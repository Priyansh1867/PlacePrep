package com.placeprep.timetable;

import com.placeprep.dto.timetable.AvailabilityCellDto;
import com.placeprep.dto.timetable.AvailabilityMatrixDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import com.placeprep.repository.timetable.TimetableSlotRepository;
import com.placeprep.service.timetable.AvailabilityMatrixService;
import com.placeprep.service.timetable.DepartmentResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class AvailabilityMatrixTest {

    private FacultyProfileRepository facultyProfileRepository;
    private TimetableSlotRepository slotRepository;
    private DepartmentResolver departmentResolver;
    private AvailabilityMatrixService matrixService;

    private FacultyProfile prof1;
    private FacultyProfile prof2;

    @BeforeEach
    void setUp() {
        prof1 = new FacultyProfile();
        prof1.setId(1L);
        prof1.setShortCode("P1");
        prof1.setFullName("Prof. One");
        prof1.setDepartmentCode("AI&DS");

        prof2 = new FacultyProfile();
        prof2.setId(2L);
        prof2.setShortCode("P2");
        prof2.setFullName("Prof. Two");
        prof2.setDepartmentCode("AI&DS");

        // Prof 1 is busy on Day 1, Period 1
        TimetableSlot s1 = new TimetableSlot();
        s1.setId(10L);
        s1.setDayOfWeek(1);
        s1.setStartPeriod(1);
        s1.setSpan(1);
        s1.setFaculty(Set.of(prof1));

        facultyProfileRepository = createProxy(FacultyProfileRepository.class, Map.of(
                "findAll", List.of(prof1, prof2),
                "findAllById", List.of(prof1, prof2)
        ));
        slotRepository = createProxy(TimetableSlotRepository.class, Map.of(
                "findByAcademicSessionAndTermNonArchived", List.of(s1)
        ));
        departmentResolver = new DepartmentResolver(facultyProfileRepository);

        matrixService = new AvailabilityMatrixService(
                facultyProfileRepository,
                slotRepository,
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
    @DisplayName("Availability matrix correctly identifies busy vs free faculty across heat cells")
    void testAvailabilityMatrixGrid() {
        AvailabilityMatrixDto matrix = matrixService.getAvailabilityMatrix(
                List.of(1L, 2L), "AI&DS", "2026-27", Term.ODD
        );

        assertNotNull(matrix);
        assertEquals(2, matrix.getFacultyMembers().size());
        assertNotNull(matrix.getCells());
        assertFalse(matrix.getCells().isEmpty());

        // Cell Day 1, Period 1: Prof 1 is busy, Prof 2 is free
        AvailabilityCellDto day1p1 = matrix.getCells().stream()
                .filter(c -> c.getDayOfWeek() == 1 && c.getPeriodIndex() == 1)
                .findFirst()
                .orElse(null);

        assertNotNull(day1p1);
        assertEquals(1, day1p1.getBusyCount());
        assertEquals(1, day1p1.getFreeCount());
        assertEquals(0.5, day1p1.getFreeRatio());
        assertEquals(1, day1p1.getBusyFaculty().size());
        assertEquals(1L, day1p1.getBusyFaculty().get(0).getFacultyId());

        // Lunch break cell (Period 5) is marked break
        AvailabilityCellDto breakCell = matrix.getCells().stream()
                .filter(c -> c.getDayOfWeek() == 1 && c.getPeriodIndex() == 5)
                .findFirst()
                .orElse(null);

        assertNotNull(breakCell);
        assertTrue(breakCell.isBreak());
    }
}
