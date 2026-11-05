package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetableSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableSectionRepository extends JpaRepository<TimetableSection, Long> {

    List<TimetableSection> findByTimetableIdOrderByNameAsc(Long timetableId);

    List<TimetableSection> findByTimetableId(Long timetableId);

    Optional<TimetableSection> findByTimetableIdAndName(Long timetableId, String name);

    boolean existsByHomeRoomId(Long roomId);

    boolean existsByClassCoordinatorId(Long coordinatorId);

    void deleteByTimetableId(Long timetableId);
}

