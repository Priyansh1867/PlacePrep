package com.placeprep.controller;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import com.placeprep.service.EligibilityService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/eligibility")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EligibilityController {

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private DriveService driveService;

    public EligibilityController() {
    }

    public EligibilityController(EligibilityService eligibilityService, DriveService driveService) {
        this.eligibilityService = eligibilityService;
        this.driveService = driveService;
    }

    @PostMapping("/check")
    public ResponseEntity<?> checkEligibility(@RequestBody Map<String, Object> request) {
        try {
            String driveId = (String) request.get("driveId");
            if (driveId == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "driveId is required"));
            }

            PlacementDrive drive = driveService.getByDriveId(driveId);
            if (drive == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Drive not found for driveId: " + driveId));
            }

            Double cgpa = request.get("cgpa") != null ? Double.valueOf(request.get("cgpa").toString()) : null;
            Double tenth = request.get("tenthPercentage") != null ? Double.valueOf(request.get("tenthPercentage").toString()) : null;
            Double twelfth = request.get("twelfthPercentage") != null ? Double.valueOf(request.get("twelfthPercentage").toString()) : null;
            Integer backlogs = request.get("activeBacklogs") != null ? Integer.valueOf(request.get("activeBacklogs").toString()) : 0;
            String branch = (String) request.get("branch");
            String batch = (String) request.get("graduationBatch");

            Map<String, Object> result = eligibilityService.evaluateEligibility(
                    cgpa, tenth, twelfth, backlogs, branch, batch, drive
            );

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/check-drive/{driveId}")
    public ResponseEntity<?> checkDriveForStudent(
            @PathVariable String driveId,
            @RequestParam String studentId
    ) {
        try {
            Map<String, Object> result = eligibilityService.checkDriveForStudent(driveId, studentId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
