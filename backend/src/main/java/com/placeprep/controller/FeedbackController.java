package com.placeprep.controller;

import com.placeprep.model.Feedback;
import com.placeprep.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    public FeedbackController() {
    }

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAll());
    }

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        Feedback created = feedbackService.submit(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/recruiter")
    public ResponseEntity<?> submitRecruiterFeedback(@RequestBody com.placeprep.model.RecruiterFeedback feedback) {
        try {
            com.placeprep.model.RecruiterFeedback created = feedbackService.submitRecruiterFeedback(feedback);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/recruiter")
    public ResponseEntity<List<com.placeprep.model.RecruiterFeedback>> getRecruiterFeedback(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String driveId
    ) {
        return ResponseEntity.ok(feedbackService.getAllRecruiterFeedback(driveId));
    }
}
