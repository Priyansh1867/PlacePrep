package com.placeprep.tools;

import com.placeprep.model.InterviewExperience;
import com.placeprep.service.ExperienceService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExperienceWriteTool {
    private final ExperienceService experienceService;

    public ExperienceWriteTool(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @Tool(description = "Submit a student interview experience for a company. Requires an authenticated user.")
    public Object createExperience(
            @ToolParam(description = "Company name, e.g. 'Amazon', 'Google'") String companyName,
            @ToolParam(description = "Role title, e.g. 'Software Development Engineer'") String role,
            @ToolParam(description = "Outcome: 'Selected', 'Rejected', or 'In Progress'") String outcome,
            @ToolParam(description = "Difficulty level: 'Easy', 'Medium', or 'Hard'", required = false) String difficulty,
            @ToolParam(description = "Tips and advice for juniors", required = false) String tips,
            @ToolParam(description = "Interview rounds description or questions faced", required = false) String roundsDescription,
            ToolContext context
    ) {
        AiToolAuthorization.userId(context);
        InterviewExperience exp = new InterviewExperience();
        exp.setCompanyName(companyName != null && !companyName.isBlank() ? companyName : "Company");
        exp.setCompanyId(companyName != null ? companyName.toLowerCase().replaceAll("[^a-z0-9]", "-") : "general");
        exp.setRole(role != null && !role.isBlank() ? role : "Software Engineer");
        exp.setOutcome(outcome != null && !outcome.isBlank() ? outcome : "Selected");
        exp.setDifficulty(difficulty != null && !difficulty.isBlank() ? difficulty : "Medium");
        exp.setTips(tips != null && !tips.isBlank() ? tips : "Practice DSA and core computer science fundamentals.");
        if (roundsDescription != null && !roundsDescription.isBlank()) {
            exp.setRoundsFaced(List.of(roundsDescription));
        }
        exp.setModerationStatus("APPROVED");
        return EntityResponseMapper.toJsonSafe(experienceService.create(exp));
    }

    public Object createExperience(InterviewExperience experience, ToolContext context) {
        AiToolAuthorization.userId(context);
        return EntityResponseMapper.toJsonSafe(experienceService.create(experience));
    }
}
