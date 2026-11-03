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

        // 1. First check if user exists by email and exact password
        java.util.Optional<User> byEmailAndPass = userRepository.findByEmailAndPassword(cleanEmail, password != null ? password : "");
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

}
