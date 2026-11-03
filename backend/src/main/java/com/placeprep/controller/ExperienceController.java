package com.placeprep.controller;

import com.placeprep.model.InterviewExperience;
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
}
