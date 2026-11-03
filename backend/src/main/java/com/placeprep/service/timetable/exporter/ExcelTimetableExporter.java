package com.placeprep.service.timetable.exporter;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.SlotKind;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ExcelTimetableExporter {

    private static final String[] DAYS = {"MON", "TUE", "WED", "THU", "FRI", "SAT"};
    private static final String[] DEFAULT_PERIOD_TIMES = {
            "8:30-9:30", "9:30-10:30", "10:30-11:30", "11:30-12:30",
            "12:30-1:30", "1:30-2:30", "2:30-3:30", "3:30-4:30"
    };

    public byte[] generateWorkbook(
            TimetableDto meta,
            List<PeriodDto> periods,
            List<SectionDto> sections,
            List<SlotDto> slots,
            List<SubjectDto> subjects,
            List<FacultyResolutionDto> facultyList,
            List<RoomDto> rooms
    ) throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle dayStyle = createDayStyle(wb);
            CellStyle theoryStyle = createSlotStyle(wb, IndexedColors.LIGHT_TURQUOISE.getIndex());
            CellStyle labStyle = createSlotStyle(wb, IndexedColors.LIGHT_GREEN.getIndex());
            CellStyle mentorStyle = createSlotStyle(wb, IndexedColors.LIGHT_YELLOW.getIndex());
            CellStyle defaultSlotStyle = createSlotStyle(wb, IndexedColors.WHITE.getIndex());
            CellStyle titleStyle = createTitleStyle(wb);

            // 1. Group slots by Semester / Source Sheet
            Map<String, List<SlotDto>> slotsBySheet = new LinkedHashMap<>();
            for (SlotDto s : slots) {
                String sheetName = "Master TT";
                if (s.getSourceRef() != null && s.getSourceRef().contains("!")) {
                    sheetName = s.getSourceRef().substring(0, s.getSourceRef().indexOf("!")).trim();
                } else if (meta != null && meta.getSemester() != null) {
                    sheetName = "Sem " + meta.getSemester() + " Master TT";
                }
                slotsBySheet.computeIfAbsent(sheetName, k -> new ArrayList<>()).add(s);
            }

            if (slotsBySheet.isEmpty()) {
                slotsBySheet.put("Master TT", slots);
            }

            for (Map.Entry<String, List<SlotDto>> entry : slotsBySheet.entrySet()) {
                String rawName = entry.getKey();
                String safeName = rawName.replaceAll("[:\\\\/*?\\[\\]]", "_");
                if (safeName.length() > 31) safeName = safeName.substring(0, 31);
                Sheet sheet = wb.createSheet(safeName);
                sheet.setDisplayGridlines(true);

                List<SlotDto> sheetSlots = entry.getValue();
                Set<String> secNames = sheetSlots.stream()
                        .map(SlotDto::getSectionName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toCollection(TreeSet::new));
                if (secNames.isEmpty()) secNames.add("A");

                int startRow = 0;
                int semForSheet = inferSemester(rawName, meta != null ? meta.getSemester() : 5);
                for (String secName : secNames) {
                    List<SlotDto> secSlots = sheetSlots.stream().filter(s -> secName.equalsIgnoreCase(s.getSectionName())).toList();
                    SectionDto secDto = (sections != null) ? sections.stream().filter(s -> secName.equalsIgnoreCase(s.getName())).findFirst().orElse(null) : null;

                    int lastRow = writeSectionGrid(sheet, startRow, secName, semForSheet, meta, periods, secSlots, secDto, subjects, facultyList,
                            titleStyle, headerStyle, dayStyle, theoryStyle, labStyle, mentorStyle, defaultSlotStyle);
                    startRow = lastRow + 4; // Clean spacing between stacked section blocks
                }
            }

            // 2. AUTO-GENERATED LAB Sheet
            writeLabSheet(wb, slots, periods, meta, titleStyle, headerStyle, dayStyle, labStyle);

            // 3. AUTO-GENERATED Room Sheet
            writeRoomSheet(wb, slots, periods, meta, rooms, titleStyle, headerStyle, dayStyle, theoryStyle);

            // 4. AUTO-GENERATED FACULTY Sheet
            writeFacultySheet(wb, slots, periods, meta, facultyList, titleStyle, headerStyle, dayStyle, theoryStyle, labStyle);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    private int writeSectionGrid(
            Sheet sheet,
            int baseRow,
            String secName,
            int sem,
            TimetableDto meta,
            List<PeriodDto> periods,
            List<SlotDto> secSlots,
            SectionDto secDto,
            List<SubjectDto> subjects,
            List<FacultyResolutionDto> facultyList,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle dayStyle,
            CellStyle theoryStyle, CellStyle labStyle, CellStyle mentorStyle, CellStyle defaultSlotStyle
    ) {
        String session = (meta != null && meta.getAcademicSession() != null) ? meta.getAcademicSession() : "2026-27";
        String yearName = switch ((sem + 1) / 2) {
            case 1 -> "I YEAR B.Tech";
            case 2 -> "II YEAR B.Tech";
            case 3 -> "III YEAR B.Tech";
            case 4 -> "IV YEAR B.Tech";
            default -> "B.Tech";
        };

        // Title Rows
        Row r0 = sheet.createRow(baseRow + 0);
        r0.createCell(0).setCellValue("PlacePrep College of Engineering & Technology");
        r0.getCell(0).setCellStyle(titleStyle);

        Row r1 = sheet.createRow(baseRow + 1);
        r1.createCell(0).setCellValue("Department of Computer Science & Engineering / AI & DS");
        r1.getCell(0).setCellStyle(titleStyle);

        Row r2 = sheet.createRow(baseRow + 2);
        r2.createCell(0).setCellValue(yearName + " Semester " + sem + " " + session);
        r2.getCell(0).setCellStyle(titleStyle);

        Row r3 = sheet.createRow(baseRow + 3);
        String venue = (secDto != null && secDto.getHomeRoomCode() != null) ? secDto.getHomeRoomCode() : "DS11";
        r3.createCell(0).setCellValue("Time-Table Section: " + secName + " (" + secName + "1+" + secName + "2) Venue: " + venue);
        r3.getCell(0).setCellStyle(titleStyle);

        // Period Header
        Row r4 = sheet.createRow(baseRow + 4);
        Cell pDayCell = r4.createCell(0);
        pDayCell.setCellValue("PERIOD DAY");
        pDayCell.setCellStyle(headerStyle);

        int numPeriods = 8;
        for (int p = 1; p <= numPeriods; p++) {
            Cell pc = r4.createCell(p);
            String timeText = (p - 1 < DEFAULT_PERIOD_TIMES.length) ? DEFAULT_PERIOD_TIMES[p - 1] : "P" + p;
            if (periods != null && p - 1 < periods.size()) {
                PeriodDto pd = periods.get(p - 1);
                if (pd.getStartTime() != null && pd.getEndTime() != null) {
                    timeText = pd.getStartTime() + "-" + pd.getEndTime();
                }
            }
            pc.setCellValue(timeText);
            pc.setCellStyle(headerStyle);
        }

        // Days
        int curRow = baseRow + 5;
        int numDays = (secSlots == null || secSlots.isEmpty() || secSlots.stream().anyMatch(s -> s.getDayOfWeek() != null && s.getDayOfWeek() >= 6)) ? 6 : 5;
        for (int d = 0; d < numDays; d++) {
            int dayOfWeek = d + 1;
            int topRowIdx = curRow;
            int botRowIdx = curRow + 1;

            Row rowTop = sheet.createRow(topRowIdx);
            Row rowBot = sheet.createRow(botRowIdx);

            // Merge Day column across top & bottom row
            Cell dayCell = rowTop.createCell(0);
            dayCell.setCellValue(DAYS[d]);
            dayCell.setCellStyle(dayStyle);
            rowBot.createCell(0).setCellStyle(dayStyle);
            safeMerge(sheet, new CellRangeAddress(topRowIdx, botRowIdx, 0, 0));

            // Populate slots for this day
            List<SlotDto> daySlots = secSlots.stream().filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == dayOfWeek).toList();

            for (SlotDto slot : daySlots) {
                int pStart = (slot.getStartPeriod() != null) ? slot.getStartPeriod() : 1;
                int span = (slot.getSpan() != null) ? slot.getSpan() : 1;
                if (pStart < 1 || pStart > numPeriods) continue;

                int pEnd = Math.min(pStart + span - 1, numPeriods);

                boolean isGroup1 = slot.getLabGroupCode() != null && slot.getLabGroupCode().endsWith("1");
                boolean isGroup2 = slot.getLabGroupCode() != null && slot.getLabGroupCode().endsWith("2");
                boolean isWholeSection = !isGroup1 && !isGroup2;

                String cellText = buildSlotCellGrammarText(slot);
                CellStyle slotStyle = chooseStyle(slot.getSlotKind(), theoryStyle, labStyle, mentorStyle, defaultSlotStyle);

                if (isWholeSection) {
                    Cell c = rowTop.createCell(pStart);
                    c.setCellValue(cellText);
                    c.setCellStyle(slotStyle);
                    for (int col = pStart; col <= pEnd; col++) {
                        if (col != pStart) rowTop.createCell(col).setCellStyle(slotStyle);
                        rowBot.createCell(col).setCellStyle(slotStyle);
                    }
                    safeMerge(sheet, new CellRangeAddress(topRowIdx, botRowIdx, pStart, pEnd));
                } else if (isGroup1) {
                    Cell c = rowTop.createCell(pStart);
                    c.setCellValue(slot.getLabGroupCode() + ": " + cellText);
                    c.setCellStyle(slotStyle);
                    for (int col = pStart + 1; col <= pEnd; col++) {
                        rowTop.createCell(col).setCellStyle(slotStyle);
                    }
                    if (pEnd > pStart) {
                        safeMerge(sheet, new CellRangeAddress(topRowIdx, topRowIdx, pStart, pEnd));
                    }
                } else {
                    Cell c = rowBot.createCell(pStart);
                    c.setCellValue(slot.getLabGroupCode() + ": " + cellText);
                    c.setCellStyle(slotStyle);
                    for (int col = pStart + 1; col <= pEnd; col++) {
                        rowBot.createCell(col).setCellStyle(slotStyle);
                    }
                    if (pEnd > pStart) {
                        safeMerge(sheet, new CellRangeAddress(botRowIdx, botRowIdx, pStart, pEnd));
                    }
                }
            }

            curRow += 2;
        }

        // Legend Block (Row 16+)
        curRow += 1;
        Row legHead = sheet.createRow(curRow++);
        legHead.createCell(0).setCellValue("RTU CODE");
        legHead.createCell(1).setCellValue("SUBJECT NAME");
        legHead.createCell(3).setCellValue("FACULTY CODE");
        legHead.createCell(4).setCellValue("FACULTY NAME");

        // Unique subjects present in slots
        Set<String> seenSubjects = new HashSet<>();
        for (SlotDto s : secSlots) {
            String sc = (s.getSubjectCode() != null) ? s.getSubjectCode() : s.getSubjectName();
            if (sc != null && seenSubjects.add(sc)) {
                Row lr = sheet.createRow(curRow++);
                lr.createCell(0).setCellValue(s.getSubjectCode() != null ? s.getSubjectCode() : "");
                lr.createCell(1).setCellValue(s.getSubjectName() != null ? s.getSubjectName() : sc);

                if (s.getFacultyNames() != null && !s.getFacultyNames().isEmpty()) {
                    String fName = s.getFacultyNames().get(0);
                    lr.createCell(3).setCellValue(extractShortCode(fName));
                    lr.createCell(4).setCellValue(fName);
                }
            }
        }

        // Class Coordinator & Mentors
        curRow++;
        Row coordRow = sheet.createRow(curRow++);
        String coordName = (secDto != null && secDto.getClassCoordinatorName() != null) ? secDto.getClassCoordinatorName() : "Ms. Ambika Bagri";
        coordRow.createCell(0).setCellValue("CLASS COORDINATOR: " + coordName);

        Row mentorRow = sheet.createRow(curRow);
        mentorRow.createCell(0).setCellValue("MENTOR " + secName + "1 - " + coordName + "  MENTOR " + secName + "2 - Ms. Samiksha Sen");

        for (int c = 0; c <= numPeriods; c++) {
            sheet.setColumnWidth(c, c == 0 ? 3500 : 4500);
        }
        return curRow;
    }

    private int inferSemester(String sheetName, Integer defaultSem) {
        if (sheetName != null) {
            String lower = sheetName.toLowerCase();
            if (lower.contains("iii") || lower.contains("sem 3") || lower.contains("3rd")) return 3;
            if (lower.contains("vii") || lower.contains("sem 7") || lower.contains("7th")) return 7;
            if (lower.contains("v") || lower.contains("sem 5") || lower.contains("5th")) return 5;
        }
        return defaultSem != null ? defaultSem : 5;
    }

    private void writeLabSheet(
            Workbook wb, List<SlotDto> slots, List<PeriodDto> periods, TimetableDto meta,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle dayStyle, CellStyle labStyle
    ) {
        Sheet sheet = wb.createSheet("LAB");
        sheet.setDisplayGridlines(true);

        List<SlotDto> labSlots = slots.stream()
                .filter(s -> s.getSlotKind() == SlotKind.LAB || (s.getRoomCode() != null && s.getRoomCode().toUpperCase().matches(".*(LAB|DT|DF|DS).*")))
                .toList();

        Set<String> labRooms = labSlots.stream()
                .map(SlotDto::getRoomCode)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));

        if (labRooms.isEmpty()) {
            labRooms.addAll(List.of("DS11", "DF05", "DT9", "DS8"));
        }

        int startRow = 0;
        for (String room : labRooms) {
            writeRoomOrFacultyGrid(sheet, "Venue: " + room, startRow, labSlots.stream().filter(s -> room.equalsIgnoreCase(s.getRoomCode())).toList(),
                    headerStyle, dayStyle, labStyle);
            startRow += 15;
        }
    }

    private void writeRoomSheet(
            Workbook wb, List<SlotDto> slots, List<PeriodDto> periods, TimetableDto meta, List<RoomDto> rooms,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle dayStyle, CellStyle roomStyle
    ) {
        Sheet sheet = wb.createSheet("Room");
        sheet.setDisplayGridlines(true);

        Set<String> allRooms = slots.stream()
                .map(SlotDto::getRoomCode)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));

        if (allRooms.isEmpty()) {
            allRooms.addAll(List.of("DS1", "DS3", "DS5", "DS11", "DF05"));
        }

        int startRow = 0;
        for (String room : allRooms) {
            writeRoomOrFacultyGrid(sheet, "Room: " + room, startRow, slots.stream().filter(s -> room.equalsIgnoreCase(s.getRoomCode())).toList(),
                    headerStyle, dayStyle, roomStyle);
            startRow += 15;
        }
    }

    private void writeFacultySheet(
            Workbook wb, List<SlotDto> slots, List<PeriodDto> periods, TimetableDto meta, List<FacultyResolutionDto> facultyList,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle dayStyle, CellStyle theoryStyle, CellStyle labStyle
    ) {
        Sheet sheet = wb.createSheet("FACULTY");
        sheet.setDisplayGridlines(true);

        Set<String> faculties = slots.stream()
                .flatMap(s -> s.getFacultyNames() != null ? s.getFacultyNames().stream() : java.util.stream.Stream.empty())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));

        if (faculties.isEmpty()) {
            faculties.addAll(List.of("Ms. Ambika Bagri", "Dr. Sanjeev Kumar", "Ms. Nidhi Soni"));
        }

        int startRow = 0;
        for (String fac : faculties) {
            List<SlotDto> facSlots = slots.stream()
                    .filter(s -> s.getFacultyNames() != null && s.getFacultyNames().stream().anyMatch(f -> f.equalsIgnoreCase(fac)))
                    .toList();
            writeRoomOrFacultyGrid(sheet, "Faculty: " + fac, startRow, facSlots, headerStyle, dayStyle, theoryStyle);
            startRow += 15;
        }
    }

    private void writeRoomOrFacultyGrid(
            Sheet sheet, String title, int startRow, List<SlotDto> slots,
            CellStyle headerStyle, CellStyle dayStyle, CellStyle slotStyle
    ) {
        Row rTitle = sheet.createRow(startRow);
        rTitle.createCell(0).setCellValue(title);

        Row rHead = sheet.createRow(startRow + 1);
        rHead.createCell(0).setCellValue("PERIOD DAY");
        rHead.getCell(0).setCellStyle(headerStyle);

        for (int p = 1; p <= 8; p++) {
            Cell c = rHead.createCell(p);
            c.setCellValue(p - 1 < DEFAULT_PERIOD_TIMES.length ? DEFAULT_PERIOD_TIMES[p - 1] : "P" + p);
            c.setCellStyle(headerStyle);
        }

        int curRow = startRow + 2;
        int numDays = (slots == null || slots.isEmpty() || slots.stream().anyMatch(s -> s.getDayOfWeek() != null && s.getDayOfWeek() >= 6)) ? 6 : 5;
        for (int d = 0; d < numDays; d++) {
            int dayOfWeek = d + 1;
            Row row = sheet.createRow(curRow);
            Cell dc = row.createCell(0);
            dc.setCellValue(DAYS[d]);
            dc.setCellStyle(dayStyle);

            List<SlotDto> daySlots = slots.stream().filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == dayOfWeek).toList();
            for (SlotDto slot : daySlots) {
                int pStart = (slot.getStartPeriod() != null) ? slot.getStartPeriod() : 1;
                int span = (slot.getSpan() != null) ? slot.getSpan() : 1;
                if (pStart < 1 || pStart > 8) continue;

                int pEnd = Math.min(pStart + span - 1, 8);
                Cell c = row.createCell(pStart);
                String txt = (slot.getSectionName() != null ? slot.getSectionName() + "-" : "") +
                        (slot.getSubjectCode() != null ? slot.getSubjectCode() : "Class");
                c.setCellValue(txt);
                c.setCellStyle(slotStyle);

                for (int col = pStart + 1; col <= pEnd; col++) {
                    row.createCell(col).setCellStyle(slotStyle);
                }
                if (pEnd > pStart) {
                    safeMerge(sheet, new CellRangeAddress(curRow, curRow, pStart, pEnd));
                }
            }
            curRow++;
        }
    }

    private void safeMerge(Sheet sheet, CellRangeAddress region) {
        if (region.getFirstRow() == region.getLastRow() && region.getFirstColumn() == region.getLastColumn()) {
            return;
        }
        for (int i = 0; i < sheet.getNumMergedRegions(); i++) {
            CellRangeAddress existing = sheet.getMergedRegion(i);
            if (existing.intersects(region)) {
                return;
            }
        }
        sheet.addMergedRegion(region);
    }

    private String buildSlotCellGrammarText(SlotDto slot) {
        String sub = (slot.getSubjectCode() != null) ? slot.getSubjectCode() : (slot.getSubjectName() != null ? slot.getSubjectName() : "SUB");
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

    private CellStyle chooseStyle(SlotKind kind, CellStyle theory, CellStyle lab, CellStyle mentor, CellStyle def) {
        if (kind == null) return theory;
        return switch (kind) {
            case THEORY -> theory;
            case LAB -> lab;
            case MENTOR_MEETING, FOUNDATION -> mentor;
            default -> def;
        };
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 9);
        style.setFont(f);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createDayStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 10);
        style.setFont(f);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createSlotStyle(Workbook wb, short bgColor) {
        CellStyle style = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontHeightInPoints((short) 8);
        style.setFont(f);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        style.setFillForegroundColor(bgColor);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
    }

    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 10);
        style.setFont(f);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
