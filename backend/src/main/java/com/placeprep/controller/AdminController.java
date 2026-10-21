package com.placeprep.controller;

import com.placeprep.model.AuditLog;
import com.placeprep.model.User;
import com.placeprep.repository.CompanyRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.AuditLogService;
import com.placeprep.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private StudentApplicationRepository applicationRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userService.getAllUsers(role, search));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String adminEmail
    ) {
        try {
            String newRole = body != null ? body.get("role") : null;
            User updated = userService.updateUserRole(id, newRole);
            auditLogService.logAction(
                    "USER_ROLE_UPDATED",
                    adminEmail,
                    "SUPER_ADMIN",
                    "User:" + id,
                    "Updated role to: " + newRole
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String adminEmail
    ) {
        try {
            String newStatus = body != null ? body.get("status") : null;
            User updated = userService.updateUserStatus(id, newStatus);
            auditLogService.logAction(
                    "USER_STATUS_UPDATED",
                    adminEmail,
                    "SUPER_ADMIN",
                    "User:" + id,
                    "Updated status to: " + newStatus
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String adminEmail
    ) {
        try {
            userService.deleteUser(id);
            auditLogService.logAction(
                    "USER_DELETED",
                    adminEmail,
                    "SUPER_ADMIN",
                    "User:" + id,
                    "User account permanently deleted"
            );
            return ResponseEntity.ok(Collections.singletonMap("message", "User deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalCompanies = companyRepository.count();
        long totalDrives = driveRepository.count();
        long totalApplications = applicationRepository.count();
        long totalOffered = applicationRepository.findAll().stream()
                .filter(a -> "OFFERED".equalsIgnoreCase(a.getStatus()))
                .count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalCompanies", totalCompanies);
        stats.put("totalDrives", totalDrives);
        stats.put("totalApplications", totalApplications);
        stats.put("totalOffersIssued", totalOffered);
        stats.put("placementRatePercentage", totalApplications > 0 ? (totalOffered * 100.0 / totalApplications) : 0.0);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }
}
