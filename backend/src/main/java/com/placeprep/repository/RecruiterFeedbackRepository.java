package com.placeprep.repository;

import com.placeprep.model.RecruiterFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterFeedbackRepository extends JpaRepository<RecruiterFeedback, Long> {
    List<RecruiterFeedback> findByDriveIdOrderBySubmittedAtDesc(String driveId);
    List<RecruiterFeedback> findAllByOrderBySubmittedAtDesc();
}
