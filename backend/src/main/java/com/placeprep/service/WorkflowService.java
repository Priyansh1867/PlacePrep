package com.placeprep.service;

import com.placeprep.model.Candidate;
import com.placeprep.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class WorkflowService {

    @Autowired
    private CandidateRepository candidateRepository;

    public WorkflowService() {
    }

    public WorkflowService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    public List<Candidate> getCandidates(String companyId, String round) {
        boolean hasComp = companyId != null && !companyId.trim().isEmpty();
        boolean hasRound = round != null && !round.trim().isEmpty() && !"all".equalsIgnoreCase(round.trim());

        if (hasComp && hasRound) {
            return candidateRepository.findByCompanyIdAndCurrentRound(companyId.trim(), round.trim());
        } else if (hasComp) {
            return candidateRepository.findByCompanyId(companyId.trim());
        } else if (hasRound) {
            return candidateRepository.findByCurrentRound(round.trim());
        } else {
            return candidateRepository.findAll();
        }
    }

    public Candidate getByCandidateId(String candidateId) {
        return candidateRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found: " + candidateId));
    }

    public Candidate advanceCandidate(String candidateId, String nextRound) {
        Candidate candidate = getByCandidateId(candidateId);
        candidate.setCurrentRound(nextRound);
        candidate.setStatus("ADVANCED");
        candidate.setUpdatedAt(LocalDateTime.now().toString());
        return candidateRepository.save(candidate);
    }

    public Candidate eliminateCandidate(String candidateId, String reason) {
        Candidate candidate = getByCandidateId(candidateId);
        candidate.setStatus("ELIMINATED");
        candidate.setEliminationReason(reason);
        candidate.setUpdatedAt(LocalDateTime.now().toString());
        return candidateRepository.save(candidate);
    }

    public Candidate shortlistCandidate(String candidateId) {
        Candidate candidate = getByCandidateId(candidateId);
        candidate.setStatus("SHORTLISTED");
        candidate.setUpdatedAt(LocalDateTime.now().toString());
        return candidateRepository.save(candidate);
    }

    public Candidate selectCandidate(String candidateId) {
        Candidate candidate = getByCandidateId(candidateId);
        candidate.setStatus("SELECTED");
        candidate.setCurrentRound("Selected / Offer Extended");
        candidate.setUpdatedAt(LocalDateTime.now().toString());
        return candidateRepository.save(candidate);
    }

    public Candidate submitEvaluation(String candidateId, Map<String, Object> evaluation) {
        Candidate candidate = getByCandidateId(candidateId);
        if (evaluation.containsKey("technicalDepth")) {
            candidate.setTechnicalDepth(((Number) evaluation.get("technicalDepth")).intValue());
        }
        if (evaluation.containsKey("problemSolving")) {
            candidate.setProblemSolving(((Number) evaluation.get("problemSolving")).intValue());
        }
        if (evaluation.containsKey("communication")) {
            candidate.setCommunication(((Number) evaluation.get("communication")).intValue());
        }
        if (evaluation.containsKey("overallScore")) {
            candidate.setOverallScore(((Number) evaluation.get("overallScore")).intValue());
        }
        if (evaluation.containsKey("feedbackNotes")) {
            candidate.setEvaluatorNotes((String) evaluation.get("feedbackNotes"));
        }
        if (evaluation.containsKey("recommendation")) {
            String rec = (String) evaluation.get("recommendation");
            if (rec != null && rec.toLowerCase().contains("advance")) {
                candidate.setStatus("ADVANCED");
            } else if (rec != null && rec.toLowerCase().contains("reject")) {
                candidate.setStatus("ELIMINATED");
            }
        }
        candidate.setUpdatedAt(LocalDateTime.now().toString());
        return candidateRepository.save(candidate);
    }

    public Candidate save(Candidate candidate) {
        return candidateRepository.save(candidate);
    }
}
