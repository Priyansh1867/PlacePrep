package com.placeprep.tools;

import org.springframework.ai.chat.model.ToolContext;

import java.util.Map;
import java.util.Set;

public final class AiToolAuthorization {
    private AiToolAuthorization() {
    }

    public static String userId(ToolContext context) {
        Object value = context.getContext().get("userId");
        if (value == null) {
            throw new IllegalStateException("Authenticated user context is missing");
        }
        return String.valueOf(value);
    }

    public static Long parseUserId(ToolContext context) {
        Object val = context.getContext().get("userId");
        if (val instanceof Number n) {
            return n.longValue();
        }
        if (val instanceof String s && s.matches("\\d+")) {
            return Long.parseLong(s);
        }
        throw new IllegalStateException("Authenticated user identifier is missing or not numeric");
    }

    public static String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "STUDENT";
        }
        String clean = role.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        return clean;
    }

    public static String userRole(ToolContext context) {
        Object role = context.getContext().get("role");
        return normalizeRole(role != null ? String.valueOf(role) : null);
    }

    public static boolean isStaff(ToolContext context) {
        String role = userRole(context);
        return Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN", "DIRECTOR").contains(role);
    }

    public static boolean isPlacementStaff(ToolContext context) {
        String role = userRole(context);
        return Set.of("HOD", "TPO", "MANAGEMENT", "ADMIN", "DIRECTOR").contains(role);
    }

    public static boolean isAdmin(ToolContext context) {
        String role = userRole(context);
        return "ADMIN".equals(role);
    }

    public static boolean canManageOpportunities(ToolContext context) {
        String role = userRole(context);
        return Set.of("ADMIN", "DIRECTOR", "TPO").contains(role);
    }

    public static boolean canManageDrives(ToolContext context) {
        String role = userRole(context);
        return Set.of("ADMIN", "DIRECTOR", "TPO", "MANAGEMENT").contains(role);
    }

    public static boolean canManageCompanies(ToolContext context) {
        String role = userRole(context);
        return Set.of("ADMIN", "DIRECTOR", "TPO", "MANAGEMENT").contains(role);
    }

    public static boolean canBroadcastNotifications(ToolContext context) {
        String role = userRole(context);
        return Set.of("ADMIN", "DIRECTOR", "TPO", "MANAGEMENT").contains(role);
    }

    public static boolean canManageQuestions(ToolContext context) {
        String role = userRole(context);
        return Set.of("ADMIN", "DIRECTOR", "TPO", "FACULTY", "TEACHER", "HOD", "MANAGEMENT").contains(role);
    }

    public static Map<String, Object> accessDenied(String actionDescription, String requiredRoleDescription) {
        return Map.of(
                "accessDenied", true,
                "error", "ACCESS_DENIED",
                "message", String.format("🚫 Access Denied: You do not have permission to %s. This information or action is restricted to %s.",
                        actionDescription, requiredRoleDescription)
        );
    }

    public static void requireStaff(ToolContext context) {
        if (!isStaff(context)) {
            throw new SecurityException("This AI tool is restricted to authorized staff");
        }
    }

    public static void requirePlacementStaff(ToolContext context) {
        if (!isPlacementStaff(context)) {
            throw new SecurityException("This AI tool is restricted to placement staff");
        }
    }

    public static void requireAdmin(ToolContext context) {
        if (!isAdmin(context)) {
            throw new SecurityException("You do not have permission to perform this administrative action");
        }
    }
}
