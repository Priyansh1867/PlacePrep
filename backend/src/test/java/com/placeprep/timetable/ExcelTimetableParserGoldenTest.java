package com.placeprep.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.SlotKind;
import com.placeprep.service.timetable.importer.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class ExcelTimetableParserGoldenTest {

    private ExcelTimetableParser parser;
    private ObjectMapper objectMapper;

    private File getWorkbookFile() {
        File file = new File("src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
        if (!file.exists()) {
            file = new File("backend/src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
        }
        return file;
    }

    @BeforeEach
    void setUp() {
        parser = new ExcelTimetableParser();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Test
    @DisplayName("Golden Test Suite - Complete Hand-Verified Assertions on Real Timetable Workbook")
    void testGoldenTimetableAssertions() throws Exception {
        File file = getWorkbookFile();
        assertTrue(file.exists(), "Workbook file must exist at " + file.getAbsolutePath());

        ImportPreviewDto preview = parser.parse(file, "2026-27");
        assertNotNull(preview, "Parsed preview must not be null");

        // 1. Sections and Lab groups counts
        // Golden: Total 10 sections, 20 lab groups
        List<SectionDto> sections = preview.getSections();
        assertEquals(10, sections.size(), "Workbook must yield exactly 10 sections across V, III, and VII Sem sheets");

        List<LabGroupDto> labGroups = preview.getLabGroups();
        assertEquals(20, labGroups.size(), "Workbook must yield exactly 20 lab groups (2 per section)");

        // 2. V Sem Section A, Monday 8:30-10:30
        // CG LAB, faculty AB (Ambika Bagri), room DT9, group A1
        // ADV JAVA LAB, faculty RG (Rahul Guha), room DF04, group A2 (parallel)
        List<SlotDto> secASlots = preview.getSlots().stream()
                .filter(s -> "A".equalsIgnoreCase(s.getSectionName()) && s.getSourceRef().contains("V Sem"))
                .toList();
        assertFalse(secASlots.isEmpty(), "V Sem Section A must have slots");

        SlotDto mon830A1 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 1 && s.getStartPeriod() == 1 && "A1".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(mon830A1, "Monday 8:30 A1 slot must exist");
        assertTrue(mon830A1.getSubjectName().toUpperCase().contains("CG LAB"), "Subject must be CG LAB");
        assertEquals("DT9", mon830A1.getRoomCode(), "Room must be DT9");
        assertTrue(mon830A1.getFacultyNames().stream().anyMatch(f -> f.contains("Ambika")), "Faculty must resolve to Ambika Bagri (AB)");

        SlotDto mon830A2 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 1 && s.getStartPeriod() == 1 && "A2".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(mon830A2, "Monday 8:30 A2 slot must exist");
        assertTrue(mon830A2.getSubjectName().toUpperCase().contains("ADV JAVA LAB"), "Subject must be ADV JAVA LAB");
        assertEquals("DF04", mon830A2.getRoomCode(), "Room must be DF04 (normalized from DFo4)");
        assertTrue(mon830A2.getFacultyNames().stream().anyMatch(f -> f.contains("Rahul Guha")), "Faculty must resolve to Rahul Guha (RG)");

        // 3. V Sem Section A, Monday 10:30-11:30: DMW, faculty RG, whole section, room DF04 (inherited from Venue)
        SlotDto mon1030Whole = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 1 && s.getStartPeriod() == 3)
                .findFirst().orElse(null);
        assertNotNull(mon1030Whole, "Monday 10:30 slot must exist");
        assertTrue(mon1030Whole.getSubjectName().toUpperCase().contains("DMW"), "Subject must be DMW");
        assertNull(mon1030Whole.getLabGroupCode(), "Whole section theory class must have null labGroupCode");
        assertEquals("DF04", mon1030Whole.getRoomCode(), "Room must be inherited from Venue line as DF04");
        assertTrue(mon1030Whole.getFacultyNames().stream().anyMatch(f -> f.contains("Rahul Guha")), "Faculty must be Rahul Guha");

        // 4. V Sem Section A, Monday 2:30-3:30: IT LAB for group A2 only, faculty DB, no room
        SlotDto mon230A2 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 1 && s.getStartPeriod() == 7 && "A2".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(mon230A2, "Monday 2:30 IT LAB for A2 must exist");
        assertTrue(mon230A2.getSubjectName().toUpperCase().contains("IT LAB"), "Subject must be IT LAB");
        assertEquals("A2", mon230A2.getLabGroupCode(), "Must be for group A2 only");

        // 5. V Sem Section A, Tuesday 2:30-3:30: IT LAB for A1, faculty YP
        SlotDto tue230A1 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 2 && s.getStartPeriod() == 7 && "A1".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(tue230A1, "Tuesday 2:30 IT LAB for A1 must exist");
        assertTrue(tue230A1.getSubjectName().toUpperCase().contains("IT LAB"), "Subject must be IT LAB");
        assertEquals("A1", tue230A1.getLabGroupCode(), "Must be for group A1 only");
        assertTrue(tue230A1.getFacultyNames().stream().anyMatch(f -> f.contains("Yogita Punjabi")), "Faculty must resolve to Yogita Punjabi (YP)");

        // 6. V Sem Section A, Wednesday 12:30-2:30: AOA LAB (A1, YP, DF5) and CD LAB (A2, JS, DS11)
        SlotDto wed1230A1 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 3 && s.getStartPeriod() == 5 && "A1".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(wed1230A1, "Wednesday 12:30 A1 slot must exist");
        assertTrue(wed1230A1.getSubjectName().toUpperCase().contains("AOA LAB"), "Subject must be AOA LAB");
        assertEquals("DF5", wed1230A1.getRoomCode(), "Room must be DF5");

        SlotDto wed1230A2 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 3 && s.getStartPeriod() == 5 && "A2".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(wed1230A2, "Wednesday 12:30 A2 slot must exist");
        assertTrue(wed1230A2.getSubjectName().toUpperCase().contains("CD LAB"), "Subject must be CD LAB");
        assertEquals("DS11", wed1230A2.getRoomCode(), "Room must be DS11");


        // 7. V Sem Section A, Wednesday 2:30-3:30 MENTOR_MEETING for A1; Thursday 2:30-3:30 for A2
        SlotDto wed230MentorA1 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 3 && s.getStartPeriod() == 7 && "A1".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(wed230MentorA1, "Wednesday 2:30 MENTOR_MEETING for A1 must exist");
        assertEquals(SlotKind.MENTOR_MEETING, wed230MentorA1.getSlotKind());
        assertEquals("A1", wed230MentorA1.getLabGroupCode());

        SlotDto thu230MentorA2 = secASlots.stream()
                .filter(s -> s.getDayOfWeek() == 4 && s.getStartPeriod() == 7 && "A2".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(thu230MentorA2, "Thursday 2:30 MENTOR_MEETING for A2 must exist");
        assertEquals(SlotKind.MENTOR_MEETING, thu230MentorA2.getSlotKind());
        assertEquals("A2", thu230MentorA2.getLabGroupCode());

        // 8. V Sem Section C, Tuesday 2:30-3:30: MENTOR_MEETING for C1
        List<SlotDto> secCSlots = preview.getSlots().stream()
                .filter(s -> "C".equalsIgnoreCase(s.getSectionName()) && s.getSourceRef().contains("V Sem"))
                .toList();
        SlotDto tue230MentorC1 = secCSlots.stream()
                .filter(s -> s.getDayOfWeek() == 2 && s.getStartPeriod() == 7 && "C1".equalsIgnoreCase(s.getLabGroupCode()))
                .findFirst().orElse(null);
        assertNotNull(tue230MentorC1, "Tuesday 2:30 MENTOR_MEETING for C1 must exist in V Sem Section C");
        assertEquals(SlotKind.MENTOR_MEETING, tue230MentorC1.getSlotKind());
        assertEquals("C1", tue230MentorC1.getLabGroupCode());

        // 9. V Sem Section A has no Friday classes; Section C has no Saturday classes
        long secAFridaySlots = secASlots.stream().filter(s -> s.getDayOfWeek() == 5).count();
        assertEquals(0, secAFridaySlots, "V Sem Section A must have no Friday classes");

        long secCSatSlots = secCSlots.stream().filter(s -> s.getDayOfWeek() == 6).count();
        assertEquals(0, secCSatSlots, "V Sem Section C must have no Saturday classes");

        // 10. Cell "CD-  Ms. Deepali" resolves to faculty Deepali Bhardwaj
        boolean deepaliResolved = preview.getFaculty().stream()
                .anyMatch(f -> f.getRawNameOrCode().contains("Deepali") && f.getResolvedFullName().contains("Deepali Bhardwaj"));
        assertTrue(deepaliResolved, "Cell 'CD-  Ms. Deepali' must resolve to Deepali Bhardwaj");

        // 11. Deterministic JSON output: Parsing the same file twice gives identical JSON
        ImportPreviewDto preview2 = parser.parse(file, "2026-27");
        String json1 = objectMapper.writeValueAsString(preview);
        String json2 = objectMapper.writeValueAsString(preview2);
        assertEquals(json1, json2, "Parsing the same file twice must yield identical JSON");

        // 12. Printed summary required by prompt
        printSummary(preview);
    }

    @Test
    @DisplayName("Cell 'SE Lab-IIIB1-DS8-Dr. Geeija  (2:00 - 3:30)' gives custom times 14:00-15:30 and faculty Geerija Lawania")
    void testCustomTimesAndFuzzyFacultyResolution() throws Exception {
        // Golden item: Cell "SE Lab-IIIB1-DS8-Dr. Geeija  (2:00 - 3:30)" gives custom times 14:00-15:30 and faculty Geerija Lawania
        SlotDto slot = parser.parseSingleCell("V-VII FACULTY", "P24", "SE Lab-IIIB1-DS8-Dr. Geeija  (2:00 - 3:30)", "B", null, 1, 7, 2, "DS8", false);
        assertNotNull(slot, "Parsed slot from cell must not be null");
        assertEquals(LocalTime.of(14, 0), slot.getCustomStart(), "Custom start must be 14:00");
        assertEquals(LocalTime.of(15, 30), slot.getCustomEnd(), "Custom end must be 15:30");
        assertNotNull(slot.getFacultyNames(), "Faculty names must be resolved");
        assertTrue(slot.getFacultyNames().stream().anyMatch(f -> f.contains("Geerija Lawania")), "Faculty Dr. Geeija must resolve to Geerija Lawania");

        // Verify full workbook parsing registers Geerija Lawania in faculty registry
        File file = getWorkbookFile();
        ImportPreviewDto preview = parser.parse(file, "2026-27");
        boolean facultyResolved = preview.getFaculty().stream()
                .anyMatch(f -> f.getResolvedFullName() != null && f.getResolvedFullName().contains("Geerija Lawania"));
        assertTrue(facultyResolved, "Faculty registry must include Geerija Lawania");
    }


    @Test
    @DisplayName("A corrupt or empty workbook returns an error report, never a 500 or an exception stack")
    void testCorruptOrEmptyWorkbook() {
        // Empty byte stream
        ImportPreviewDto emptyResult = parser.parse(new ByteArrayInputStream(new byte[0]), "2026-27");
        assertNotNull(emptyResult);
        assertFalse(emptyResult.getErrors().isEmpty(), "Empty workbook must return errors");

        // Corrupt bytes
        byte[] junk = new byte[]{1, 2, 3, 4, 5, 6, 7, 8, 9};
        ImportPreviewDto corruptResult = parser.parse(new ByteArrayInputStream(junk), "2026-27");
        assertNotNull(corruptResult);
        assertFalse(corruptResult.getErrors().isEmpty(), "Corrupt workbook must return errors without throwing exception");

        // Non-existent file
        ImportPreviewDto missingResult = parser.parse(new File("non_existent_file.xlsx"), "2026-27");
        assertNotNull(missingResult);
        assertFalse(missingResult.getErrors().isEmpty(), "Missing file must return clean error");
    }

    private void printSummary(ImportPreviewDto preview) {
        System.out.println("\n=======================================================");
        System.out.println("            TIMETABLE IMPORT PARSER SUMMARY            ");
        System.out.println("=======================================================");

        System.out.println("\n--- SLOT COUNTS PER SECTION ---");
        preview.getSlotCountsPerSection().forEach((sec, count) -> {
            System.out.printf("  Section %-10s : %d slots\n", sec, count);
        });

        System.out.println("\n--- ALL WARNINGS GROUPED BY CODE ---");
        Map<String, List<ImportIssueDto>> warningsByCode = preview.getWarnings().stream()
                .collect(Collectors.groupingBy(ImportIssueDto::getCode));
        warningsByCode.forEach((code, list) -> {
            System.out.printf("  [%s] (Count: %d)\n", code, list.size());
            list.stream().limit(3).forEach(w -> System.out.printf("    - %s (%s): %s\n", w.getSheetName(), w.getCellRef(), w.getMessage()));
            if (list.size() > 3) {
                System.out.printf("    ... and %d more\n", list.size() - 3);
            }
        });

        System.out.println("\n--- ALL DETECTED CLASHES ---");
        System.out.println("  Total Clashes Detected: " + preview.getClashes().size());
        preview.getClashes().forEach(c -> {
            System.out.printf("  [%s] %s period %s: %s\n",
                    c.getClashType(), c.getDay(), c.getPeriodRange(), c.getMessage());

        });
        System.out.println("=======================================================\n");
    }
}

