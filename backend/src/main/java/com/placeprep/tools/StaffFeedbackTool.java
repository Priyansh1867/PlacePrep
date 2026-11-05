package com.placeprep.tools;

import com.placeprep.service.FeedbackService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class StaffFeedbackTool {
    private final FeedbackService feedbackService;

    public StaffFeedbackTool(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @Tool(description = "List recruiter feedback for authorized placement staff only.")
    public Object listRecruiterFeedback(@ToolParam(description = "Drive identifier, or blank") String driveId,
                                        ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return feedbackService.getAllRecruiterFeedback(driveId);
    }
}
