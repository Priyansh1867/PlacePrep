package com.placeprep.tools;

import com.placeprep.model.StudentApplication;
import com.placeprep.service.ApplicationService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class ApplicationWriteTool {
    private final ApplicationService applicationService;

    public ApplicationWriteTool(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Tool(description = "Register the authenticated student for a placement drive. The student identity must come from the authenticated session.")
    public Object registerForDrive(StudentApplication application, ToolContext context) {
        String userId = AiToolAuthorization.userId(context);
        application.setStudentId(userId);
        return applicationService.registerApplication(application);
    }

    @Tool(description = "Update placement application status. Requires placement staff permission.")
    public Object updateApplicationStatus(String applicationId, String status, String currentRound,
                                          String scheduledDate, String scheduledTime, String scheduledEndTime,
                                          String venue, String instructions, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return applicationService.updateStatus(applicationId, status, currentRound, scheduledDate,
                scheduledTime, scheduledEndTime, venue, instructions);
    }
}
