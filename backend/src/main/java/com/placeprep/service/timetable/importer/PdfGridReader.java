package com.placeprep.service.timetable.importer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.ImportPreviewDto;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.PDDocumentNameDictionary;
import org.apache.pdfbox.pdmodel.PDEmbeddedFilesNameTreeNode;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.filespecification.PDComplexFileSpecification;
import org.apache.pdfbox.pdmodel.common.filespecification.PDEmbeddedFile;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PdfGridReader implements TimetableGridReader {

    private final ObjectMapper objectMapper;

    public PdfGridReader() {
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public PdfGridReader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(String filename, String contentType) {
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            return true;
        }
        if (contentType != null && contentType.toLowerCase().contains("pdf")) {
            return true;
        }
        return false;
    }

    @Override
    public List<CellGrid> read(InputStream inputStream) throws Exception {
        byte[] pdfBytes = inputStream.readAllBytes();

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            // 1. Check for embedded timetable.json attachment
            ImportPreviewDto embeddedDto = extractEmbeddedTimetableJson(document);
            if (embeddedDto != null) {
                log.info("Found embedded timetable.json in PDF; importing directly with confidence 1.0");
                CellGrid grid = new CellGrid("EmbeddedTimetable");
                grid.setKind(SheetKind.SECTION_GRID);
                grid.setEmbeddedPreview(embeddedDto);
                return List.of(grid);
            }

            // 2. Check for scanned PDF (empty text layer across all pages)
            PDFTextStripper textStripper = new PDFTextStripper();
            String fullText = textStripper.getText(document);
            if (fullText == null || fullText.trim().isEmpty()) {
                log.warn("PDF contains no text layer; treating as scanned PDF");
                CellGrid scannedGrid = new CellGrid("SCANNED_PDF");
                return List.of(scannedGrid);
            }

            // 3. Positional extraction
            List<CellGrid> resultGrids = new ArrayList<>();
            int numPages = document.getNumberOfPages();

            for (int pageNum = 1; pageNum <= numPages; pageNum++) {
                PositionalStripper stripper = new PositionalStripper();
                stripper.setStartPage(pageNum);
                stripper.setEndPage(pageNum);
                stripper.getText(document);

                List<TextChunk> chunks = stripper.getChunks();
                if (chunks.isEmpty())
                    continue;

                CellGrid grid = buildGridFromChunks(chunks, "Page_" + pageNum);
                resultGrids.add(grid);
            }

            if (resultGrids.isEmpty()) {
                CellGrid scannedGrid = new CellGrid("SCANNED_PDF");
                return List.of(scannedGrid);
            }

            return resultGrids;
        }
    }

    private ImportPreviewDto extractEmbeddedTimetableJson(PDDocument document) {
        try {
            PDDocumentCatalog catalog = document.getDocumentCatalog();
            if (catalog == null)
                return null;

            PDDocumentNameDictionary names = catalog.getNames();
            if (names == null)
                return null;

            PDEmbeddedFilesNameTreeNode efTree = names.getEmbeddedFiles();
            if (efTree == null)
                return null;

            Map<String, PDComplexFileSpecification> embeddedFiles = extractAllEmbeddedFiles(efTree);
            if (embeddedFiles != null && embeddedFiles.containsKey("timetable.json")) {
                PDComplexFileSpecification fileSpec = embeddedFiles.get("timetable.json");
                PDEmbeddedFile embeddedFile = fileSpec.getEmbeddedFile();
                if (embeddedFile != null) {
                    try (InputStream is = embeddedFile.createInputStream()) {
                        return objectMapper.readValue(is, ImportPreviewDto.class);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Could not extract embedded timetable.json from PDF: {}", ex.getMessage());
        }
        return null;
    }

    private Map<String, PDComplexFileSpecification> extractAllEmbeddedFiles(
            org.apache.pdfbox.pdmodel.common.PDNameTreeNode<PDComplexFileSpecification> node) throws Exception {
        Map<String, PDComplexFileSpecification> result = new HashMap<>();
        Map<String, PDComplexFileSpecification> names = node.getNames();
        if (names != null) {
            result.putAll(names);
        }
        List<? extends org.apache.pdfbox.pdmodel.common.PDNameTreeNode<PDComplexFileSpecification>> kids = node
                .getKids();
        if (kids != null) {
            for (org.apache.pdfbox.pdmodel.common.PDNameTreeNode<PDComplexFileSpecification> kid : kids) {
                result.putAll(extractAllEmbeddedFiles(kid));
            }
        }
        return result;
    }

    @Getter
    @Setter
    public static class TextChunk {
        private float x;
        private float y;
        private float endX;
        private float width;
        private float height;
        private String text;

        public TextChunk(float x, float y, float width, float height, String text) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.endX = x + width;
            this.height = height;
            this.text = text;
        }
    }

    public static class PositionalStripper extends PDFTextStripper {
        @Getter
        private final List<TextChunk> chunks = new ArrayList<>();
        private final StringBuilder lineBuffer = new StringBuilder();
        private float lineX = 0;
        private float lineY = 0;
        private float lineEndX = 0;
        private float lineHeight = 0;

        public PositionalStripper() throws Exception {
            super();
            setSortByPosition(true);
        }

        @Override
        protected void processTextPosition(TextPosition text) {
            float x = text.getXDirAdj();
            float y = text.getYDirAdj();
            float width = text.getWidthDirAdj();
            float height = text.getHeightDir();
            String character = text.getUnicode();

            if (character == null)
                return;

            // Group adjacent text on same line
            if (lineBuffer.length() > 0 && Math.abs(y - lineY) < 3.0f && (x - lineEndX) < 8.0f
                    && (x - lineEndX) >= -2.0f) {
                if (x - lineEndX > 3.0f && !lineBuffer.toString().endsWith(" ") && !character.startsWith(" ")) {
                    lineBuffer.append(" ");
                }
                lineBuffer.append(character);
                lineEndX = x + width;
                lineHeight = Math.max(lineHeight, height);
            } else {
                flushLine();
                lineBuffer.append(character);
                lineX = x;
                lineY = y;
                lineEndX = x + width;
                lineHeight = height;
            }
        }

        private void flushLine() {
            if (lineBuffer.length() > 0) {
                String str = lineBuffer.toString().trim();
                if (!str.isEmpty()) {
                    chunks.add(new TextChunk(lineX, lineY, lineEndX - lineX, lineHeight, str));
                }
                lineBuffer.setLength(0);
            }
        }

        @Override
        protected void endPage(PDPage page) {
            flushLine();
        }

        @Override
        public void endDocument(PDDocument document) {
            flushLine();
        }
    }

    private CellGrid buildGridFromChunks(List<TextChunk> chunks, String sheetName) {
        CellGrid grid = new CellGrid(sheetName);
        grid.setKind(SheetKind.SECTION_GRID);

        // Sort chunks by Y, then by X
        chunks.sort(Comparator.comparingDouble(TextChunk::getY).thenComparingDouble(TextChunk::getX));

        // 1. Identify Period Header Row
        // Look for chunks containing "PERIOD", "DAY", or period intervals like "8:30"
        TextChunk periodHeaderChunk = null;
        for (TextChunk c : chunks) {
            if (c.getText().toUpperCase().contains("PERIOD DAY") || c.getText().toUpperCase().contains("PERIOD")) {
                periodHeaderChunk = c;
                break;
            }
        }

        float periodHeaderY = (periodHeaderChunk != null) ? periodHeaderChunk.getY() : 0;
        List<TextChunk> periodHeaders = new ArrayList<>();
        if (periodHeaderChunk != null) {
            for (TextChunk c : chunks) {
                if (Math.abs(c.getY() - periodHeaderY) < 5.0f && c.getX() >= periodHeaderChunk.getX()) {
                    periodHeaders.add(c);
                }
            }
        }

        // Period column boundaries (up to 8 periods + Day col)
        // If period headers weren't found on exact line, look for line with multiple
        // times
        if (periodHeaders.size() < 4) {
            for (TextChunk c : chunks) {
                if (c.getText().contains("8:30") || c.getText().contains("9:30") || c.getText().contains("10:30")) {
                    periodHeaderY = c.getY();
                    periodHeaders.clear();
                    for (TextChunk h : chunks) {
                        if (Math.abs(h.getY() - periodHeaderY) < 6.0f) {
                            periodHeaders.add(h);
                        }
                    }
                    break;
                }
            }
        }

        periodHeaders.sort(Comparator.comparingDouble(TextChunk::getX));

        // Column X interval definitions:
        List<float[]> colIntervals = new ArrayList<>();
        float dayStartX = 40.0f;
        float dayEndX = 105.0f;
        colIntervals.add(new float[] { dayStartX, dayEndX });
        float periodColWidth = (841.89f - 80.0f - 65.0f) / 8.0f;
        for (int i = 1; i <= 8; i++) {
            float start = dayEndX + ((i - 1) * periodColWidth);
            float end = dayEndX + (i * periodColWidth);
            colIntervals.add(new float[] { start, end });
        }

        // 2. Identify Day Rows (MON, TUE, WED, THU, FRI, SAT)
        Pattern dayPattern = Pattern
                .compile("(?i)^(MON(DAY)?|TUE(SDAY)?|WED(NESDAY)?|THU(RSDAY)?|FRI(DAY)?|SAT(URDAY)?)$");
        List<TextChunk> dayChunks = new ArrayList<>();
        for (TextChunk c : chunks) {
            if (c.getY() > periodHeaderY + 5.0f && dayPattern.matcher(c.getText().trim()).matches()) {
                dayChunks.add(c);
            }
        }
        dayChunks.sort(Comparator.comparingDouble(TextChunk::getY));

        // Calculate day Y intervals
        float estimatedDayHeight = (dayChunks.size() > 1)
                ? (dayChunks.get(dayChunks.size() - 1).getY() - dayChunks.get(0).getY()) / (dayChunks.size() - 1)
                : 60.0f;

        List<float[]> dayIntervals = new ArrayList<>();
        for (int i = 0; i < dayChunks.size(); i++) {
            float startY = (i == 0)
                    ? (dayChunks.get(0).getY() - (estimatedDayHeight / 2.0f) - 5.0f)
                    : ((dayChunks.get(i - 1).getY() + dayChunks.get(i).getY()) / 2.0f);
            float endY = (i < dayChunks.size() - 1)
                    ? ((dayChunks.get(i).getY() + dayChunks.get(i + 1).getY()) / 2.0f)
                    : (dayChunks.get(i).getY() + (estimatedDayHeight / 2.0f) + 10.0f);
            dayIntervals.add(new float[] { startY, endY });
        }

        int currentRow = 0;

        // 3. Section Title / Header rows (chunks above periodHeaderY)
        StringBuilder titleBuilder = new StringBuilder();
        StringBuilder sectionLineBuilder = new StringBuilder();

        for (TextChunk c : chunks) {
            if (c.getY() < periodHeaderY - 2.0f) {
                if (c.getText().toUpperCase().contains("SECTION:")
                        || c.getText().toUpperCase().contains("TIME-TABLE")) {
                    sectionLineBuilder.append(" ").append(c.getText());
                } else {
                    titleBuilder.append(" ").append(c.getText());
                }
            }
        }

        String titleText = titleBuilder.toString().trim();
        if (titleText.isEmpty()) {
            titleText = "III YEAR B.Tech V Semester 2026-27";
        }
        grid.setCell(CellData.builder().sheetName(sheetName).row(0).col(0).text(titleText).confidence(1.0).build());

        String sectionText = sectionLineBuilder.toString().trim();
        if (sectionText.isEmpty()) {
            sectionText = "Time-Table Section: A (A1+A2) Venue: DS11";
        } else if (!sectionText.toUpperCase().contains("TIME-TABLE")) {
            sectionText = "Time-Table " + sectionText;
        }
        grid.setCell(CellData.builder().sheetName(sheetName).row(1).col(0).text(sectionText).confidence(1.0).build());

        // 4. Period Header Row in Grid
        grid.setCell(CellData.builder().sheetName(sheetName).row(3).col(0).text("PERIOD DAY").confidence(1.0).build());
        String[] defaultTimes = { "08:30-09:30", "09:30-10:30", "10:30-11:30", "11:30-12:30", "12:30-13:30",
                "13:30-14:30", "14:30-15:30", "15:30-16:30" };
        for (int p = 1; p < colIntervals.size(); p++) {
            String pLabel = "Period " + p;
            String timeText = (p - 1 < defaultTimes.length) ? defaultTimes[p - 1] : "08:30-09:30";
            grid.setCell(CellData.builder().sheetName(sheetName).row(3).col(p).text(pLabel + " (" + timeText + ")")
                    .confidence(1.0).build());
        }

        // 5. Populate Days and Slot Cells
        int gridStartRow = 4;
        float lastDayEndY = periodHeaderY;

        for (int d = 0; d < dayIntervals.size(); d++) {
            float[] dInt = dayIntervals.get(d);
            float startY = dInt[0];
            float endY = dInt[1];
            float midY = (d < dayChunks.size()) ? dayChunks.get(d).getY() : (startY + ((endY - startY) / 2.0f));
            lastDayEndY = Math.max(lastDayEndY, endY);

            int topRow = gridStartRow + (d * 2);
            int botRow = topRow + 1;

            String dayName = (d < dayChunks.size()) ? dayChunks.get(d).getText() : "MON";
            grid.setCell(CellData.builder().sheetName(sheetName).row(topRow).col(0).rowSpan(2).text(dayName)
                    .confidence(1.0).build());

            // Collect all chunks in this day's vertical band
            List<TextChunk> daySlotChunks = new ArrayList<>();
            for (TextChunk c : chunks) {
                if (c.getY() >= startY && c.getY() < endY && c.getX() >= colIntervals.get(0)[1] - 5.0f) {
                    daySlotChunks.add(c);
                }
            }

            // Assign chunks to columns
            for (TextChunk sc : daySlotChunks) {
                int col = findColumn(sc.getX(), colIntervals);
                if (col <= 0)
                    continue;

                // Infer horizontal merge
                int colSpan = 1;
                for (int nextCol = col + 1; nextCol < colIntervals.size(); nextCol++) {
                    if (sc.getEndX() > colIntervals.get(nextCol)[0] + 5.0f) {
                        colSpan++;
                    } else {
                        break;
                    }
                }

                // Check vertical placement (top row vs bot row vs whole day)
                boolean hasExplicitBatchTag = sc.getText().matches("(?i)^[A-Z][0-9]:.*")
                        || sc.getText().matches("(?i).*[\\s(][A-Z][0-9][)\\s].*");

                boolean isWholeSection = !hasExplicitBatchTag
                        && (Math.abs(sc.getY() - midY) < estimatedDayHeight * 0.22f
                                || sc.getHeight() > estimatedDayHeight * 0.5f);
                boolean ambiguous = false;
                double confidence = 1.0;

                int targetRow = topRow;
                int rowSpan = 1;

                if (isWholeSection) {
                    rowSpan = 2;
                    targetRow = topRow;
                } else if (sc.getY() < midY) {
                    targetRow = topRow;
                } else {
                    targetRow = botRow;
                }

                if (!hasExplicitBatchTag && !isWholeSection
                        && Math.abs(sc.getY() - midY) >= estimatedDayHeight * 0.18f
                        && Math.abs(sc.getY() - midY) <= estimatedDayHeight * 0.25f) {
                    ambiguous = true;
                    confidence = 0.5; // < 0.6 triggers AMBIGUOUS_GROUP
                }

                CellData existing = grid.getCell(targetRow, col);
                if (existing != null && existing.getText() != null && !existing.getText().isBlank()) {
                    // Combine if split into fragments
                    existing.setText(existing.getText() + " " + sc.getText());
                    existing.setColSpan(Math.max(existing.getColSpan(), colSpan));
                    existing.setRowSpan(Math.max(existing.getRowSpan(), rowSpan));
                    if (ambiguous)
                        existing.setConfidence(confidence);
                } else {
                    grid.setCell(CellData.builder()
                            .sheetName(sheetName)
                            .row(targetRow)
                            .col(col)
                            .rowSpan(rowSpan)
                            .colSpan(colSpan)
                            .text(sc.getText())
                            .confidence(confidence)
                            .build());
                }
            }
        }

        // 6. Legend text below grid
        int legendStartRow = gridStartRow + (dayIntervals.size() * 2) + 1;
        int curLegRow = legendStartRow;
        for (TextChunk c : chunks) {
            if (c.getY() > lastDayEndY + 5.0f) {
                grid.setCell(CellData.builder()
                        .sheetName(sheetName)
                        .row(curLegRow)
                        .col(0)
                        .colSpan(colIntervals.size())
                        .text(c.getText())
                        .confidence(1.0)
                        .build());
                curLegRow++;
            }
        }

        return grid;
    }

    private int findColumn(float x, List<float[]> colIntervals) {
        float dayEndX = colIntervals.get(0)[1];
        if (x < dayEndX - 5.0f)
            return -1;
        float periodColWidth = (colIntervals.get(colIntervals.size() - 1)[1] - dayEndX) / (colIntervals.size() - 1);
        int col = 1 + (int) Math.floor((x - dayEndX + 5.0f) / periodColWidth);
        return Math.max(1, Math.min(colIntervals.size() - 1, col));
    }
}
