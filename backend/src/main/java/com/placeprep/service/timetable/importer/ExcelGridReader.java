package com.placeprep.service.timetable.importer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
public class ExcelGridReader implements TimetableGridReader {

    private final ExcelWorkbookReader workbookReader;

    public ExcelGridReader() {
        this.workbookReader = new ExcelWorkbookReader();
    }

    public ExcelGridReader(ExcelWorkbookReader workbookReader) {
        this.workbookReader = workbookReader;
    }

    @Override
    public List<CellGrid> read(InputStream inputStream) throws Exception {
        return workbookReader.readWorkbook(inputStream);
    }

    @Override
    public boolean supports(String filename, String contentType) {
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                return true;
            }
        }
        if (contentType != null) {
            String lower = contentType.toLowerCase();
            return lower.contains("spreadsheet") || lower.contains("excel");
        }
        return false;
    }
}

