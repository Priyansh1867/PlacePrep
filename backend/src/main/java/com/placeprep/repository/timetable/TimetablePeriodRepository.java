package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetablePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetablePeriodRepository extends JpaRepository<TimetablePeriod, Long> {

    List<TimetablePeriod> findByTimetableIdOrderByPeriodIndexAsc(Long timetableId);

    Optional<TimetablePeriod> findByTimetableIdAndPeriodIndex(Long timetableId, Integer periodIndex);

    void deleteByTimetableId(Long timetableId);
}

