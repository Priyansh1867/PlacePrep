package com.placeprep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.dto.coding.CodingProblemDto;
import com.placeprep.dto.coding.CodingProgressDto;
import com.placeprep.dto.coding.CodingSubmissionDto;
import com.placeprep.dto.coding.CodingSubmissionPageDto;
import com.placeprep.model.CodingExample;
import com.placeprep.model.CodingSubmission;
import com.placeprep.model.CodingTestCase;
import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.CodingSubmissionRepository;
import com.placeprep.repository.InterviewQuestionRepository;
import com.placeprep.service.CodingResourceNotFoundException;
import com.placeprep.service.CodingStudioService;
import com.placeprep.service.Judge0Client;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CodingStudioServiceTest {

    private InterviewQuestionRepository questionRepository;
    private CodingSubmissionRepository submissionRepository;
    private Judge0Client judge0Client;
    private ObjectMapper objectMapper;
    private CodingStudioService studioService;

    @BeforeEach
    void setUp() {
        questionRepository = mock(InterviewQuestionRepository.class);
        submissionRepository = mock(CodingSubmissionRepository.class);
        judge0Client = mock(Judge0Client.class);
        objectMapper = new ObjectMapper();

        studioService = new CodingStudioService(
                questionRepository,
                submissionRepository,
                judge0Client,
                objectMapper
        );
        ReflectionTestUtils.setField(studioService, "maxSourceBytes", 40000);
    }

    private InterviewQuestion createSampleQuestion(String id) {
        InterviewQuestion question = new InterviewQuestion();
        question.setQuestionId(id);
        question.setQuestion("Test Question");
        question.setCategory("Algorithms");
        question.setDifficulty("Easy");
        question.setCodingStatement("Sample statement");
        question.setInputFormat("Sample input format");
        question.setOutputFormat("Sample output format");
        question.setCodingConstraints(List.of("1 <= N <= 100"));
        question.setCodingExamples(List.of(new CodingExample("1", "1", "Same")));
        question.setPublicTestCases(List.of(new CodingTestCase("1\n", "1")));
        question.setHiddenTestCases(List.of(new CodingTestCase("2\n", "2")));
        question.setStarterCodeJava("public class Main {}");
        return question;
    }

    @Test
    void getProblemsMarksSolvedCorrectly() {
        InterviewQuestion q1 = createSampleQuestion("prob-1");
        InterviewQuestion q2 = createSampleQuestion("prob-2");
        when(questionRepository.findByCodingStatementIsNotNull()).thenReturn(List.of(q1, q2));

        CodingSubmission solved = new CodingSubmission();
        solved.setProblemId("prob-1");
        solved.setVerdict("ACCEPTED");
        when(submissionRepository.findByStudentIdAndSubmissionType(100L, "SUBMIT"))
                .thenReturn(List.of(solved));

        List<CodingProblemDto> problems = studioService.getProblems(100L);

        assertEquals(2, problems.size());
        assertTrue(problems.stream().filter(p -> p.id().equals("prob-1")).findFirst().get().solved());
        assertFalse(problems.stream().filter(p -> p.id().equals("prob-2")).findFirst().get().solved());
    }

    @Test
    void getProblemThrowsWhenNotFoundOrNotCodingProblem() {
        when(questionRepository.findByQuestionId("unknown")).thenReturn(Optional.empty());

        assertThrows(CodingResourceNotFoundException.class, () -> studioService.getProblem(100L, "unknown"));

        InterviewQuestion nonCoding = new InterviewQuestion();
        nonCoding.setQuestionId("non-coding");
        nonCoding.setQuestion("What is polymorphism?");
        when(questionRepository.findByQuestionId("non-coding")).thenReturn(Optional.of(nonCoding));

        assertThrows(CodingResourceNotFoundException.class, () -> studioService.getProblem(100L, "non-coding"));
    }

    @Test
    void runValidatesLanguageAndSource() {
        InterviewQuestion q = createSampleQuestion("prob-1");
        when(questionRepository.findByQuestionId("prob-1")).thenReturn(Optional.of(q));

        assertThrows(IllegalArgumentException.class,
                () -> studioService.run(100L, "prob-1", "python", "print(1)"));

        assertThrows(IllegalArgumentException.class,
                () -> studioService.run(100L, "prob-1", "java", "   "));

        assertThrows(IllegalArgumentException.class,
                () -> studioService.run(100L, "prob-1", "java", "x".repeat(45000)));
    }

    @Test
    void progressComputesAccuracyAndDistinctSolvedCount() {
        CodingSubmission sub1 = new CodingSubmission();
        sub1.setProblemId("prob-1");
        sub1.setVerdict("ACCEPTED");

        CodingSubmission sub2 = new CodingSubmission();
        sub2.setProblemId("prob-1");
        sub2.setVerdict("ACCEPTED"); // same problem solved twice

        CodingSubmission sub3 = new CodingSubmission();
        sub3.setProblemId("prob-2");
        sub3.setVerdict("WRONG_ANSWER");

        when(submissionRepository.findByStudentIdAndSubmissionType(100L, "SUBMIT"))
                .thenReturn(List.of(sub1, sub2, sub3));

        CodingProgressDto progress = studioService.getProgress(100L);

        assertEquals(1, progress.solvedProblems());
        assertEquals(3, progress.attempts());
        assertEquals(2, progress.acceptedSubmissions());
        assertEquals(67, progress.accuracyPercent());
    }

    @Test
    void emptyProgressReturnsZeroes() {
        when(submissionRepository.findByStudentIdAndSubmissionType(100L, "SUBMIT"))
                .thenReturn(List.of());

        CodingProgressDto progress = studioService.getProgress(100L);

        assertEquals(0, progress.solvedProblems());
        assertEquals(0, progress.attempts());
        assertEquals(0, progress.acceptedSubmissions());
        assertEquals(0, progress.accuracyPercent());
    }

    @Test
    void getSubmissionsClampsPagination() {
        when(submissionRepository.findByStudentIdOrderBySubmittedAtDesc(eq(100L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        CodingSubmissionPageDto page = studioService.getSubmissions(100L, null, -5, 200);

        assertNotNull(page);
        verify(submissionRepository).findByStudentIdOrderBySubmittedAtDesc(
                eq(100L),
                argThat(pageable -> pageable.getPageNumber() == 0 && pageable.getPageSize() == 50)
        );
    }
}
