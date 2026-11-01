package com.placeprep.tools;

import com.placeprep.model.Feedback;
import com.placeprep.model.RecruiterFeedback;
import com.placeprep.service.FeedbackService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class FeedbackWriteTool {
    private final FeedbackService feedbackService;

    public FeedbackWriteTool(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @Tool(description = "Submit general PlacePrep feedback as the authenticated user.")
    public Object submitFeedback(Feedback feedback, ToolContext context) {
        AiToolAuthorization.userId(context);
        return EntityResponseMapper.toJsonSafe(feedbackService.submit(feedback));
    }

    @Tool(description = "Submit recruiter feedback for a placement drive. Requires placement staff permission.")
    public Object submitRecruiterFeedback(RecruiterFeedback feedback, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return EntityResponseMapper.toJsonSafe(feedbackService.submitRecruiterFeedback(feedback));
    }
}
