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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

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

    private User getCurrentAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("User is not authenticated");
        }
        return userService.getUserByEmail(principal.getName().trim().toLowerCase());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/me/batch")
    public ResponseEntity<?> updateMyBatch(@RequestBody Map<String, String> body, Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            String batch = body != null ? body.get("batch") : null;
            return ResponseEntity.ok(userService.updateBatch(user.getId(), batch));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/me/saved-questions")
    public ResponseEntity<?> getMySavedQuestions(Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            List<String> savedQuestions = userService.getSavedQuestionIds(user.getId());
            return ResponseEntity.ok(savedQuestions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-saved-question/{questionId}")
    public ResponseEntity<?> toggleMySavedQuestion(@PathVariable String questionId, Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            boolean saved = userService.toggleSavedQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-practiced-question/{questionId}")
    public ResponseEntity<?> toggleMyPracticedQuestion(@PathVariable String questionId, Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            boolean practiced = userService.togglePracticedQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("practiced", practiced));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-revision-question/{questionId}")
    public ResponseEntity<?> toggleMyRevisionQuestion(@PathVariable String questionId, Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            boolean revision = userService.toggleRevisionQuestion(user.getId(), questionId);
            return ResponseEntity.ok(Collections.singletonMap("revision", revision));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/me/toggle-saved-company/{companyId}")
    public ResponseEntity<?> toggleMySavedCompany(@PathVariable String companyId, Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            boolean saved = userService.toggleSavedCompany(user.getId(), companyId);
            return ResponseEntity.ok(Collections.singletonMap("saved", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<?> getMyDashboardData(Principal principal) {
        try {
            User user = getCurrentAuthenticatedUser(principal);
            Map<String, Object> dashboard = userService.getDashboardData(user.getId());
            return ResponseEntity.ok(dashboard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/batch")
    public ResponseEntity<?> updateBatch(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String batch = body != null ? body.get("batch") : null;
            return ResponseEntity.ok(userService.updateBatch(id, batch));
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

    @PutMapping("/profile/step")
    public ResponseEntity<?> saveOnboardingStep(@RequestBody Map<String, Object> payload, Principal principal) {
        try {
            String email = payload != null && payload.get("email") != null
                    ? String.valueOf(payload.get("email")).trim()
                    : (principal != null ? principal.getName() : null);
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
            }

            Integer step = payload.get("step") != null ? Integer.parseInt(String.valueOf(payload.get("step"))) : 1;
            @SuppressWarnings("unchecked")
            Map<String, Object> stepData = payload.get("stepData") instanceof Map
                    ? (Map<String, Object>) payload.get("stepData")
                    : Collections.emptyMap();
            boolean isCompleted = Boolean.parseBoolean(String.valueOf(payload.get("isCompleted")));

            User updatedUser = userService.saveOnboardingStep(email, step, stepData, isCompleted);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("step", step);
            res.put("currentOnboardingStep", updatedUser.getCurrentOnboardingStep());
            res.put("onboardingStatus", updatedUser.getOnboardingStatus());
            res.put("onboardingCompleted", updatedUser.isOnboardingCompleted());
            res.put("user", updatedUser);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to save step: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "email", required = false) String email,
            Principal principal
    ) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "File is required and cannot be empty."));
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "File exceeds maximum permitted size of 10MB."));
            }

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String lowerName = originalName.toLowerCase();
            boolean validExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".jpg")
                    || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png")
                    || lowerName.endsWith(".doc") || lowerName.endsWith(".docx");
            if (!validExt) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid file format. Allowed formats: PDF, JPG, JPEG, PNG, DOC, DOCX."));
            }

            // Create uploads directory
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "documents");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            String safeFileName = System.currentTimeMillis() + "_" + documentType + "_" + originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
            java.nio.file.Path targetPath = uploadDir.resolve(safeFileName);
            java.nio.file.Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/uploads/documents/" + safeFileName;

            // Generate small data preview URI for images so UI displays immediately without network lag
            String previewDataUri = null;
            if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png")) {
                String mime = lowerName.endsWith(".png") ? "image/png" : "image/jpeg";
                previewDataUri = "data:" + mime + ";base64," + java.util.Base64.getEncoder().encodeToString(file.getBytes());
            }

            String effectiveEmail = (email != null && !email.trim().isEmpty())
                    ? email.trim()
                    : (principal != null ? principal.getName() : null);

            if (effectiveEmail != null && !effectiveEmail.trim().isEmpty()) {
                userService.attachUserDocument(effectiveEmail, documentType, originalName, fileUrl, previewDataUri);
            }

            Map<String, Object> resp = new java.util.LinkedHashMap<>();
            resp.put("success", true);
            resp.put("fileName", originalName);
            resp.put("documentType", documentType);
            resp.put("fileSize", file.getSize());
            resp.put("fileUrl", fileUrl);
            resp.put("previewUrl", previewDataUri != null ? previewDataUri : fileUrl);
            resp.put("uploadedAt", java.time.LocalDateTime.now().toString());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Document upload failed: " + e.getMessage()));
        }
    }

}
