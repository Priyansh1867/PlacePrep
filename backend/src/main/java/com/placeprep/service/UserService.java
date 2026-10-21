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
