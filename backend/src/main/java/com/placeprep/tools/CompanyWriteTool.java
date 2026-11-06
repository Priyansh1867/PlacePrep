package com.placeprep.tools;

import com.placeprep.model.Company;
import com.placeprep.service.CompanyService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CompanyWriteTool {
    private final CompanyService companyService;

    public CompanyWriteTool(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Tool(description = "Create a new placement recruiting company profile. Requires TPO, Director, Management, or Administrator permission.")
    public Object createCompany(
            @ToolParam(description = "Company official name, e.g. 'Google', 'Microsoft'") String name,
            @ToolParam(description = "Industry or sector, e.g. 'Technology', 'Fintech', 'Consulting'", required = false) String industry,
            @ToolParam(description = "Headquarters location, e.g. 'Mountain View, CA' or 'Bangalore'", required = false) String headquarters,
            @ToolParam(description = "Expected CTC range, e.g. '15-25 LPA'", required = false) String ctcRange,
            @ToolParam(description = "Tier, e.g. 'Tier 1' or 'Dream'", required = false) String tier,
            @ToolParam(description = "Eligible graduation batch, e.g. '2026'", required = false) String batch,
            @ToolParam(description = "Hiring roles, e.g. 'Software Engineer, Cloud Engineer'", required = false) String roles,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canManageCompanies(context)) {
            return AiToolAuthorization.accessDenied("create placement companies", "TPO, Director, Management, or Administrator");
        }
        Company c = new Company();
        c.setName(name != null && !name.isBlank() ? name : "Recruiting Partner");
        c.setIndustry(industry != null && !industry.isBlank() ? industry : "Technology");
        c.setHeadquarters(headquarters != null && !headquarters.isBlank() ? headquarters : "India");
        c.setCtcRange(ctcRange != null && !ctcRange.isBlank() ? ctcRange : "Competitive");
        c.setTier(tier != null && !tier.isBlank() ? tier : "Tier 1");
        if (batch != null && !batch.isBlank()) {
            c.setEligibleBatches(List.of(batch));
        }
        if (roles != null && !roles.isBlank()) {
            c.setRoles(List.of(roles.split("\\s*,\\s*")));
        }
        return companyService.create(c);
    }

    public Object createCompany(Company company, ToolContext context) {
        if (!AiToolAuthorization.canManageCompanies(context)) {
            return AiToolAuthorization.accessDenied("create placement companies", "TPO, Director, Management, or Administrator");
        }
        return companyService.create(company);
    }

    @Tool(description = "Update an existing placement company profile. Requires placement staff permission.")
    public Object updateCompany(String companyId, Company company, ToolContext context) {
        if (!AiToolAuthorization.canManageCompanies(context)) {
            return AiToolAuthorization.accessDenied("update placement companies", "TPO, Director, Management, or Administrator");
        }
        return companyService.update(companyId, company);
    }
}
