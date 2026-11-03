package com.placeprep.repository;

import com.placeprep.model.PlacementStudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlacementStudentProfileRepository extends JpaRepository<PlacementStudentProfile, Long> {

    Optional<PlacementStudentProfile> findByUserId(Long userId);

    Optional<PlacementStudentProfile> findByEmail(String email);

    boolean existsByUserId(Long userId);

    boolean existsByEmail(String email);
}
