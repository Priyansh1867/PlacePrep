package com.placeprep;

import com.placeprep.model.Company;
import com.placeprep.model.InterviewExperience;
import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.CompanyRepository;
import com.placeprep.repository.InterviewExperienceRepository;
import com.placeprep.repository.InterviewQuestionRepository;
import com.placeprep.service.InsightsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class InsightsServiceTest {

    private CompanyRepository companyRepository;
    private InterviewQuestionRepository questionRepository;
    private InterviewExperienceRepository experienceRepository;
    private InsightsService insightsService;

    @BeforeEach
    void setUp() {
        companyRepository = mock(CompanyRepository.class);
        questionRepository = mock(InterviewQuestionRepository.class);
        experienceRepository = mock(InterviewExperienceRepository.class);
        insightsService = new InsightsService(companyRepository, questionRepository, experienceRepository);
    }

    @Test
    void testCompanyInsightsCalculatedFromRealRecordsWithoutFabricatedCounts() {
        Company hcl = new Company();
        hcl.setCompanyId("hcltech");
        hcl.setName("HCLTech");
        hcl.setFrequentTopics(Arrays.asList("SQL", "Java"));

        InterviewQuestion q1 = new InterviewQuestion();
        q1.setQuestionId("q1");
        q1.setCompanyId("hcltech");
        q1.setDifficulty("Medium");
        q1.setCategory("DSA");

        InterviewQuestion q2 = new InterviewQuestion();
        q2.setQuestionId("q2");
        q2.setCompanyId("hcltech");
        q2.setDifficulty("Hard");
        q2.setCategory("DSA");

        InterviewExperience exp1 = new InterviewExperience();
        exp1.setExperienceId("e1");
        exp1.setCompanyId("hcltech");

        when(companyRepository.findByCompanyId("hcltech")).thenReturn(Optional.of(hcl));
        when(questionRepository.findByCompanyId("hcltech")).thenReturn(Arrays.asList(q1, q2));
        when(experienceRepository.findByCompanyId("hcltech")).thenReturn(Collections.singletonList(exp1));

        Map<String, Object> insights = insightsService.getInsights("hcltech");

        assertNotNull(insights);
        assertEquals("hcltech", insights.get("companyId"));
        assertEquals("HCLTech", insights.get("companyName"));
        assertEquals(2, insights.get("questionCount"));
        assertEquals(1, insights.get("experienceCount"));
        assertEquals(3, insights.get("totalSamplesAnalyzed")); // 2 questions + 1 experience = exactly 3
    }

    @Test
    void testCompanyInsightsWithZeroRecordsDoesNotBorrowOtherCompanies() {
        when(companyRepository.findByCompanyId("unknown")).thenReturn(Optional.empty());
        when(questionRepository.findByCompanyId("unknown")).thenReturn(Collections.emptyList());
        when(experienceRepository.findByCompanyId("unknown")).thenReturn(Collections.emptyList());

        Map<String, Object> insights = insightsService.getInsights("unknown");

        assertNotNull(insights);
        assertEquals(0, insights.get("questionCount"));
        assertEquals(0, insights.get("experienceCount"));
        assertEquals(0, insights.get("totalSamplesAnalyzed"));
        assertFalse((Boolean) insights.get("hasSufficientData"));
    }
}
