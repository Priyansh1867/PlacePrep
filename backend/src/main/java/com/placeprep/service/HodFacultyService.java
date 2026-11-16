package com.placeprep.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.dto.hod.FacultyBulkImportResponseDto;
import com.placeprep.dto.hod.FacultyRegistrationDto;
import com.placeprep.model.User;
import com.placeprep.model.timetable.FacultyProfile;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import com.placeprep.service.timetable.DepartmentResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HodFacultyService {

    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentResolver departmentResolver;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Resolves the authoritative department for an HOD or Admin caller.
     * HODs are strictly constrained to their own department.
     */
    public String resolveDepartmentForCaller(User caller, String requestedDepartment) {
        if (caller == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        String role = caller.getRole() != null ? caller.getRole().toUpperCase() : "STUDENT";

        if ("ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) {
            if (requestedDepartment != null && !requestedDepartment.isBlank()) {
                return departmentResolver.canonicalize(requestedDepartment).orElse(requestedDepartment.trim());
            }
            return departmentResolver.resolveUserDepartment(caller).orElse("CSE");
        }

        if ("HOD".equalsIgnoreCase(role)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(caller);
            if (requestedDepartment != null && !requestedDepartment.isBlank()
                    && !departmentResolver.matches(requestedDepartment, hodDept)) {
                throw new AccessDeniedException(String.format(
                        "Department restriction violation: HOD of department '%s' cannot manage faculty in department '%s'.",
                        hodDept, requestedDepartment));
            }
            return hodDept;
        }

        throw new AccessDeniedException("Only HOD and Admin roles are authorized for faculty registration and management.");
    }

    /**
     * Register a new faculty member strictly in the HOD's department.
     */
    @Transactional
    public FacultyRegistrationDto registerFaculty(FacultyRegistrationDto dto, User caller) {
        if (dto == null) {
            throw new IllegalArgumentException("Faculty registration payload cannot be empty.");
        }

        String targetDepartment = resolveDepartmentForCaller(caller, dto.getDepartment());

        // 1. Validate required fields
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Official email address is required.");
        }
        if (dto.getFacultyId() == null || dto.getFacultyId().trim().isEmpty()) {
            throw new IllegalArgumentException("Faculty ID / Employee ID is required.");
        }

        String cleanName = dto.getName().trim();
        String cleanEmail = dto.getEmail().trim().toLowerCase();
        String cleanFacultyId = dto.getFacultyId().trim().toUpperCase();

        // 2. Validate email uniqueness
        if (userRepository.findByEmail(cleanEmail).isPresent()
                || facultyProfileRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("Email address is already registered in the university system: " + cleanEmail);
        }

        // 3. Validate Faculty ID uniqueness
        if (userRepository.findByRollNumber(cleanFacultyId).isPresent()) {
            throw new IllegalArgumentException("Faculty ID / Employee ID already exists: " + cleanFacultyId);
        }

        String status = (dto.getStatus() != null && !dto.getStatus().isBlank())
                ? dto.getStatus().trim().toUpperCase() : "ACTIVE";
        String designation = (dto.getDesignation() != null && !dto.getDesignation().isBlank())
                ? dto.getDesignation().trim() : "Assistant Professor";
        String specialization = dto.getSpecialization() != null ? dto.getSpecialization().trim() : "";
        String qualification = dto.getQualification() != null ? dto.getQualification().trim() : "";
        String joiningDate = dto.getJoiningDate() != null ? dto.getJoiningDate().trim() : "";
        String phone = dto.getPhone() != null ? dto.getPhone().trim() : "";

        // 4. Create User entity
        User user = new User();
        user.setName(cleanName);
        user.setEmail(cleanEmail);
        user.setRole("faculty");
        user.setRollNumber(cleanFacultyId);
        user.setBranch(targetDepartment);
        user.setPhone(phone);
        user.setStatus(status);
        user.setCollege(caller.getCollege() != null ? caller.getCollege() : "Engineering Campus");
        user.setOnboardingCompleted(true);
        String defaultPassword = "Faculty@" + cleanFacultyId;
        user.setPassword(passwordEncoder != null ? passwordEncoder.encode(defaultPassword) : defaultPassword);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("facultyId", cleanFacultyId);
        meta.put("department", targetDepartment);
        meta.put("designation", designation);
        meta.put("specialization", specialization);
        meta.put("qualification", qualification);
        meta.put("joiningDate", joiningDate);
        meta.put("accountStatus", status);
        meta.put("phone", phone);
        try {
            user.setFullProfileJson(objectMapper.writeValueAsString(meta));
        } catch (Exception e) {
            log.warn("Failed to serialize faculty profile JSON: {}", e.getMessage());
        }

        User savedUser = userRepository.save(user);

        // 5. Create or sync FacultyProfile entity
        FacultyProfile fp = facultyProfileRepository.findByEmailIgnoreCase(cleanEmail).orElseGet(FacultyProfile::new);
        fp.setFullName(cleanName);
        fp.setEmail(cleanEmail);
        fp.setDepartmentCode(targetDepartment);
        fp.setUser(savedUser);
        fp.setActive(!"INACTIVE".equalsIgnoreCase(status));
        fp.setShortCode(generateShortCode(cleanName, targetDepartment, cleanFacultyId));
        FacultyProfile savedFp = facultyProfileRepository.save(fp);

        log.info("[HodFacultyService] Registered faculty '{}' ({}) in department '{}' by HOD/Admin '{}'",
                cleanName, cleanFacultyId, targetDepartment, caller.getEmail());

        return mapToDto(savedUser, savedFp, targetDepartment, designation, specialization, qualification, joiningDate, status, phone);
    }

    /**
     * Bulk imports a batch of faculty records for the HOD's department.
     */
    @Transactional
    public FacultyBulkImportResponseDto bulkImportFaculty(List<FacultyRegistrationDto> dtoList, User caller) {
        String targetDepartment = resolveDepartmentForCaller(caller, null);

        FacultyBulkImportResponseDto response = FacultyBulkImportResponseDto.builder()
                .totalProcessed(dtoList != null ? dtoList.size() : 0)
                .build();

        if (dtoList == null || dtoList.isEmpty()) {
            return response;
        }

        Set<String> seenEmailsInBatch = new HashSet<>();
        Set<String> seenIdsInBatch = new HashSet<>();

        for (int i = 0; i < dtoList.size(); i++) {
            FacultyRegistrationDto item = dtoList.get(i);
            int rowNum = i + 1;

            if (item == null) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("reason", "Empty row data");
                response.getFailed().add(err);
                continue;
            }

            String name = item.getName() != null ? item.getName().trim() : "";
            String email = item.getEmail() != null ? item.getEmail().trim().toLowerCase() : "";
            String facultyId = item.getFacultyId() != null ? item.getFacultyId().trim().toUpperCase() : "";

            if (name.isEmpty() || email.isEmpty() || facultyId.isEmpty()) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("email", email);
                err.put("facultyId", facultyId);
                err.put("reason", "Missing required fields: Name, Email, and Faculty ID are mandatory.");
                response.getFailed().add(err);
                continue;
            }

            // In-batch duplicate checks
            if (seenEmailsInBatch.contains(email)) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("email", email);
                err.put("reason", "Duplicate email within upload file: " + email);
                response.getFailed().add(err);
                continue;
            }
            if (seenIdsInBatch.contains(facultyId)) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("facultyId", facultyId);
                err.put("reason", "Duplicate Faculty ID within upload file: " + facultyId);
                response.getFailed().add(err);
                continue;
            }

            // Database duplicate checks
            if (userRepository.findByEmail(email).isPresent() || facultyProfileRepository.findByEmailIgnoreCase(email).isPresent()) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("email", email);
                err.put("reason", "Email already registered in system: " + email);
                response.getFailed().add(err);
                continue;
            }
            if (userRepository.findByRollNumber(facultyId).isPresent()) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("facultyId", facultyId);
                err.put("reason", "Faculty ID already exists in system: " + facultyId);
                response.getFailed().add(err);
                continue;
            }

            seenEmailsInBatch.add(email);
            seenIdsInBatch.add(facultyId);

            try {
                // Ensure department is forced to HOD's department
                item.setDepartment(targetDepartment);
                FacultyRegistrationDto saved = registerFaculty(item, caller);
                response.getSuccessful().add(saved);
            } catch (Exception e) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("row", rowNum);
                err.put("email", email);
                err.put("facultyId", facultyId);
                err.put("reason", e.getMessage());
                response.getFailed().add(err);
            }
        }

        response.setSuccessCount(response.getSuccessful().size());
        response.setFailureCount(response.getFailed().size());
        return response;
    }

    /**
     * Lists all faculty strictly belonging to the caller's department.
     */
    @Transactional(readOnly = true)
    public List<FacultyRegistrationDto> getDepartmentFaculty(User caller, String search, String designation, String status) {
        String targetDepartment = resolveDepartmentForCaller(caller, null);

        // 1. Fetch from FacultyProfile
        List<FacultyProfile> profiles = facultyProfileRepository.findByDepartmentCode(targetDepartment);
        Map<Long, FacultyProfile> profileByUserId = new HashMap<>();
        Map<String, FacultyProfile> profileByEmail = new HashMap<>();
        for (FacultyProfile p : profiles) {
            if (p.getUser() != null) profileByUserId.put(p.getUser().getId(), p);
            if (p.getEmail() != null) profileByEmail.put(p.getEmail().toLowerCase(), p);
        }

        // 2. Fetch User records matching department and faculty role
        List<User> users = userRepository.findAll().stream()
                .filter(u -> ("faculty".equalsIgnoreCase(u.getRole()) || "teacher".equalsIgnoreCase(u.getRole())))
                .filter(u -> departmentResolver.matches(targetDepartment, u.getBranch()))
                .collect(Collectors.toList());

        Map<Long, FacultyRegistrationDto> resultMap = new LinkedHashMap<>();

        // Add users
        for (User u : users) {
            FacultyProfile fp = profileByUserId.get(u.getId());
            if (fp == null && u.getEmail() != null) fp = profileByEmail.get(u.getEmail().toLowerCase());

            Map<String, Object> meta = parseProfileJson(u.getFullProfileJson());
            String desig = (String) meta.getOrDefault("designation", "Faculty Member");
            String spec = (String) meta.getOrDefault("specialization", "");
            String qual = (String) meta.getOrDefault("qualification", "");
            String joinDate = (String) meta.getOrDefault("joiningDate", "");
            String stat = u.getStatus() != null ? u.getStatus() : "ACTIVE";
            String ph = u.getPhone() != null ? u.getPhone() : (String) meta.getOrDefault("phone", "");

            FacultyRegistrationDto dto = mapToDto(u, fp, targetDepartment, desig, spec, qual, joinDate, stat, ph);
            resultMap.put(u.getId(), dto);
        }

        // Add any faculty profile without an explicit user record
        for (FacultyProfile fp : profiles) {
            if (fp.getUser() == null && fp.getEmail() != null) {
                Long virtualId = -fp.getId();
                FacultyRegistrationDto dto = FacultyRegistrationDto.builder()
                        .id(virtualId)
                        .name(fp.getFullName())
                        .email(fp.getEmail())
                        .facultyId("FAC-" + targetDepartment + "-" + fp.getId())
                        .department(targetDepartment)
                        .designation("Faculty Member")
                        .status(Boolean.TRUE.equals(fp.getActive()) ? "ACTIVE" : "INACTIVE")
                        .shortCode(fp.getShortCode())
                        .build();
                resultMap.putIfAbsent(virtualId, dto);
            }
        }

        List<FacultyRegistrationDto> list = new ArrayList<>(resultMap.values());

        // Apply filters
        String searchLower = search != null ? search.trim().toLowerCase() : "";
        String desigLower = designation != null ? designation.trim().toLowerCase() : "";
        String statusUpper = status != null ? status.trim().toUpperCase() : "";

        return list.stream()
                .filter(f -> {
                    if (searchLower.isEmpty()) return true;
                    return (f.getName() != null && f.getName().toLowerCase().contains(searchLower))
                            || (f.getEmail() != null && f.getEmail().toLowerCase().contains(searchLower))
                            || (f.getFacultyId() != null && f.getFacultyId().toLowerCase().contains(searchLower));
                })
                .filter(f -> {
                    if (desigLower.isEmpty() || "all".equals(desigLower)) return true;
                    return f.getDesignation() != null && f.getDesignation().toLowerCase().contains(desigLower);
                })
                .filter(f -> {
                    if (statusUpper.isEmpty() || "ALL".equals(statusUpper)) return true;
                    return statusUpper.equalsIgnoreCase(f.getStatus());
                })
                .sorted(Comparator.comparing(FacultyRegistrationDto::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    /**
     * Get single faculty details with strict department boundary enforcement.
     */
    @Transactional(readOnly = true)
    public FacultyRegistrationDto getFacultyById(Long id, User caller) {
        String targetDepartment = resolveDepartmentForCaller(caller, null);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member not found with ID: " + id));

        if (!departmentResolver.matches(targetDepartment, user.getBranch())) {
            throw new AccessDeniedException("Unauthorized: This faculty member belongs to another department.");
        }

        FacultyProfile fp = facultyProfileRepository.findByUserId(user.getId()).orElse(null);
        Map<String, Object> meta = parseProfileJson(user.getFullProfileJson());

        return mapToDto(
                user, fp, targetDepartment,
                (String) meta.getOrDefault("designation", "Faculty Member"),
                (String) meta.getOrDefault("specialization", ""),
                (String) meta.getOrDefault("qualification", ""),
                (String) meta.getOrDefault("joiningDate", ""),
                user.getStatus() != null ? user.getStatus() : "ACTIVE",
                user.getPhone()
        );
    }

    /**
     * Update permitted faculty member info with department boundary enforcement.
     */
    @Transactional
    public FacultyRegistrationDto updateFaculty(Long id, FacultyRegistrationDto updates, User caller) {
        String targetDepartment = resolveDepartmentForCaller(caller, null);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member not found with ID: " + id));

        if (!departmentResolver.matches(targetDepartment, user.getBranch())) {
            throw new AccessDeniedException("Unauthorized: Cannot modify faculty from another department.");
        }

        if (updates.getName() != null && !updates.getName().isBlank()) {
            user.setName(updates.getName().trim());
        }
        if (updates.getPhone() != null) {
            user.setPhone(updates.getPhone().trim());
        }
        if (updates.getStatus() != null && !updates.getStatus().isBlank()) {
            user.setStatus(updates.getStatus().trim().toUpperCase());
        }

        Map<String, Object> meta = parseProfileJson(user.getFullProfileJson());
        if (updates.getDesignation() != null) meta.put("designation", updates.getDesignation().trim());
        if (updates.getSpecialization() != null) meta.put("specialization", updates.getSpecialization().trim());
        if (updates.getQualification() != null) meta.put("qualification", updates.getQualification().trim());
        if (updates.getJoiningDate() != null) meta.put("joiningDate", updates.getJoiningDate().trim());
        meta.put("accountStatus", user.getStatus());

        try {
            user.setFullProfileJson(objectMapper.writeValueAsString(meta));
        } catch (Exception e) {
            log.warn("Failed to serialize updated metadata: {}", e.getMessage());
        }

        User savedUser = userRepository.save(user);

        // Update FacultyProfile sync
        FacultyProfile fp = facultyProfileRepository.findByUserId(user.getId()).orElse(null);
        if (fp != null) {
            if (updates.getName() != null) fp.setFullName(updates.getName().trim());
            if (updates.getStatus() != null) fp.setActive(!"INACTIVE".equalsIgnoreCase(updates.getStatus()));
            facultyProfileRepository.save(fp);
        }

        return mapToDto(
                savedUser, fp, targetDepartment,
                (String) meta.getOrDefault("designation", "Faculty Member"),
                (String) meta.getOrDefault("specialization", ""),
                (String) meta.getOrDefault("qualification", ""),
                (String) meta.getOrDefault("joiningDate", ""),
                savedUser.getStatus(),
                savedUser.getPhone()
        );
    }

    /**
     * Toggles faculty account status (ACTIVE / INACTIVE).
     */
    @Transactional
    public FacultyRegistrationDto updateFacultyStatus(Long id, String status, User caller) {
        String targetDepartment = resolveDepartmentForCaller(caller, null);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member not found with ID: " + id));

        if (!departmentResolver.matches(targetDepartment, user.getBranch())) {
            throw new AccessDeniedException("Unauthorized: Cannot modify status for faculty of another department.");
        }

        String newStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "ACTIVE";
        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        FacultyProfile fp = facultyProfileRepository.findByUserId(user.getId()).orElse(null);
        if (fp != null) {
            fp.setActive("ACTIVE".equalsIgnoreCase(newStatus));
            facultyProfileRepository.save(fp);
        }

        Map<String, Object> meta = parseProfileJson(savedUser.getFullProfileJson());
        return mapToDto(
                savedUser, fp, targetDepartment,
                (String) meta.getOrDefault("designation", "Faculty Member"),
                (String) meta.getOrDefault("specialization", ""),
                (String) meta.getOrDefault("qualification", ""),
                (String) meta.getOrDefault("joiningDate", ""),
                savedUser.getStatus(),
                savedUser.getPhone()
        );
    }

    private String generateShortCode(String fullName, String department, String facultyId) {
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty() && Character.isLetter(p.charAt(0))) {
                sb.append(Character.toUpperCase(p.charAt(0)));
            }
        }
        String base = sb.length() >= 2 ? sb.substring(0, Math.min(3, sb.length())) : "FAC";
        String candidate = base;
        int counter = 1;
        while (facultyProfileRepository.findByDepartmentCodeAndShortCode(department, candidate).isPresent()) {
            counter++;
            candidate = base + counter;
        }
        return candidate;
    }

    private Map<String, Object> parseProfileJson(String json) {
        if (json == null || json.trim().isEmpty()) return new LinkedHashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new LinkedHashMap<>();
        }
    }

    private FacultyRegistrationDto mapToDto(
            User user, FacultyProfile fp, String department,
            String designation, String specialization, String qualification,
            String joiningDate, String status, String phone
    ) {
        return FacultyRegistrationDto.builder()
                .id(user.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .facultyId(user.getRollNumber() != null ? user.getRollNumber() : "FAC-" + department + "-" + user.getId())
                .phone(phone)
                .department(department)
                .designation(designation)
                .specialization(specialization)
                .qualification(qualification)
                .joiningDate(joiningDate)
                .status(status != null ? status : "ACTIVE")
                .shortCode(fp != null ? fp.getShortCode() : null)
                .build();
    }
}
