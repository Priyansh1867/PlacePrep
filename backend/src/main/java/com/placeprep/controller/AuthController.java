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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
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

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("token", token);
        resp.put("user", user);
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
            String token = tokenService != null ? tokenService.generateToken(created.getId(), created.getEmail(), created.getRole()) : "pp_demo_token";
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
            String token = tokenService != null ? tokenService.generateToken(user.getId(), user.getEmail(), user.getRole()) : "pp_demo_token";
            return ResponseEntity.ok(buildAuthResponse(user, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Login error: " + e.getMessage()));
        }
    }

    @PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin(@RequestBody(required = false) Map<String, String> body) {
        try {
            String role = (body != null && body.containsKey("role")) ? body.get("role") : "student";
            User demoUser = userService.demoLogin(role);
            String token = tokenService != null ? tokenService.generateToken(demoUser.getId(), demoUser.getEmail(), demoUser.getRole()) : "pp_demo_token";
            return ResponseEntity.ok(buildAuthResponse(demoUser, token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Demo login error: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body != null ? body.get("email") : null;
            String token = userService.generatePasswordResetToken(email);
            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("message", "Password reset token generated successfully");
            resp.put("resetToken", token);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error: " + e.getMessage()));
        }
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
