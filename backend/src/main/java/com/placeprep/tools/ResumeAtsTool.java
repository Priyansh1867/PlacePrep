package com.placeprep.tools;

import com.placeprep.service.ResumeAtsService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class ResumeAtsTool {
    private final ResumeAtsService resumeAtsService;

    public ResumeAtsTool(ResumeAtsService resumeAtsService) {
        this.resumeAtsService = resumeAtsService;
    }

    @Tool(description = "Analyze resume text against a job description and return ATS matching results.")
    public Object analyzeResume(
            @ToolParam(description = "Plain text extracted from the resume") String resumeText,
            @ToolParam(description = "Target company") String company,
            @ToolParam(description = "Target role") String role,
            @ToolParam(description = "Job description") String jobDescription
    ) {
        return resumeAtsService.analyze(resumeText, company, role, jobDescription, "ai-resume.txt");
    }

    @Tool(description = "List sample job descriptions available for ATS practice.")
    public Object listSampleJobDescriptions() {
        return resumeAtsService.getSampleJds();
    }
}
