package com.placeprep.service.timetable.exporter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.ImportPreviewDto;
import com.placeprep.dto.timetable.PeriodDto;
import com.placeprep.dto.timetable.SlotDto;
import com.placeprep.dto.timetable.TimetableDto;
import com.placeprep.model.timetable.SlotKind;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.PDDocumentNameDictionary;
import org.apache.pdfbox.pdmodel.PDEmbeddedFilesNameTreeNode;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.common.filespecification.PDComplexFileSpecification;
import org.apache.pdfbox.pdmodel.common.filespecification.PDEmbeddedFile;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class PdfTimetableExporter {

    private final ObjectMapper objectMapper;

    public PdfTimetableExporter() {
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    public byte[] generatePdf(
            TimetableDto timetable,
            List<PeriodDto> periods,
            List<SlotDto> slots,
            ImportPreviewDto rawImportPreview,
            String scopeHeader
    ) throws Exception {
        try (PDDocument document = new PDDocument()) {
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            // Group slots by Section (one page per section) or single grid for scoped export
            Map<String, List<SlotDto>> slotsByPage = new LinkedHashMap<>();
            if (scopeHeader != null && !scopeHeader.equalsIgnoreCase("all") && !scopeHeader.startsWith("section:")) {
                slotsByPage.put(scopeHeader, slots);
            } else {
                Set<String> sectionNames = slots.stream()
                        .map(SlotDto::getSectionName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toCollection(TreeSet::new));
                if (sectionNames.isEmpty()) {
                    slotsByPage.put("Master Schedule", slots);
                } else {
                    for (String sec : sectionNames) {
                        slotsByPage.put("Section " + sec, slots.stream().filter(s -> sec.equals(s.getSectionName())).toList());
                    }
                }
            }

            for (Map.Entry<String, List<SlotDto>> entry : slotsByPage.entrySet()) {
                String pageTitle = entry.getKey();
                List<SlotDto> pageSlots = entry.getValue();

                // Landscape A4: width = 841.89, height = 595.28
                PDPage page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
                document.addPage(page);

                try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                    drawPageGrid(cs, fontRegular, fontBold, timetable, periods, pageSlots, pageTitle);
                }
            }

            // Embed timetable.json as an attachment in document catalog for lossless round-tripping
            if (rawImportPreview != null) {
                embedTimetableJson(document, rawImportPreview);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void drawPageGrid(
            PDPageContentStream cs,
            PDType1Font fontRegular,
            PDType1Font fontBold,
            TimetableDto meta,
            List<PeriodDto> periods,
            List<SlotDto> slots,
            String subTitle
    ) throws Exception {
        float pageWidth = 841.89f;
        float pageHeight = 595.28f;

        float marginLeft = 40.0f;
        float marginRight = 40.0f;
        float marginTop = 35.0f;
        float marginBottom = 30.0f;

        // 1. Header block
        float y = pageHeight - marginTop;

        cs.beginText();
        cs.setFont(fontBold, 14);
        cs.newLineAtOffset(marginLeft, y);
        cs.showText("PlacePrep College of Engineering & Technology");
        cs.endText();

        y -= 16;
        cs.beginText();
        cs.setFont(fontBold, 11);
        cs.newLineAtOffset(marginLeft, y);
        String dept = (meta != null && meta.getDepartmentName() != null) ? meta.getDepartmentName() : "Department of AI & Data Science";
        String session = (meta != null && meta.getAcademicSession() != null) ? meta.getAcademicSession() : "2026-27";
        String sem = (meta != null && meta.getSemester() != null) ? "Semester " + meta.getSemester() : "Odd Sem";
        cs.showText(dept + "  |  " + session + "  |  " + sem + "  |  " + subTitle);
        cs.endText();

        y -= 14;
        String secName = (subTitle != null && subTitle.contains("Section")) ? subTitle.replace("Section", "").trim() : "A";
        cs.beginText();
        cs.setFont(fontBold, 10);
        cs.newLineAtOffset(marginLeft, y);
        cs.showText("Time-Table Section: " + secName + " (" + secName + "1+" + secName + "2) Venue: DS11");
        cs.endText();

        // Version badge on right
        String versionBadge = "Version " + (meta != null && meta.getVersionNo() != null ? meta.getVersionNo() : "1") +
                " (" + (meta != null && meta.getStatus() != null ? meta.getStatus().name() : "PUBLISHED") + ")";
        cs.beginText();
        cs.setFont(fontRegular, 10);
        cs.newLineAtOffset(pageWidth - marginRight - 140, y + 14);
        cs.showText(versionBadge);
        cs.endText();

        y -= 15;

        // 2. Grid Dimensions
        float gridTop = y;
        float gridWidth = pageWidth - marginLeft - marginRight;
        float dayColWidth = 65.0f;
        int numPeriods = (periods != null && !periods.isEmpty()) ? Math.min(periods.size(), 8) : 8;
        float periodColWidth = (gridWidth - dayColWidth) / numPeriods;

        float headerRowHeight = 24.0f;
        int numDays = (slots != null && slots.stream().anyMatch(s -> s.getDayOfWeek() != null && s.getDayOfWeek() >= 6)) ? 6 : 5;
        float availableGridHeight = gridTop - marginBottom - 40.0f;
        float dayHeight = (availableGridHeight - headerRowHeight) / numDays;
        float subRowHeight = dayHeight / 2.0f;

        // Draw Table Header Background
        cs.setNonStrokingColor(0.92f, 0.94f, 0.96f);
        cs.addRect(marginLeft, gridTop - headerRowHeight, gridWidth, headerRowHeight);
        cs.fill();

        // Draw Table Outer Border
        cs.setStrokingColor(0.70f, 0.75f, 0.80f);
        cs.setLineWidth(1.0f);
        cs.addRect(marginLeft, gridTop - headerRowHeight - (numDays * dayHeight), gridWidth, headerRowHeight + (numDays * dayHeight));
        cs.stroke();

        // Header Text: Day
        cs.setNonStrokingColor(0.15f, 0.20f, 0.25f);
        cs.beginText();
        cs.setFont(fontBold, 9);
        cs.newLineAtOffset(marginLeft + 12, gridTop - 16);
        cs.showText("PERIOD DAY");
        cs.endText();

        // Header Text: Periods
        for (int p = 1; p <= numPeriods; p++) {
            float px = marginLeft + dayColWidth + ((p - 1) * periodColWidth);
            // vertical separator
            cs.setStrokingColor(0.80f, 0.83f, 0.86f);
            cs.moveTo(px, gridTop);
            cs.lineTo(px, gridTop - headerRowHeight - (numDays * dayHeight));
            cs.stroke();

            String timeLabel = "P" + p;
            if (periods != null && p - 1 < periods.size()) {
                PeriodDto pd = periods.get(p - 1);
                if (pd.getStartTime() != null && pd.getEndTime() != null) {
                    timeLabel = pd.getStartTime().toString() + "-" + pd.getEndTime().toString();
                } else if (pd.getLabel() != null) {
                    timeLabel = pd.getLabel();
                }
            }
            cs.setNonStrokingColor(0.15f, 0.20f, 0.25f);
            cs.beginText();
            cs.setFont(fontBold, 8);
            cs.newLineAtOffset(px + 4, gridTop - 12);
            cs.showText("P" + p);
            cs.endText();

            cs.beginText();
            cs.setFont(fontRegular, 7);
            cs.newLineAtOffset(px + 4, gridTop - 21);
            cs.showText(timeLabel);
            cs.endText();
        }

        // Draw Days and Slots
        String[] dayNames = {"MON", "TUE", "WED", "THU", "FRI", "SAT"};
        float curY = gridTop - headerRowHeight;

        for (int d = 0; d < numDays; d++) {
            int dayOfWeek = d + 1;
            float dayY = curY - dayHeight;

            // Day label
            cs.setStrokingColor(0.80f, 0.83f, 0.86f);
            cs.moveTo(marginLeft, dayY);
            cs.lineTo(marginLeft + gridWidth, dayY);
            cs.stroke();

            // sub-row separator (dotted or thin)
            cs.setStrokingColor(0.90f, 0.92f, 0.94f);
            cs.moveTo(marginLeft + dayColWidth, curY - subRowHeight);
            cs.lineTo(marginLeft + gridWidth, curY - subRowHeight);
            cs.stroke();

            cs.setNonStrokingColor(0.10f, 0.15f, 0.20f);
            cs.beginText();
            cs.setFont(fontBold, 9);
            cs.newLineAtOffset(marginLeft + 18, curY - (dayHeight / 2.0f) - 3);
            cs.showText(dayNames[d]);
            cs.endText();

            // Slots for this day
            List<SlotDto> daySlots = slots.stream().filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == dayOfWeek).toList();

            for (SlotDto slot : daySlots) {
                int pStart = (slot.getStartPeriod() != null) ? slot.getStartPeriod() : 1;
                int span = (slot.getSpan() != null) ? slot.getSpan() : 1;
                if (pStart < 1 || pStart > numPeriods) continue;

                int pEnd = Math.min(pStart + span - 1, numPeriods);
                int actualSpan = pEnd - pStart + 1;

                float slotX = marginLeft + dayColWidth + ((pStart - 1) * periodColWidth);
                float slotW = actualSpan * periodColWidth;

                boolean isGroup1 = slot.getLabGroupCode() != null && slot.getLabGroupCode().endsWith("1");
                boolean isGroup2 = slot.getLabGroupCode() != null && slot.getLabGroupCode().endsWith("2");
                boolean isWholeSection = !isGroup1 && !isGroup2;

                float slotY;
                float slotH;

                if (isWholeSection) {
                    slotY = curY - dayHeight;
                    slotH = dayHeight;
                } else if (isGroup1) {
                    slotY = curY - subRowHeight;
                    slotH = subRowHeight;
                } else {
                    slotY = curY - dayHeight;
                    slotH = subRowHeight;
                }

                // Color by slot kind
                fillSlotBackground(cs, slot.getSlotKind());
                cs.addRect(slotX + 1, slotY + 1, slotW - 2, slotH - 2);
                cs.fill();

                // Slot border
                cs.setStrokingColor(0.65f, 0.70f, 0.75f);
                cs.setLineWidth(0.5f);
                cs.addRect(slotX + 1, slotY + 1, slotW - 2, slotH - 2);
                cs.stroke();

                // Slot text
                cs.setNonStrokingColor(0.05f, 0.08f, 0.12f);

                String cellText = buildSlotCellGrammarText(slot);
                if (slot.getLabGroupCode() != null) {
                    cellText = slot.getLabGroupCode() + ": " + cellText;
                }

                cs.beginText();
                cs.setFont(fontBold, 7.5f);
                cs.newLineAtOffset(slotX + 3, slotY + (slotH / 2.0f) - 3.0f);
                cs.showText(sanitizeText(cellText));
                cs.endText();
            }

            curY = dayY;
        }

        // 3. Footer
        float footerY = 18.0f;
        String genTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String footerText = "Generated: " + genTimestamp + "  |  PlacePrep AI Timetable System  |  Confidential";

        cs.setNonStrokingColor(0.40f, 0.45f, 0.50f);
        cs.beginText();
        cs.setFont(fontRegular, 8);
        cs.newLineAtOffset(marginLeft, footerY);
        cs.showText(footerText);
        cs.endText();
    }

    private void fillSlotBackground(PDPageContentStream cs, SlotKind kind) throws Exception {
        if (kind == null) kind = SlotKind.THEORY;
        switch (kind) {
            case THEORY -> cs.setNonStrokingColor(0.88f, 0.94f, 0.99f); // Soft blue
            case LAB -> cs.setNonStrokingColor(0.86f, 0.98f, 0.90f);    // Soft emerald/green
            case MENTOR_MEETING, FOUNDATION -> cs.setNonStrokingColor(1.0f, 0.96f, 0.82f); // Soft amber
            default -> cs.setNonStrokingColor(0.93f, 0.91f, 0.99f);     // Soft violet
        }
    }

    private void embedTimetableJson(PDDocument document, ImportPreviewDto rawImportPreview) {
        try {
            byte[] jsonBytes = objectMapper.writeValueAsBytes(rawImportPreview);

            PDEmbeddedFilesNameTreeNode efTree = new PDEmbeddedFilesNameTreeNode();
            PDComplexFileSpecification fs = new PDComplexFileSpecification();
            fs.setFile("timetable.json");

            PDEmbeddedFile ef = new PDEmbeddedFile(document, new ByteArrayInputStream(jsonBytes));
            ef.setSubtype("application/json");
            ef.setSize(jsonBytes.length);
            fs.setEmbeddedFile(ef);

            efTree.setNames(Collections.singletonMap("timetable.json", fs));

            PDDocumentCatalog catalog = document.getDocumentCatalog();
            PDDocumentNameDictionary names = new PDDocumentNameDictionary(catalog);
            names.setEmbeddedFiles(efTree);
            catalog.setNames(names);
            log.info("Embedded timetable.json ({} bytes) into PDF attachment", jsonBytes.length);
        } catch (Exception ex) {
            log.warn("Failed to embed timetable.json in PDF: {}", ex.getMessage());
        }
    }

    private String buildSlotCellGrammarText(SlotDto slot) {
        String sub = (slot.getSubjectCode() != null) ? slot.getSubjectCode() : (slot.getSubjectName() != null ? slot.getSubjectName() : "SUB");
        if (slot.getSlotKind() == SlotKind.LAB && !sub.toUpperCase().contains("LAB")) {
            sub = sub + " LAB";
        }
        String fac = (slot.getFacultyNames() != null && !slot.getFacultyNames().isEmpty()) ? extractShortCode(slot.getFacultyNames().get(0)) : "NF";
        String room = (slot.getRoomCode() != null) ? slot.getRoomCode() : "DS11";
        return sub + "-" + fac + "-" + room;
    }

    private String extractShortCode(String fullName) {
        if (fullName == null || fullName.isBlank()) return "NF";
        if (fullName.equalsIgnoreCase("Ms. Ambika Bagri") || fullName.contains("Ambika")) return "AB";
        if (fullName.contains("Sanjeev")) return "SK";
        if (fullName.contains("Nidhi")) return "NS";
        if (fullName.contains("Sunil")) return "SM";
        if (fullName.contains("Praveen")) return "PK";
        if (fullName.contains("Anjana")) return "AN";
        if (fullName.contains("Sanjay")) return "SC";
        if (fullName.contains("Pooja")) return "PC";
        if (fullName.contains("Samiksha")) return "SS";
        if (fullName.length() <= 3) return fullName.toUpperCase();
        return Arrays.stream(fullName.split("\\s+"))
                .filter(w -> !w.equalsIgnoreCase("Dr.") && !w.equalsIgnoreCase("Mr.") && !w.equalsIgnoreCase("Ms.") && !w.equalsIgnoreCase("Prof."))
                .map(w -> String.valueOf(w.charAt(0)))
                .collect(Collectors.joining())
                .toUpperCase();
    }

    private String sanitizeText(String text) {
        if (text == null) return "";
        return text.replaceAll("[^\\x20-\\x7E]", " ").trim();
    }
}
