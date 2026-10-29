package com.placeprep.repository;

import com.placeprep.model.StudentSubjectEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubjectEnrollmentRepository extends JpaRepository<StudentSubjectEnrollment, Long> {
    List<StudentSubjectEnrollment> findByStudentEmail(String studentEmail);
    List<StudentSubjectEnrollment> findBySubjectCode(String subjectCode);
    Optional<StudentSubjectEnrollment> findByStudentEmailAndSubjectCode(String studentEmail, String subjectCode);
    boolean existsByStudentEmailAndSubjectCode(String studentEmail, String subjectCode);
}
