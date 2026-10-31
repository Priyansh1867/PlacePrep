package com.placeprep.tools;

import com.placeprep.service.CompanyService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class CompanyTool {
    private final CompanyService companyService;

    public CompanyTool(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Tool(description = "Find placement companies, optionally filtered by eligible graduation batch.")
    public Object searchCompanies(@ToolParam(description = "Graduation batch, or blank for all companies") String batch) {
        return companyService.getAll(batch);
    }

    @Tool(description = "Get the complete profile of one placement company.")
    public Object getCompany(@ToolParam(description = "Company identifier") String companyId) {
        return companyService.getByCompanyId(companyId);
    }
}
