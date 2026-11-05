package com.placeprep.service.timetable.importer;

import java.io.InputStream;
import java.util.List;

public interface TimetableGridReader {
    List<CellGrid> read(InputStream inputStream) throws Exception;
    boolean supports(String filename, String contentType);
}

