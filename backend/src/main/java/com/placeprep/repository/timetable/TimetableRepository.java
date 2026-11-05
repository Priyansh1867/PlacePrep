package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.Timetable;
import com.placeprep.model.timetable.TimetableSourceType;
import com.placeprep.model.timetable.TimetableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long>, JpaSpecificationExecutor<Timetable> {

    @Query("SELECT t FROM Timetable t WHERE t.academicSession = :session AND t.term = :term " +
           "AND t.departmentCode = :dept AND t.semester = :sem AND t.status != 'ARCHIVED'")
    List<Timetable> findActiveConflicts(
            @Param("session") String academicSession,
            @Param("term") Term term,
            @Param("dept") String departmentCode,
            @Param("sem") Integer semester
    );

    List<Timetable> findByAcademicSessionAndTermAndStatusNot(String academicSession, Term term, TimetableStatus status);

    List<Timetable> findByAcademicSessionAndTermAndDepartmentCode(String academicSession, Term term, String departmentCode);

    Optional<Timetable> findByAcademicSessionAndTermAndDepartmentCodeAndSemesterAndStatus(
            String academicSession, Term term, String departmentCode, Integer semester, TimetableStatus status
    );

    List<Timetable> findByDepartmentCode(String departmentCode);

    List<Timetable> findByDepartmentCodeAndStatus(String departmentCode, TimetableStatus status);

    Optional<Timetable> findByIdAndStatus(Long id, TimetableStatus status);

    List<Timetable> findByStatus(TimetableStatus status);


    boolean existsByTitleAndSourceType(String title, TimetableSourceType sourceType);
}

