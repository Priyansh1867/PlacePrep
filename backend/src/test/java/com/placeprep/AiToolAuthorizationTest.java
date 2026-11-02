package com.placeprep;

import com.placeprep.tools.AiToolAuthorization;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ToolContext;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AiToolAuthorizationTest {
    @Test
    void readsAuthenticatedUserIdFromToolContext() {
        ToolContext context = new ToolContext(Map.of("userId", 42L));

        assertEquals("42", AiToolAuthorization.userId(context));
    }

    @Test
    void rejectsMissingAuthenticatedUserId() {
        ToolContext context = new ToolContext(Map.of());

        assertThrows(IllegalStateException.class, () -> AiToolAuthorization.userId(context));
    }

    @Test
    void allowsTeachingStaffAndRejectsStudents() {
        assertDoesNotThrow(() -> AiToolAuthorization.requireStaff(context("TEACHER")));
        assertDoesNotThrow(() -> AiToolAuthorization.requireStaff(context("ADMIN")));
        assertThrows(SecurityException.class, () -> AiToolAuthorization.requireStaff(context("STUDENT")));
    }

    @Test
    void restrictsPlacementOperationsToPlacementStaff() {
        assertDoesNotThrow(() -> AiToolAuthorization.requirePlacementStaff(context("TPO")));
        assertDoesNotThrow(() -> AiToolAuthorization.requirePlacementStaff(context("HOD")));
        assertThrows(SecurityException.class, () -> AiToolAuthorization.requirePlacementStaff(context("FACULTY")));
    }

    @Test
    void restrictsAdministrativeOperationsToAdmins() {
        assertDoesNotThrow(() -> AiToolAuthorization.requireAdmin(context("ADMIN")));
        assertThrows(SecurityException.class, () -> AiToolAuthorization.requireAdmin(context("TPO")));
        assertThrows(SecurityException.class, () -> AiToolAuthorization.requireAdmin(context("STUDENT")));
    }

    private ToolContext context(String role) {
        return new ToolContext(Map.of("userId", 42L, "role", role));
    }
}
