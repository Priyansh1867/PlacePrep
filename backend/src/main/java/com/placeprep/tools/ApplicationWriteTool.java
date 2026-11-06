package com.placeprep.tools;

import com.placeprep.model.StudentApplication;
import com.placeprep.service.ApplicationService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class ApplicationWriteTool {
    private final ApplicationService applicationService;

    public ApplicationWriteTool(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Tool(description = "Register the authenticated student for a placement drive using the drive identifier.")
    public Object registerForDrive(
            @ToolParam(description = "Placement drive identifier, e.g. 'DRIVE-001' or '1'") String driveId,
            ToolContext context
    ) {
        String role = AiToolAuthorization.userRole(context);
        if (!"STUDENT".equalsIgnoreCase(role)) {
            return AiToolAuthorization.accessDenied("register for placement drives", "Students");
        }
        String userId = AiToolAuthorization.userId(context);
        Object emailObj = context.getContext().get("userEmail");
        String email = emailObj != null ? String.valueOf(emailObj) : "student@placeprep.edu";

        StudentApplication application = new StudentApplication();
        application.setDriveId(driveId);
        application.setStudentId(userId);
        application.setStudentEmail(email);
        application.setStatus("APPLIED");
        return EntityResponseMapper.toJsonSafe(applicationService.registerApplication(application));
    }

    public Object registerForDrive(StudentApplication application, ToolContext context) {
        String role = AiToolAuthorization.userRole(context);
        if (!"STUDENT".equalsIgnoreCase(role)) {
            return AiToolAuthorization.accessDenied("register for placement drives", "Students");
        }
        String userId = AiToolAuthorization.userId(context);
        Object emailObj = context.getContext().get("userEmail");
        String email = emailObj != null ? String.valueOf(emailObj) : "student@placeprep.edu";
        application.setStudentId(userId);
        application.setStudentEmail(email);
        return EntityResponseMapper.toJsonSafe(applicationService.registerApplication(application));
    }

    @Tool(description = "Update placement application status. Requires placement staff permission.")
    public Object updateApplicationStatus(
            @ToolParam(description = "Application ID") String applicationId,
            @ToolParam(description = "Status, e.g. 'SHORTLISTED', 'REJECTED', 'OFFERED'") String status,
            @ToolParam(description = "Current round name, e.g. 'Technical Round 1'", required = false) String currentRound,
            @ToolParam(description = "Scheduled interview date", required = false) String scheduledDate,
            @ToolParam(description = "Scheduled start time", required = false) String scheduledTime,
            @ToolParam(description = "Scheduled end time", required = false) String scheduledEndTime,
            @ToolParam(description = "Venue or meeting link", required = false) String venue,
            @ToolParam(description = "Instructions for candidate", required = false) String instructions,
            ToolContext context
    ) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("update application statuses", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(applicationService.updateStatus(applicationId, status, currentRound, scheduledDate,
                scheduledTime, scheduledEndTime, venue, instructions));
    }
}
