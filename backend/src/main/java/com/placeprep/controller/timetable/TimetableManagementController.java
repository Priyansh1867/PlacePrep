package com.placeprep.controller.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.TimetableStatus;
import com.placeprep.service.timetable.*;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/management/timetables")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TimetableManagementController {

    private final TimetableManagementService managementService;
    private final TimetableSlotService slotService;
    private final TimetableMetadataService metadataService;
    private final TimetableImportService importService;
    private final TimetableMappingService mappingService;
    private final com.placeprep.service.timetable.exporter.TimetableExportService exportService;
    private final TimetableCalendarService calendarService;
    private final TimetableReportsService reportsService;
    private final FindSlotService findSlotService;
    private final AvailabilityMatrixService availabilityMatrixService;
    private final TimetableAuditService auditService;

    // ==========================================
    // 1. Timetable Lifecycle & Grid Endpoints
    // ==========================================

    @GetMapping
    public ResponseEntity<Page<TimetableDto>> getAllTimetables(
            @RequestParam(required = false) String session,
            @RequestParam(required = false) Term term,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) TimetableStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        return ResponseEntity.ok(managementService.listTimetables(session, term, department, year, semester, status, search, pageRequest));
    }

    @GetMapping("/stats")
    public ResponseEntity<TimetableStatsDto> getDashboardStats() {
        return ResponseEntity.ok(managementService.getDashboardStats());
    }

    @GetMapping("/student/active")
    public ResponseEntity<Map<String, Object>> getStudentActive() {
        return ResponseEntity.ok(Map.of(
                "hasActiveTimetable", false,
                "message", "Active student timetable queried via role-specific endpoints"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimetableDto> getTimetableGrid(@PathVariable Long id) {
        return ResponseEntity.ok(managementService.getTimetableGrid(id));
    }

    @PostMapping
    public ResponseEntity<TimetableDto> createTimetable(@RequestBody TimetableDto dto, Principal principal) {
        String createdBy = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.status(HttpStatus.CREATED).body(managementService.createTimetable(dto, createdBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimetableDto> updateTimetable(
            @PathVariable Long id,
            @RequestBody TimetableDto dto,
            Principal principal
    ) {
        String updatedBy = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(managementService.updateTimetable(id, dto, updatedBy));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        managementService.deleteTimetable(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<TimetableDto> cloneTimetable(
            @PathVariable Long id,
            @RequestParam(required = false) String targetSession,
            @RequestParam(required = false) Integer targetSemester,
            Principal principal
    ) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.status(HttpStatus.CREATED).body(managementService.cloneTimetable(id, targetSession, targetSemester, user));
    }

    @PostMapping("/{id}/revise")
    public ResponseEntity<TimetableDto> reviseTimetable(@PathVariable Long id, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.status(HttpStatus.CREATED).body(managementService.reviseTimetable(id, user));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<TimetableDto> publishTimetable(@PathVariable Long id, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(managementService.publishTimetable(id, user));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<TimetableDto> unpublishTimetable(@PathVariable Long id, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(managementService.unpublishTimetable(id, user));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<TimetableDto> archiveTimetable(@PathVariable Long id, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(managementService.archiveTimetable(id, user));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<TimetableVersionDto>> getVersions(@PathVariable Long id) {
        return ResponseEntity.ok(managementService.getVersions(id));
    }

    @GetMapping("/{id}/versions/{versionNo}")
    public ResponseEntity<TimetableVersionDto> getVersionSnapshot(
            @PathVariable Long id,
            @PathVariable Integer versionNo
    ) {
        return ResponseEntity.ok(managementService.getVersionSnapshot(id, versionNo));
    }

    @PostMapping("/{id}/restore/{versionNo}")
    public ResponseEntity<TimetableDto> restoreVersion(
            @PathVariable Long id,
            @PathVariable Integer versionNo,
            Principal principal
    ) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.status(HttpStatus.CREATED).body(managementService.restoreVersion(id, versionNo, user));
    }

    @GetMapping("/{id}/diff")
    public ResponseEntity<TimetableDiffDto> getDiff(
            @PathVariable Long id,
            @RequestParam(name = "from") Integer fromVersion,
            @RequestParam(name = "to") Integer toVersion
    ) {
        return ResponseEntity.ok(managementService.getDiff(id, fromVersion, toVersion));
    }

    @GetMapping("/{id}/validate")
    public ResponseEntity<List<TimetableConflict>> validateTimetable(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.validateTimetable(id));
    }

    // ==========================================
    // 2. Slot Endpoints
    // ==========================================

    @PostMapping("/{id}/slots")
    public ResponseEntity<SlotDto> createSlot(@PathVariable Long id, @RequestBody SlotDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(slotService.createSlot(id, dto));
    }

    @PutMapping("/{id}/slots/{slotId}")
    public ResponseEntity<SlotDto> updateSlot(
            @PathVariable Long id,
            @PathVariable Long slotId,
            @RequestBody SlotDto dto
    ) {
        return ResponseEntity.ok(slotService.updateSlot(id, slotId, dto));
    }

    @DeleteMapping("/{id}/slots/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id, @PathVariable Long slotId) {
        slotService.deleteSlot(id, slotId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/slots/bulk")
    public ResponseEntity<List<SlotDto>> bulkWriteSlots(
            @PathVariable Long id,
            @RequestBody SlotBulkRequest request
    ) {
        return ResponseEntity.ok(slotService.bulkWriteSlots(id, request));
    }

    @PostMapping("/{id}/slots/{slotId}/move")
    public ResponseEntity<SlotDto> moveSlot(
            @PathVariable Long id,
            @PathVariable Long slotId,
            @RequestBody SlotMoveRequest request
    ) {
        return ResponseEntity.ok(slotService.moveSlot(id, slotId, request));
    }

    @PostMapping("/{id}/slots/swap")
    public ResponseEntity<List<SlotDto>> swapSlots(
            @PathVariable Long id,
            @RequestBody SlotSwapRequest request
    ) {
        return ResponseEntity.ok(slotService.swapSlots(id, request));
    }

    @PostMapping("/{id}/slots/validate")
    public ResponseEntity<List<TimetableConflict>> dryRunSlot(
            @PathVariable Long id,
            @RequestBody SlotDto dto
    ) {
        return ResponseEntity.ok(slotService.dryRunCandidateSlot(id, dto));
    }

    // ==========================================
    // 3. Metadata Endpoints
    // ==========================================

    // Sections
    @PostMapping("/{id}/sections")
    public ResponseEntity<SectionDto> createSection(@PathVariable Long id, @RequestBody SectionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createSection(id, dto));
    }

    @PutMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<SectionDto> updateSection(
            @PathVariable Long id,
            @PathVariable Long sectionId,
            @RequestBody SectionDto dto
    ) {
        return ResponseEntity.ok(metadataService.updateSection(id, sectionId, dto));
    }

    @DeleteMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id, @PathVariable Long sectionId) {
        metadataService.deleteSection(id, sectionId);
        return ResponseEntity.noContent().build();
    }

    // Lab Groups
    @PostMapping("/sections/{sectionId}/lab-groups")
    public ResponseEntity<LabGroupDto> createLabGroup(@PathVariable Long sectionId, @RequestBody LabGroupDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createLabGroup(sectionId, dto));
    }

    @PutMapping("/sections/{sectionId}/lab-groups/{groupId}")
    public ResponseEntity<LabGroupDto> updateLabGroup(
            @PathVariable Long sectionId,
            @PathVariable Long groupId,
            @RequestBody LabGroupDto dto
    ) {
        return ResponseEntity.ok(metadataService.updateLabGroup(sectionId, groupId, dto));
    }

    @DeleteMapping("/sections/{sectionId}/lab-groups/{groupId}")
    public ResponseEntity<Void> deleteLabGroup(@PathVariable Long sectionId, @PathVariable Long groupId) {
        metadataService.deleteLabGroup(sectionId, groupId);
        return ResponseEntity.noContent().build();
    }

    // Subjects
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDto>> listSubjects(
            @RequestParam(required = false) String departmentCode,
            @RequestParam(required = false) Integer semester
    ) {
        return ResponseEntity.ok(metadataService.listSubjects(departmentCode, semester));
    }

    @PostMapping("/subjects")
    public ResponseEntity<SubjectDto> createSubject(@RequestBody SubjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createSubject(dto));
    }

    @PutMapping("/subjects/{subjectId}")
    public ResponseEntity<SubjectDto> updateSubject(@PathVariable Long subjectId, @RequestBody SubjectDto dto) {
        return ResponseEntity.ok(metadataService.updateSubject(subjectId, dto));
    }

    @DeleteMapping("/subjects/{subjectId}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long subjectId) {
        metadataService.deleteSubject(subjectId);
        return ResponseEntity.noContent().build();
    }

    // Assignments
    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<AssignmentDto>> listAssignments(
            @PathVariable Long id,
            @RequestParam(required = false) Long sectionId
    ) {
        return ResponseEntity.ok(metadataService.listAssignments(id, sectionId));
    }

    @PostMapping("/{id}/assignments")
    public ResponseEntity<AssignmentDto> createAssignment(@PathVariable Long id, @RequestBody AssignmentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createAssignment(id, dto));
    }

    @PutMapping("/{id}/assignments/{assignmentId}")
    public ResponseEntity<AssignmentDto> updateAssignment(
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @RequestBody AssignmentDto dto
    ) {
        return ResponseEntity.ok(metadataService.updateAssignment(id, assignmentId, dto));
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id, @PathVariable Long assignmentId) {
        metadataService.deleteAssignment(id, assignmentId);
        return ResponseEntity.noContent().build();
    }

    // Rooms
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDto>> listRooms() {
        return ResponseEntity.ok(metadataService.listRooms());
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDto> createRoom(@RequestBody RoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createRoom(dto));
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDto> updateRoom(@PathVariable Long roomId, @RequestBody RoomDto dto) {
        return ResponseEntity.ok(metadataService.updateRoom(roomId, dto));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        metadataService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    // Faculty Profiles
    @GetMapping("/faculty-profiles")
    public ResponseEntity<List<FacultyProfileDto>> listFacultyProfiles(
            @RequestParam(required = false) String departmentCode
    ) {
        return ResponseEntity.ok(metadataService.listFacultyProfiles(departmentCode));
    }

    @PostMapping("/faculty-profiles")
    public ResponseEntity<FacultyProfileDto> createFacultyProfile(@RequestBody FacultyProfileDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metadataService.createFacultyProfile(dto));
    }

    @PutMapping("/faculty-profiles/{id}")
    public ResponseEntity<FacultyProfileDto> updateFacultyProfile(
            @PathVariable Long id,
            @RequestBody FacultyProfileDto dto
    ) {
        return ResponseEntity.ok(metadataService.updateFacultyProfile(id, dto));
    }

    @DeleteMapping("/faculty-profiles/{id}")
    public ResponseEntity<Void> deleteFacultyProfile(@PathVariable Long id) {
        metadataService.deleteFacultyProfile(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/faculty-profiles/{id}/link-user")
    public ResponseEntity<FacultyProfileDto> linkFacultyProfileToUser(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(mappingService.linkFacultyProfileToUser(id, userId));
    }

    // ==========================================
    // 4. Import Flow Endpoints
    // ==========================================

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportPreviewDto> importTimetable(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicSession") String academicSession,
            @RequestParam("term") Term term,
            @RequestParam(value = "departmentCode", required = false) String departmentCode,
            Principal principal
    ) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(importService.uploadAndParse(file, academicSession, term, departmentCode, user));
    }

    @GetMapping("/import/{jobId}")
    public ResponseEntity<ImportPreviewDto> getImportJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(importService.getImportJobPreview(jobId));
    }

    @PutMapping("/import/{jobId}/resolutions")
    public ResponseEntity<ImportPreviewDto> updateResolutions(
            @PathVariable Long jobId,
            @RequestBody ImportResolutionsDto resolutions
    ) {
        return ResponseEntity.ok(importService.applyResolutions(jobId, resolutions));
    }

    @DeleteMapping("/import/{jobId}")
    public ResponseEntity<Void> cancelImportJob(@PathVariable Long jobId) {
        importService.deleteImportJob(jobId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import/{jobId}/commit")
    public ResponseEntity<List<TimetableDto>> commitImport(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "false") boolean replaceExisting
    ) {
        return ResponseEntity.ok(importService.commitImportJob(jobId, replaceExisting));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportTimetable(
            @PathVariable Long id,
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(defaultValue = "all") String scope
    ) throws Exception {
        byte[] data = exportService.exportManagement(id, format, scope);
        String ext = "pdf".equalsIgnoreCase(format) ? "pdf" : "xlsx";
        String contentType = "pdf".equalsIgnoreCase(format)
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String filename = "timetable-" + id + (scope != null && !scope.equalsIgnoreCase("all") ? "-" + scope.replace(":", "-") : "") + "." + ext;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(data);
    }

    // ==========================================
    // 5. Student Group Mapping Endpoints
    // ==========================================

    @PostMapping(value = "/student-groups/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentGroupImportPreviewDto> previewStudentGroups(
            @RequestParam Long timetableId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(mappingService.previewStudentGroupsImport(timetableId, file));
    }

    @PostMapping("/student-groups/import/commit")
    public ResponseEntity<Map<String, String>> commitStudentGroups(@RequestBody StudentGroupImportCommitRequest request) {
        mappingService.commitStudentGroupsImport(request);
        return ResponseEntity.ok(Map.of("message", "Student groups committed successfully"));
    }

    @GetMapping("/{id}/student-groups")
    public ResponseEntity<List<StudentGroupDto>> listStudentGroups(
            @PathVariable Long id,
            @RequestParam(required = false) Long sectionId
    ) {
        return ResponseEntity.ok(mappingService.listStudentGroups(id, sectionId));
    }

    @PostMapping("/student-groups")
    public ResponseEntity<StudentGroupDto> createStudentGroup(@RequestBody StudentGroupDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mappingService.createStudentGroup(dto));
    }

    @PutMapping("/student-groups/{groupId}")
    public ResponseEntity<StudentGroupDto> updateStudentGroup(
            @PathVariable Long groupId,
            @RequestBody StudentGroupDto dto
    ) {
        return ResponseEntity.ok(mappingService.updateStudentGroup(groupId, dto));
    }

    @DeleteMapping("/student-groups/{groupId}")
    public ResponseEntity<Void> deleteStudentGroup(@PathVariable Long groupId) {
        mappingService.deleteStudentGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 6. Academic Calendar Endpoints (Prompt 10.A)
    // ==========================================

    @GetMapping("/calendar-events")
    public ResponseEntity<List<CalendarEventDto>> getCalendarEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) CalendarEventKind kind,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(calendarService.listEvents(startDate, endDate, kind, department));
    }

    @GetMapping("/calendar-events/{id}")
    public ResponseEntity<CalendarEventDto> getCalendarEvent(@PathVariable Long id) {
        return ResponseEntity.ok(calendarService.getEvent(id));
    }

    @PostMapping("/calendar-events")
    public ResponseEntity<CalendarEventDto> createCalendarEvent(@RequestBody CreateCalendarEventRequestDto req, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarService.createEvent(req, user));
    }

    @PutMapping("/calendar-events/{id}")
    public ResponseEntity<CalendarEventDto> updateCalendarEvent(
            @PathVariable Long id,
            @RequestBody CreateCalendarEventRequestDto req,
            Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        return ResponseEntity.ok(calendarService.updateEvent(id, req, user));
    }

    @DeleteMapping("/calendar-events/{id}")
    public ResponseEntity<Void> deleteCalendarEvent(@PathVariable Long id, Principal principal) {
        String user = principal != null ? principal.getName() : "MANAGEMENT";
        calendarService.deleteEvent(id, user);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 7. Management Reports & Analytics (Prompt 10.B)
    // ==========================================

    @GetMapping("/reports/faculty-workload")
    public ResponseEntity<List<FacultyWorkloadReportDto>> getFacultyWorkloadReport(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(reportsService.getFacultyWorkload(department));
    }

    @GetMapping("/reports/faculty-workload/export")
    public ResponseEntity<byte[]> exportFacultyWorkloadXlsx(
            @RequestParam(required = false) String department) throws Exception {
        List<FacultyWorkloadReportDto> reports = reportsService.getFacultyWorkload(department);
        byte[] data = reportsService.exportFacultyWorkloadXlsx(reports);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"faculty_workload_report.xlsx\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(data);
    }

    @GetMapping("/reports/room-utilisation")
    public ResponseEntity<RoomUtilisationSummaryDto> getRoomUtilisationReport(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(reportsService.getRoomUtilisation(department));
    }

    @GetMapping("/reports/section-free-periods")
    public ResponseEntity<List<SectionFreePeriodsReportDto>> getSectionFreePeriodsReport(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(reportsService.getSectionFreePeriods(department));
    }

    // ==========================================
    // 8. Find Slot Suggestion Helper (Prompt 10.C)
    // ==========================================

    @PostMapping("/find-slot")
    public ResponseEntity<List<CandidateSlotDto>> findSlot(@RequestBody FindSlotRequestDto req) {
        return ResponseEntity.ok(findSlotService.findCandidateSlots(req));
    }

    @PostMapping("/{id}/find-slot")
    public ResponseEntity<List<CandidateSlotDto>> findSlotForTimetable(
            @PathVariable Long id,
            @RequestBody FindSlotRequestDto req) {
        req.setTimetableId(id);
        return ResponseEntity.ok(findSlotService.findCandidateSlots(req));
    }

    // ==========================================
    // 9. Availability Matrix (Prompt 10.D)
    // ==========================================

    @GetMapping("/availability")
    public ResponseEntity<AvailabilityMatrixDto> getAvailabilityMatrix(
            @RequestParam(required = false) List<Long> facultyIds,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String session,
            @RequestParam(required = false) Term term) {
        return ResponseEntity.ok(availabilityMatrixService.getAvailabilityMatrix(facultyIds, department, session, term));
    }

    // ==========================================
    // 10. Audit Trail Logs (Prompt 10.F)
    // ==========================================

    @GetMapping("/audit-logs")
    public ResponseEntity<List<TimetableAuditLogDto>> getAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) Long timetableId) {
        return ResponseEntity.ok(auditService.getTimetableLogs(startDate, endDate, user, timetableId));
    }

    // ==========================================
    // Exception Handlers (409 Conflict, etc.)
    // ==========================================

    @ExceptionHandler(TimetableHardConflictException.class)
    public ResponseEntity<Map<String, Object>> handleHardConflict(TimetableHardConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "HARD_CONFLICT",
                "message", ex.getMessage(),
                "conflicts", ex.getConflicts()
        ));
    }

    @ExceptionHandler(StaleVersionException.class)
    public ResponseEntity<Map<String, Object>> handleStaleVersion(StaleVersionException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "STALE_VERSION",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(ReferencedEntityException.class)
    public ResponseEntity<Map<String, Object>> handleReferencedEntity(ReferencedEntityException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "REFERENCED_ENTITY",
                "message", ex.getMessage(),
                "referencingSlotIds", ex.getReferencingSlotIds()
        ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "error", ex.getStatusCode().toString(),
                "message", ex.getReason() != null ? ex.getReason() : ex.getMessage()
        ));
    }
}

