package com.placeprep.repository;

import com.placeprep.model.TimetableVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("legacyTimetableVersionRepository")
public interface TimetableVersionRepository extends JpaRepository<TimetableVersion, Long> {
    List<TimetableVersion> findByTimetableIdOrderByVersionNumberDesc(Long timetableId);
}
