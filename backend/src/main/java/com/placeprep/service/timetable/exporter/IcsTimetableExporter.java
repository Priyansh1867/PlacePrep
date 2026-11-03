package com.placeprep.service.timetable.exporter;

import com.placeprep.dto.timetable.PeriodDto;
import com.placeprep.dto.timetable.SlotDto;
import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.TimetableCalendarEvent;
import com.placeprep.model.timetable.TimetableOverride;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Component
public class IcsTimetableExporter {

    private static final DateTimeFormatter ICS_DATE_TIME = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    private static final DateTimeFormatter ICS_DATE_ONLY = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter ICS_UTC = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    public String generateIcs(
            String calendarName,
            List<PeriodDto> periods,
            List<SlotDto> slots,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            List<TimetableOverride> cancelOverrides
    ) {
        return generateIcs(calendarName, periods, slots, effectiveFrom, effectiveTo, cancelOverrides, Collections.emptyList());
    }

    public String generateIcs(
            String calendarName,
            List<PeriodDto> periods,
            List<SlotDto> slots,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            List<TimetableOverride> cancelOverrides,
            List<TimetableCalendarEvent> calendarEvents
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//PlacePrep//Timetable Management//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:").append(calendarName != null ? calendarName : "PlacePrep Timetable").append("\r\n");
        sb.append("X-WR-TIMEZONE:Asia/Kolkata\r\n");

        // VTIMEZONE Block for Asia/Kolkata
        sb.append("BEGIN:VTIMEZONE\r\n");
        sb.append("TZID:Asia/Kolkata\r\n");
        sb.append("BEGIN:STANDARD\r\n");
        sb.append("TZOFFSETFROM:+0530\r\n");
        sb.append("TZOFFSETTO:+0530\r\n");
        sb.append("TZNAME:IST\r\n");
        sb.append("DTSTART:19700101T000000\r\n");
        sb.append("END:STANDARD\r\n");
        sb.append("END:VTIMEZONE\r\n");

        LocalDate startDate = (effectiveFrom != null) ? effectiveFrom : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = (effectiveTo != null) ? effectiveTo : startDate.plusMonths(4);
        String untilUtc = endDate.atTime(23, 59, 59).atZone(ZoneId.of("Asia/Kolkata")).withZoneSameInstant(ZoneOffset.UTC).format(ICS_UTC);

        // Map period times
        Map<Integer, PeriodDto> periodMap = new HashMap<>();
        if (periods != null) {
            for (PeriodDto p : periods) {
                periodMap.put(p.getPeriodIndex(), p);
            }
        }

        // Collect all holiday dates from calendar events
        Set<LocalDate> holidayDates = new HashSet<>();
        if (calendarEvents != null) {
            for (TimetableCalendarEvent ev : calendarEvents) {
                if (ev.getKind() == CalendarEventKind.HOLIDAY || ev.getKind() == CalendarEventKind.NO_CLASSES) {
                    LocalDate cur = ev.getStartDate();
                    while (!cur.isAfter(ev.getEndDate())) {
                        holidayDates.add(cur);
                        cur = cur.plusDays(1);
                    }
                }
            }
        }

        // Map cancel overrides by slot ID -> set of dates
        Map<Long, Set<LocalDate>> cancelsBySlot = new HashMap<>();
        if (cancelOverrides != null) {
            for (TimetableOverride o : cancelOverrides) {
                if (o.getSlot() != null && o.getOnDate() != null) {
                    cancelsBySlot.computeIfAbsent(o.getSlot().getId(), k -> new HashSet<>()).add(o.getOnDate());
                }
            }
        }

        if (slots != null) {
            for (SlotDto slot : slots) {
                if (Boolean.TRUE.equals(slot.getIsCancelled())) {
                    continue;
                }

                int dayOfWeek = (slot.getDayOfWeek() != null) ? slot.getDayOfWeek() : 1;
                DayOfWeek dow = DayOfWeek.of(Math.min(Math.max(dayOfWeek, 1), 7));

                // First occurrence date on or after startDate with matching dow
                LocalDate firstDate = startDate.with(TemporalAdjusters.nextOrSame(dow));

                LocalTime startTime = slot.getCustomStart();
                LocalTime endTime = slot.getCustomEnd();

                if (startTime == null && slot.getStartPeriod() != null) {
                    PeriodDto p = periodMap.get(slot.getStartPeriod());
                    if (p != null && p.getStartTime() != null) {
                        startTime = p.getStartTime();
                    }
                }
                if (startTime == null) startTime = LocalTime.of(9, 0);

                if (endTime == null) {
                    int endPeriodIdx = (slot.getStartPeriod() != null ? slot.getStartPeriod() : 1) + (slot.getSpan() != null ? slot.getSpan() : 1) - 1;
                    PeriodDto p = periodMap.get(endPeriodIdx);
                    if (p != null && p.getEndTime() != null) {
                        endTime = p.getEndTime();
                    }
                }
                if (endTime == null) endTime = startTime.plusHours(slot.getSpan() != null ? slot.getSpan() : 1);

                LocalDateTime startDateTime = firstDate.atTime(startTime);
                LocalDateTime endDateTime = firstDate.atTime(endTime);

                long slotId = slot.getId() != null ? slot.getId() : Math.abs((slot.getSourceRef() != null ? slot.getSourceRef().hashCode() : 1000));
                long ttId = slot.getTimetableId() != null ? slot.getTimetableId() : 1L;
                String uid = String.format("slot-%d-%d@placeprep.com", slotId, ttId);

                sb.append("BEGIN:VEVENT\r\n");
                sb.append("UID:").append(uid).append("\r\n");
                sb.append("DTSTAMP:").append(LocalDateTime.now().format(ICS_DATE_TIME)).append("Z\r\n");
                sb.append("DTSTART;TZID=Asia/Kolkata:").append(startDateTime.format(ICS_DATE_TIME)).append("\r\n");
                sb.append("DTEND;TZID=Asia/Kolkata:").append(endDateTime.format(ICS_DATE_TIME)).append("\r\n");
                sb.append("RRULE:FREQ=WEEKLY;UNTIL=").append(untilUtc).append("\r\n");

                // EXDATE for cancellations
                Set<LocalDate> slotCancels = new HashSet<>();
                for (LocalDate h : holidayDates) {
                    if (h.getDayOfWeek() == dow) {
                        slotCancels.add(h);
                    }
                }
                if (slot.getId() != null && cancelsBySlot.containsKey(slot.getId())) {
                    slotCancels.addAll(cancelsBySlot.get(slot.getId()));
                }

                for (LocalDate cancelDate : slotCancels) {
                    LocalDateTime cancelDt = cancelDate.atTime(startTime);
                    sb.append("EXDATE;TZID=Asia/Kolkata:").append(cancelDt.format(ICS_DATE_TIME)).append("\r\n");
                }

                String summary = (slot.getSubjectName() != null ? slot.getSubjectName() : "Class");
                if (slot.getSubjectCode() != null && !slot.getSubjectCode().isBlank()) {
                    summary = slot.getSubjectCode() + " - " + summary;
                }
                sb.append("SUMMARY:").append(escapeIcs(summary)).append("\r\n");

                StringBuilder desc = new StringBuilder();
                if (slot.getFacultyNames() != null && !slot.getFacultyNames().isEmpty()) {
                    desc.append("Faculty: ").append(String.join(", ", slot.getFacultyNames())).append("\\n");
                }
                if (slot.getSectionName() != null) {
                    desc.append("Section: ").append(slot.getSectionName());
                    if (slot.getLabGroupCode() != null) desc.append(" (").append(slot.getLabGroupCode()).append(")");
                    desc.append("\\n");
                }
                if (slot.getNote() != null) {
                    desc.append("Note: ").append(slot.getNote()).append("\\n");
                }
                sb.append("DESCRIPTION:").append(escapeIcs(desc.toString())).append("\r\n");

                if (slot.getRoomCode() != null && !slot.getRoomCode().isBlank()) {
                    sb.append("LOCATION:").append(escapeIcs("Room " + slot.getRoomCode())).append("\r\n");
                }

                sb.append("STATUS:CONFIRMED\r\n");
                sb.append("END:VEVENT\r\n");
            }
        }

        // Add calendar events / holidays as all-day events
        if (calendarEvents != null) {
            for (TimetableCalendarEvent ev : calendarEvents) {
                String eventUid = String.format("cal-event-%d@placeprep.com", ev.getId() != null ? ev.getId() : (long) ev.getTitle().hashCode());
                sb.append("BEGIN:VEVENT\r\n");
                sb.append("UID:").append(eventUid).append("\r\n");
                sb.append("DTSTAMP:").append(LocalDateTime.now().format(ICS_DATE_TIME)).append("Z\r\n");
                sb.append("DTSTART;VALUE=DATE:").append(ev.getStartDate().format(ICS_DATE_ONLY)).append("\r\n");
                sb.append("DTEND;VALUE=DATE:").append(ev.getEndDate().plusDays(1).format(ICS_DATE_ONLY)).append("\r\n");
                sb.append("SUMMARY:").append(escapeIcs((ev.getKind() == CalendarEventKind.HOLIDAY ? "Holiday: " : "") + ev.getTitle())).append("\r\n");
                if (ev.getDescription() != null && !ev.getDescription().isBlank()) {
                    sb.append("DESCRIPTION:").append(escapeIcs(ev.getDescription())).append("\r\n");
                }
                sb.append("STATUS:CONFIRMED\r\n");
                sb.append("END:VEVENT\r\n");
            }
        }

        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private String escapeIcs(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
