package com.placeprep.service.timetable.importer;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class ExcelWorkbookReader {

    private static final Pattern SECTION_PATTERN = Pattern.compile("Time-Table\\s+Section:|Section:\\s*[A-Za-z0-9]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern LAB_ROOM_PATTERN = Pattern.compile("DS-?11|DF-?0?5|DT-?0?7|DS-?8", Pattern.CASE_INSENSITIVE);
    private static final Pattern ROOM_PATTERN = Pattern.compile("^D[STF][0-9]{1,2}$", Pattern.CASE_INSENSITIVE);

    private final SheetReader sheetReader;

    public ExcelWorkbookReader() {
        this(new ExcelSheetReader());
    }

    public ExcelWorkbookReader(SheetReader sheetReader) {
        this.sheetReader = sheetReader;
    }

    public List<CellGrid> readWorkbook(InputStream inputStream) throws Exception {
        if (inputStream == null) {
            throw new IllegalArgumentException("Workbook input stream cannot be null.");
        }

        List<CellGrid> grids = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            int numSheets = workbook.getNumberOfSheets();
            for (int i = 0; i < numSheets; i++) {
                Sheet sheet = workbook.getSheetAt(i);
                CellGrid grid = sheetReader.readSheet(sheet);
                grid.setKind(classifySheet(grid));
                grids.add(grid);
            }
        }
        return grids;
    }

    /**
     * Classifies sheet by content so next semester's file works even if sheet names differ.
     */
    public SheetKind classifySheet(CellGrid grid) {
        if (grid == null) return SheetKind.UNKNOWN;

        // 1. Check for Section grid signatures
        if (!grid.findCellsMatching(SECTION_PATTERN).isEmpty()) {
            return SheetKind.SECTION_GRID;
        }

        // 2. Check for Lab sheet signatures
        String name = grid.getSheetName().toLowerCase();
        boolean hasLabRooms = !grid.findCellsMatching(LAB_ROOM_PATTERN).isEmpty();
        if (name.contains("lab") || (hasLabRooms && grid.findCellsContaining("PERIOD DAY").size() >= 2)) {
            return SheetKind.LAB_GRID;
        }

        // 3. Check for Room sheet signatures
        if (name.contains("room") || (!grid.findCellsMatching(ROOM_PATTERN).isEmpty() && grid.findCellsContaining("PERIOD DAY").size() >= 3)) {
            return SheetKind.ROOM_GRID;
        }

        // 4. Check for Faculty sheet signatures
        if (name.contains("faculty") || grid.findCellsContaining("PERIOD DAY").size() >= 5) {
            return SheetKind.FACULTY_GRID;
        }

        return SheetKind.UNKNOWN;
    }
}

