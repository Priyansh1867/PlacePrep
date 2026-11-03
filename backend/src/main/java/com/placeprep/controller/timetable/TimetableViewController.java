package com.placeprep.controller.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.User;
import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.RoomType;
import com.placeprep.model.timetable.Term;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.timetable.*;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Read-side controller for published timetables and operational substitutions.
 * Identity is derived strictly from the authentication token.
 * Only PUBLISHED timetables are visible.
 */
@Slf4j
@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableViewController {

    private final TimetableViewService timetableViewService;
    private final com.placeprep.service.timetable.exporter.TimetableExportService exportService;
    private final TimetableCalendarService calendarService;
    private final TimetableReportsService reportsService;
    private final FindSlotService findSlotService;
    private final AvailabilityMatrixService availabilityMatrixService;
    private final PeerSwapService peerSwapService;
    private final DepartmentResolver departmentResolver;

    private User getCurrentUser(Authentication auth) {
        return timetableViewService.resolveCurrentUser(auth);
    }

    private String resolveHodOrManagementDept(User user, String requestedDept) {
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        if ("HOD".equalsIgnoreCase(role)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(user);
            if (requestedDept != null && !requestedDept.isBlank() && !departmentResolver.matches(requestedDept, hodDept)) {
                throw new AccessDeniedException(String.format("HOD of department '%s' cannot access reports for department '%s'.", hodDept, requestedDept));
            }
            return hodDept;
        } else if ("MANAGEMENT".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            return requestedDept;
        } else {
            throw new AccessDeniedException("Access denied: role not permitted for departmental reports.");
        }
    }


    /**
     * GET /api/timetable/me
     * Returns student or faculty personal grid from published timetables.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getMyTimetable(Authentication auth) {
        User user = getCurrentUser(auth);
        String role = user.getRole() != null ? user.getRole().toLowerCase() : "student";

        if ("student".equalsIgnoreCase(role)) {
            StudentTimetableViewDto dto = timetableViewService.getStudentView(user);
            HttpHeaders headers = new HttpHeaders();
            if (dto.getEtag() != null) headers.setETag(dto.getEtag());
            return new ResponseEntity<>(dto, headers, HttpStatus.OK);
        } else {
            TeacherTimetableViewDto dto = timetableViewService.getTeacherView(user);
            HttpHeaders headers = new HttpHeaders();
            if (dto.getEtag() != null) headers.setETag(dto.getEtag());
            return new ResponseEntity<>(dto, headers, HttpStatus.OK);
        }
    }

    /**
     * GET /api/timetable/me/today
     * Today's slots with approved overrides applied.
     */
    @GetMapping("/me/today")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getMyToday(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(timetableViewService.getMeToday(user));
    }

    /**
     * GET /api/timetable/me/week?date=YYYY-MM-DD
     * Week's slots with approved overrides applied.
     */
    @GetMapping("/me/week")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getMyWeek(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(timetableViewService.getMeWeek(user, date));
    }

    /**
     * GET /api/timetable/me/export?format=pdf|ics
     * Streams personal schedule as PDF or ICS file.
     */
    @GetMapping("/me/export")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<byte[]> exportMySchedule(
            Authentication auth,
            @RequestParam(defaultValue = "pdf") String format) throws Exception {
        User user = getCurrentUser(auth);
        byte[] data = exportService.exportUser(user, format);
        String ext = "ics".equalsIgnoreCase(format) ? "ics" : "pdf";
        String contentType = "ics".equalsIgnoreCase(format) ? "text/calendar; charset=utf-8" : "application/pdf";
        String filename = "my-timetable." + ext;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(data);
    }

    /**
     * HOD: GET /api/timetable/hod/overview
     * Department overview: faculty loads, per-day load, free periods, rooms and sections in use.
     */
    @GetMapping("/hod/overview")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<HodOverviewDto> getHodOverview(
            Authentication auth,
            @RequestParam(required = false) String department) {
        User user = getCurrentUser(auth);
        HodOverviewDto dto = timetableViewService.getHodOverview(user, department);
        HttpHeaders headers = new HttpHeaders();
        if (dto.getEtag() != null) headers.setETag(dto.getEtag());
        return new ResponseEntity<>(dto, headers, HttpStatus.OK);
    }

    /**
     * GET /api/timetable/faculty/{id}
     * Weekly teaching grid for a faculty member.
     */
    @GetMapping("/faculty/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<TeacherTimetableViewDto> getFacultyGrid(
            Authentication auth,
            @PathVariable Long id) {
        User user = getCurrentUser(auth);
        TeacherTimetableViewDto dto = timetableViewService.getFacultyGrid(user, id);
        HttpHeaders headers = new HttpHeaders();
        if (dto.getEtag() != null) headers.setETag(dto.getEtag());
        return new ResponseEntity<>(dto, headers, HttpStatus.OK);
    }

    /**
     * GET /api/timetable/sections/{id}
     * Weekly teaching grid for a section.
     */
    @GetMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<TimetableDto> getSectionGrid(
            Authentication auth,
            @PathVariable Long id) {
        User user = getCurrentUser(auth);
        TimetableDto dto = timetableViewService.getSectionGrid(user, id);
        HttpHeaders headers = new HttpHeaders();
        headers.setETag(String.format("\"sec-%d-v%d\"", id, dto.getVersionNo()));
        return new ResponseEntity<>(dto, headers, HttpStatus.OK);
    }

    /**
     * GET /api/timetable/rooms/{id}
     * Weekly grid for a room across published timetables.
     */
    @GetMapping("/rooms/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<SlotDto>> getRoomGrid(
            Authentication auth,
            @PathVariable Long id) {
        User user = getCurrentUser(auth);
        List<SlotDto> slots = timetableViewService.getRoomGrid(user, id);
        HttpHeaders headers = new HttpHeaders();
        headers.setETag(String.format("\"room-%d-slots-%d\"", id, slots.size()));
        return new ResponseEntity<>(slots, headers, HttpStatus.OK);
    }

    /**
     * GET /api/timetable/rooms/free?day=&period=&roomType=
     * Lists free rooms for a day and period.
     */
    @GetMapping("/rooms/free")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<RoomDto>> getFreeRooms(
            @RequestParam Integer day,
            @RequestParam Integer period,
            @RequestParam(required = false) RoomType roomType) {
        return ResponseEntity.ok(timetableViewService.getFreeRooms(day, period, roomType));
    }

    /**
     * POST /api/timetable/overrides
     * Faculty request for CANCEL, SUBSTITUTE, ROOM_CHANGE, or RESCHEDULE.
     */
    @PostMapping("/overrides")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<OverrideDto> requestOverride(
            Authentication auth,
            @Valid @RequestBody CreateOverrideRequestDto request) {
        User user = getCurrentUser(auth);
        OverrideDto dto = timetableViewService.requestOverride(user, request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    /**
     * GET /api/timetable/overrides
     * List overrides (own for faculty, department for HOD, all for management).
     */
    @GetMapping("/overrides")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<OverrideDto>> listOverrides(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(timetableViewService.listOverrides(user));
    }

    /**
     * POST /api/timetable/overrides/{id}/approve
     * HOD or Management approval with clash validation.
     */
    @PostMapping("/overrides/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<OverrideDto> approveOverride(
            Authentication auth,
            @PathVariable Long id) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(timetableViewService.approveOverride(user, id));
    }

    /**
     * POST /api/timetable/overrides/{id}/reject
     * HOD or Management rejection.
     */
    @PostMapping("/overrides/{id}/reject")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<OverrideDto> rejectOverride(
            Authentication auth,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(timetableViewService.rejectOverride(user, id, reason));
    }

    // ==========================================
    // Calendar Events (Read for authenticated roles)
    // ==========================================

    @GetMapping("/calendar-events")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<CalendarEventDto>> getCalendarEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) CalendarEventKind kind,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(calendarService.listEvents(startDate, endDate, kind, department));
    }

    // ==========================================
    // HOD & Management Reports (Prompt 10.B)
    // ==========================================

    @GetMapping("/hod/reports/faculty-workload")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<FacultyWorkloadReportDto>> getHodFacultyWorkload(
            Authentication auth,
            @RequestParam(required = false) String department) {
        User user = getCurrentUser(auth);
        String targetDept = resolveHodOrManagementDept(user, department);
        return ResponseEntity.ok(reportsService.getFacultyWorkload(targetDept));
    }

    @GetMapping("/hod/reports/faculty-workload/export")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<byte[]> exportHodFacultyWorkload(
            Authentication auth,
            @RequestParam(required = false) String department) throws Exception {
        User user = getCurrentUser(auth);
        String targetDept = resolveHodOrManagementDept(user, department);
        List<FacultyWorkloadReportDto> reports = reportsService.getFacultyWorkload(targetDept);
        byte[] data = reportsService.exportFacultyWorkloadXlsx(reports);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"faculty_workload_report.xlsx\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(data);
    }

    @GetMapping("/hod/reports/room-utilisation")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<RoomUtilisationSummaryDto> getHodRoomUtilisation(
            Authentication auth,
            @RequestParam(required = false) String department) {
        User user = getCurrentUser(auth);
        String targetDept = resolveHodOrManagementDept(user, department);
        return ResponseEntity.ok(reportsService.getRoomUtilisation(targetDept));
    }

    @GetMapping("/hod/reports/section-free-periods")
    @PreAuthorize("hasAnyRole('HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<SectionFreePeriodsReportDto>> getHodSectionFreePeriods(
            Authentication auth,
            @RequestParam(required = false) String department) {
        User user = getCurrentUser(auth);
        String targetDept = resolveHodOrManagementDept(user, department);
        return ResponseEntity.ok(reportsService.getSectionFreePeriods(targetDept));
    }

    // ==========================================
    // Find Slot Helper (Prompt 10.C)
    // ==========================================

    @PostMapping("/find-slot")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<CandidateSlotDto>> findSlot(@RequestBody FindSlotRequestDto req) {
        return ResponseEntity.ok(findSlotService.findCandidateSlots(req));
    }

    // ==========================================
    // Availability Matrix (Prompt 10.D)
    // ==========================================

    @GetMapping("/availability")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<AvailabilityMatrixDto> getAvailabilityMatrix(
            Authentication auth,
            @RequestParam(required = false) List<Long> facultyIds,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String session,
            @RequestParam(required = false) Term term) {
        User user = getCurrentUser(auth);
        String targetDept = department;
        if ("HOD".equalsIgnoreCase(user.getRole())) {
            targetDept = departmentResolver.resolveUserDepartmentOrThrow(user);
        }
        return ResponseEntity.ok(availabilityMatrixService.getAvailabilityMatrix(facultyIds, targetDept, session, term));
    }

    // ==========================================
    // Peer Swaps (Prompt 10.E)
    // ==========================================

    @PostMapping("/peer-swaps")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<OverrideDto>> proposePeerSwap(
            Authentication auth,
            @Valid @RequestBody ProposePeerSwapRequestDto req) {
        User user = getCurrentUser(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(peerSwapService.proposePeerSwap(user, req));
    }

    @PostMapping("/peer-swaps/{id}/accept")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<OverrideDto>> acceptPeerSwap(
            Authentication auth,
            @PathVariable Long id) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(peerSwapService.acceptPeerSwap(user, id));
    }

    @PostMapping("/peer-swaps/{id}/reject")
    @PreAuthorize("hasAnyRole('TEACHER', 'FACULTY', 'HOD', 'MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<OverrideDto>> rejectPeerSwap(
            Authentication auth,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(peerSwapService.rejectPeerSwap(user, id, reason));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "FORBIDDEN",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(TimetableHardConflictException.class)
    public ResponseEntity<Map<String, Object>> handleHardConflict(TimetableHardConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "HARD_CONFLICT",
                "message", ex.getMessage(),
                "conflicts", ex.getConflicts()
        ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "NOT_FOUND",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "BAD_REQUEST",
                "message", ex.getMessage()
        ));
    }
}
