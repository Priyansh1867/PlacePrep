package com.placeprep.tools;

import com.placeprep.model.Feedback;
import com.placeprep.model.RecruiterFeedback;
import com.placeprep.service.FeedbackService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class FeedbackWriteTool {
    private final FeedbackService feedbackService;

    public FeedbackWriteTool(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @Tool(description = "Submit general feedback or suggestions regarding PlacePrep platform.")
    public Object submitFeedback(
            @ToolParam(description = "Feedback message or suggestions") String message,
            @ToolParam(description = "Category, e.g. 'PLATFORM', 'INTERVIEW_PREP', 'TIMETABLE'", required = false) String category,
            @ToolParam(description = "Rating from 1 to 5", required = false) Integer rating,
            ToolContext context
    ) {
        Feedback feedback = new Feedback();
        feedback.setUserId(AiToolAuthorization.userId(context));
        feedback.setMessage(message);
        feedback.setCategory(category != null && !category.isBlank() ? category : "GENERAL");
        feedback.setRating(rating != null ? rating : 5);
        return EntityResponseMapper.toJsonSafe(feedbackService.submit(feedback));
    }

    public Object submitFeedback(Feedback feedback, ToolContext context) {
        feedback.setUserId(AiToolAuthorization.userId(context));
        return EntityResponseMapper.toJsonSafe(feedbackService.submit(feedback));
    }

    @Tool(description = "Submit recruiter evaluation feedback for a placement drive. Requires placement staff permission.")
    public Object submitRecruiterFeedback(
            @ToolParam(description = "Drive identifier, e.g. 'DRIVE-001'") String driveId,
            @ToolParam(description = "Company name, e.g. 'Google'") String companyName,
            @ToolParam(description = "Recruiter hiring remarks and candidate evaluation notes") String hiringRemarks,
            @ToolParam(description = "Recruiter name or email", required = false) String recruiterName,
            @ToolParam(description = "Overall rating out of 5", required = false) Integer overallRating,
            ToolContext context
    ) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("submit recruiter feedback", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        RecruiterFeedback feedback = RecruiterFeedback.builder()
                .driveId(driveId)
                .companyName(companyName != null && !companyName.isBlank() ? companyName : "Company")
                .hiringRemarks(hiringRemarks)
                .recruiterName(recruiterName != null && !recruiterName.isBlank() ? recruiterName : "Visiting Recruiter")
                .overallRating(overallRating != null ? overallRating : 5)
                .build();
        return EntityResponseMapper.toJsonSafe(feedbackService.submitRecruiterFeedback(feedback));
    }

    public Object submitRecruiterFeedback(RecruiterFeedback feedback, ToolContext context) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("submit recruiter feedback", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(feedbackService.submitRecruiterFeedback(feedback));
    }
}
