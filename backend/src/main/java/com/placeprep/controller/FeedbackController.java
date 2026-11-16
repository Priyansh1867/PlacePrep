package com.placeprep.controller;

import com.placeprep.model.Feedback;
import com.placeprep.service.FeedbackService;
import com.placeprep.mapper.EntityResponseMapper;
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

    @Autowired
    private com.placeprep.repository.UserRepository userRepository;

    public FeedbackController() {
    }

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    private com.placeprep.model.User resolveCaller(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return null;
        }
        String principal = auth.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByRollNumber(principal))
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<com.placeprep.dto.EntityResponseDto>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAll());
    }

    @PostMapping
    public ResponseEntity<com.placeprep.dto.EntityResponseDto> submitFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submit(feedback));
    }

    @PostMapping("/recruiter")
    public ResponseEntity<?> submitRecruiterFeedback(
            @RequestBody com.placeprep.model.RecruiterFeedback feedback,
            org.springframework.security.core.Authentication auth
    ) {
        try {
            com.placeprep.model.User caller = resolveCaller(auth);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submitRecruiterFeedback(feedback, caller));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Collections.singletonMap("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/recruiter")
    public ResponseEntity<List<com.placeprep.dto.EntityResponseDto>> getRecruiterFeedback(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String driveId,
            org.springframework.security.core.Authentication auth
    ) {
        com.placeprep.model.User caller = resolveCaller(auth);
        return ResponseEntity.ok(feedbackService.getAllRecruiterFeedback(driveId, caller));
    }
}
