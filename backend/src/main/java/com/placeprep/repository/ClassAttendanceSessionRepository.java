package com.placeprep.repository;

import com.placeprep.model.ClassAttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassAttendanceSessionRepository extends JpaRepository<ClassAttendanceSession, Long> {
    List<ClassAttendanceSession> findByDepartmentAndSemesterOrderBySessionDateDesc(String department, String semester);
    List<ClassAttendanceSession> findBySubjectCodeOrderBySessionDateDesc(String subjectCode);
    List<ClassAttendanceSession> findByFacultyIdOrderBySessionDateDesc(String facultyId);
}
