package com.placeprep;

import com.placeprep.model.Company;
import com.placeprep.model.StudentApplication;
import com.placeprep.model.Feedback;
import com.placeprep.service.FeedbackService;
import com.placeprep.service.DriveService;
import com.placeprep.service.AttendanceService;
import com.placeprep.service.ApplicationService;
import com.placeprep.service.CompanyService;
import com.placeprep.tools.ApplicationWriteTool;
import com.placeprep.tools.CompanyWriteTool;
import com.placeprep.tools.StaffApplicationTool;
import com.placeprep.tools.DriveWriteTool;
import com.placeprep.tools.FeedbackWriteTool;
import com.placeprep.tools.AttendanceWriteTool;
import org.springframework.ai.support.ToolCallbacks;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ToolContext;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class AiWriteToolTest {
    @Test
    void studentApplicationUsesAuthenticatedUserInsteadOfModelSuppliedStudentId() {
        ApplicationService applicationService = mock(ApplicationService.class);
        ApplicationWriteTool tool = new ApplicationWriteTool(applicationService);
        StudentApplication application = new StudentApplication();
        application.setStudentId("attacker-supplied-id");
        application.setStudentEmail("victim@example.edu");
        ToolContext context = context("STUDENT", 17L);

        tool.registerForDrive(application, context);

        verify(applicationService).registerApplication(application);
        org.junit.jupiter.api.Assertions.assertEquals("17", application.getStudentId());
        org.junit.jupiter.api.Assertions.assertEquals("student@example.edu", application.getStudentEmail());
    }

    @Test
    void adminCompanyWriteRejectsStudent() {
        CompanyService companyService = mock(CompanyService.class);
        CompanyWriteTool tool = new CompanyWriteTool(companyService);

        assertThrows(SecurityException.class,
                () -> tool.createCompany(new Company(), context("STUDENT", 17L)));

        verifyNoInteractions(companyService);
    }

    @Test
    void driveApplicationListingRejectsNonPlacementStaff() {
        ApplicationService applicationService = mock(ApplicationService.class);
        StaffApplicationTool tool = new StaffApplicationTool(applicationService);

        assertThrows(SecurityException.class,
                () -> tool.listDriveApplications("drive-1", context("TEACHER", 17L)));

        verifyNoInteractions(applicationService);
    }

    @Test
    void adminCompanyWriteCallsServiceForAdmin() {
        CompanyService companyService = mock(CompanyService.class);
        CompanyWriteTool tool = new CompanyWriteTool(companyService);
        Company company = new Company();

        tool.createCompany(company, context("ADMIN", 1L));

        verify(companyService).create(company);
    }

    @Test
    void driveWriteCallbackAcceptsJsonAndCallsService() {
        DriveService service = mock(DriveService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new DriveWriteTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("updateDriveRounds"))
                .findFirst().orElseThrow();
        callback.call("{\"driveId\":\"drive-1\",\"rounds\":[\"Aptitude\"],\"roundConfigsJson\":\"[]\"}", context("ADMIN", 1L));
        verify(service).updateRoundsDto("drive-1", java.util.List.of("Aptitude"), "[]");
    }

    @Test
    void driveWriteCallbackRejectsStudentWithoutServiceCall() {
        DriveService service = mock(DriveService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new DriveWriteTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("updateDriveRounds"))
                .findFirst().orElseThrow();
        assertThrows(RuntimeException.class, () -> callback.call("{\"driveId\":\"drive-1\",\"rounds\":[]}", context("STUDENT", 2L)));
        verifyNoInteractions(service);
    }

    @Test
    void driveWriteCallbackAcceptsStructuredRoundConfigJson() {
        DriveService service = mock(DriveService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new DriveWriteTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("updateDriveRounds"))
                .findFirst().orElseThrow();
        callback.call("{\"driveId\":\"drive-1\",\"rounds\":[\"Aptitude\"],\"roundConfigsJson\":[{\"name\":\"Aptitude\"}]}", context("ADMIN", 1L));
        verify(service).updateRoundsDto("drive-1", java.util.List.of("Aptitude"), "[{\"name\":\"Aptitude\"}]");
    }

    @Test
    void createDriveCallbackAcceptsStructuredDriveJson() {
        DriveService service = mock(DriveService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new DriveWriteTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("createDrive"))
                .findFirst().orElseThrow();
        callback.call("{\"drive\":{\"companyId\":\"company-1\",\"companyName\":\"Acme\",\"role\":\"Engineer\",\"rounds\":[\"Aptitude\"]}}", context("ADMIN", 1L));
        verify(service).createDto(argThat(drive -> "company-1".equals(drive.getCompanyId())
                && java.util.List.of("Aptitude").equals(drive.getRounds())));
    }

    @Test
    void updateDriveInstructionsCallbackCallsService() {
        DriveService service = mock(DriveService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new DriveWriteTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("updateDriveInstructions"))
                .findFirst().orElseThrow();
        callback.call("{\"driveId\":\"drive-1\",\"venue\":\"Hall A\",\"reportingTime\":\"09:00\",\"instructions\":\"Bring ID\"}", context("ADMIN", 1L));
        verify(service).updateInstructionsDto("drive-1", "Hall A", "09:00", "Bring ID");
    }

    @Test
    void feedbackCannotImpersonateAnotherUser() {
        FeedbackService service = mock(FeedbackService.class);
        Feedback feedback = new Feedback();
        feedback.setUserId("victim");
        new FeedbackWriteTool(service).submitFeedback(feedback, context("STUDENT", 17L));
        assertEquals("17", feedback.getUserId());
        verify(service).submit(feedback);
    }

    @Test
    void crtAttendanceRecorderComesFromAuthenticatedUser() {
        AttendanceService service = mock(AttendanceService.class);
        new AttendanceWriteTool(service).markCrtAttendance(3L, java.util.List.of(), "forged-recorder", context("TEACHER", 17L));
        verify(service).markCrtAttendanceDto(3L, java.util.List.of(), "17");
    }

    @Test
    void placementApplicationRejectsStaffIdentity() {
        ApplicationService service = mock(ApplicationService.class);
        assertThrows(SecurityException.class, () -> new ApplicationWriteTool(service)
                .registerForDrive(new StudentApplication(), context("ADMIN", 1L)));
        verifyNoInteractions(service);
    }

    private ToolContext context(String role, Long userId) {
        return new ToolContext(Map.of("role", role, "userId", userId, "userEmail", "student@example.edu"));
    }
}
