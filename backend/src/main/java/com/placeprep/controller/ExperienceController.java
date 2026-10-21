package com.placeprep.controller;

import com.placeprep.model.InterviewExperience;
import com.placeprep.service.ExperienceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    @Autowired
    private ExperienceService experienceService;

    public ExperienceController() {
    }

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    public ResponseEntity<List<InterviewExperience>> getExperiences(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String batch) {
        if (companyId != null && !companyId.trim().isEmpty()) {
            return ResponseEntity.ok(experienceService.getByCompanyId(companyId.trim()));
        } else if (batch != null && !batch.trim().isEmpty()) {
            return ResponseEntity.ok(experienceService.getByBatch(batch.trim()));
        } else {
            return ResponseEntity.ok(experienceService.getAll());
        }
    }

    @PostMapping
    public ResponseEntity<InterviewExperience> createExperience(@RequestBody InterviewExperience experience) {
        InterviewExperience created = experienceService.create(experience);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{experienceId}/vote")
    public ResponseEntity<?> voteHelpful(@PathVariable String experienceId) {
        try {
            InterviewExperience updated = experienceService.voteHelpful(experienceId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{experienceId}/report")
    public ResponseEntity<?> reportExperience(
            @PathVariable String experienceId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : "Inappropriate content";
            InterviewExperience updated = experienceService.reportExperience(experienceId, reason);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{experienceId}/moderate")
    public ResponseEntity<?> moderateExperience(
            @PathVariable String experienceId,
            @RequestBody Map<String, String> body) {
        try {
            String status = body != null ? body.get("status") : "APPROVED";
            InterviewExperience updated = experienceService.moderateExperience(experienceId, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
