package com.placeprep;

import com.placeprep.controller.ResumeAtsController;
import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.dto.SampleJdDto;
import com.placeprep.service.ResumeAtsService;
import com.placeprep.service.ResumeParserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ResumeAtsControllerTest {

    private MockMvc mockMvc;
    private ResumeParserService parserService;
    private ResumeAtsService atsService;

    @BeforeEach
    void setUp() {
        parserService = mock(ResumeParserService.class);
        atsService = mock(ResumeAtsService.class);
        ResumeAtsController controller = new ResumeAtsController(parserService, atsService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new com.placeprep.exception.GlobalExceptionHandler())
                .build();
    }

    @Test
    void testAnalyzeResumeEndpointSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "my_resume.pdf", MediaType.APPLICATION_PDF_VALUE, "%PDF-1.4 synthetic".getBytes()
        );

        when(parserService.extractText(any())).thenReturn("Java Spring Boot Developer");
        when(atsService.analyze(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(ResumeAtsResponse.builder()
                        .company("TCS")
                        .role("Software Engineer")
                        .fileName("my_resume.pdf")
                        .matchScore(85)
                        .approvalStatus("APPROVED")
                        .approvalThreshold(75)
                        .totalJobKeywords(10)
                        .matchedCount(8)
                        .missingCount(2)
                        .matchedKeywords(List.of("Java", "Spring Boot"))
                        .missingKeywords(List.of("Docker", "AWS"))
                        .recommendations(List.of("Add Docker to skills"))
                        .summary("High ATS match")
                        .disclaimer("Educational estimate")
                        .build());

        mockMvc.perform(multipart("/api/resume-ats/analyze")
                        .file(file)
                        .param("company", "TCS")
                        .param("role", "Software Engineer")
                        .param("jobDescription", "Hiring Java and Spring Boot engineer with Docker and AWS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("TCS"))
                .andExpect(jsonPath("$.role").value("Software Engineer"))
                .andExpect(jsonPath("$.matchScore").value(85))
                .andExpect(jsonPath("$.approvalStatus").value("APPROVED"))
                .andExpect(jsonPath("$.matchedKeywords[0]").value("Java"));
    }

    @Test
    void testAnalyzeResumeMissingFileReturnsBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", "", new byte[0]);

        mockMvc.perform(multipart("/api/resume-ats/analyze")
                        .file(emptyFile)
                        .param("company", "TCS")
                        .param("role", "Developer")
                        .param("jobDescription", "Valid JD description here"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetSampleJdsEndpoint() throws Exception {
        when(atsService.getSampleJds()).thenReturn(List.of(
                SampleJdDto.builder()
                        .id("jd-1")
                        .company("TCS")
                        .role("Digital Engineer")
                        .build()
        ));

        mockMvc.perform(get("/api/resume-ats/sample-jds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].company").value("TCS"))
                .andExpect(jsonPath("$[0].role").value("Digital Engineer"));
    }
}
