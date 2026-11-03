package com.placeprep.service.timetable.importer;

import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.util.regex.Pattern;

@Getter
@Setter
public class CellGrid {
    private final String sheetName;
    private SheetKind kind = SheetKind.UNKNOWN;
    private int maxRow = 0;
    private int maxCol = 0;
    private final Map<String, CellData> cellMap = new HashMap<>();
    private com.placeprep.dto.timetable.ImportPreviewDto embeddedPreview;

    public CellGrid(String sheetName) {
        this.sheetName = sheetName;
    }

    private static String key(int r, int c) {
        return r + ":" + c;
    }

    public void setCell(CellData cell) {
        if (cell == null) return;
        cellMap.put(key(cell.getRow(), cell.getCol()), cell);
        if (cell.getRow() + cell.getRowSpan() - 1 > maxRow) {
            maxRow = cell.getRow() + cell.getRowSpan() - 1;
        }
        if (cell.getCol() + cell.getColSpan() - 1 > maxCol) {
            maxCol = cell.getCol() + cell.getColSpan() - 1;
        }
    }

    public CellData getCell(int r, int c) {
        return cellMap.get(key(r, c));
    }

    public String getText(int r, int c) {
        CellData cell = getCell(r, c);
        return cell != null && cell.getText() != null ? cell.getText().trim() : "";
    }

    public List<CellData> findCellsContaining(String snippet) {
        if (snippet == null || snippet.isBlank()) return Collections.emptyList();
        String lower = snippet.toLowerCase();
        List<CellData> matches = new ArrayList<>();
        for (CellData cell : cellMap.values()) {
            if (cell.getText() != null && cell.getText().toLowerCase().contains(lower)) {
                matches.add(cell);
            }
        }
        matches.sort(Comparator.comparingInt(CellData::getRow).thenComparingInt(CellData::getCol));
        return matches;
    }

    public List<CellData> findCellsMatching(Pattern pattern) {
        if (pattern == null) return Collections.emptyList();
        List<CellData> matches = new ArrayList<>();
        for (CellData cell : cellMap.values()) {
            if (cell.getText() != null && pattern.matcher(cell.getText()).find()) {
                matches.add(cell);
            }
        }
        matches.sort(Comparator.comparingInt(CellData::getRow).thenComparingInt(CellData::getCol));
        return matches;
    }
}

