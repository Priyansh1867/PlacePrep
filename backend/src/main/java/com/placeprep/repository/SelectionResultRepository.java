package com.placeprep.repository;

import com.placeprep.model.SelectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SelectionResultRepository extends JpaRepository<SelectionResult, Long> {

    Optional<SelectionResult> findByApplicationId(String applicationId);

    List<SelectionResult> findByDriveIdAndCurrentRoundNumberAndPipelineStatus(
            String driveId,
            Integer currentRoundNumber,
            String pipelineStatus
    );

    List<SelectionResult> findByDriveIdAndPipelineStatus(String driveId, String pipelineStatus);
}
