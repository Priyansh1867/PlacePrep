package com.placeprep.repository;

import com.placeprep.model.LocationUpdateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationUpdateHistoryRepository extends JpaRepository<LocationUpdateHistory, Long> {
    List<LocationUpdateHistory> findByInstituteLocationIdOrderByUpdatedAtDesc(Long instituteLocationId);
    List<LocationUpdateHistory> findAllByOrderByUpdatedAtDesc();
}
