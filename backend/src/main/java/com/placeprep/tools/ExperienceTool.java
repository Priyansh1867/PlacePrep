package com.placeprep.tools;

import com.placeprep.service.ExperienceService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class ExperienceTool {
    private final ExperienceService experienceService;

    public ExperienceTool(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @Tool(description = "Find interview experiences by optional company or graduation batch.")
    public Object searchExperiences(
            @ToolParam(description = "Company identifier, or blank") String companyId,
            @ToolParam(description = "Graduation batch, or blank") String batch
    ) {
        if (companyId != null && !companyId.isBlank()) return experienceService.getByCompanyId(companyId);
        if (batch != null && !batch.isBlank()) return experienceService.getByBatch(batch);
        return experienceService.getAll();
    }
}
