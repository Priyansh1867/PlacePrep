package com.placeprep.service;

import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserService() {
    }

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = user.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("User with email " + cleanEmail + " already exists");
        }
        user.setEmail(cleanEmail);
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("student");
        }
        if (user.getSavedCompanyIds() == null) {
            user.setSavedCompanyIds(new ArrayList<>());
        }
        if (user.getSavedQuestionIds() == null) {
            user.setSavedQuestionIds(new ArrayList<>());
        }
        if (user.getPracticedQuestionIds() == null) {
            user.setPracticedQuestionIds(new ArrayList<>());
        }
        if (user.getRevisionQuestionIds() == null) {
            user.setRevisionQuestionIds(new ArrayList<>());
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = email.trim().toLowerCase();

        // Resolve known demo email aliases
        if ("hod.cse@dtu.ac.in".equals(cleanEmail)) {
            cleanEmail = "hod@placeprep.com";
        } else if ("neha.sharma@dtu.ac.in".equals(cleanEmail)) {
            cleanEmail = "teacher@placeprep.com";
        }

        // 1. First check if user exists by email and exact password or demo fallback
        java.util.Optional<User> byEmailAndPass = userRepository.findByEmailAndPassword(cleanEmail, password != null ? password : "");
        if (byEmailAndPass.isEmpty() && password != null) {
            if ("password123".equals(password)) {
                byEmailAndPass = userRepository.findByEmailAndPassword(cleanEmail, "demo123");
            } else if ("demo123".equals(password)) {
                byEmailAndPass = userRepository.findByEmailAndPassword(cleanEmail, "password123");
            }
        }
        if (byEmailAndPass.isPresent()) {
            User user = byEmailAndPass.get();
            if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalArgumentException("Account is suspended. Please contact the administrator.");
            }
            return user;
        }

        // 2. Hardcoded login bypass: if user exists by email, allow login with any password
        java.util.Optional<User> byEmail = userRepository.findByEmail(cleanEmail);
        if (byEmail.isPresent()) {
            User user = byEmail.get();
            if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalArgumentException("Account is suspended. Please contact the administrator.");
            }
            return user;
        }

        // 3. Auto-provision hardcoded profile for any role/email
        return provisionHardcodedUser(cleanEmail, password != null ? password : "password123");
    }

    private User provisionHardcodedUser(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setStatus("ACTIVE");
        user.setOnboardingCompleted(true);
        user.setCollege("Indian Institute of Technology");

        String lower = email.toLowerCase();
        if (lower.contains("tpo")) {
            user.setName("Prof. Rajesh Raman");
            user.setRole("tpo");
            user.setBranch("Management & Placement");
        } else if (lower.contains("manage") || lower.contains("admin")) {
            user.setName("Dr. Ramesh Gupta");
            user.setRole("management");
            user.setBranch("Operations");
        } else if (lower.contains("hod")) {
            user.setName("Prof. Alok Verma");
            user.setRole("hod");
            user.setBranch("Computer Science & Engineering");
        } else if (lower.contains("teacher") || lower.contains("faculty")) {
            user.setName("Dr. Neha Sharma");
            user.setRole("teacher");
            user.setBranch("Computer Science & Engineering");
        } else if (lower.contains("recruit") || lower.contains("hr")) {
            user.setName("Sarah Jenkins");
            user.setRole("hr");
            user.setBranch("Corporate Recruitment (Google)");
        } else if (lower.contains("coord")) {
            user.setName("Prof. Ananya Gupta");
            user.setRole("coordinator");
            user.setBranch("Computer Science & Engineering");
        } else if (lower.contains("direct")) {
            user.setName("Dr. Vikramaditya Sen");
            user.setRole("director");
            user.setBranch("Institutional Governance");
        } else {
            user.setName("Priyansh Jain");
            user.setRole("student");
            user.setBranch("Computer Science & Engineering");
            user.setRollNumber("2024/CSE/084");
            user.setGraduationBatch("2026");
            user.setCgpa(8.85);
            user.setActiveBacklogs(0);
        }

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    public User updateBatch(Long userId, String batch) {
        User user = getUserById(userId);
        user.setGraduationBatch(batch);
        user.setOnboardingCompleted(true);
        return userRepository.save(user);
    }

    public List<String> getSavedQuestionIds(Long userId) {
        User user = getUserById(userId);
        return user.getSavedQuestionIds() != null ? user.getSavedQuestionIds() : new ArrayList<>();
    }

    public boolean toggleSavedQuestion(Long userId, String questionId) {
        User user = getUserById(userId);
        List<String> list = user.getSavedQuestionIds();
        if (list == null) {
            list = new ArrayList<>();
        }
        boolean isSaved;
        if (list.contains(questionId)) {
            list.remove(questionId);
            isSaved = false;
        } else {
            list.add(questionId);
            isSaved = true;
        }
        user.setSavedQuestionIds(list);
        userRepository.save(user);
        return isSaved;
    }

    public boolean togglePracticedQuestion(Long userId, String questionId) {
        User user = getUserById(userId);
        List<String> list = user.getPracticedQuestionIds();
        if (list == null) {
            list = new ArrayList<>();
        }
        boolean isPracticed;
        if (list.contains(questionId)) {
            list.remove(questionId);
            isPracticed = false;
        } else {
            list.add(questionId);
            isPracticed = true;
        }
        user.setPracticedQuestionIds(list);
        userRepository.save(user);
        return isPracticed;
    }

    public boolean toggleRevisionQuestion(Long userId, String questionId) {
        User user = getUserById(userId);
        List<String> list = user.getRevisionQuestionIds();
        if (list == null) {
            list = new ArrayList<>();
        }
        boolean isRevision;
        if (list.contains(questionId)) {
            list.remove(questionId);
            isRevision = false;
        } else {
            list.add(questionId);
            isRevision = true;
        }
        user.setRevisionQuestionIds(list);
        userRepository.save(user);
        return isRevision;
    }

    public boolean toggleSavedCompany(Long userId, String companyId) {
        User user = getUserById(userId);
        List<String> list = user.getSavedCompanyIds();
        if (list == null) {
            list = new ArrayList<>();
        }
        boolean isSaved;
        if (list.contains(companyId)) {
            list.remove(companyId);
            isSaved = false;
        } else {
            list.add(companyId);
            isSaved = true;
        }
        user.setSavedCompanyIds(list);
        userRepository.save(user);
        return isSaved;
    }

    public Map<String, Object> getDashboardData(Long userId) {
        User user = getUserById(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("savedCount", user.getSavedQuestionIds() != null ? user.getSavedQuestionIds().size() : 0);
        data.put("practicedCount", user.getPracticedQuestionIds() != null ? user.getPracticedQuestionIds().size() : 0);
        data.put("revisionCount", user.getRevisionQuestionIds() != null ? user.getRevisionQuestionIds().size() : 0);
        data.put("savedCompaniesCount", user.getSavedCompanyIds() != null ? user.getSavedCompanyIds().size() : 0);
        data.put("user", user);
        return data;
    }

    public List<User> getAllUsers(String role, String search) {
        List<User> all = userRepository.findAll();
        return all.stream()
                .filter(u -> role == null || role.trim().isEmpty() || role.equalsIgnoreCase(u.getRole()))
                .filter(u -> search == null || search.trim().isEmpty() ||
                        (u.getName() != null && u.getName().toLowerCase().contains(search.toLowerCase())) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(search.toLowerCase())) ||
                        (u.getRollNumber() != null && u.getRollNumber().toLowerCase().contains(search.toLowerCase())))
                .toList();
    }

    public User updateUserRole(Long userId, String newRole) {
        User user = getUserById(userId);
        if (newRole == null || newRole.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }
        user.setRole(newRole.trim().toLowerCase());
        return userRepository.save(user);
    }

    public User updateUserStatus(Long userId, String newStatus) {
        User user = getUserById(userId);
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }
        user.setStatus(newStatus.trim().toUpperCase());
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    public String generatePasswordResetToken(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("No user found with email: " + email));
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(java.time.LocalDateTime.now().plusHours(2).toString());
        userRepository.save(user);
        return token;
    }

    public boolean resetPassword(String token, String newPassword) {
        if (token == null || newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Token and new password are required");
        }
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (token.equals(u.getResetPasswordToken())) {
                u.setPassword(newPassword.trim());
                u.setResetPasswordToken(null);
                u.setResetPasswordExpiry(null);
                userRepository.save(u);
                return true;
            }
        }
        throw new IllegalArgumentException("Invalid or expired password reset token");
    }

    public User getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
    }

    public String getUserFullProfile(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Register an account before using a profile."));
        return user.getFullProfileJson();
    }

    public User saveUserFullProfile(String email, String profileJson, Map<String, Object> basicFields) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Register an account before using a profile."));
        user.setFullProfileJson(profileJson);
        if (basicFields != null) {
            if (basicFields.get("name") != null && !String.valueOf(basicFields.get("name")).trim().isEmpty()) {
                user.setName(String.valueOf(basicFields.get("name")).trim());
            }
            if (basicFields.get("phone") != null) {
                user.setPhone(String.valueOf(basicFields.get("phone")).trim());
            }
            if (basicFields.get("college") != null) {
                user.setCollege(String.valueOf(basicFields.get("college")).trim());
            }
            if (basicFields.get("branch") != null) {
                user.setBranch(String.valueOf(basicFields.get("branch")).trim());
            }
            if (basicFields.get("rollNumber") != null) {
                user.setRollNumber(String.valueOf(basicFields.get("rollNumber")).trim());
            }
            if (basicFields.get("graduationBatch") != null) {
                user.setGraduationBatch(String.valueOf(basicFields.get("graduationBatch")).trim());
            }
        }
        return userRepository.save(user);
    }

    public User saveOnboardingStep(String email, Integer step, Map<String, Object> stepData, boolean isCompleted) {
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + cleanEmail));

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> profile;
        try {
            if (user.getFullProfileJson() != null && !user.getFullProfileJson().trim().isEmpty()) {
                profile = mapper.readValue(user.getFullProfileJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            } else {
                profile = new HashMap<>();
            }
        } catch (Exception e) {
            profile = new HashMap<>();
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> basicDetails = (Map<String, Object>) profile.computeIfAbsent("basicDetails", k -> new HashMap<String, Object>());
        @SuppressWarnings("unchecked")
        Map<String, Object> educationDetails = (Map<String, Object>) profile.computeIfAbsent("educationDetails", k -> new HashMap<String, Object>());
        @SuppressWarnings("unchecked")
        Map<String, Object> documents = (Map<String, Object>) profile.computeIfAbsent("documents", k -> new HashMap<String, Object>());

        if (step == 1) {
            String option = String.valueOf(stepData.getOrDefault("option", "apply_job"));
            profile.put("onboardingOption", option);
            if (stepData.containsKey("passphrase")) {
                String pass = String.valueOf(stepData.get("passphrase")).trim();
                user.setPassphrase(pass);
                user.setPassphraseVerified(Boolean.parseBoolean(String.valueOf(stepData.getOrDefault("passphraseVerified", false))));
            }
        } else if (step == 2) {
            if (stepData.get("mobileNumber") != null) {
                user.setPhone(String.valueOf(stepData.get("mobileNumber")).trim());
                basicDetails.put("phone", user.getPhone());
            }
            if (stepData.get("alternateMobileNumber") != null) {
                user.setAlternatePhone(String.valueOf(stepData.get("alternateMobileNumber")).trim());
                basicDetails.put("alternatePhone", user.getAlternatePhone());
            }
            if (stepData.get("personalEmail") != null) {
                user.setPersonalEmail(String.valueOf(stepData.get("personalEmail")).trim());
                basicDetails.put("personalEmail", user.getPersonalEmail());
            }
            if (stepData.get("currentAddress") != null) {
                user.setCurrentAddress(String.valueOf(stepData.get("currentAddress")).trim());
                basicDetails.put("currentAddress", user.getCurrentAddress());
            }
            if (stepData.get("city") != null) {
                user.setCity(String.valueOf(stepData.get("city")).trim());
                basicDetails.put("city", user.getCity());
            }
            if (stepData.get("state") != null) {
                user.setState(String.valueOf(stepData.get("state")).trim());
                basicDetails.put("state", user.getState());
            }
            if (stepData.get("pincode") != null) {
                user.setPincode(String.valueOf(stepData.get("pincode")).trim());
                basicDetails.put("pincode", user.getPincode());
            }
        } else if (step == 3) {
            if (stepData.get("college") != null) {
                user.setCollege(String.valueOf(stepData.get("college")).trim());
                educationDetails.put("college", user.getCollege());
            }
            if (stepData.get("degree") != null) {
                user.setDegree(String.valueOf(stepData.get("degree")).trim());
                educationDetails.put("degree", user.getDegree());
            }
            if (stepData.get("branch") != null) {
                user.setBranch(String.valueOf(stepData.get("branch")).trim());
                educationDetails.put("branch", user.getBranch());
            }
            if (stepData.get("currentSemester") != null) {
                user.setCurrentSemester(String.valueOf(stepData.get("currentSemester")).trim());
                educationDetails.put("currentSemester", user.getCurrentSemester());
            }
            if (stepData.get("rollNumber") != null) {
                user.setRollNumber(String.valueOf(stepData.get("rollNumber")).trim());
                educationDetails.put("rollNumber", user.getRollNumber());
            }
            if (stepData.get("enrollmentNumber") != null) {
                user.setEnrollmentNumber(String.valueOf(stepData.get("enrollmentNumber")).trim());
                educationDetails.put("enrollmentNumber", user.getEnrollmentNumber());
            }
            if (stepData.get("cgpa") != null && !String.valueOf(stepData.get("cgpa")).trim().isEmpty()) {
                try {
                    user.setCgpa(Double.parseDouble(String.valueOf(stepData.get("cgpa")).trim()));
                    educationDetails.put("cgpa", user.getCgpa());
                } catch (Exception ignored) {}
            }
            if (stepData.get("educationStartYear") != null && !String.valueOf(stepData.get("educationStartYear")).trim().isEmpty()) {
                try {
                    user.setEducationStartYear(Integer.parseInt(String.valueOf(stepData.get("educationStartYear")).trim()));
                    educationDetails.put("educationStartYear", user.getEducationStartYear());
                } catch (Exception ignored) {}
            }
            if (stepData.get("expectedGraduationYear") != null && !String.valueOf(stepData.get("expectedGraduationYear")).trim().isEmpty()) {
                try {
                    user.setExpectedGraduationYear(Integer.parseInt(String.valueOf(stepData.get("expectedGraduationYear")).trim()));
                    educationDetails.put("expectedGraduationYear", user.getExpectedGraduationYear());
                } catch (Exception ignored) {}
            }
            if (stepData.get("graduationBatch") != null) {
                user.setGraduationBatch(String.valueOf(stepData.get("graduationBatch")).trim());
                educationDetails.put("graduationBatch", user.getGraduationBatch());
            }
        } else if (step == 4) {
            if (stepData.get("tenthSchool") != null) {
                user.setTenthSchool(String.valueOf(stepData.get("tenthSchool")).trim());
                educationDetails.put("tenthSchool", user.getTenthSchool());
            }
            if (stepData.get("tenthBoard") != null) {
                user.setTenthBoard(String.valueOf(stepData.get("tenthBoard")).trim());
                educationDetails.put("tenthBoard", user.getTenthBoard());
            }
            if (stepData.get("tenthYear") != null) {
                user.setTenthYear(String.valueOf(stepData.get("tenthYear")).trim());
                educationDetails.put("tenthYear", user.getTenthYear());
            }
            if (stepData.get("tenthPercentage") != null && !String.valueOf(stepData.get("tenthPercentage")).trim().isEmpty()) {
                try {
                    user.setTenthPercentage(Double.parseDouble(String.valueOf(stepData.get("tenthPercentage")).trim()));
                    educationDetails.put("tenthPercentage", user.getTenthPercentage());
                } catch (Exception ignored) {}
            }
            if (stepData.get("twelfthSchool") != null) {
                user.setTwelfthSchool(String.valueOf(stepData.get("twelfthSchool")).trim());
                educationDetails.put("twelfthSchool", user.getTwelfthSchool());
            }
            if (stepData.get("twelfthBoard") != null) {
                user.setTwelfthBoard(String.valueOf(stepData.get("twelfthBoard")).trim());
                educationDetails.put("twelfthBoard", user.getTwelfthBoard());
            }
            if (stepData.get("twelfthStream") != null) {
                user.setTwelfthStream(String.valueOf(stepData.get("twelfthStream")).trim());
                educationDetails.put("twelfthStream", user.getTwelfthStream());
            }
            if (stepData.get("twelfthYear") != null) {
                user.setTwelfthYear(String.valueOf(stepData.get("twelfthYear")).trim());
                educationDetails.put("twelfthYear", user.getTwelfthYear());
            }
            if (stepData.get("twelfthPercentage") != null && !String.valueOf(stepData.get("twelfthPercentage")).trim().isEmpty()) {
                try {
                    user.setTwelfthPercentage(Double.parseDouble(String.valueOf(stepData.get("twelfthPercentage")).trim()));
                    educationDetails.put("twelfthPercentage", user.getTwelfthPercentage());
                } catch (Exception ignored) {}
            }
        } else if (step == 5) {
            Object experiences = stepData.get("experiences");
            profile.put("workExperiences", experiences != null ? experiences : new ArrayList<>());
            profile.put("hasNoExperience", Boolean.parseBoolean(String.valueOf(stepData.getOrDefault("hasNoExperience", false))));
        } else if (step == 6) {
            if (stepData.get("profilePhotoUrl") != null) {
                user.setProfilePhotoUrl(String.valueOf(stepData.get("profilePhotoUrl")));
                documents.put("profilePhotoUrl", user.getProfilePhotoUrl());
            }
            if (stepData.get("resumeUrl") != null) {
                user.setResumeUrl(String.valueOf(stepData.get("resumeUrl")));
                documents.put("resumeUrl", user.getResumeUrl());
            }
            if (stepData.get("documents") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> docsMap = (Map<String, Object>) stepData.get("documents");
                documents.putAll(docsMap);
            }
        }

        if (isCompleted || step >= 7) {
            user.setOnboardingCompleted(true);
            user.setOnboardingStatus("COMPLETED");
            user.setCurrentOnboardingStep(7);
            profile.put("onboardingCompleted", true);
            profile.put("onboardingCompletedAt", java.time.LocalDateTime.now().toString());
        } else {
            int nextStep = Math.max(user.getCurrentOnboardingStep() != null ? user.getCurrentOnboardingStep() : 1, step + 1);
            user.setCurrentOnboardingStep(nextStep);
            user.setOnboardingStatus("IN_PROGRESS");
        }

        try {
            user.setFullProfileJson(mapper.writeValueAsString(profile));
        } catch (Exception ignored) {}

        return userRepository.save(user);
    }

    public void attachUserDocument(String email, String documentType, String fileName, String fileUrl, String previewUrl) {
        String cleanEmail = email.trim().toLowerCase();
        userRepository.findByEmail(cleanEmail).ifPresent(user -> {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            try {
                Map<String, Object> profile;
                if (user.getFullProfileJson() != null && !user.getFullProfileJson().trim().isEmpty()) {
                    profile = mapper.readValue(user.getFullProfileJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                } else {
                    profile = new HashMap<>();
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> documents = (Map<String, Object>) profile.computeIfAbsent("documents", k -> new HashMap<String, Object>());
                Map<String, Object> docMeta = new HashMap<>();
                docMeta.put("fileName", fileName);
                docMeta.put("fileUrl", fileUrl);
                if (previewUrl != null) docMeta.put("previewUrl", previewUrl);
                docMeta.put("uploadedAt", java.time.LocalDateTime.now().toString());

                documents.put(documentType, docMeta);

                if ("profilePhoto".equalsIgnoreCase(documentType)) {
                    user.setProfilePhotoUrl(previewUrl != null ? previewUrl : fileUrl);
                } else if ("resume".equalsIgnoreCase(documentType)) {
                    user.setResumeUrl(fileUrl);
                    documents.put("resumeFileName", fileName);
                    documents.put("resumeLastUpdated", java.time.LocalDateTime.now().toString());
                }

                user.setFullProfileJson(mapper.writeValueAsString(profile));
                userRepository.save(user);
            } catch (Exception ignored) {}
        });
    }

}
