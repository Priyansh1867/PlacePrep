package com.placeprep.controller;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            ClassAttendanceSession created = attendanceService.createClassSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/class/sessions")
    public ResponseEntity<List<ClassAttendanceSession>> listClassSessions(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String semester
    ) {
        return ResponseEntity.ok(attendanceService.getClassSessions(department, semester));
    }

    @PostMapping("/class/sessions/{sessionId}/mark")
    public ResponseEntity<?> markClassAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<ClassAttendanceRecord> records
    ) {
        try {
            List<ClassAttendanceRecord> saved = attendanceService.markClassAttendance(sessionId, records);
            return ResponseEntity.ok(saved);
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
            ClassAttendanceSession res = attendanceService.findOrCreateClassSession(session);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/class/sessions/{sessionId}/records")
    public ResponseEntity<List<ClassAttendanceRecord>> getSessionRecords(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionRecords(sessionId));
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

    // --- CRT ATTENDANCE ---

    @PostMapping("/crt/sessions")
    public ResponseEntity<?> createCrtSession(@RequestBody CrtTrainingSession session) {
        try {
            CrtTrainingSession created = attendanceService.createCrtSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/crt/sessions")
    public ResponseEntity<List<CrtTrainingSession>> listCrtSessions(
            @RequestParam(required = false) String targetBatch
    ) {
        return ResponseEntity.ok(attendanceService.getCrtSessions(targetBatch));
    }

    @PostMapping("/crt/sessions/{sessionId}/mark")
    public ResponseEntity<?> markCrtAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<CrtAttendanceRecord> records
    ) {
        try {
            List<CrtAttendanceRecord> saved = attendanceService.markCrtAttendance(sessionId, records);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
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
