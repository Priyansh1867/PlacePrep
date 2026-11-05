package com.placeprep.service;

import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.SelectionResult;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.CandidateEvaluationRepository;
import com.placeprep.repository.SelectionResultRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private CandidateEvaluationRepository evaluationRepository;

    @Autowired
    private StudentApplicationRepository applicationRepository;

    @Autowired
    private SelectionResultRepository selectionResultRepository;

    public CandidateEvaluation submitEvaluation(CandidateEvaluation evaluation) {
        validateScores(evaluation);

        Optional<StudentApplication> appOpt =
                applicationRepository.findByApplicationId(evaluation.getApplicationId());
        if (!appOpt.isPresent()) {
            throw new IllegalArgumentException("Application not found: " + evaluation.getApplicationId());
        }
        StudentApplication app = appOpt.get();

        if (evaluation.getDriveId() == null) {
            evaluation.setDriveId(app.getDriveId());
        }
        if (evaluation.getSubmittedAt() == null) {
            evaluation.setSubmittedAt(LocalDateTime.now().format(TS));
        }
        if (evaluation.getVerdict() == null || evaluation.getVerdict().trim().isEmpty()) {
            evaluation.setVerdict(inferVerdict(evaluation));
        }

        return evaluationRepository.save(evaluation);
    }

    public List<CandidateEvaluation> getEvaluationsForCandidate(String applicationId, Integer roundNumber) {
        return evaluationRepository.findByApplicationIdAndRoundNumber(applicationId, roundNumber);
    }

    public Optional<CandidateEvaluation> getLatestEvaluation(String applicationId, Integer roundNumber) {
        return evaluationRepository.findTopByApplicationIdAndRoundNumberOrderBySubmittedAtDesc(
                applicationId,
                roundNumber
        );
    }

    private void validateScores(CandidateEvaluation evaluation) {
        validateScoreRange(evaluation.getTechnicalScore(), "technicalScore");
        validateScoreRange(evaluation.getProblemSolvingScore(), "problemSolvingScore");
        validateScoreRange(evaluation.getCommunicationScore(), "communicationScore");

        String verdict = evaluation.getVerdict();
        if (verdict != null) {
            String v = verdict.trim().toUpperCase();
            if (!v.equals("ADVANCE") && !v.equals("HOLD") && !v.equals("REJECT")) {
                throw new IllegalArgumentException("verdict must be ADVANCE, HOLD, or REJECT");
            }
            evaluation.setVerdict(v);
        }

        Optional<SelectionResult> pipeline = selectionResultRepository.findByApplicationId(
                evaluation.getApplicationId()
        );
        if (pipeline.isPresent() && "REJECTED".equals(pipeline.get().getPipelineStatus())) {
            throw new IllegalArgumentException("Cannot evaluate a rejected candidate");
        }
    }

    private void validateScoreRange(Integer score, String field) {
        if (score == null) {
            return;
        }
        if (score < 1 || score > 10) {
            throw new IllegalArgumentException(field + " must be between 1 and 10");
        }
    }

    private String inferVerdict(CandidateEvaluation evaluation) {
        double composite = evaluation.compositeScore();
        if (composite >= 7.0) {
            return "ADVANCE";
        }
        if (composite >= 5.0) {
            return "HOLD";
        }
        return "REJECT";
    }
}
