package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetableVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableVersionRepository extends JpaRepository<TimetableVersion, Long> {

    List<TimetableVersion> findByTimetableIdOrderByVersionNoDesc(Long timetableId);

    Optional<TimetableVersion> findByTimetableIdAndVersionNo(Long timetableId, Integer versionNo);

    void deleteByTimetableId(Long timetableId);
}

