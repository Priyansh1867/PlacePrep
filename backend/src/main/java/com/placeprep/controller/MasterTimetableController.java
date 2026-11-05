package com.placeprep.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.dto.MasterTimetableDto;
import com.placeprep.dto.TimetableStatsDto;
import com.placeprep.service.MasterTimetableService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/management/legacy-timetables")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class MasterTimetableController {

    @Autowired
    private MasterTimetableService timetableService;

    @Autowired(required = false)
    private ObjectMapper objectMapper;

    /**
     * GET /api/management/timetables/stats
     * Dashboard KPI overview counts.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<TimetableStatsDto> getStats() {
        return ResponseEntity.ok(timetableService.getStats());
    }

    /**
     * GET /api/management/timetables
     * Paginated and filtered timetable management list.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<Page<MasterTimetableDto>> getAllTimetables(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String academicSession,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastUpdated") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<MasterTimetableDto> result = timetableService.getAllTimetables(
                search, academicSession, branch, semester, year, section, status,
                page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/management/timetables/{id}
     * Retrieve single timetable with version history.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> getTimetableById(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.getTimetableById(id));
    }

    /**
     * POST /api/management/timetables
     * Upload & register a new master timetable with metadata & document.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> createTimetable(
            @RequestParam("title") String title,
            @RequestParam("academicSession") String academicSession,
            @RequestParam("department") String department,
            @RequestParam(value = "branch", required = false) String branch,
            @RequestParam("semester") String semester,
            @RequestParam("academicYear") String academicYear,
            @RequestParam(value = "section", defaultValue = "All Sections") String section,
            @RequestParam(value = "effectiveStartDate", required = false) String effectiveStartDate,
            @RequestParam(value = "effectiveEndDate", required = false) String effectiveEndDate,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "status", defaultValue = "DRAFT") String status,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpServletRequest request
    ) {
        String uploaderEmail = resolveUserEmail(request);

        MasterTimetableDto dto = MasterTimetableDto.builder()
                .title(title)
                .academicSession(academicSession)
                .department(department)
                .branch(branch)
                .semester(semester)
                .academicYear(academicYear)
                .section(section)
                .effectiveStartDate(effectiveStartDate != null && !effectiveStartDate.isBlank() ? LocalDate.parse(effectiveStartDate) : null)
                .effectiveEndDate(effectiveEndDate != null && !effectiveEndDate.isBlank() ? LocalDate.parse(effectiveEndDate) : null)
                .description(description)
                .status(status)
                .build();

        MasterTimetableDto created = timetableService.createTimetable(dto, file, uploaderEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/management/timetables/{id}
     * Edit timetable metadata.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> updateMetadata(
            @PathVariable Long id,
            @RequestBody MasterTimetableDto dto,
            HttpServletRequest request
    ) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.updateMetadata(id, dto, updaterEmail));
    }

    /**
     * POST /api/management/timetables/{id}/replace-file
     * Replace timetable document while preserving previous versions in audit history.
     */
    @PostMapping(value = "/{id}/replace-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> replaceFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changeSummary", required = false) String changeSummary,
            HttpServletRequest request
    ) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.replaceFile(id, file, changeSummary, updaterEmail));
    }

    /**
     * POST /api/management/timetables/{id}/publish
     */
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> publishTimetable(@PathVariable Long id, HttpServletRequest request) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.publishTimetable(id, updaterEmail));
    }

    /**
     * POST /api/management/timetables/{id}/unpublish
     */
    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> unpublishTimetable(@PathVariable Long id, HttpServletRequest request) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.unpublishTimetable(id, updaterEmail));
    }

    /**
     * POST /api/management/timetables/{id}/archive
     */
    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> archiveTimetable(@PathVariable Long id, HttpServletRequest request) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.archiveTimetable(id, updaterEmail));
    }

    /**
     * DELETE /api/management/timetables/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteTimetable(@PathVariable Long id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Master timetable deleted successfully."));
    }

    /**
     * GET /api/management/timetables/{id}/versions
     */
    @GetMapping("/{id}/versions")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<List<MasterTimetableDto.TimetableVersionDto>> getVersionHistory(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.getVersionHistory(id));
    }

    /**
     * POST /api/management/timetables/{id}/restore-version/{versionId}
     */
    @PostMapping("/{id}/restore-version/{versionId}")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<MasterTimetableDto> restoreVersion(
            @PathVariable Long id,
            @PathVariable Long versionId,
            HttpServletRequest request
    ) {
        String updaterEmail = resolveUserEmail(request);
        return ResponseEntity.ok(timetableService.restoreVersion(id, versionId, updaterEmail));
    }

    /**
     * GET /api/management/timetables/{id}/file
     * Download or stream active document for embedded preview.
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
        MasterTimetableDto dto = timetableService.getTimetableById(id);
        byte[] fileBytes = timetableService.getFileBytes(id);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (dto.getFileType() != null && !dto.getFileType().isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(dto.getFileType());
            } catch (Exception ignored) {}
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("inline", dto.getFileName() != null ? dto.getFileName() : "timetable.pdf");
        headers.setContentLength(fileBytes.length);

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    /**
     * GET /api/management/timetables/version/{versionId}/file
     * Download or stream specific historical version document.
     */
    @GetMapping("/version/{versionId}/file")
    public ResponseEntity<byte[]> getVersionFile(@PathVariable Long versionId) {
        byte[] fileBytes = timetableService.getVersionFileBytes(versionId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("inline", "timetable_version_" + versionId + ".pdf");
        headers.setContentLength(fileBytes.length);

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    /**
     * GET /api/management/timetables/{id}/preview-data
     * Structured rows & columns for Excel/CSV spreadsheet preview.
     */
    @GetMapping("/{id}/preview-data")
    public ResponseEntity<Map<String, Object>> getPreviewData(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.parseTabularDataForPreview(id));
    }

    /**
     * GET /api/management/timetables/student/active
     * Student-side timetable visibility: returns active published timetable.
     */
    @GetMapping("/student/active")
    public ResponseEntity<?> getStudentActiveTimetable(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String section
    ) {
        MasterTimetableDto timetable = timetableService.getStudentActiveTimetable(branch, semester, section);
        if (timetable == null) {
            return ResponseEntity.ok(Map.of(
                    "hasActiveTimetable", false,
                    "message", "No official published master timetable available for your branch/semester yet."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "hasActiveTimetable", true,
                "timetable", timetable
        ));
    }

    private String resolveUserEmail(HttpServletRequest request) {
        String email = (String) request.getAttribute("currentUserEmail");
        if (email != null && !email.isBlank()) {
            return email;
        }
        if (request.getUserPrincipal() != null) {
            return request.getUserPrincipal().getName();
        }
        return "management@placeprep.com";
    }
}
