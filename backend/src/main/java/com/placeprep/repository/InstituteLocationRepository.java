package com.placeprep.repository;

import com.placeprep.model.InstituteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InstituteLocationRepository extends JpaRepository<InstituteLocation, Long> {
    Optional<InstituteLocation> findTopByLocationStatusOrderByUpdatedAtDesc(String status);
    Optional<InstituteLocation> findTopByOrderByUpdatedAtDesc();
}
