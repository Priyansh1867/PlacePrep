package com.placeprep.timetable;

import com.placeprep.dto.timetable.CandidateSlotDto;
import com.placeprep.dto.timetable.FindSlotRequestDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.FindSlotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class FindSlotServiceTest {

    private TimetableRepository timetableRepository;
    private TimetableSlotRepository slotRepository;
    private TimetableRoomRepository roomRepository;
    private FacultyProfileRepository facultyProfileRepository;
    private TimetablePeriodRepository periodRepository;
    private FindSlotService findSlotService;

    private TimetableRoom room1;
    private TimetableRoom room2;
    private FacultyProfile prof;
    private Timetable timetable;

    @BeforeEach
    void setUp() {
        timetable = new Timetable();
        timetable.setId(1L);
        timetable.setAcademicSession("2026-27");
        timetable.setTerm(Term.ODD);

        prof = new FacultyProfile();
        prof.setId(10L);
        prof.setFullName("Prof. Sharma");

        room1 = new TimetableRoom();
        room1.setId(101L);
        room1.setCode("CS-LAB1");
        room1.setDisplayName("CS Lab 1");
        room1.setRoomType(RoomType.LAB);

        room2 = new TimetableRoom();
        room2.setId(102L);
        room2.setCode("CR-102");
        room2.setDisplayName("Classroom 102");
        room2.setRoomType(RoomType.CLASSROOM);

        timetableRepository = createProxy(TimetableRepository.class, Map.of(
                "findById", Optional.of(timetable)
        ));
        slotRepository = createProxy(TimetableSlotRepository.class, Map.of(
                "findByAcademicSessionAndTermNonArchived", Collections.emptyList()
        ));
        roomRepository = createProxy(TimetableRoomRepository.class, Map.of(
                "findAll", List.of(room1, room2)
        ));
        facultyProfileRepository = createProxy(FacultyProfileRepository.class, Map.of(
                "findAllById", List.of(prof)
        ));
        periodRepository = createProxy(TimetablePeriodRepository.class, Map.of(
                "findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList()
        ));

        findSlotService = new FindSlotService(
                timetableRepository,
                slotRepository,
                roomRepository,
                facultyProfileRepository,
                periodRepository
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
    @DisplayName("Find slot returns up to 10 candidates filtered by room type and duration")
    void testFindCandidateSlots() {
        FindSlotRequestDto req = FindSlotRequestDto.builder()
                .timetableId(1L)
                .sectionId(100L)
                .subjectKind(SlotKind.LAB)
                .duration(2)
                .roomType(RoomType.LAB)
                .facultyIds(List.of(10L))
                .build();

        List<CandidateSlotDto> candidates = findSlotService.findCandidateSlots(req);
        assertNotNull(candidates);
        assertFalse(candidates.isEmpty());
        assertTrue(candidates.size() <= 10, "Should return at most 10 candidates");

        for (CandidateSlotDto c : candidates) {
            assertEquals(2, c.getSpan());
            assertEquals(101L, c.getRoom().getId()); // CS-LAB1
            // Span 2 cannot start on period 5 (lunch break)
            assertNotEquals(5, c.getStartPeriod());
        }
    }

    @Test
    @DisplayName("Preferred room gives highest ranking score")
    void testPreferredRoomRanking() {
        FindSlotRequestDto req = FindSlotRequestDto.builder()
                .timetableId(1L)
                .sectionId(100L)
                .subjectKind(SlotKind.THEORY)
                .duration(1)
                .preferredRoomId(102L)
                .facultyIds(List.of(10L))
                .build();

        List<CandidateSlotDto> candidates = findSlotService.findCandidateSlots(req);
        assertNotNull(candidates);
        assertFalse(candidates.isEmpty());
        // Candidate 0 should have the preferred room
        assertEquals(102L, candidates.get(0).getRoom().getId());
    }
}
