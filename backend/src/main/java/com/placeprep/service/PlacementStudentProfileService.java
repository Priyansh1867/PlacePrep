package com.placeprep.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.model.PlacementStudentProfile;
import com.placeprep.model.User;
import com.placeprep.repository.PlacementStudentProfileRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PlacementStudentProfileService {

    @Autowired
    private PlacementStudentProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PlacementStudentProfileService() {
    }

    public PlacementStudentProfileService(PlacementStudentProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public Optional<PlacementStudentProfile> getByUserId(Long userId) {
        if (userId == null) return Optional.empty();
        return profileRepository.findByUserId(userId);
    }

    public Optional<PlacementStudentProfile> getByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return Optional.empty();
        return profileRepository.findByEmail(email.trim().toLowerCase());
    }

    public PlacementStudentProfile getOrCreateProfileForStudent(Long userId, String email, String name) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        Optional<PlacementStudentProfile> existing = Optional.empty();
        if (userId != null) {
            existing = profileRepository.findByUserId(userId);
        }
        if (existing.isEmpty() && !cleanEmail.isEmpty()) {
            existing = profileRepository.findByEmail(cleanEmail);
        }
        if (existing.isPresent()) {
            return existing.get();
        }

        PlacementStudentProfile newProfile = new PlacementStudentProfile();
        newProfile.setUserId(userId != null ? userId : 0L);
        newProfile.setEmail(cleanEmail);
        newProfile.setFullName(name != null ? name : "Student");
        newProfile.setPrimaryEmail(cleanEmail);
        newProfile.setPlacementStatus("PENDING_REGISTRATION");
        newProfile.setPlacementCycle("2026-2027");
        newProfile.setIsCompleted(false);
        newProfile.setCurrentStep(1);
        newProfile.setLastUpdatedAt(LocalDateTime.now().toString());

        return profileRepository.save(newProfile);
    }

    @Transactional
    public PlacementStudentProfile saveOrUpdatePlacementProfile(Long userId, String email, Map<String, Object> payload) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        if (cleanEmail.isEmpty() && userId == null) {
            throw new IllegalArgumentException("User ID or Email is required to persist Placement Profile.");
        }

        // Find existing or create new
        PlacementStudentProfile profile = null;
        if (userId != null) {
            profile = profileRepository.findByUserId(userId).orElse(null);
        }
        if (profile == null && !cleanEmail.isEmpty()) {
            profile = profileRepository.findByEmail(cleanEmail).orElse(null);
        }
        if (profile == null) {
            profile = new PlacementStudentProfile();
            profile.setUserId(userId != null ? userId : 0L);
            profile.setEmail(cleanEmail);
        }

        // If user id wasn't set or was 0, link with user repo
        if (profile.getUserId() == null || profile.getUserId() == 0L) {
            Optional<User> uOpt = userRepository.findByEmail(cleanEmail);
            if (uOpt.isPresent()) {
                profile.setUserId(uOpt.get().getId());
            }
        }

        // Map personal information
        if (payload.containsKey("fullName")) profile.setFullName(getString(payload, "fullName"));
        if (payload.containsKey("fatherName")) profile.setFatherName(getString(payload, "fatherName"));
        if (payload.containsKey("motherName")) profile.setMotherName(getString(payload, "motherName"));
        if (payload.containsKey("dateOfBirth")) profile.setDateOfBirth(getString(payload, "dateOfBirth"));
        if (payload.containsKey("gender")) profile.setGender(getString(payload, "gender"));
        if (payload.containsKey("registrationNumber")) profile.setRegistrationNumber(getString(payload, "registrationNumber"));
        if (payload.containsKey("university")) profile.setUniversity(getString(payload, "university"));
        if (payload.containsKey("college")) profile.setCollege(getString(payload, "college"));
        if (payload.containsKey("branch")) profile.setBranch(getString(payload, "branch"));
        if (payload.containsKey("currentYear")) profile.setCurrentYear(getString(payload, "currentYear"));
        if (payload.containsKey("currentSemester")) profile.setCurrentSemester(getString(payload, "currentSemester"));

        // Map contact information
        if (payload.containsKey("primaryEmail")) profile.setPrimaryEmail(getString(payload, "primaryEmail"));
        if (payload.containsKey("personalEmail")) profile.setPersonalEmail(getString(payload, "personalEmail"));
        if (payload.containsKey("mobileNumber")) profile.setMobileNumber(getString(payload, "mobileNumber"));
        if (payload.containsKey("emailVerified")) profile.setEmailVerified(getBoolean(payload, "emailVerified"));
        if (payload.containsKey("mobileVerified")) profile.setMobileVerified(getBoolean(payload, "mobileVerified"));
        if (payload.containsKey("permanentAddress")) profile.setPermanentAddress(getString(payload, "permanentAddress"));
        if (payload.containsKey("currentAddress")) profile.setCurrentAddress(getString(payload, "currentAddress"));

        // Current education
        if (payload.containsKey("degree")) profile.setDegree(getString(payload, "degree"));
        if (payload.containsKey("currentUniversity")) profile.setCurrentUniversity(getString(payload, "currentUniversity"));
        if (payload.containsKey("currentCollege")) profile.setCurrentCollege(getString(payload, "currentCollege"));
        if (payload.containsKey("currentBranch")) profile.setCurrentBranch(getString(payload, "currentBranch"));
        if (payload.containsKey("admissionYear")) profile.setAdmissionYear(getString(payload, "admissionYear"));
        if (payload.containsKey("graduationYear")) profile.setGraduationYear(getString(payload, "graduationYear"));
        if (payload.containsKey("cgpa")) profile.setCgpa(getDouble(payload, "cgpa"));
        if (payload.containsKey("backlogs")) profile.setBacklogs(getInt(payload, "backlogs"));

        // Previous education
        if (payload.containsKey("tenthSchool")) profile.setTenthSchool(getString(payload, "tenthSchool"));
        if (payload.containsKey("tenthBoard")) profile.setTenthBoard(getString(payload, "tenthBoard"));
        if (payload.containsKey("tenthPercentage")) profile.setTenthPercentage(getDouble(payload, "tenthPercentage"));
        if (payload.containsKey("tenthYear")) profile.setTenthYear(getString(payload, "tenthYear"));

        if (payload.containsKey("twelfthSchool")) profile.setTwelfthSchool(getString(payload, "twelfthSchool"));
        if (payload.containsKey("twelfthBoard")) profile.setTwelfthBoard(getString(payload, "twelfthBoard"));
        if (payload.containsKey("twelfthPercentage")) profile.setTwelfthPercentage(getDouble(payload, "twelfthPercentage"));
        if (payload.containsKey("twelfthYear")) profile.setTwelfthYear(getString(payload, "twelfthYear"));

        if (payload.containsKey("hasDiploma")) profile.setHasDiploma(getBoolean(payload, "hasDiploma"));
        if (payload.containsKey("diplomaInstitute")) profile.setDiplomaInstitute(getString(payload, "diplomaInstitute"));
        if (payload.containsKey("diplomaBranch")) profile.setDiplomaBranch(getString(payload, "diplomaBranch"));
        if (payload.containsKey("diplomaPercentage")) profile.setDiplomaPercentage(getDouble(payload, "diplomaPercentage"));
        if (payload.containsKey("diplomaYear")) profile.setDiplomaYear(getString(payload, "diplomaYear"));

        if (payload.containsKey("previousEducationJson")) {
            profile.setPreviousEducationJson(getString(payload, "previousEducationJson"));
        } else if (payload.containsKey("previousEducation")) {
            profile.setPreviousEducationJson(toJson(payload.get("previousEducation")));
        }

        // Internships
        if (payload.containsKey("internshipsJson")) {
            profile.setInternshipsJson(getString(payload, "internshipsJson"));
        } else if (payload.containsKey("internships")) {
            profile.setInternshipsJson(toJson(payload.get("internships")));
        }

        // Profile Photo & Documents
        if (payload.containsKey("profilePhoto")) profile.setProfilePhoto(getString(payload, "profilePhoto"));
        if (payload.containsKey("resumeFileName")) profile.setResumeFileName(getString(payload, "resumeFileName"));
        if (payload.containsKey("resumeUrl")) profile.setResumeUrl(getString(payload, "resumeUrl"));
        if (payload.containsKey("documentsJson")) {
            profile.setDocumentsJson(getString(payload, "documentsJson"));
        } else if (payload.containsKey("documents")) {
            profile.setDocumentsJson(toJson(payload.get("documents")));
        }

        // Placement details
        if (payload.containsKey("placementStatus")) profile.setPlacementStatus(getString(payload, "placementStatus"));
        if (payload.containsKey("placementCycle")) profile.setPlacementCycle(getString(payload, "placementCycle"));
        if (payload.containsKey("enrollmentDate")) profile.setEnrollmentDate(getString(payload, "enrollmentDate"));
        if (payload.containsKey("placementNotes")) profile.setPlacementNotes(getString(payload, "placementNotes"));
        if (payload.containsKey("declarationAgreed")) profile.setDeclarationAgreed(getBoolean(payload, "declarationAgreed"));

        // Completion & step
        if (payload.containsKey("isCompleted")) profile.setIsCompleted(getBoolean(payload, "isCompleted"));
        if (payload.containsKey("currentStep")) profile.setCurrentStep(getInt(payload, "currentStep"));
        profile.setLastUpdatedAt(LocalDateTime.now().toString());

        // Full payload serialized for bulletproof preservation
        profile.setFullDataJson(toJson(payload));

        PlacementStudentProfile saved = profileRepository.save(profile);

        // Keep User entity synchronized
        synchronizeUserEntity(cleanEmail, saved);

        return saved;
    }

    private void synchronizeUserEntity(String email, PlacementStudentProfile profile) {
        if (email == null || email.trim().isEmpty()) return;
        userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            if (profile.getFullName() != null && !profile.getFullName().trim().isEmpty()) {
                user.setName(profile.getFullName().trim());
            }
            if (profile.getMobileNumber() != null && !profile.getMobileNumber().trim().isEmpty()) {
                user.setPhone(profile.getMobileNumber().trim());
            }
            if (profile.getCollege() != null && !profile.getCollege().trim().isEmpty()) {
                user.setCollege(profile.getCollege().trim());
            }
            if (profile.getBranch() != null && !profile.getBranch().trim().isEmpty()) {
                user.setBranch(profile.getBranch().trim());
            }
            if (profile.getRegistrationNumber() != null && !profile.getRegistrationNumber().trim().isEmpty()) {
                user.setRollNumber(profile.getRegistrationNumber().trim());
            }
            if (profile.getGraduationYear() != null && !profile.getGraduationYear().trim().isEmpty()) {
                user.setGraduationBatch(profile.getGraduationYear().trim());
            }
            if (profile.getCgpa() != null) {
                user.setCgpa(profile.getCgpa());
            }
            if (profile.getTenthPercentage() != null) {
                user.setTenthPercentage(profile.getTenthPercentage());
            }
            if (profile.getTwelfthPercentage() != null) {
                user.setTwelfthPercentage(profile.getTwelfthPercentage());
            }
            if (profile.getBacklogs() != null) {
                user.setActiveBacklogs(profile.getBacklogs());
            }
            if (Boolean.TRUE.equals(profile.getIsCompleted())) {
                user.setOnboardingCompleted(true);
            }
            user.setFullProfileJson(profile.getFullDataJson());
            userRepository.save(user);
        });
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? String.valueOf(val).trim() : null;
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(val).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            return Integer.parseInt(String.valueOf(val).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private Boolean getBoolean(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return false;
        if (val instanceof Boolean) return (Boolean) val;
        return "true".equalsIgnoreCase(String.valueOf(val).trim());
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return String.valueOf(obj);
        }
    }
}
