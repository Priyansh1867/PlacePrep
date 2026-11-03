package com.placeprep.controller;

import com.placeprep.model.MockSession;
import com.placeprep.service.MockSessionService;
import com.placeprep.mapper.EntityResponseMapper;
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
    public ResponseEntity<List<com.placeprep.dto.EntityResponseDto>> getMockSessions(@RequestParam(required = false) String userId, HttpServletRequest request) {
        if (userId != null && !userId.trim().isEmpty()) {
            return ResponseEntity.ok(mockSessionService.getByUserIdDto(userId));
        }
        Object currentUserId = request.getAttribute("currentUserId");
        String uid = currentUserId != null ? String.valueOf(currentUserId) : "1";
        return ResponseEntity.ok(mockSessionService.getByUserIdDto(uid));
    }

    @GetMapping("/my")
    public ResponseEntity<List<com.placeprep.dto.EntityResponseDto>> getMyMockSessions(HttpServletRequest request) {
        Object currentUserId = request.getAttribute("currentUserId");
        String uid = currentUserId != null ? String.valueOf(currentUserId) : "1";
        return ResponseEntity.ok(mockSessionService.getByUserIdDto(uid));
    }

    @PostMapping
    public ResponseEntity<com.placeprep.dto.EntityResponseDto> createMockSession(@RequestBody MockSession session, HttpServletRequest request) {
        if (session.getUserId() == null || session.getUserId().trim().isEmpty()) {
            Object currentUserId = request.getAttribute("currentUserId");
            if (currentUserId != null) {
                session.setUserId(String.valueOf(currentUserId));
            } else {
                session.setUserId("1");
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(mockSessionService.saveDto(session));
    }
}
