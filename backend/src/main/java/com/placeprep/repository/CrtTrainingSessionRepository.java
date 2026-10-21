package com.placeprep.repository;

import com.placeprep.model.CrtTrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrtTrainingSessionRepository extends JpaRepository<CrtTrainingSession, Long> {
    List<CrtTrainingSession> findByTargetBatchOrderByScheduledDateDesc(String targetBatch);
    List<CrtTrainingSession> findByModuleTypeOrderByScheduledDateDesc(String moduleType);
    List<CrtTrainingSession> findAllByOrderByScheduledDateDesc();
}
