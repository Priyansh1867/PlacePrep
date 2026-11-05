package com.placeprep.repository;

import com.placeprep.model.OffCampusJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffCampusJobRepository extends JpaRepository<OffCampusJob, Long> {
    List<OffCampusJob> findAllByOrderByApplicationDeadlineAsc();
}

