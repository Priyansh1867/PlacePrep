package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.FacultyAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyAliasRepository extends JpaRepository<FacultyAlias, Long> {

    Optional<FacultyAlias> findByNormalizedAlias(String normalizedAlias);

    List<FacultyAlias> findByFacultyId(Long facultyId);
}

