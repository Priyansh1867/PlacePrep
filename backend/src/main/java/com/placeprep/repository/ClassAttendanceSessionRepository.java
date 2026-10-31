package com.placeprep.repository;

import com.placeprep.model.ClassAttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassAttendanceSessionRepository extends JpaRepository<ClassAttendanceSession, Long> {
    List<ClassAttendanceSession> findByDepartmentAndSemesterOrderBySessionDateDesc(String department, String semester);
    List<ClassAttendanceSession> findBySubjectCodeOrderBySessionDateDesc(String subjectCode);
    List<ClassAttendanceSession> findBySubjectCodeOrderByLectureNumberAsc(String subjectCode);
    List<ClassAttendanceSession> findBySubjectCodeAndStatus(String subjectCode, String status);
    List<ClassAttendanceSession> findByFacultyIdOrderBySessionDateDesc(String facultyId);
    List<ClassAttendanceSession> findByDepartmentAndSemesterAndSubjectCodeOrderBySessionDateDesc(String department, String semester, String subjectCode);
    Optional<ClassAttendanceSession> findFirstByDepartmentAndSemesterAndSubjectCodeAndSessionDate(String department, String semester, String subjectCode, String sessionDate);
    List<ClassAttendanceSession> findByDepartmentAndSemesterAndStatus(String department, String semester, String status);
    List<ClassAttendanceSession> findBySubjectCodeAndSessionDateOrderByPeriodNumberAsc(String subjectCode, String sessionDate);
}
