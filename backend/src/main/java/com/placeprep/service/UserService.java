package com.placeprep.service;

import com.placeprep.config.TokenService;
import com.placeprep.dto.AuthRequest;
import com.placeprep.dto.AuthResponse;
import com.placeprep.dto.RegisterRequest;
import com.placeprep.dto.UserDto;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    public UserService() {
    }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getGraduationBatch(),
                user.getRole(),
                user.isOnboardingCompleted(),
                user.getSavedCompanyIds() != null ? new ArrayList<>(user.getSavedCompanyIds()) : new ArrayList<>(),
                user.getSavedQuestionIds() != null ? new ArrayList<>(user.getSavedQuestionIds()) : new ArrayList<>(),
                user.getPracticedQuestionIds() != null ? new ArrayList<>(user.getPracticedQuestionIds()) : new ArrayList<>(),
                user.getRevisionQuestionIds() != null ? new ArrayList<>(user.getRevisionQuestionIds()) : new ArrayList<>()
        );
    }

    public AuthResponse register(RegisterRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("An account with email " + cleanEmail + " already exists");
        }

        User user = new User();
        user.setName(req.getName() != null ? req.getName().trim() : "Student");
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setCollege(req.getCollege() != null ? req.getCollege().trim() : "Engineering College");
        user.setBranch(req.getBranch() != null ? req.getBranch().trim() : "Computer Science");
        user.setGraduationBatch(req.getGraduationBatch() != null ? req.getGraduationBatch().trim() : "2028");
        user.setRole("student"); // Public registration is strictly restricted to student role
        user.setOnboardingCompleted(true);
        user.setSavedCompanyIds(new ArrayList<>());
        user.setSavedQuestionIds(new ArrayList<>());
        user.setPracticedQuestionIds(new ArrayList<>());
        user.setRevisionQuestionIds(new ArrayList<>());

        User saved = userRepository.save(user);
        String token = tokenService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
        return new AuthResponse(token, toDto(saved));
    }

    public AuthResponse login(AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, toDto(user));
    }

    public AuthResponse demoLogin(String requestedRole) {
        String role = (requestedRole != null && requestedRole.equalsIgnoreCase("admin")) ? "admin" : "student";
        String demoEmail = role.equals("admin") ? "admin@placeprep.com" : "student@placeprep.com";

        Optional<User> existing = userRepository.findByEmail(demoEmail);
        User user;
        if (existing.isPresent()) {
            user = existing.get();
        } else {
            user = new User();
            user.setEmail(demoEmail);
            user.setPassword(passwordEncoder.encode(role.equals("admin") ? "Admin@123" : "Student@123"));
            user.setName(role.equals("admin") ? "Placement Director (Admin)" : "Priyansh Jain");
            user.setCollege(role.equals("admin") ? "Training & Placement Office" : "Delhi Technological University (DTU)");
            user.setBranch("Computer Science and Engineering");
            user.setGraduationBatch("2028");
            user.setRole(role);
            user.setOnboardingCompleted(true);
            user.setSavedCompanyIds(new ArrayList<>(List.of("hcltech", "tcs")));
            user.setSavedQuestionIds(new ArrayList<>(List.of("hcl-tech-01", "tcs-tech-01")));
            user.setPracticedQuestionIds(new ArrayList<>(List.of("hcl-tech-02")));
            user.setRevisionQuestionIds(new ArrayList<>(List.of("hcl-mgr-01")));
            user = userRepository.save(user);
        }

        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, toDto(user));
    }

    public User getUserByEmail(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    public UserDto getUserDtoById(Long id) {
        return toDto(getUserById(id));
    }

    public UserDto updateBatch(Long userId, String batch) {
        User user = getUserById(userId);
        user.setGraduationBatch(batch);
        user.setOnboardingCompleted(true);
        return toDto(userRepository.save(user));
    }

    public List<String> getSavedQuestionIds(Long userId) {
        User user = getUserById(userId);
        return user.getSavedQuestionIds() != null ? user.getSavedQuestionIds() : new ArrayList<>();
    }

    public boolean toggleSavedQuestion(Long userId, String questionId) {
        User user = getUserById(userId);
        List<String> list = user.getSavedQuestionIds();
        if (list == null) list = new ArrayList<>();
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
        if (list == null) list = new ArrayList<>();
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
        if (list == null) list = new ArrayList<>();
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
        if (list == null) list = new ArrayList<>();
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
        data.put("user", toDto(user));
        return data;
    }
}
