package com.placeprep.tools;

import com.placeprep.service.OpportunityService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class OpportunityTool {
    private final OpportunityService opportunityService;

    public OpportunityTool(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @Tool(description = "List all hackathons.")
    public Object listHackathons() {
        return opportunityService.getAllHackathons();
    }

    @Tool(description = "List internships, optionally filtered by graduation batch.")
    public Object listInternships(@ToolParam(description = "Graduation batch, or blank") String batch) {
        return opportunityService.getAllInternships(batch);
    }

    @Tool(description = "Find off-campus opportunities for a student.")
    public Object listOffCampusOpportunities(@ToolParam(description = "Student email or user identifier") String studentId) {
        return opportunityService.getOffCampusOpportunitiesForStudent(studentId);
    }
}
