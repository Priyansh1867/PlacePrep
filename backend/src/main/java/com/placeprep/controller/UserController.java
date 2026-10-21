package com.placeprep.controller;

import com.placeprep.dto.UserDto;
import com.placeprep.model.User;
import com.placeprep.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    public UserController() {
    }

    public UserController(UserService userService) {
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

    private Long resolveAuthorizedUserId(Long requestedId) {
        User current = getAuthenticatedUser();
        // If user is ADMIN, they may operate on requestedId. Otherwise only on their own ID.
        if ("admin".equalsIgnoreCase(current.getRole())) {
            return requestedId != null ? requestedId : current.getId();
        }
        return current.getId();
    }

    // --- Current User Operations (/me) ---

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        try {
            User user = getAuthenticatedUser();
            return ResponseEntity.ok(userService.toDto(user));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/me/batch")
    public ResponseEntity<?> updateMyBatch(@RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String batch = body != null ? body.get("batch") : "2028";
            UserDto updated = userService.updateBatch(user.getId(), batch);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/me/saved-questions")
    public ResponseEntity<?> getMySavedQuestions() {
        try {
            User user = getAuthenticatedUser();
            return ResponseEntity.ok(userService.getSavedQuestionIds(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-saved-question/{questionId}")
    public ResponseEntity<?> toggleMySavedQuestion(@PathVariable String questionId) {
        try {
            User user = getAuthenticatedUser();
            boolean saved = userService.toggleSavedQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-practiced-question/{questionId}")
    public ResponseEntity<?> toggleMyPracticedQuestion(@PathVariable String questionId) {
        try {
            User user = getAuthenticatedUser();
            boolean practiced = userService.togglePracticedQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("practiced", practiced));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-revision-question/{questionId}")
    public ResponseEntity<?> toggleMyRevisionQuestion(@PathVariable String questionId) {
        try {
            User user = getAuthenticatedUser();
            boolean revision = userService.toggleRevisionQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("revision", revision));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-saved-company/{companyId}")
    public ResponseEntity<?> toggleMySavedCompany(@PathVariable String companyId) {
        try {
            User user = getAuthenticatedUser();
            boolean saved = userService.toggleSavedCompany(user.getId(), companyId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<?> getMyDashboard() {
        try {
            User user = getAuthenticatedUser();
            return ResponseEntity.ok(userService.getDashboardData(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- Legacy / ID Parameterized Routes with Server-Side Authorization Check ---

    @PutMapping("/{id}/batch")
    public ResponseEntity<?> updateBatch(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            String batch = body != null ? body.get("batch") : null;
            UserDto updated = userService.updateBatch(effectiveId, batch);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/saved-questions")
    public ResponseEntity<?> getSavedQuestions(@PathVariable Long id) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            List<String> savedQuestions = userService.getSavedQuestionIds(effectiveId);
            return ResponseEntity.ok(savedQuestions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-saved-question/{questionId}")
    public ResponseEntity<?> toggleSavedQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            boolean saved = userService.toggleSavedQuestion(effectiveId, questionId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-practiced-question/{questionId}")
    public ResponseEntity<?> togglePracticedQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            boolean practiced = userService.togglePracticedQuestion(effectiveId, questionId);
            return ResponseEntity.ok(Collections.singletonMap("practiced", practiced));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-revision-question/{questionId}")
    public ResponseEntity<?> toggleRevisionQuestion(@PathVariable Long id, @PathVariable String questionId) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            boolean revision = userService.toggleRevisionQuestion(effectiveId, questionId);
            return ResponseEntity.ok(Collections.singletonMap("revision", revision));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-saved-company/{companyId}")
    public ResponseEntity<?> toggleSavedCompany(@PathVariable Long id, @PathVariable String companyId) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            boolean saved = userService.toggleSavedCompany(effectiveId, companyId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getDashboardData(@PathVariable Long id) {
        try {
            Long effectiveId = resolveAuthorizedUserId(id);
            Map<String, Object> dashboard = userService.getDashboardData(effectiveId);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
