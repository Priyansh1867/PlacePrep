package com.placeprep.controller;

import com.placeprep.model.StudentApplication;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api/applications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    public ApplicationController() {
    }

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<?> trackApplication(@RequestBody StudentApplication app) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.registerApplication(app));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerApplication(@RequestBody StudentApplication app) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.registerApplication(app));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{applicationId}")
    public ResponseEntity<?> withdrawApplication(@PathVariable String applicationId) {
        try {
            applicationService.deleteApplication(applicationId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Application withdrawn successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(applicationService.getApplicationStats());
    }

    @GetMapping("/my")
    public ResponseEntity<List<EntityResponseDto>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails,
            Principal principal,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String email
    ) {
        String identifier = null;
        if (principal != null) {
            identifier = principal.getName();
        } else if (userDetails != null) {
            identifier = userDetails.getUsername();
        } else if (studentId != null && !studentId.isBlank()) {
            identifier = studentId.trim();
        } else if (email != null && !email.isBlank()) {
            identifier = email.trim();
        }

        if (identifier != null && !identifier.isBlank()) {
            return ResponseEntity.ok(applicationService.getMyApplications(identifier));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EntityResponseDto>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(applicationService.getStudentApplications(studentId));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<List<EntityResponseDto>> getByDrive(@PathVariable String driveId) {
        return ResponseEntity.ok(applicationService.getDriveApplications(driveId));
    }

    @GetMapping
    public ResponseEntity<List<EntityResponseDto>> getAll() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String applicationId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            return ResponseEntity.ok(applicationService.updateStatus(
                    applicationId,
                    payload.get("status"),
                    payload.get("currentRound"),
                    payload.get("scheduledDate"),
                    payload.get("scheduledTime"),
                    payload.get("scheduledEndTime"),
                    payload.get("venue"),
                    payload.get("candidateInstructions")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
