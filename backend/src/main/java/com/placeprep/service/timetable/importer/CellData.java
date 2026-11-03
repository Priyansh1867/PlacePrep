package com.placeprep.service.timetable.importer;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CellData {
    private String sheetName;
    private int row;
    private int col;
    @Builder.Default
    private int rowSpan = 1;
    @Builder.Default
    private int colSpan = 1;
    private String text;
    @Builder.Default
    private double confidence = 1.0;

    public String getCellRef() {
        return formatCellRef(row, col);
    }

    public static String formatCellRef(int r, int c) {
        StringBuilder sb = new StringBuilder();
        int colNum = c;
        while (colNum >= 0) {
            sb.insert(0, (char) ('A' + (colNum % 26)));
            colNum = (colNum / 26) - 1;
        }
        sb.append(r + 1);
        return sb.toString();
    }
}

