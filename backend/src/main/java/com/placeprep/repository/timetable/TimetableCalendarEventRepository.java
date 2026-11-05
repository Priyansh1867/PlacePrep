package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.TimetableCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimetableCalendarEventRepository extends JpaRepository<TimetableCalendarEvent, Long> {

    @Query("SELECT e FROM TimetableCalendarEvent e WHERE e.startDate <= :endDate AND e.endDate >= :startDate ORDER BY e.startDate ASC")
    List<TimetableCalendarEvent> findOverlapping(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM TimetableCalendarEvent e WHERE e.startDate <= :endDate AND e.endDate >= :startDate " +
            "AND (:kind IS NULL OR e.kind = :kind) " +
            "AND (:department IS NULL OR e.departmentCode = :department OR e.scope = 'WHOLE_INSTITUTE') " +
            "ORDER BY e.startDate ASC")
    List<TimetableCalendarEvent> findWithFilters(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("kind") CalendarEventKind kind,
            @Param("department") String department
    );

    @Query("SELECT e FROM TimetableCalendarEvent e WHERE e.startDate <= :date AND e.endDate >= :date " +
            "AND (e.scope = 'WHOLE_INSTITUTE' " +
            "     OR (e.scope = 'DEPARTMENT' AND (:dept IS NULL OR e.departmentCode = :dept)) " +
            "     OR (e.scope = 'YEAR_SECTION' AND (:dept IS NULL OR e.departmentCode = :dept) " +
            "         AND (:year IS NULL OR e.yearOfStudy IS NULL OR e.yearOfStudy = :year) " +
            "         AND (:section IS NULL OR e.sectionName IS NULL OR e.sectionName = :section))) " +
            "ORDER BY e.startDate ASC")
    List<TimetableCalendarEvent> findApplicableForDate(
            @Param("date") LocalDate date,
            @Param("dept") String dept,
            @Param("year") Integer year,
            @Param("section") String section
    );

    @Query("SELECT e FROM TimetableCalendarEvent e WHERE e.startDate <= :endDate AND e.endDate >= :startDate " +
            "AND (e.scope = 'WHOLE_INSTITUTE' " +
            "     OR (e.scope = 'DEPARTMENT' AND (:dept IS NULL OR e.departmentCode = :dept)) " +
            "     OR (e.scope = 'YEAR_SECTION' AND (:dept IS NULL OR e.departmentCode = :dept) " +
            "         AND (:year IS NULL OR e.yearOfStudy IS NULL OR e.yearOfStudy = :year) " +
            "         AND (:section IS NULL OR e.sectionName IS NULL OR e.sectionName = :section))) " +
            "ORDER BY e.startDate ASC")
    List<TimetableCalendarEvent> findApplicableForDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dept") String dept,
            @Param("year") Integer year,
            @Param("section") String section
    );
}

