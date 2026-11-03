package com.placeprep.service.timetable;

import com.placeprep.model.User;
import com.placeprep.model.timetable.FacultyProfile;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Resolves and normalizes academic departments across users, branches, and faculty profiles.
 * Disallows guessing: if department cannot be resolved, access is denied.
 */
@Component
@RequiredArgsConstructor
public class DepartmentResolver {

    private final FacultyProfileRepository facultyProfileRepository;

    private static final Map<String, String> ALIAS_MAP = new HashMap<>();

    static {
        // AI & DS aliases
        register("AI&DS", "AI&DS", "AIDS", "AI-DS", "AI & DS", "ARTIFICIAL INTELLIGENCE & DATA SCIENCE",
                "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", "ARTIFICIAL INTELLIGENCE DATA SCIENCE");

        // CSE aliases
        register("CSE", "CSE", "CS", "COMPUTER SCIENCE", "COMPUTER SCIENCE & ENGINEERING",
                "COMPUTER SCIENCE AND ENGINEERING", "COMPUTER SCIENCE ENGINEERING");

        // IT aliases
        register("IT", "IT", "INFORMATION TECHNOLOGY");

        // ECE aliases
        register("ECE", "ECE", "EC", "ELECTRONICS & COMMUNICATION", "ELECTRONICS AND COMMUNICATION",
                "ELECTRONICS & COMMUNICATION ENGINEERING", "ELECTRONICS AND COMMUNICATION ENGINEERING");

        // ME aliases
        register("ME", "ME", "MECHANICAL", "MECHANICAL ENGINEERING");

        // EE aliases
        register("EE", "EE", "ELECTRICAL", "ELECTRICAL ENGINEERING");

        // CIVIL aliases
        register("CIVIL", "CIVIL", "CE", "CIVIL ENGINEERING");
    }

    private static void register(String canonical, String... aliases) {
        for (String alias : aliases) {
            ALIAS_MAP.put(normalize(alias), canonical);
        }
    }

    public static String normalize(String s) {
        if (s == null) return "";
        return s.toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    public Optional<String> canonicalize(String raw) {
        if (raw == null || raw.isBlank()) return Optional.empty();
        String norm = normalize(raw);
        if (ALIAS_MAP.containsKey(norm)) {
            return Optional.of(ALIAS_MAP.get(norm));
        }
        String trimmed = raw.trim().toUpperCase();
        if (!trimmed.isEmpty()) {
            return Optional.of(trimmed);
        }
        return Optional.empty();
    }

    public boolean matches(String deptA, String deptB) {
        if (deptA == null || deptB == null) return false;
        Optional<String> cA = canonicalize(deptA);
        Optional<String> cB = canonicalize(deptB);
        if (cA.isPresent() && cB.isPresent()) {
            return cA.get().equalsIgnoreCase(cB.get());
        }
        return deptA.trim().equalsIgnoreCase(deptB.trim());
    }

    public Optional<String> resolveUserDepartment(User user) {
        if (user == null) return Optional.empty();

        // 1. Check linked FacultyProfile if present
        if (user.getId() != null) {
            Optional<FacultyProfile> fp = facultyProfileRepository.findByUserId(user.getId());
            if (fp.isPresent() && fp.get().getDepartmentCode() != null && !fp.get().getDepartmentCode().isBlank()) {
                return canonicalize(fp.get().getDepartmentCode());
            }
        }

        // 2. Check user.branch
        if (user.getBranch() != null && !user.getBranch().isBlank()) {
            return canonicalize(user.getBranch());
        }

        return Optional.empty();
    }

    public String resolveUserDepartmentOrThrow(User user) {
        return resolveUserDepartment(user)
                .orElseThrow(() -> new AccessDeniedException("User department could not be resolved. Access denied."));
    }
}

