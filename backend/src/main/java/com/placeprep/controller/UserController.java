package com.placeprep.controller;

import com.placeprep.model.User;
import com.placeprep.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.security.Principal;
import java.util.HashMap;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

    public UserController() {
    }

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/{id}/batch")
    public ResponseEntity<?> updateBatch(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String batch = body != null ? body.get("batch") : null;
            User updated = userService.updateBatch(id, batch);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/saved-questions")
    public ResponseEntity<?> getSavedQuestions(@PathVariable Long id) {
        try {
            List<String> savedQuestions = userService.getSavedQuestionIds(id);
            return ResponseEntity.ok(savedQuestions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-saved-question/{questionId}")
    public ResponseEntity<?> toggleSavedQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            boolean saved = userService.toggleSavedQuestion(id, questionId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-practiced-question/{questionId}")
    public ResponseEntity<?> togglePracticedQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            boolean practiced = userService.togglePracticedQuestion(id, questionId);
            return ResponseEntity.ok(Collections.singletonMap("practiced", practiced));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-revision-question/{questionId}")
    public ResponseEntity<?> toggleRevisionQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            boolean revision = userService.toggleRevisionQuestion(id, questionId);
            return ResponseEntity.ok(Collections.singletonMap("revision", revision));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-saved-company/{companyId}")
    public ResponseEntity<?> toggleSavedCompany(@PathVariable Long id, @PathVariable String companyId) {
        try {
            boolean saved = userService.toggleSavedCompany(id, companyId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getDashboardData(@PathVariable Long id) {
        try {
            Map<String, Object> dashboard = userService.getDashboardData(id);
            return ResponseEntity.ok(dashboard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getFullProfile(@RequestParam(required = false) String email, Principal principal) {
        try {
            String targetEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : (principal != null ? principal.getName() : null);
            if (targetEmail == null || targetEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
            }
            String profileJson = userService.getUserFullProfile(targetEmail);
            if (profileJson != null && !profileJson.trim().isEmpty()) {
                return ResponseEntity.ok(profileJson);
            }
            User user = userService.getUserByEmail(targetEmail);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("user", user);
            fallback.put("name", user.getName());
            fallback.put("email", user.getEmail());
            fallback.put("rollNumber", user.getRollNumber());
            fallback.put("college", user.getCollege());
            fallback.put("branch", user.getBranch());
            fallback.put("graduationBatch", user.getGraduationBatch());
            fallback.put("phone", user.getPhone());
            return ResponseEntity.ok(fallback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> saveFullProfile(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String email = body != null && body.get("email") != null ? String.valueOf(body.get("email")).trim() : (principal != null ? principal.getName() : null);
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
            }

            Object profileObj = body != null ? body.get("profile") : null;
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String profileJson = profileObj != null ? mapper.writeValueAsString(profileObj) : mapper.writeValueAsString(body);

            Map<String, Object> basicFields = new HashMap<>();
            if (profileObj instanceof Map) {
                Map<?, ?> pMap = (Map<?, ?>) profileObj;
                Object basicObj = pMap.get("basicDetails");
                if (basicObj instanceof Map) {
                    Map<?, ?> bMap = (Map<?, ?>) basicObj;
                    if (bMap.get("fullName") != null) basicFields.put("name", bMap.get("fullName"));
                    if (bMap.get("phone") != null) basicFields.put("phone", bMap.get("phone"));
                }
                Object eduObj = pMap.get("educationDetails");
                if (eduObj instanceof Map) {
                    Map<?, ?> eMap = (Map<?, ?>) eduObj;
                    if (eMap.get("college") != null) basicFields.put("college", eMap.get("college"));
                    if (eMap.get("branch") != null) basicFields.put("branch", eMap.get("branch"));
                    if (eMap.get("rollNumber") != null) basicFields.put("rollNumber", eMap.get("rollNumber"));
                    if (eMap.get("graduationBatch") != null) basicFields.put("graduationBatch", eMap.get("graduationBatch"));
                }
            }

            User updatedUser = userService.saveUserFullProfile(email, profileJson, basicFields);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Profile successfully saved to database");
            res.put("user", updatedUser);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

}
