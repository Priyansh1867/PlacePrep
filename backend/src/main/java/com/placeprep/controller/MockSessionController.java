package com.placeprep.controller;

import com.placeprep.model.MockSession;
import com.placeprep.service.MockSessionService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/mock-sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class MockSessionController {

    @Autowired
    private MockSessionService mockSessionService;

    public MockSessionController() {
    }

    public MockSessionController(MockSessionService mockSessionService) {
        this.mockSessionService = mockSessionService;
    }

    @GetMapping
    public ResponseEntity<List<MockSession>> getMockSessions(@RequestParam(required = false) String userId, HttpServletRequest request) {
        if (userId != null && !userId.trim().isEmpty()) {
            return ResponseEntity.ok(mockSessionService.getByUserId(userId));
        }
        Object currentUserId = request.getAttribute("currentUserId");
        String uid = currentUserId != null ? String.valueOf(currentUserId) : "1";
        return ResponseEntity.ok(mockSessionService.getByUserId(uid));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MockSession>> getMyMockSessions(HttpServletRequest request) {
        Object currentUserId = request.getAttribute("currentUserId");
        String uid = currentUserId != null ? String.valueOf(currentUserId) : "1";
        return ResponseEntity.ok(mockSessionService.getByUserId(uid));
    }

    @PostMapping
    public ResponseEntity<MockSession> createMockSession(@RequestBody MockSession session, HttpServletRequest request) {
        if (session.getUserId() == null || session.getUserId().trim().isEmpty()) {
            Object currentUserId = request.getAttribute("currentUserId");
            if (currentUserId != null) {
                session.setUserId(String.valueOf(currentUserId));
            } else {
                session.setUserId("1");
            }
        }
        MockSession saved = mockSessionService.save(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
