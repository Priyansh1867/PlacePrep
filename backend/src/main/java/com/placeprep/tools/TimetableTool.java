package com.placeprep.tools;

import com.placeprep.dto.timetable.PeriodDto;
import com.placeprep.dto.timetable.SlotDto;
import com.placeprep.dto.timetable.StudentTimetableViewDto;
import com.placeprep.dto.timetable.TeacherTimetableViewDto;
import com.placeprep.model.User;
import com.placeprep.model.timetable.Timetable;
import com.placeprep.model.timetable.TimetableStatus;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.TimetablePeriodRepository;
import com.placeprep.repository.timetable.TimetableRepository;
import com.placeprep.repository.timetable.TimetableSlotRepository;
import com.placeprep.service.timetable.TimetableDtoMapper;
import com.placeprep.service.timetable.TimetableViewService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TimetableTool {

    private final TimetableViewService timetableViewService;
    private final TimetableRepository timetableRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSlotRepository slotRepository;
    private final UserRepository userRepository;

    public TimetableTool(
            TimetableViewService timetableViewService,
            TimetableRepository timetableRepository,
            TimetablePeriodRepository periodRepository,
            TimetableSlotRepository slotRepository,
            UserRepository userRepository
    ) {
        this.timetableViewService = timetableViewService;
        this.timetableRepository = timetableRepository;
        this.periodRepository = periodRepository;
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    @Tool(description = "Get the authenticated student or faculty member's full weekly class timetable, period timings, classrooms, subjects, and assigned professors.")
    public Object getMyTimetable(ToolContext context) {
        User user = resolveUser(context);
        if (user == null) {
            return Map.of("error", "User not found");
        }

        if (isStaffRole(user.getRole())) {
            try {
                TeacherTimetableViewDto teacherView = timetableViewService.getTeacherView(user);
                return teacherView != null ? teacherView : Map.of("message", "No teacher timetable assigned.");
            } catch (Exception ex) {
                return Map.of("message", "Could not load teacher timetable: " + ex.getMessage());
            }
        }

        try {
            StudentTimetableViewDto studentView = timetableViewService.getStudentView(user);
            if (studentView != null && !studentView.isUnassigned() && studentView.getSlots() != null && !studentView.getSlots().isEmpty()) {
                return buildTimetableSummary(studentView);
            }
        } catch (Exception ignored) {
        }

        // Fallback: check any published timetable for student's department or campus
        List<Timetable> publishedList = timetableRepository.findByStatus(TimetableStatus.PUBLISHED);
        if (!publishedList.isEmpty()) {
            Timetable target = publishedList.stream()
                    .filter(t -> user.getBranch() != null && t.getDepartmentCode() != null
                            && user.getBranch().toLowerCase().contains(t.getDepartmentCode().toLowerCase()))
                    .findFirst()
                    .orElse(publishedList.get(0));

            List<SlotDto> slots = slotRepository.findPublishedSlotsByTimetableId(target.getId()).stream()
                    .map(TimetableDtoMapper::toDto)
                    .collect(Collectors.toList());

            List<PeriodDto> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(target.getId()).stream()
                    .map(TimetableDtoMapper::toDto)
                    .collect(Collectors.toList());

            StudentTimetableViewDto fallbackDto = StudentTimetableViewDto.builder()
                    .unassigned(false)
                    .timetableId(target.getId())
                    .academicSession(target.getAcademicSession())
                    .departmentCode(target.getDepartmentCode())
                    .semester(target.getSemester())
                    .periods(periods)
                    .slots(slots)
                    .build();

            return buildTimetableSummary(fallbackDto);
        }

        return Map.of(
                "unassigned", true,
                "message", "No published timetable is currently assigned for your section. Contact your department timetable coordinator."
        );
    }

    @Tool(description = "Get today's schedule of classes and lectures for the authenticated student or faculty member.")
    public Object getTodaySchedule(ToolContext context) {
        Object fullTimetable = getMyTimetable(context);
        LocalDate today = LocalDate.now();
        int dayOfWeek = today.getDayOfWeek().getValue(); // 1=Mon, ..., 7=Sun

        String dayName = today.getDayOfWeek().name();
        if (dayOfWeek == 7) { // Sunday
            return Map.of(
                    "day", "Sunday",
                    "isWeekend", true,
                    "message", "Today is Sunday! There are no scheduled classes today. Enjoy your weekend or practice some coding questions for placement preparation.",
                    "fullWeeklyTimetable", fullTimetable
            );
        }

        if (fullTimetable instanceof Map<?, ?> rawMap && rawMap.containsKey("weeklySchedule")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) rawMap;
            Object weeklyObj = map.get("weeklySchedule");
            if (weeklyObj instanceof Map<?, ?> rawWeeklyMap) {
                @SuppressWarnings("unchecked")
                Map<String, Object> weeklyMap = (Map<String, Object>) rawWeeklyMap;
                String dayKey = dayName.substring(0, 1).toUpperCase() + dayName.substring(1).toLowerCase();
                Object todayClasses = weeklyMap.get(dayKey);
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("day", dayKey);
                res.put("date", today.toString());
                res.put("classesToday", todayClasses != null ? todayClasses : List.of());
                res.put("academicSession", map.getOrDefault("academicSession", ""));
                res.put("department", map.getOrDefault("department", ""));
                res.put("semester", map.getOrDefault("semester", ""));
                res.put("weeklySchedule", weeklyMap);
                return res;
            }
        }

        return Map.of(
                "day", dayName,
                "date", today.toString(),
                "schedule", fullTimetable
        );
    }

    private Map<String, Object> buildTimetableSummary(StudentTimetableViewDto dto) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("timetableId", dto.getTimetableId());
        summary.put("academicSession", dto.getAcademicSession());
        summary.put("department", dto.getDepartmentCode());
        summary.put("semester", dto.getSemester());
        summary.put("section", dto.getSectionName());
        summary.put("labGroup", dto.getLabGroupCode());

        Map<Integer, String> periodTimeMap = new HashMap<>();
        if (dto.getPeriods() != null) {
            for (PeriodDto p : dto.getPeriods()) {
                String time = (p.getStartTime() != null ? p.getStartTime().toString() : "")
                        + " - " + (p.getEndTime() != null ? p.getEndTime().toString() : "");
                periodTimeMap.put(p.getPeriodIndex(), time.trim());
            }
        }

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        Map<String, List<Map<String, Object>>> weeklySchedule = new LinkedHashMap<>();
        for (String day : days) {
            weeklySchedule.put(day, new ArrayList<>());
        }

        if (dto.getSlots() != null) {
            for (SlotDto slot : dto.getSlots()) {
                int dayIdx = slot.getDayOfWeek() != null ? slot.getDayOfWeek() : 1;
                if (dayIdx >= 1 && dayIdx <= 6) {
                    String dayName = days[dayIdx - 1];
                    Map<String, Object> slotMap = new LinkedHashMap<>();
                    slotMap.put("period", slot.getStartPeriod());
                    slotMap.put("time", periodTimeMap.getOrDefault(slot.getStartPeriod(),
                            (slot.getCustomStart() != null ? slot.getCustomStart() + " - " + slot.getCustomEnd() : "Period " + slot.getStartPeriod())));
                    slotMap.put("subject", slot.getSubjectName() != null ? slot.getSubjectName() : slot.getSubjectCode());
                    slotMap.put("subjectCode", slot.getSubjectCode());
                    slotMap.put("room", slot.getRoomCode());
                    slotMap.put("faculty", slot.getFacultyNames() != null && !slot.getFacultyNames().isEmpty()
                            ? String.join(", ", slot.getFacultyNames()) : "Faculty");
                    slotMap.put("type", slot.getSlotKind() != null ? slot.getSlotKind().name() : "THEORY");
                    if (Boolean.TRUE.equals(slot.getIsCancelled())) {
                        slotMap.put("status", "CANCELLED");
                    }
                    weeklySchedule.get(dayName).add(slotMap);
                }
            }
        }

        summary.put("weeklySchedule", weeklySchedule);
        return summary;
    }

    private User resolveUser(ToolContext context) {
        Object emailObj = context.getContext().get("userEmail");
        if (emailObj instanceof String email && !email.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) return byEmail.get();
        }
        Object userIdObj = context.getContext().get("userId");
        if (userIdObj instanceof Number num) {
            return userRepository.findById(num.longValue()).orElse(null);
        } else if (userIdObj instanceof String str && str.matches("\\d+")) {
            return userRepository.findById(Long.parseLong(str)).orElse(null);
        }
        return null;
    }

    private boolean isStaffRole(String role) {
        String r = AiToolAuthorization.normalizeRole(role);
        return Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN", "DIRECTOR")
                .contains(r);
    }
}
