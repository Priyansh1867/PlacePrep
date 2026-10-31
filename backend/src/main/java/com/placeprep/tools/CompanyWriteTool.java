package com.placeprep.tools;

import com.placeprep.model.Company;
import com.placeprep.service.CompanyService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class CompanyWriteTool {
    private final CompanyService companyService;

    public CompanyWriteTool(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Tool(description = "Create a placement company. Requires ADMIN permission.")
    public Object createCompany(Company company, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return companyService.create(company);
    }

    @Tool(description = "Update an existing placement company. Requires ADMIN permission.")
    public Object updateCompany(String companyId, Company company, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return companyService.update(companyId, company);
    }
}
