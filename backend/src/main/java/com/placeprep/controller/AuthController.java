package com.placeprep.controller;

import com.placeprep.model.User;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired(required = false)
    private com.placeprep.config.TokenService tokenService;

    public AuthController() {
    }

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    private String unavailableTokenService() {
        throw new IllegalStateException("Authentication service is unavailable.");
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("token", token);
        resp.put("user", EntityResponseMapper.toDto(user));
        resp.put("id", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("branch", user.getBranch());
        resp.put("college", user.getCollege());
        resp.put("rollNumber", user.getRollNumber());
        return resp;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User created = userService.register(user);
            String token = tokenService != null ? tokenService.generateToken(created.getId(), created.getEmail(), created.getRole()) : unavailableTokenService();
            return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(created, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Registration error: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials != null ? credentials.get("email") : null;
        String password = credentials != null ? credentials.get("password") : null;
        try {
            User user = userService.login(email, password);
            String token = tokenService != null ? tokenService.generateToken(user.getId(), user.getEmail(), user.getRole()) : unavailableTokenService();
            return ResponseEntity.ok(buildAuthResponse(user, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Login error: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(java.security.Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Not authenticated"));
        }
        try {
            User user = userService.getUserByEmail(principal.getName());
            return ResponseEntity.ok(EntityResponseMapper.toDto(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<EntityResponseDto>> getAllUsers(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String role,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getAllUsers(role, search));
    }

    @PostMapping("/bulk-register")
    public ResponseEntity<?> bulkRegister(@RequestBody List<Map<String, Object>> students) {
        if (students == null || students.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No students provided"));
        }
        int count = 0;
        for (Map<String, Object> s : students) {
            String email = s.get("email") != null ? String.valueOf(s.get("email")).trim().toLowerCase() : null;
            if (email == null || email.isEmpty()) continue;
            try {
                try {
                    userService.getUserByEmail(email);
                    continue;
                } catch (IllegalArgumentException notFound) {
                    User newUser = new User();
                    newUser.setEmail(email);
                    String name = s.get("fullName") != null ? String.valueOf(s.get("fullName")) : (s.get("name") != null ? String.valueOf(s.get("name")) : email.split("@")[0]);
                    newUser.setName(name);
                    newUser.setPassword(s.get("password") != null ? String.valueOf(s.get("password")) : "PlacePrep@2026");
                    newUser.setRole("student");
                    if (s.get("rollNumber") != null) newUser.setRollNumber(String.valueOf(s.get("rollNumber")));
                    if (s.get("college") != null) newUser.setCollege(String.valueOf(s.get("college")));
                    if (s.get("branch") != null) newUser.setBranch(String.valueOf(s.get("branch")));
                    if (s.get("graduationBatch") != null) newUser.setGraduationBatch(String.valueOf(s.get("graduationBatch")));
                    userService.register(newUser);
                    count++;
                }
            } catch (Exception ignored) {
            }
        }
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("registeredCount", count);
        resp.put("total", students.size());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(EntityResponseMapper.toDto(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        // Reset tokens must never be returned to a requester. Re-enable only with a delivery channel.
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Collections.singletonMap("error", "Password recovery is temporarily unavailable."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body != null ? body.get("token") : null;
            String newPassword = body != null ? body.get("newPassword") : null;
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Collections.singletonMap("message", "Password reset successfully. You can now login."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error: " + e.getMessage()));
        }
    }
}
