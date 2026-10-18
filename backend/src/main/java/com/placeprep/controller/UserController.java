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
}
