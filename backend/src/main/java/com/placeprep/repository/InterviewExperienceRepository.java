package com.placeprep.repository;

import com.placeprep.model.InterviewExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Long> {
    List<InterviewExperience> findByCompanyId(String companyId);
    List<InterviewExperience> findByBatch(String batch);
}
