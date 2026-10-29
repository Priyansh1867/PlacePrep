package com.placeprep.repository;

import com.placeprep.model.ClassAttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassAttendanceRecordRepository extends JpaRepository<ClassAttendanceRecord, Long> {
    List<ClassAttendanceRecord> findBySessionId(Long sessionId);
    List<ClassAttendanceRecord> findByStudentId(String studentId);
    List<ClassAttendanceRecord> findByStudentIdOrderByRecordedAtDesc(String studentId);
    List<ClassAttendanceRecord> findByStudentIdAndSubjectCode(String studentId, String subjectCode);
    Optional<ClassAttendanceRecord> findBySessionIdAndStudentId(Long sessionId, String studentId);
    boolean existsBySessionIdAndStudentId(Long sessionId, String studentId);
}
