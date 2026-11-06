package com.placeprep.controller;

import com.placeprep.model.InterviewExperience;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.ExperienceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ExperienceController {

    @Autowired
    private ExperienceService experienceService;

    public ExperienceController() {
    }

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    public ResponseEntity<List<EntityResponseDto>> getExperiences(
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
    public ResponseEntity<EntityResponseDto> createExperience(@RequestBody InterviewExperience experience) {
        return ResponseEntity.status(HttpStatus.CREATED).body(experienceService.create(experience));
    }

    @PostMapping("/{experienceId}/vote")
    public ResponseEntity<?> voteHelpful(@PathVariable String experienceId) {
        try {
            return ResponseEntity.ok(experienceService.voteHelpful(experienceId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{experienceId}/report")
    public ResponseEntity<?> reportExperience(@PathVariable String experienceId, @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : "Inappropriate content";
            return ResponseEntity.ok(experienceService.reportExperience(experienceId, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{experienceId}/moderate")
    public ResponseEntity<?> moderateExperience(@PathVariable String experienceId, @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String status = body != null ? body.get("status") : "APPROVED";
            return ResponseEntity.ok(experienceService.moderateExperience(experienceId, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }
}
