package com.placeprep.repository;

import com.placeprep.model.CrtAttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrtAttendanceRecordRepository extends JpaRepository<CrtAttendanceRecord, Long> {
    List<CrtAttendanceRecord> findByCrtSessionId(Long crtSessionId);
    List<CrtAttendanceRecord> findByStudentId(String studentId);
    Optional<CrtAttendanceRecord> findByCrtSessionIdAndStudentId(Long crtSessionId, String studentId);
}
