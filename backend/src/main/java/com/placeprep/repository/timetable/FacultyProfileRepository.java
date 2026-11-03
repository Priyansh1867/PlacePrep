package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {

    Optional<FacultyProfile> findByDepartmentCodeAndShortCode(String departmentCode, String shortCode);

    Optional<FacultyProfile> findByEmail(String email);

    Optional<FacultyProfile> findByEmailIgnoreCase(String email);

    List<FacultyProfile> findByFullNameContainingIgnoreCase(String name);

    Optional<FacultyProfile> findByUserId(Long userId);

    List<FacultyProfile> findByDepartmentCode(String departmentCode);

    List<FacultyProfile> findByUserIdIsNull();

    List<FacultyProfile> findByDepartmentCodeAndActiveTrue(String departmentCode);

}

