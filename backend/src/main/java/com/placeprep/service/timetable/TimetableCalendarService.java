package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.CalendarEventDto;
import com.placeprep.dto.timetable.CreateCalendarEventRequestDto;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.TimetableCalendarEvent;
import com.placeprep.repository.timetable.TimetableCalendarEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableCalendarService {

    private final TimetableCalendarEventRepository calendarEventRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventDto> listEvents(LocalDate startDate, LocalDate endDate, CalendarEventKind kind, String department) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now().plusMonths(6);

        List<TimetableCalendarEvent> events;
        if (kind != null || department != null) {
            events = calendarEventRepository.findWithFilters(start, end, kind, department);
        } else {
            events = calendarEventRepository.findOverlapping(start, end);
        }
        return events.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CalendarEventDto getEvent(Long id) {
        TimetableCalendarEvent e = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with id: " + id));
        return toDto(e);
    }

    @Transactional
    public CalendarEventDto createEvent(CreateCalendarEventRequestDto req, String username) {
        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new IllegalArgumentException("startDate cannot be after endDate");
        }

        TimetableCalendarEvent event = TimetableCalendarEvent.builder()
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .kind(req.getKind())
                .scope(req.getScope())
                .departmentCode(req.getDepartmentCode())
                .yearOfStudy(req.getYearOfStudy())
                .sectionName(req.getSectionName())
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .createdBy(username)
                .updatedBy(username)
                .build();

        TimetableCalendarEvent saved = calendarEventRepository.save(event);
        log.info("Created calendar event '{}' [{}] from {} to {} by {}", saved.getTitle(), saved.getKind(), saved.getStartDate(), saved.getEndDate(), username);
        return toDto(saved);
    }

    @Transactional
    public CalendarEventDto updateEvent(Long id, CreateCalendarEventRequestDto req, String username) {
        TimetableCalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with id: " + id));

        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new IllegalArgumentException("startDate cannot be after endDate");
        }

        event.setStartDate(req.getStartDate());
        event.setEndDate(req.getEndDate());
        event.setKind(req.getKind());
        event.setScope(req.getScope());
        event.setDepartmentCode(req.getDepartmentCode());
        event.setYearOfStudy(req.getYearOfStudy());
        event.setSectionName(req.getSectionName());
        event.setTitle(req.getTitle().trim());
        event.setDescription(req.getDescription());
        event.setUpdatedBy(username);

        TimetableCalendarEvent saved = calendarEventRepository.save(event);
        log.info("Updated calendar event id {} by {}", id, username);
        return toDto(saved);
    }

    @Transactional
    public void deleteEvent(Long id, String username) {
        if (!calendarEventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Calendar event not found with id: " + id);
        }
        calendarEventRepository.deleteById(id);
        log.info("Deleted calendar event id {} by {}", id, username);
    }

    @Transactional(readOnly = true)
    public List<TimetableCalendarEvent> findApplicableForDate(LocalDate date, String department, Integer year, String section) {
        return calendarEventRepository.findApplicableForDate(date, department, year, section);
    }

    @Transactional(readOnly = true)
    public List<TimetableCalendarEvent> findApplicableForDateRange(LocalDate start, LocalDate end, String department, Integer year, String section) {
        return calendarEventRepository.findApplicableForDateRange(start, end, department, year, section);
    }

    public CalendarEventDto toDto(TimetableCalendarEvent e) {
        if (e == null) return null;
        return CalendarEventDto.builder()
                .id(e.getId())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .kind(e.getKind())
                .scope(e.getScope())
                .departmentCode(e.getDepartmentCode())
                .yearOfStudy(e.getYearOfStudy())
                .sectionName(e.getSectionName())
                .title(e.getTitle())
                .description(e.getDescription())
                .createdBy(e.getCreatedBy())
                .createdAt(e.getCreatedAt())
                .updatedBy(e.getUpdatedBy())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

