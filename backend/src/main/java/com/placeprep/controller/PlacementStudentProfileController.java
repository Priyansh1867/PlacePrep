package com.placeprep.controller;

import com.placeprep.model.PlacementStudentProfile;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.PlacementStudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/placement-profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PlacementStudentProfileController {

    @Autowired
    private PlacementStudentProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    public PlacementStudentProfileController() {
    }

    public PlacementStudentProfileController(PlacementStudentProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private String resolveEffectiveEmail(String queryEmail, Principal principal) {
        if (queryEmail != null && !queryEmail.trim().isEmpty()) {
            return queryEmail.trim().toLowerCase();
        }
        if (principal != null && principal.getName() != null && !principal.getName().trim().isEmpty()) {
            return principal.getName().trim().toLowerCase();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getPlacementProfile(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId,
            Principal principal
    ) {
        try {
            String effectiveEmail = resolveEffectiveEmail(email, principal);
            Optional<PlacementStudentProfile> profileOpt = Optional.empty();

            if (userId != null) {
                profileOpt = profileService.getByUserId(userId);
            }
            if (profileOpt.isEmpty() && effectiveEmail != null) {
                profileOpt = profileService.getByEmail(effectiveEmail);
            }

            if (profileOpt.isPresent()) {
                return ResponseEntity.ok(profileOpt.get());
            }

            // If profile does not exist yet, check if User exists to return initial template
            if (effectiveEmail != null) {
                Optional<User> userOpt = userRepository.findByEmail(effectiveEmail);
                if (userOpt.isPresent()) {
                    User u = userOpt.get();
                    PlacementStudentProfile initial = profileService.getOrCreateProfileForStudent(u.getId(), u.getEmail(), u.getName());
                    return ResponseEntity.ok(initial);
                }
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Placement profile not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getPlacementProfileStatus(
            @RequestParam(required = false) String email,
            Principal principal
    ) {
        try {
            String effectiveEmail = resolveEffectiveEmail(email, principal);
            if (effectiveEmail == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required to check status"));
            }

            Optional<PlacementStudentProfile> profileOpt = profileService.getByEmail(effectiveEmail);
            Map<String, Object> status = new HashMap<>();

            if (profileOpt.isPresent()) {
                PlacementStudentProfile p = profileOpt.get();
                status.put("exists", true);
                status.put("isCompleted", Boolean.TRUE.equals(p.getIsCompleted()));
                status.put("currentStep", p.getCurrentStep() != null ? p.getCurrentStep() : 1);
                status.put("placementStatus", p.getPlacementStatus());
                status.put("placementCycle", p.getPlacementCycle());
                status.put("lastUpdatedAt", p.getLastUpdatedAt());
            } else {
                status.put("exists", false);
                status.put("isCompleted", false);
                status.put("currentStep", 1);
                status.put("placementStatus", "PENDING_REGISTRATION");
                status.put("placementCycle", "2026-2027");
            }

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping
    @PostMapping
    public ResponseEntity<?> savePlacementProfile(
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {
        try {
            String emailInBody = body != null && body.get("email") != null ? String.valueOf(body.get("email")).trim() : null;
            String effectiveEmail = resolveEffectiveEmail(emailInBody, principal);

            Long userId = null;
            if (body != null && body.get("userId") != null) {
                try {
                    userId = Long.parseLong(String.valueOf(body.get("userId")).trim());
                } catch (Exception ignored) {}
            }

            if (effectiveEmail == null && userId == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Student email or User ID is required"));
            }

            PlacementStudentProfile saved = profileService.saveOrUpdatePlacementProfile(userId, effectiveEmail, body);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Placement Profile successfully synchronized with database");
            response.put("profile", saved);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/draft")
    public ResponseEntity<?> saveDraft(
            @RequestBody Map<String, Object> body,
            Principal principal
    ) {
        try {
            String emailInBody = body != null && body.get("email") != null ? String.valueOf(body.get("email")).trim() : null;
            String effectiveEmail = resolveEffectiveEmail(emailInBody, principal);

            Long userId = null;
            if (body != null && body.get("userId") != null) {
                try {
                    userId = Long.parseLong(String.valueOf(body.get("userId")).trim());
                } catch (Exception ignored) {}
            }

            // For draft, ensure isCompleted is marked false
            if (body != null) {
                body.put("isCompleted", false);
            }

            PlacementStudentProfile saved = profileService.saveOrUpdatePlacementProfile(userId, effectiveEmail, body);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration draft saved successfully");
            response.put("profile", saved);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
