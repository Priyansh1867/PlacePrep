package com.placeprep.controller;

import com.placeprep.service.ScheduleConflictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ScheduleConflictController {

    @Autowired
    private ScheduleConflictService conflictService;

    public ScheduleConflictController() {
    }

    public ScheduleConflictController(ScheduleConflictService conflictService) {
        this.conflictService = conflictService;
    }

    @PostMapping("/check-conflict")
    public ResponseEntity<Map<String, Object>> checkConflict(@RequestBody Map<String, String> request) {
        String studentId = request.get("studentId");
        String companyId = request.get("companyId");
        String driveId = request.get("driveId");
        String round = request.get("round");
        String targetDate = request.get("targetDate");
        String startTime = request.get("startTime");
        String endTime = request.get("endTime");

        Map<String, Object> result = conflictService.checkStudentInterviewConflict(
                studentId, companyId, driveId, round, targetDate, startTime, endTime
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/conflicts/student")
    public ResponseEntity<Map<String, Object>> getStudentConflicts(
            @RequestParam String studentId,
            @RequestParam(required = false) String targetDate,
            @RequestParam(required = false, defaultValue = "10:00 AM") String startTime,
            @RequestParam(required = false, defaultValue = "11:30 AM") String endTime
    ) {
        Map<String, Object> result = conflictService.checkStudentInterviewConflict(
                studentId, null, null, "All Rounds", targetDate, startTime, endTime
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/conflicts/drives")
    public ResponseEntity<List<Map<String, Object>>> getDriveConflicts() {
        return ResponseEntity.ok(conflictService.checkDriveLevelConflicts());
    }
}
