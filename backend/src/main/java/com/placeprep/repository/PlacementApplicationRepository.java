package com.placeprep.repository;

import com.placeprep.model.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
    List<PlacementApplication> findByUserId(Long userId);
    Optional<PlacementApplication> findByUserIdAndDriveId(Long userId, String driveId);
    List<PlacementApplication> findByDriveId(String driveId);
}
