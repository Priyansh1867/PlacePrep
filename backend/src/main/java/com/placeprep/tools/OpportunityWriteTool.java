package com.placeprep.tools;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.service.OpportunityService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class OpportunityWriteTool {
    private final OpportunityService opportunityService;

    public OpportunityWriteTool(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @Tool(description = "Create a hackathon listing. Requires ADMIN permission.")
    public Object createHackathon(Hackathon hackathon, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return EntityResponseMapper.toJsonSafe(opportunityService.createHackathon(hackathon));
    }

    @Tool(description = "Create an internship listing. Requires ADMIN permission.")
    public Object createInternship(Internship internship, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return EntityResponseMapper.toJsonSafe(opportunityService.createInternship(internship));
    }
}
