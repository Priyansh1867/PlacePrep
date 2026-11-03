package com.placeprep.tools;

import com.placeprep.model.InterviewExperience;
import com.placeprep.service.ExperienceService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class ExperienceWriteTool {
    private final ExperienceService experienceService;

    public ExperienceWriteTool(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @Tool(description = "Submit an interview experience for the authenticated student. Requires an authenticated user.")
    public Object createExperience(InterviewExperience experience, ToolContext context) {
        AiToolAuthorization.userId(context);
        return EntityResponseMapper.toJsonSafe(experienceService.create(experience));
    }
}
