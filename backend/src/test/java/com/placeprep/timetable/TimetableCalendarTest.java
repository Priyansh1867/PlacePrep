package com.placeprep.timetable;

import com.placeprep.dto.timetable.CalendarEventDto;
import com.placeprep.dto.timetable.CreateCalendarEventRequestDto;
import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.CalendarEventScope;
import com.placeprep.model.timetable.TimetableCalendarEvent;
import com.placeprep.repository.timetable.TimetableCalendarEventRepository;
import com.placeprep.service.timetable.TimetableCalendarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class TimetableCalendarTest {

    private TimetableCalendarEventRepository repository;
    private TimetableCalendarService service;
    private Map<Long, TimetableCalendarEvent> eventDb;
    private long idSeq = 1L;

    @BeforeEach
    void setUp() {
        eventDb = new HashMap<>();
        repository = (TimetableCalendarEventRepository) Proxy.newProxyInstance(
                TimetableCalendarEventRepository.class.getClassLoader(),
                new Class<?>[]{TimetableCalendarEventRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        TimetableCalendarEvent e = (TimetableCalendarEvent) args[0];
                        if (e.getId() == null) e.setId(idSeq++);
                        eventDb.put(e.getId(), e);
                        return e;
                    } else if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(eventDb.get(id));
                    } else if ("existsById".equals(name)) {
                        Long id = (Long) args[0];
                        return eventDb.containsKey(id);
                    } else if ("deleteById".equals(name)) {
                        Long id = (Long) args[0];
                        eventDb.remove(id);
                        return null;
                    } else if ("findOverlapping".equals(name)) {
                        LocalDate start = (LocalDate) args[0];
                        LocalDate end = (LocalDate) args[1];
                        return eventDb.values().stream()
                                .filter(e -> !e.getStartDate().isAfter(end) && !e.getEndDate().isBefore(start))
                                .toList();
                    } else if ("findWithFilters".equals(name)) {
                        LocalDate start = (LocalDate) args[0];
                        LocalDate end = (LocalDate) args[1];
                        CalendarEventKind kind = (CalendarEventKind) args[2];
                        String dept = (String) args[3];
                        return eventDb.values().stream()
                                .filter(e -> !e.getStartDate().isAfter(end) && !e.getEndDate().isBefore(start))
                                .filter(e -> kind == null || e.getKind() == kind)
                                .filter(e -> dept == null || (e.getDepartmentCode() != null && e.getDepartmentCode().equalsIgnoreCase(dept)))
                                .toList();
                    }
                    return null;
                }
        );
        service = new TimetableCalendarService(repository);
    }

    @Test
    @DisplayName("Create calendar event succeeds with valid dates")
    void testCreateEventSuccess() {
        CreateCalendarEventRequestDto req = CreateCalendarEventRequestDto.builder()
                .title("Diwali Break")
                .kind(CalendarEventKind.HOLIDAY)
                .scope(CalendarEventScope.WHOLE_INSTITUTE)
                .startDate(LocalDate.of(2026, 11, 1))
                .endDate(LocalDate.of(2026, 11, 5))
                .description("Diwali Festival Holidays")
                .build();

        CalendarEventDto dto = service.createEvent(req, "admin");
        assertNotNull(dto.getId());
        assertEquals("Diwali Break", dto.getTitle());
        assertEquals(CalendarEventKind.HOLIDAY, dto.getKind());
        assertEquals(LocalDate.of(2026, 11, 1), dto.getStartDate());
    }

    @Test
    @DisplayName("Create calendar event fails when startDate is after endDate")
    void testCreateEventInvalidDates() {
        CreateCalendarEventRequestDto req = CreateCalendarEventRequestDto.builder()
                .title("Invalid Date Event")
                .kind(CalendarEventKind.EVENT)
                .scope(CalendarEventScope.WHOLE_INSTITUTE)
                .startDate(LocalDate.of(2026, 11, 5))
                .endDate(LocalDate.of(2026, 11, 1))
                .build();

        assertThrows(IllegalArgumentException.class, () -> service.createEvent(req, "admin"));
    }

    @Test
    @DisplayName("Update and delete calendar event")
    void testUpdateAndDeleteEvent() {
        CreateCalendarEventRequestDto createReq = CreateCalendarEventRequestDto.builder()
                .title("Mid-term Exam")
                .kind(CalendarEventKind.EXAM)
                .scope(CalendarEventScope.DEPARTMENT)
                .departmentCode("AI&DS")
                .startDate(LocalDate.of(2026, 10, 10))
                .endDate(LocalDate.of(2026, 10, 15))
                .build();

        CalendarEventDto created = service.createEvent(createReq, "admin");

        CreateCalendarEventRequestDto updateReq = CreateCalendarEventRequestDto.builder()
                .title("Mid-term Exam (Postponed)")
                .kind(CalendarEventKind.EXAM)
                .scope(CalendarEventScope.DEPARTMENT)
                .departmentCode("AI&DS")
                .startDate(LocalDate.of(2026, 10, 12))
                .endDate(LocalDate.of(2026, 10, 17))
                .build();

        CalendarEventDto updated = service.updateEvent(created.getId(), updateReq, "admin");
        assertEquals("Mid-term Exam (Postponed)", updated.getTitle());
        assertEquals(LocalDate.of(2026, 10, 12), updated.getStartDate());

        service.deleteEvent(created.getId(), "admin");
        assertTrue(service.listEvents(LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31), null, null).isEmpty());
    }
}

