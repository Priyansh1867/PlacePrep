package com.placeprep.service.timetable.importer;

import org.apache.poi.ss.usermodel.Sheet;

public interface SheetReader {
    CellGrid readSheet(Sheet sheet);
}

