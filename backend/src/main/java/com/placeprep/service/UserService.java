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
        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required");
        }
        String cleanEmail = email.trim().toLowerCase();
        return userRepository.findByEmailAndPassword(cleanEmail, password)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
    }

    public User demoLogin() {
        String demoEmail = "demo@placeprep.com";
        Optional<User> existing = userRepository.findByEmail(demoEmail);
        if (existing.isPresent()) {
            return existing.get();
        }
        User demoUser = new User();
        demoUser.setEmail(demoEmail);
        demoUser.setPassword("demo123");
        demoUser.setName("Demo Student");
        demoUser.setCollege("Demo University");
        demoUser.setBranch("CSE");
        demoUser.setGraduationBatch("2028");
        demoUser.setRole("student");
        demoUser.setOnboardingCompleted(true);
        demoUser.setSavedCompanyIds(new ArrayList<>());
        demoUser.setSavedQuestionIds(new ArrayList<>());
        demoUser.setPracticedQuestionIds(new ArrayList<>());
        demoUser.setRevisionQuestionIds(new ArrayList<>());
        return userRepository.save(demoUser);
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
}
