package com.placeprep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.service.ResumeAtsService;
import com.placeprep.tools.ResumeAtsTool;
import org.junit.jupiter.api.Test;
import org.springframework.ai.support.ToolCallbacks;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ResumeAtsToolTest {
    @Test
    void aiCanAnalyzeResumeWithoutCompanyArgument() throws Exception {
        ResumeAtsService service = mock(ResumeAtsService.class);
        var callback = java.util.Arrays.stream(ToolCallbacks.from(new ResumeAtsTool(service)))
                .filter(tool -> tool.getToolDefinition().name().equals("analyzeResume"))
                .findFirst().orElseThrow();
        var schema = new ObjectMapper().readTree(callback.getToolDefinition().inputSchema());
        assertFalse(schema.path("required").toString().contains("company"));

        String result = callback.call("""
                {"resumeText":"Java Spring Boot developer","role":"Backend Engineer",
                 "jobDescription":"Backend engineer with Java and Spring Boot skills"}
                """);

        assertNotNull(result);
        verify(service).analyze("Java Spring Boot developer", null, "Backend Engineer",
                "Backend engineer with Java and Spring Boot skills", "ai-resume.txt");
    }
}
