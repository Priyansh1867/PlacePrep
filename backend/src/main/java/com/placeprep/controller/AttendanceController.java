package com.placeprep.controller;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // --- CLASS ATTENDANCE ---

    @PostMapping("/class/sessions")
    public ResponseEntity<?> createClassSession(@RequestBody ClassAttendanceSession session) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.createClassSessionDto(session));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/class/sessions")
    public ResponseEntity<List<EntityResponseDto>> listClassSessions(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String semester
    ) {
        return ResponseEntity.ok(attendanceService.getClassSessionsDto(department, semester));
    }

    @PostMapping("/class/sessions/{sessionId}/mark")
    public ResponseEntity<?> markClassAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<ClassAttendanceRecord> records
    ) {
        try {
            return ResponseEntity.ok(attendanceService.markClassAttendanceDto(sessionId, records));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/class/sessions/find-or-create")
    public ResponseEntity<?> findOrCreateClassSession(@RequestBody ClassAttendanceSession session) {
        try {
            return ResponseEntity.ok(attendanceService.findOrCreateClassSessionDto(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/class/sessions/{sessionId}/records")
    public ResponseEntity<List<EntityResponseDto>> getSessionRecords(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionRecordsDto(sessionId));
    }

    @GetMapping("/class/report")
    public ResponseEntity<?> getClassAttendanceReport(
            @RequestParam(required = false, defaultValue = "CSE") String department,
            @RequestParam(required = false, defaultValue = "6") String semester,
            @RequestParam(required = false, defaultValue = "CS306") String subjectCode,
            @RequestParam(required = false) String targetDate
    ) {
        try {
            Map<String, Object> report = attendanceService.getClassAttendanceReport(department, semester, subjectCode, targetDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/class/roster")
    public ResponseEntity<List<Map<String, Object>>> getClassRoster(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String semester
    ) {
        return ResponseEntity.ok(attendanceService.getClassRoster(department, semester));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<?> getStudentAttendanceSummary(@PathVariable String studentId) {
        try {
            Map<String, Object> summary = attendanceService.getStudentAttendanceSummary(studentId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- CRT TRAINING ATTENDANCE ---

    @PostMapping("/crt/sessions")
    public ResponseEntity<?> createCrtSession(@RequestBody CrtTrainingSession session, Principal principal) {
        try {
            if (principal != null && session.getCreatedBy() == null) {
                session.setCreatedBy(principal.getName());
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.createCrtSessionDto(session));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/sessions")
    public ResponseEntity<List<EntityResponseDto>> listCrtSessions(
            @RequestParam(required = false) String targetBatch,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(attendanceService.getCrtSessionsDto(targetBatch, department, status));
    }

    @GetMapping("/crt/sessions/{id}")
    public ResponseEntity<?> getCrtSession(@PathVariable Long id) {
        return attendanceService.getCrtSessionByIdDto(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/crt/sessions/{id}")
    public ResponseEntity<?> updateCrtSession(@PathVariable Long id, @RequestBody CrtTrainingSession session) {
        try {
            return ResponseEntity.ok(attendanceService.updateCrtSessionDto(id, session));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PatchMapping("/crt/sessions/{id}/status")
    public ResponseEntity<?> updateCrtSessionStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body != null ? body.get("status") : null;
            if (status == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Status field is required"));
            }
            return ResponseEntity.ok(attendanceService.updateCrtSessionStatusDto(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/sessions/{sessionId}/roster")
    public ResponseEntity<?> getCrtSessionRoster(@PathVariable Long sessionId) {
        try {
            List<Map<String, Object>> roster = attendanceService.getCrtSessionRoster(sessionId);
            return ResponseEntity.ok(roster);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/crt/sessions/{sessionId}/mark")
    public ResponseEntity<?> markCrtAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<CrtAttendanceRecord> records,
            Principal principal
    ) {
        try {
            String recordedBy = principal != null ? principal.getName() : "Faculty Coordinator";
            return ResponseEntity.ok(attendanceService.markCrtAttendanceDto(sessionId, records, recordedBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/sessions/{sessionId}/records")
    public ResponseEntity<List<EntityResponseDto>> getCrtSessionRecords(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.getCrtSessionRecordsDto(sessionId));
    }

    @GetMapping("/crt/report/session/{sessionId}")
    public ResponseEntity<?> getCrtSessionReport(@PathVariable Long sessionId) {
        try {
            Map<String, Object> report = attendanceService.getCrtSessionReport(sessionId);
            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/report/cumulative")
    public ResponseEntity<?> getCrtCumulativeReport(
            @RequestParam(required = false) String targetBatch,
            @RequestParam(required = false) String department
    ) {
        try {
            Map<String, Object> report = attendanceService.getCrtCumulativeReport(targetBatch, department);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/student/{studentId}")
    public ResponseEntity<?> getStudentCrtSummary(@PathVariable String studentId) {
        try {
            Map<String, Object> summary = attendanceService.getStudentCrtSummary(studentId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
