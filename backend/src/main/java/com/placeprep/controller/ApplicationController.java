package com.placeprep.controller;

import com.placeprep.model.PlacementApplication;
import com.placeprep.model.User;
import com.placeprep.service.ApplicationService;
import com.placeprep.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    public ApplicationController() {
    }

    public ApplicationController(ApplicationService applicationService, UserService userService) {
        this.applicationService = applicationService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("Authentication required");
        }
        String email = (String) auth.getPrincipal();
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found for active authentication");
        }
        return user;
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyApplications() {
        try {
            User user = getAuthenticatedUser();
            List<PlacementApplication> apps = applicationService.getStudentApplications(user.getId());
            return ResponseEntity.ok(apps);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> trackApplication(@RequestBody PlacementApplication application) {
        try {
            User user = getAuthenticatedUser();
            PlacementApplication saved = applicationService.trackApplication(user.getId(), application);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String status = body != null ? body.get("status") : "APPLIED";
            String notes = body != null ? body.get("notes") : null;
            PlacementApplication updated = applicationService.updateStatus(user.getId(), id, status, notes);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            applicationService.withdrawApplication(user.getId(), id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Application removed successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getApplicationStats() {
        try {
            User user = getAuthenticatedUser();
            return ResponseEntity.ok(applicationService.getStudentApplicationStats(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
