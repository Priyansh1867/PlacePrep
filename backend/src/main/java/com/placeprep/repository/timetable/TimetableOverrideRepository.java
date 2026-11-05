package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.OverrideStatus;
import com.placeprep.model.timetable.TimetableOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimetableOverrideRepository extends JpaRepository<TimetableOverride, Long> {

    List<TimetableOverride> findBySlotId(Long slotId);

    List<TimetableOverride> findByOnDate(LocalDate onDate);

    List<TimetableOverride> findBySlotIdAndOnDate(Long slotId, LocalDate onDate);

    List<TimetableOverride> findByStatus(OverrideStatus status);

    List<TimetableOverride> findBySlotIdInAndOnDateAndStatus(java.util.Collection<Long> slotIds, LocalDate onDate, OverrideStatus status);

    List<TimetableOverride> findBySlotIdInAndOnDateBetweenAndStatus(java.util.Collection<Long> slotIds, LocalDate startDate, LocalDate endDate, OverrideStatus status);

    List<TimetableOverride> findBySlotIdInAndStatus(java.util.Collection<Long> slotIds, OverrideStatus status);

    List<TimetableOverride> findByRequestedBy(String requestedBy);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM TimetableOverride o JOIN o.slot s JOIN s.timetable t WHERE t.departmentCode = :dept")
    List<TimetableOverride> findByDepartmentCode(@org.springframework.data.repository.query.Param("dept") String departmentCode);

}

