package com.placeprep;

import com.placeprep.model.Candidate;
import com.placeprep.repository.CandidateRepository;
import com.placeprep.service.WorkflowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WorkflowServiceTest {

    private CandidateRepository candidateRepository;
    private WorkflowService workflowService;

    @BeforeEach
    void setUp() {
        candidateRepository = mock(CandidateRepository.class);
        workflowService = new WorkflowService(candidateRepository);
    }

    @Test
    void testGetCandidatesFiltering() {
        Candidate c1 = new Candidate();
        c1.setCandidateId("cand-01");
        c1.setCompanyId("hcltech");
        c1.setCurrentRound("technical");

        when(candidateRepository.findByCompanyIdAndCurrentRound("hcltech", "technical"))
                .thenReturn(Collections.singletonList(c1));

        List<Candidate> res = workflowService.getCandidates("hcltech", "technical");
        assertEquals(1, res.size());
        assertEquals("cand-01", res.get(0).getCandidateId());
    }

    @Test
    void testAdvanceCandidateUpdatesRoundAndStatus() {
        Candidate cand = new Candidate();
        cand.setCandidateId("cand-02");
        cand.setCurrentRound("aptitude");
        cand.setStatus("ACTIVE");

        when(candidateRepository.findByCandidateId("cand-02")).thenReturn(Optional.of(cand));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(i -> i.getArgument(0));

        Candidate updated = workflowService.advanceCandidate("cand-02", "technical");

        assertEquals("technical", updated.getCurrentRound());
        assertEquals("ADVANCED", updated.getStatus());
        assertNotNull(updated.getUpdatedAt());
        verify(candidateRepository, times(1)).save(cand);
    }

    @Test
    void testEliminateCandidateRecordsReason() {
        Candidate cand = new Candidate();
        cand.setCandidateId("cand-03");

        when(candidateRepository.findByCandidateId("cand-03")).thenReturn(Optional.of(cand));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(i -> i.getArgument(0));

        Candidate updated = workflowService.eliminateCandidate("cand-03", "Below cutoff in coding round");

        assertEquals("ELIMINATED", updated.getStatus());
        assertEquals("Below cutoff in coding round", updated.getEliminationReason());
        verify(candidateRepository, times(1)).save(cand);
    }

    @Test
    void testSelectCandidateGrantsOfferStatus() {
        Candidate cand = new Candidate();
        cand.setCandidateId("cand-04");

        when(candidateRepository.findByCandidateId("cand-04")).thenReturn(Optional.of(cand));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(i -> i.getArgument(0));

        Candidate updated = workflowService.selectCandidate("cand-04");

        assertEquals("SELECTED", updated.getStatus());
        assertEquals("Selected / Offer Extended", updated.getCurrentRound());
        verify(candidateRepository, times(1)).save(cand);
    }

    @Test
    void testSubmitEvaluationUpdatesScoresAndRecommendation() {
        Candidate cand = new Candidate();
        cand.setCandidateId("cand-05");

        when(candidateRepository.findByCandidateId("cand-05")).thenReturn(Optional.of(cand));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> eval = new HashMap<>();
        eval.put("technicalDepth", 9);
        eval.put("problemSolving", 9);
        eval.put("communication", 8);
        eval.put("overallScore", 90);
        eval.put("feedbackNotes", "Excellent command of concurrency and system architecture.");
        eval.put("recommendation", "Advance to Next Round");

        Candidate evaluated = workflowService.submitEvaluation("cand-05", eval);

        assertEquals(9, evaluated.getTechnicalDepth());
        assertEquals(9, evaluated.getProblemSolving());
        assertEquals(8, evaluated.getCommunication());
        assertEquals(90, evaluated.getOverallScore());
        assertEquals("ADVANCED", evaluated.getStatus());
        assertEquals("Excellent command of concurrency and system architecture.", evaluated.getEvaluatorNotes());
        verify(candidateRepository, times(1)).save(cand);
    }
}
