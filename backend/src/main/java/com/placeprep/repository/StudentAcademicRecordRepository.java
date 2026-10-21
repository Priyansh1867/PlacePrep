package com.placeprep.repository;

import com.placeprep.model.StudentAcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentAcademicRecordRepository extends JpaRepository<StudentAcademicRecord, Long> {

    Optional<StudentAcademicRecord> findByEmail(String email);

    Optional<StudentAcademicRecord> findByStudentId(String studentId);
}
