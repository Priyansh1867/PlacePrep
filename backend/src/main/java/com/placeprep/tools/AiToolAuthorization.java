package com.placeprep.tools;

import org.springframework.ai.chat.model.ToolContext;

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

    public static void requireStaff(ToolContext context) {
        Object role = context.getContext().get("role");
        String normalizedRole = role == null ? "" : String.valueOf(role).toUpperCase();
        if (!Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN").contains(normalizedRole)) {
            throw new SecurityException("This AI tool is restricted to authorized staff");
        }
    }

    public static void requirePlacementStaff(ToolContext context) {
        Object role = context.getContext().get("role");
        String normalizedRole = role == null ? "" : String.valueOf(role).toUpperCase();
        if (!Set.of("HOD", "TPO", "MANAGEMENT", "ADMIN").contains(normalizedRole)) {
            throw new SecurityException("This AI tool is restricted to placement staff");
        }
    }

    public static void requireAdmin(ToolContext context) {
        Object role = context.getContext().get("role");
        if (!"ADMIN".equalsIgnoreCase(role == null ? "" : String.valueOf(role))) {
            throw new SecurityException("You do not have permission to perform this administrative action");
        }
    }
}
