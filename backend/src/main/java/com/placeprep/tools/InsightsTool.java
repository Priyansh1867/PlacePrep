package com.placeprep.tools;

import com.placeprep.service.InsightsService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class InsightsTool {
    private final InsightsService insightsService;

    public InsightsTool(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @Tool(description = "Get aggregate preparation and placement insights for a company.")
    public Object getCompanyInsights(@ToolParam(description = "Company identifier") String companyId) {
        return insightsService.getInsights(companyId);
    }
}
