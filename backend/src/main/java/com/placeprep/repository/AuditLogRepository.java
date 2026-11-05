package com.placeprep.repository;

import com.placeprep.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(a.action LIKE 'TIMETABLE_%' OR a.action LIKE 'SLOT_%' OR a.action LIKE '%_TIMETABLE' OR a.action LIKE '%_OVERRIDE%' OR a.targetResource LIKE 'tt_timetable%' OR a.targetResource LIKE 'Slot:%' OR a.targetResource LIKE 'Timetable:%' OR a.targetResource LIKE 'ImportJob:%') " +
           "AND (:user IS NULL OR :user = '' OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :user, '%'))) " +
           "AND (:startDate IS NULL OR :startDate = '' OR a.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR :endDate = '' OR a.timestamp <= :endDate) " +
           "AND (:timetableIdStr IS NULL OR :timetableIdStr = '' OR a.targetResource LIKE CONCAT('%', :timetableIdStr, '%') OR a.details LIKE CONCAT('%', :timetableIdStr, '%')) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findTimetableAuditLogs(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("user") String user,
            @Param("timetableIdStr") String timetableIdStr
    );
}
