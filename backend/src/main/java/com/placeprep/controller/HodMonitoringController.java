package com.placeprep.controller;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.repository.ClassAttendanceRecordRepository;
import com.placeprep.repository.ClassAttendanceSessionRepository;
import com.placeprep.repository.CrtAttendanceRecordRepository;
import com.placeprep.repository.CrtTrainingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Controller providing HOD-restricted Faculty Operations Monitoring data.
 * Secured via Spring Security to only allow HOD and ADMIN roles.
 */
@RestController
@RequestMapping("/api/hod")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class HodMonitoringController {

    @Autowired
    private ClassAttendanceSessionRepository classSessionRepo;

    @Autowired
    private ClassAttendanceRecordRepository classRecordRepo;

    @Autowired
    private CrtTrainingSessionRepository crtSessionRepo;

    @Autowired
    private CrtAttendanceRecordRepository crtRecordRepo;

    @GetMapping("/faculty-operations")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getFacultyOperations(
            @RequestParam(required = false) String facultyName,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> activities = new ArrayList<>();

        // 1. Ingest real Class Attendance Sessions created/conducted by faculty
        if (operationType == null || operationType.isEmpty() || "CLASS_ATTENDANCE".equalsIgnoreCase(operationType)) {
            List<ClassAttendanceSession> classSessions = classSessionRepo.findAll();
            for (ClassAttendanceSession s : classSessions) {
                String fName = s.getFacultyName() != null && !s.getFacultyName().trim().isEmpty()
                        ? s.getFacultyName() : "Not recorded";
                String fId = s.getFacultyId() != null && !s.getFacultyId().trim().isEmpty()
                        ? s.getFacultyId() : "FAC-" + s.getDepartment() + "-01";

                List<ClassAttendanceRecord> recs = classRecordRepo.findBySessionId(s.getId());
                int recordsCount = recs != null ? recs.size() : 0;
                long presentCount = recs != null ? recs.stream()
                        .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus()))
                        .count() : 0;

                String sessionStatus = recordsCount > 0 ? "COMPLETED" : "SCHEDULED";

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", "CLASS-" + s.getId());
                item.put("rawId", s.getId());
                item.put("facultyName", fName);
                item.put("facultyId", fId);
                item.put("operationType", "CLASS_ATTENDANCE");
                item.put("operationLabel", "Class Attendance Marked");
                item.put("module", "Daily Class Attendance");
                item.put("subjectCode", s.getSubjectCode());
                item.put("subjectName", s.getSubjectName());
                item.put("title", s.getSubjectCode() + " • " + (s.getSubjectName() != null ? s.getSubjectName() : "Lecture"));
                item.put("department", s.getDepartment());
                item.put("semester", s.getSemester() != null ? s.getSemester() : "6");
                item.put("section", s.getSection() != null ? s.getSection() : "A");
                item.put("periodNumber", s.getPeriodNumber() != null ? s.getPeriodNumber() : 1);
                item.put("sessionDate", s.getSessionDate());
                item.put("timestamp", s.getCreatedAt() != null ? s.getCreatedAt() : s.getSessionDate());
                item.put("status", sessionStatus);
                item.put("recordsCount", recordsCount);
                item.put("presentCount", presentCount);
                item.put("details", "Period " + (s.getPeriodNumber() != null ? s.getPeriodNumber() : 1)
                        + (s.getSection() != null ? (" (Sec " + s.getSection() + ")") : "")
                        + " • " + (recordsCount > 0 ? (recordsCount + " students evaluated (" + presentCount + " present)") : "Session registered"));

                activities.add(item);
            }
        }

        // 2. Ingest real CRT Training Sessions conducted by faculty trainers/coordinators
        if (operationType == null || operationType.isEmpty() || "CRT_TRAINING".equalsIgnoreCase(operationType)) {
            List<CrtTrainingSession> crtSessions = crtSessionRepo.findAll();
            for (CrtTrainingSession c : crtSessions) {
                String trainer = c.getTrainerName() != null && !c.getTrainerName().trim().isEmpty()
                        ? c.getTrainerName() : (c.getCreatedBy() != null ? c.getCreatedBy() : "Faculty Coordinator");
                String fId = c.getCreatedBy() != null && !c.getCreatedBy().trim().isEmpty()
                        ? c.getCreatedBy() : "crt.coordinator@dtu.ac.in";

                List<CrtAttendanceRecord> recs = crtRecordRepo.findByCrtSessionId(c.getId());
                int recordsCount = recs != null ? recs.size() : 0;
                long presentCount = recs != null ? recs.stream()
                        .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus()))
                        .count() : 0;

                String sessionStatus = c.getStatus() != null ? c.getStatus() : "SCHEDULED";

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", "CRT-" + c.getId());
                item.put("rawId", c.getId());
                item.put("facultyName", trainer);
                item.put("facultyId", fId);
                item.put("operationType", "CRT_TRAINING");
                item.put("operationLabel", "CRT Training Session");
                item.put("module", "Campus Recruitment Training");
                item.put("subjectCode", c.getModuleType() != null ? c.getModuleType() : "CRT");
                item.put("subjectName", c.getTopic());
                item.put("title", c.getTopic() + (c.getModuleType() != null ? (" [" + c.getModuleType() + "]") : ""));
                item.put("department", c.getTargetBranch() != null ? c.getTargetBranch() : "ALL");
                item.put("semester", c.getSemester() != null ? c.getSemester() : "6");
                item.put("section", "N/A");
                item.put("periodNumber", null);
                item.put("sessionDate", c.getScheduledDate());
                item.put("timestamp", c.getCreatedAt() != null ? c.getCreatedAt() : c.getScheduledDate());
                item.put("status", sessionStatus);
                item.put("recordsCount", recordsCount);
                item.put("presentCount", presentCount);
                item.put("details", (c.getVenue() != null ? c.getVenue() : "Campus Lab")
                        + " • " + (c.getTimeSlot() != null ? c.getTimeSlot() : (c.getStartTime() + " - " + c.getEndTime()))
                        + (recordsCount > 0 ? (" • " + recordsCount + " candidates marked") : ""));

                activities.add(item);
            }
        }

        // Apply filters
        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> act : activities) {
            if (facultyName != null && !facultyName.trim().isEmpty()) {
                String curFac = (String) act.get("facultyName");
                if (curFac == null || !curFac.toLowerCase().contains(facultyName.trim().toLowerCase())) {
                    continue;
                }
            }
            if (department != null && !department.trim().isEmpty() && !"ALL".equalsIgnoreCase(department)) {
                String curDept = (String) act.get("department");
                if (curDept != null && !curDept.equalsIgnoreCase("ALL") && !curDept.equalsIgnoreCase(department)) {
                    continue;
                }
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                String curStatus = (String) act.get("status");
                if (curStatus == null || !curStatus.equalsIgnoreCase(status)) {
                    continue;
                }
            }
            filtered.add(act);
        }

        // Sort descending by timestamp / sessionDate
        filtered.sort((a, b) -> {
            String tsA = (String) a.getOrDefault("timestamp", a.getOrDefault("sessionDate", ""));
            String tsB = (String) b.getOrDefault("timestamp", b.getOrDefault("sessionDate", ""));
            return tsB.compareTo(tsA);
        });

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/faculty-operations/metrics")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getFacultyOperationMetrics() {
        List<ClassAttendanceSession> classSessions = classSessionRepo.findAll();
        List<CrtTrainingSession> crtSessions = crtSessionRepo.findAll();

        Set<String> uniqueFaculty = new HashSet<>();
        int totalClassAttendanceRecords = 0;
        int totalCrtRecords = 0;

        for (ClassAttendanceSession s : classSessions) {
            if (s.getFacultyName() != null && !s.getFacultyName().trim().isEmpty()) {
                uniqueFaculty.add(s.getFacultyName().trim());
            }
            List<ClassAttendanceRecord> recs = classRecordRepo.findBySessionId(s.getId());
            if (recs != null) {
                totalClassAttendanceRecords += recs.size();
            }
        }

        for (CrtTrainingSession c : crtSessions) {
            if (c.getTrainerName() != null && !c.getTrainerName().trim().isEmpty()) {
                uniqueFaculty.add(c.getTrainerName().trim());
            }
            List<CrtAttendanceRecord> recs = crtRecordRepo.findByCrtSessionId(c.getId());
            if (recs != null) {
                totalCrtRecords += recs.size();
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalActiveFaculty", uniqueFaculty.size());
        metrics.put("totalClassSessions", classSessions.size());
        metrics.put("totalCrtSessions", crtSessions.size());
        metrics.put("totalAttendanceEvaluations", totalClassAttendanceRecords + totalCrtRecords);
        metrics.put("facultyList", new ArrayList<>(uniqueFaculty));

        return ResponseEntity.ok(metrics);
    }
}
