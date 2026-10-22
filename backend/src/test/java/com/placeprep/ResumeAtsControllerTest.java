package com.placeprep;

import com.placeprep.controller.ResumeAtsController;
import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.service.ResumeAtsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

public class ResumeAtsControllerTest {

    @Mock
    private ResumeAtsService resumeAtsService;

    @InjectMocks
    private ResumeAtsController resumeAtsController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAnalyzeSuccess() {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[]{1, 2, 3});
        ResumeAtsResponse mockResponse = ResumeAtsResponse.builder()
                .company("HCLTech")
                .role("Software Engineer")
                .matchScore(85)
                .approvalStatus("APPROVED")
                .approvalThreshold(75)
                .matchedKeywords(Arrays.asList("Java", "Spring Boot"))
                .missingKeywords(Collections.singletonList("Docker"))
                .recommendations(Collections.singletonList("Add Docker experience"))
                .analyzedAt(Instant.now())
                .build();

        when(resumeAtsService.analyze(any(), anyString(), anyString(), anyString())).thenReturn(mockResponse);

        ResponseEntity<?> responseEntity = resumeAtsController.analyzeResume(file, "HCLTech", "Software Engineer", "Detailed job description for Java developer");

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertTrue(responseEntity.getBody() instanceof ResumeAtsResponse);
        ResumeAtsResponse body = (ResumeAtsResponse) responseEntity.getBody();
        assertEquals(85, body.getMatchScore());
        assertEquals("APPROVED", body.getApprovalStatus());
    }

    @Test
    public void testAnalyzeEmptyFileReturnsBadRequest() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);
        ResponseEntity<?> response = resumeAtsController.analyzeResume(emptyFile, "HCLTech", "Role", "Job description");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertTrue(body.containsKey("error"));
    }

    @Test
    public void testAnalyzeMissingJdReturnsBadRequest() {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[]{1, 2, 3});
        ResponseEntity<?> response = resumeAtsController.analyzeResume(file, "HCLTech", "Role", "   ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
    }

    @Test
    public void testGetSampleJobDescriptionsReturnsList() {
        ResponseEntity<List<Map<String, String>>> response = resumeAtsController.getSampleJobDescriptions();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
        assertTrue(response.getBody().stream().anyMatch(s -> "HCLTech".equalsIgnoreCase(s.get("companyName"))));
    }
}
