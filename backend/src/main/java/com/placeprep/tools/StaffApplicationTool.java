package com.placeprep.tools;

import com.placeprep.service.ApplicationService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class StaffApplicationTool {
    private final ApplicationService applicationService;

    public StaffApplicationTool(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Tool(description = "List applications for a placement drive. Available only to authorized placement staff.")
    public Object listDriveApplications(@ToolParam(description = "Placement drive identifier") String driveId,
                                        ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return applicationService.getDriveApplications(driveId);
    }
}
