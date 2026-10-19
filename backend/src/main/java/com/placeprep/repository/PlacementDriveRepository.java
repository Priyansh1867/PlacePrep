package com.placeprep.repository;

import com.placeprep.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    List<PlacementDrive> findByCompanyId(String companyId);

    @Query("SELECT d FROM PlacementDrive d JOIN d.eligibleBatches b WHERE b = :batch")
    List<PlacementDrive> findByEligibleBatch(@Param("batch") String batch);
}
