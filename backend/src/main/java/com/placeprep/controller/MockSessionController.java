package com.placeprep.controller;

import com.placeprep.model.MockSession;
import com.placeprep.service.MockSessionService;
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
    public ResponseEntity<List<MockSession>> getMockSessions(@RequestParam String userId) {
        return ResponseEntity.ok(mockSessionService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<MockSession> createMockSession(@RequestBody MockSession session) {
        MockSession saved = mockSessionService.save(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
