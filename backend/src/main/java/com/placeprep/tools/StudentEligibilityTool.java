package com.placeprep.tools;

import com.placeprep.service.EligibilityService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class StudentEligibilityTool {
    private final EligibilityService eligibilityService;

    public StudentEligibilityTool(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @Tool(description = "Check only the authenticated student's saved profile against a placement drive.")
    public Object checkMyEligibility(
            @ToolParam(description = "Placement drive identifier") String driveId,
            ToolContext context
    ) {
        return eligibilityService.checkDriveForStudent(driveId, AiToolAuthorization.userId(context));
    }
}
