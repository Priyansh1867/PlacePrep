package com.placeprep.service.timetable.importer;

import com.placeprep.dto.timetable.ImportIssueDto;
import com.placeprep.dto.timetable.ImportPreviewDto;
import com.placeprep.dto.timetable.ImportStatsDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

/**
 * Pure, deterministic, side-effect free Excel timetable parser.
 * Encapsulates the two-layer architecture:
 * Layer 1 (Reader): converts raw workbook sheets into abstract CellGrids.
 * Layer 2 (Interpreter): applies college timetable domain grammar, resolution, and clash rules.
 */
@Service
@Slf4j
public class ExcelTimetableParser {

    private final ExcelWorkbookReader workbookReader;
    private final ExcelGridReader excelGridReader;
    private final PdfGridReader pdfGridReader;
    private final TimetableInterpreter interpreter;

    public ExcelTimetableParser() {
        this.workbookReader = new ExcelWorkbookReader();
        this.excelGridReader = new ExcelGridReader(this.workbookReader);
        this.pdfGridReader = new PdfGridReader();
        this.interpreter = new TimetableInterpreter();
    }

    public ExcelTimetableParser(ExcelWorkbookReader workbookReader, TimetableInterpreter interpreter) {
        this.workbookReader = workbookReader;
        this.excelGridReader = new ExcelGridReader(workbookReader);
        this.pdfGridReader = new PdfGridReader();
        this.interpreter = interpreter;
    }

    public ImportPreviewDto parse(File file, String targetSession) {
        if (file == null || !file.exists() || file.length() == 0) {
            ImportPreviewDto dto = new ImportPreviewDto();
            dto.getErrors().add(new ImportIssueDto("", "A1", "FILE_NOT_FOUND", "Timetable file does not exist or is empty.", "ERROR"));
            dto.setStats(new ImportStatsDto(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return dto;
        }

        try (FileInputStream fis = new FileInputStream(file)) {
            return parse(fis, targetSession, file.getName());
        } catch (Exception ex) {
            log.error("Failed to read timetable file {}: {}", file.getName(), ex.getMessage());
            ImportPreviewDto dto = new ImportPreviewDto();
            dto.getErrors().add(new ImportIssueDto("", "A1", "CORRUPT_WORKBOOK", "Failed to parse file: " + ex.getMessage(), "ERROR"));
            dto.setStats(new ImportStatsDto(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return dto;
        }
    }

    public ImportPreviewDto parse(InputStream inputStream, String targetSession) {
        return parse(inputStream, targetSession, "timetable.xlsx");
    }

    public ImportPreviewDto parse(InputStream inputStream, String targetSession, String filenameOrExt) {
        if (inputStream == null) {
            ImportPreviewDto dto = new ImportPreviewDto();
            dto.getErrors().add(new ImportIssueDto("", "A1", "EMPTY_INPUT", "Input stream is null.", "ERROR"));
            dto.setStats(new ImportStatsDto(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return dto;
        }

        try {
            List<CellGrid> cellGrids;
            if (filenameOrExt != null && filenameOrExt.toLowerCase().endsWith(".pdf")) {
                cellGrids = pdfGridReader.read(inputStream);
            } else {
                cellGrids = excelGridReader.read(inputStream);
            }
            return interpreter.interpret(cellGrids, targetSession);
        } catch (Exception ex) {
            log.error("Error interpreting timetable input: {}", ex.getMessage());
            ImportPreviewDto dto = new ImportPreviewDto();
            dto.getErrors().add(new ImportIssueDto("", "A1", "CORRUPT_WORKBOOK", "Unable to parse timetable: " + ex.getMessage(), "ERROR"));
            dto.setStats(new ImportStatsDto(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return dto;
        }
    }

    public com.placeprep.dto.timetable.SlotDto parseSingleCell(
            String sheetName, String cellRef, String text,
            String sectionName, String groupCode,
            int dayOfWeek, int startPeriod, int span,
            String homeRoom, boolean multiVenue
    ) {
        ImportPreviewDto preview = new ImportPreviewDto();
        com.placeprep.dto.timetable.TimetableDto meta = com.placeprep.dto.timetable.TimetableDto.builder()
                .semester(3)
                .departmentCode("AI&DS")
                .build();
        return interpreter.parseSlotCell(
                CellData.builder()
                        .sheetName(sheetName)
                        .row(0)
                        .col(0)
                        .rowSpan(1)
                        .colSpan(1)
                        .text(text)
                        .build(),
                sheetName, sectionName, groupCode, dayOfWeek, startPeriod, span,
                homeRoom, multiVenue, new java.util.LinkedHashMap<>(), new java.util.LinkedHashMap<>(),
                new java.util.LinkedHashMap<>(), preview, meta
        );

    }
}


