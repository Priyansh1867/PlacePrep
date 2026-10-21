package com.placeprep.controller;

import com.placeprep.model.MockSession;
import com.placeprep.model.User;
import com.placeprep.service.MockSessionService;
import com.placeprep.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/mock-sessions")
public class MockSessionController {

    @Autowired
    private MockSessionService mockSessionService;

    @Autowired
    private UserService userService;

    public MockSessionController() {
    }

    public MockSessionController(MockSessionService mockSessionService, UserService userService) {
        this.mockSessionService = mockSessionService;
        this.userService = userService;
    }

    private User getAuthenticatedUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = (String) auth.getPrincipal();
        return userService.getUserByEmail(email);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMySessions() {
        User user = getAuthenticatedUserOrNull();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Authentication required"));
        }
        return ResponseEntity.ok(mockSessionService.getByUserId(String.valueOf(user.getId())));
    }

    @GetMapping
    public ResponseEntity<List<MockSession>> getMockSessions(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.trim().isEmpty()) {
            return ResponseEntity.ok(mockSessionService.getByUserId(userId.trim()));
        }
        User user = getAuthenticatedUserOrNull();
        if (user != null) {
            return ResponseEntity.ok(mockSessionService.getByUserId(String.valueOf(user.getId())));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping
    public ResponseEntity<MockSession> createMockSession(@RequestBody MockSession session) {
        User user = getAuthenticatedUserOrNull();
        if ((session.getUserId() == null || session.getUserId().trim().isEmpty()) && user != null) {
            session.setUserId(String.valueOf(user.getId()));
        }
        if (session.getSessionId() == null || session.getSessionId().trim().isEmpty()) {
            session.setSessionId("mock-" + System.currentTimeMillis());
        }
        MockSession saved = mockSessionService.save(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
