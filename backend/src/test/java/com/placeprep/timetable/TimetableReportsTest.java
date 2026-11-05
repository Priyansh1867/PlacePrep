package com.placeprep.timetable;

import com.placeprep.dto.timetable.FacultyWorkloadReportDto;
import com.placeprep.dto.timetable.RoomUtilisationReportDto;
import com.placeprep.dto.timetable.RoomUtilisationSummaryDto;
import com.placeprep.dto.timetable.SectionFreePeriodsReportDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.DepartmentResolver;
import com.placeprep.service.timetable.TimetableReportsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class TimetableReportsTest {

    private FacultyProfileRepository facultyProfileRepository;
    private TimetableSlotRepository slotRepository;
    private TimetableRoomRepository roomRepository;
    private TimetableSectionRepository sectionRepository;
    private TimetableRepository timetableRepository;
    private DepartmentResolver departmentResolver;
    private TimetableReportsService reportsService;

    private FacultyProfile profA;
    private Timetable publishedTt;
    private TimetableRoom room101;
    private TimetableSection secA;
    private List<TimetableSlot> slots;

    @BeforeEach
    void setUp() {
        profA = new FacultyProfile();
        profA.setId(1L);
        profA.setShortCode("AB");
        profA.setFullName("Dr. Alice Brown");
        profA.setDepartmentCode("AI&DS");

        publishedTt = new Timetable();
        publishedTt.setId(10L);
        publishedTt.setStatus(TimetableStatus.PUBLISHED);
        publishedTt.setDepartmentCode("AI&DS");

        room101 = new TimetableRoom();
        room101.setId(101L);
        room101.setCode("R101");
        room101.setDisplayName("Room 101");
        room101.setRoomType(RoomType.CLASSROOM);
        room101.setCapacity(60);

        secA = new TimetableSection();
        secA.setId(201L);
        secA.setName("A");
        secA.setTimetable(publishedTt);

        slots = new ArrayList<>();

        // Slot 1: Day 1, Period 1, Theory, Prof A, Room 101
        TimetableSlot s1 = new TimetableSlot();
        s1.setId(1L);
        s1.setTimetable(publishedTt);
        s1.setSection(secA);
        s1.setDayOfWeek(1);
        s1.setStartPeriod(1);
        s1.setSpan(1);
        s1.setSlotKind(SlotKind.THEORY);
        s1.setRoom(room101);
        s1.setFaculty(Set.of(profA));
        slots.add(s1);

        // Slot 2: Day 1, Period 2, Theory, Prof A, Room 101 (consecutive)
        TimetableSlot s2 = new TimetableSlot();
        s2.setId(2L);
        s2.setTimetable(publishedTt);
        s2.setSection(secA);
        s2.setDayOfWeek(1);
        s2.setStartPeriod(2);
        s2.setSpan(1);
        s2.setSlotKind(SlotKind.THEORY);
        s2.setRoom(room101);
        s2.setFaculty(Set.of(profA));
        slots.add(s2);

        // Slot 3: Day 2, Period 3, Lab (span 2), Prof A, Room 101
        TimetableSlot s3 = new TimetableSlot();
        s3.setId(3L);
        s3.setTimetable(publishedTt);
        s3.setSection(secA);
        s3.setDayOfWeek(2);
        s3.setStartPeriod(3);
        s3.setSpan(2);
        s3.setSlotKind(SlotKind.LAB);
        s3.setRoom(room101);
        s3.setFaculty(Set.of(profA));
        slots.add(s3);

        facultyProfileRepository = createProxy(FacultyProfileRepository.class, Map.of(
                "findAll", List.of(profA)
        ));
        slotRepository = createProxy(TimetableSlotRepository.class, Map.of(
                "findAll", slots,
                "findByTimetableId", slots
        ));
        roomRepository = createProxy(TimetableRoomRepository.class, Map.of(
                "findAll", List.of(room101)
        ));
        sectionRepository = createProxy(TimetableSectionRepository.class, Map.of(
                "findAll", List.of(secA),
                "findByTimetableId", List.of(secA)
        ));
        timetableRepository = createProxy(TimetableRepository.class, Map.of(
                "findByStatus", List.of(publishedTt)
        ));

        departmentResolver = new DepartmentResolver(facultyProfileRepository);
        reportsService = new TimetableReportsService(
                facultyProfileRepository,
                slotRepository,
                roomRepository,
                sectionRepository,
                timetableRepository,
                departmentResolver
        );
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> intf, Map<String, Object> returns) {
        return (T) Proxy.newProxyInstance(
                intf.getClassLoader(),
                new Class<?>[]{intf},
                (proxy, method, args) -> returns.get(method.getName())
        );
    }

    @Test
    @DisplayName("Faculty workload report computes theory, lab, total, and consecutive periods")
    void testFacultyWorkloadReport() {
        List<FacultyWorkloadReportDto> reports = reportsService.getFacultyWorkload("AI&DS");
        assertEquals(1, reports.size());
        FacultyWorkloadReportDto r = reports.get(0);
        assertEquals("Dr. Alice Brown", r.getFullName());
        assertEquals(2, r.getTheoryPeriods()); // s1 and s2
        assertEquals(2, r.getLabPeriods());    // s3 span 2
        assertEquals(4, r.getTotalPeriods());
        assertEquals(2, r.getPerDayPeak());    // Day 1 has 2, Day 2 has 2
        assertEquals(2, r.getMaxConsecutivePeriods()); // Periods 1 and 2 on Day 1
    }

    @Test
    @DisplayName("Faculty workload XLSX export generates valid binary spreadsheet")
    void testExportFacultyWorkloadXlsx() throws Exception {
        List<FacultyWorkloadReportDto> reports = reportsService.getFacultyWorkload("AI&DS");
        byte[] xlsx = reportsService.exportFacultyWorkloadXlsx(reports);
        assertNotNull(xlsx);
        assertTrue(xlsx.length > 500, "Spreadsheet output should contain standard PKZIP header and bytes");
    }

    @Test
    @DisplayName("Room utilisation report computes hours used and idle status")
    void testRoomUtilisationReport() {
        RoomUtilisationSummaryDto summary = reportsService.getRoomUtilisation("AI&DS");
        assertNotNull(summary);
        assertEquals(1, summary.getTotalRooms());
        assertEquals(0, summary.getIdleRoomsCount());
        RoomUtilisationReportDto roomReport = summary.getRooms().get(0);
        assertEquals("R101", roomReport.getRoomCode());
        assertEquals(4, roomReport.getHoursUsed()); // 1 + 1 + 2 = 4
        assertFalse(roomReport.isIdle());
    }

    @Test
    @DisplayName("Section free periods report calculates scheduled and free periods")
    void testSectionFreePeriodsReport() {
        List<SectionFreePeriodsReportDto> reports = reportsService.getSectionFreePeriods("AI&DS");
        assertNotNull(reports);
        assertEquals(1, reports.size());
        SectionFreePeriodsReportDto secReport = reports.get(0);
        assertEquals("A", secReport.getSectionName());
        assertTrue(secReport.getTotalFreePeriods() > 0);
        assertNotNull(secReport.getFreePeriodsPerDay());
    }
}
