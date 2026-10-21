package com.placeprep.repository;

import com.placeprep.model.DriveRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriveRoundRepository extends JpaRepository<DriveRound, Long> {

    List<DriveRound> findByDriveIdOrderByRoundNumberAsc(String driveId);

    Optional<DriveRound> findByDriveIdAndRoundNumber(String driveId, Integer roundNumber);

    void deleteByDriveId(String driveId);
}
