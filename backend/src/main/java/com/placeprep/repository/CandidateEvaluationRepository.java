package com.placeprep.repository;

import com.placeprep.model.CandidateEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateEvaluationRepository extends JpaRepository<CandidateEvaluation, Long> {

    List<CandidateEvaluation> findByApplicationIdAndRoundNumber(String applicationId, Integer roundNumber);

    List<CandidateEvaluation> findByDriveIdAndRoundNumber(String driveId, Integer roundNumber);

    Optional<CandidateEvaluation> findTopByApplicationIdAndRoundNumberOrderBySubmittedAtDesc(
            String applicationId,
            Integer roundNumber
    );
}
