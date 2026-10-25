package com.placeprep;

import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.dto.SampleJdDto;
import com.placeprep.exception.BadRequestException;
import com.placeprep.service.ResumeAtsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeAtsServiceTest {

    private ResumeAtsService atsService;

    @BeforeEach
    void setUp() {
        atsService = new ResumeAtsService();
        ReflectionTestUtils.setField(atsService, "approvalThreshold", 75);
    }

    @Test
    void testKeywordExtractionMultiWordAndSingle() {
        String jd = "We are seeking a Backend Engineer with strong expertise in Spring Boot, REST API, Docker Container, and Java. Candidate should know Data Structures and SQL Queries.";
        Set<String> keywords = atsService.extractKeywordsFromJobDescription(jd);

        assertNotNull(keywords);
        assertTrue(keywords.contains("Spring Boot"));
        assertTrue(keywords.contains("REST API"));
        assertTrue(keywords.contains("Data Structures"));
        assertTrue(keywords.contains("Java"));
    }

    @Test
    void testStopWordsAreFiltered() {
        String jd = "The candidate must have strong experience with excellent ability in working on team projects.";
        Set<String> keywords = atsService.extractKeywordsFromJobDescription(jd);

        // Common stopwords and recruitment boilerplate should not appear as keywords
        assertFalse(keywords.contains("The"));
        assertFalse(keywords.contains("Must"));
        assertFalse(keywords.contains("Have"));
        assertFalse(keywords.contains("Experience"));
        assertFalse(keywords.contains("With"));
    }

    @Test
    void testAnalyzeHighMatchApproved() {
        String resume = "Software Engineer with extensive experience building REST APIs with Java and Spring Boot. Proficient in Data Structures, SQL, and Docker Container deployments.";
        String jd = "Hiring Software Engineer with Java, Spring Boot, REST API, Docker Container, and Data Structures.";

        ResumeAtsResponse response = atsService.analyze(resume, "TCS", "Software Engineer", jd, "my_resume.pdf");

        assertNotNull(response);
        assertEquals("TCS", response.getCompany());
        assertEquals("Software Engineer", response.getRole());
        assertEquals(75, response.getApprovalThreshold());
        assertTrue(response.getMatchScore() >= 75, "Expected score to be >= 75%");
        assertEquals("APPROVED", response.getApprovalStatus());
        assertFalse(response.getMatchedKeywords().isEmpty());
        assertNotNull(response.getRecommendations());
        assertFalse(response.getRecommendations().isEmpty());
    }

    @Test
    void testAnalyzeLowMatchNeedsRevision() {
        String resume = "Finance graduate with basic Microsoft Excel and Accounting skills.";
        String jd = "Requires expert in Java, Spring Boot, REST API, Kubernetes, Docker, Microservices Architecture, and AWS Cloud.";

        ResumeAtsResponse response = atsService.analyze(resume, "Amazon", "SDE-1", jd, "finance_resume.pdf");

        assertNotNull(response);
        assertTrue(response.getMatchScore() < 75, "Expected score to be < 75%");
        assertEquals("NEEDS_REVISION", response.getApprovalStatus());
        assertFalse(response.getMissingKeywords().isEmpty());
        assertTrue(response.getMissingKeywords().contains("Java") || response.getMissingKeywords().contains("Spring Boot"));
    }

    @Test
    void testEmptyResumeThrowsBadRequest() {
        assertThrows(BadRequestException.class, () ->
                atsService.analyze("", "Google", "SWE", "Java and Python", "resume.pdf")
        );
    }

    @Test
    void testEmptyJdThrowsBadRequest() {
        assertThrows(BadRequestException.class, () ->
                atsService.analyze("Java developer resume", "Google", "SWE", "", "resume.pdf")
        );
    }

    @Test
    void testSampleJdsReturnValidList() {
        List<SampleJdDto> samples = atsService.getSampleJds();
        assertNotNull(samples);
        assertFalse(samples.isEmpty());
        assertTrue(samples.stream().anyMatch(s -> s.getCompany().equalsIgnoreCase("TCS")));
        assertTrue(samples.stream().anyMatch(s -> s.getCompany().equalsIgnoreCase("Amazon")));
    }
}
