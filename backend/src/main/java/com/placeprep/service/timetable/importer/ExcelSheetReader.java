package com.placeprep.service.timetable.importer;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;

import java.util.HashMap;
import java.util.Map;

public class ExcelSheetReader implements SheetReader {

    @Override
    public CellGrid readSheet(Sheet sheet) {
        if (sheet == null) {
            return new CellGrid("Empty");
        }

        CellGrid grid = new CellGrid(sheet.getSheetName());

        // 1. Index all merged regions
        Map<String, CellRangeAddress> topLeftToMerged = new HashMap<>();
        Map<String, CellRangeAddress> childToMerged = new HashMap<>();

        for (int i = 0; i < sheet.getNumMergedRegions(); i++) {
            CellRangeAddress range = sheet.getMergedRegion(i);
            String topLeftKey = range.getFirstRow() + ":" + range.getFirstColumn();
            topLeftToMerged.put(topLeftKey, range);

            for (int r = range.getFirstRow(); r <= range.getLastRow(); r++) {
                for (int c = range.getFirstColumn(); c <= range.getLastColumn(); c++) {
                    if (r != range.getFirstRow() || c != range.getFirstColumn()) {
                        childToMerged.put(r + ":" + c, range);
                    }
                }
            }
        }

        // 2. Read cell values
        int lastRow = sheet.getLastRowNum();
        for (int r = 0; r <= lastRow; r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            short lastCol = row.getLastCellNum();
            if (lastCol < 0) continue;

            for (int c = 0; c < lastCol; c++) {
                Cell cell = row.getCell(c);
                String cellText = getFormattedCellValue(cell);

                String key = r + ":" + c;
                CellRangeAddress merged = topLeftToMerged.get(key);

                if (merged != null) {
                    int rowSpan = merged.getLastRow() - merged.getFirstRow() + 1;
                    int colSpan = merged.getLastColumn() - merged.getFirstColumn() + 1;
                    CellData cellData = CellData.builder()
                            .sheetName(sheet.getSheetName())
                            .row(r)
                            .col(c)
                            .rowSpan(rowSpan)
                            .colSpan(colSpan)
                            .text(cellText)
                            .confidence(1.0)
                            .build();
                    grid.setCell(cellData);
                } else if (!childToMerged.containsKey(key)) {
                    // Regular non-merged cell
                    CellData cellData = CellData.builder()
                            .sheetName(sheet.getSheetName())
                            .row(r)
                            .col(c)
                            .rowSpan(1)
                            .colSpan(1)
                            .text(cellText)
                            .confidence(1.0)
                            .build();
                    grid.setCell(cellData);
                }
            }
        }

        return grid;
    }

    private String getFormattedCellValue(Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> {
                    if (DateUtil.isCellDateFormatted(cell)) {
                        yield cell.getDateCellValue().toString();
                    }
                    double val = cell.getNumericCellValue();
                    if (val == (long) val) {
                        yield String.valueOf((long) val);
                    }
                    yield String.valueOf(val);
                }
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                case FORMULA -> {
                    try {
                        yield cell.getStringCellValue();
                    } catch (Exception e) {
                        try {
                            double val = cell.getNumericCellValue();
                            yield (val == (long) val) ? String.valueOf((long) val) : String.valueOf(val);
                        } catch (Exception ex) {
                            yield "";
                        }
                    }
                }
                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
    }
}

