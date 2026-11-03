package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.SubjectKind;
import com.placeprep.model.timetable.TimetableSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableSubjectRepository extends JpaRepository<TimetableSubject, Long> {

    List<TimetableSubject> findByDepartmentCodeAndSemester(String departmentCode, Integer semester);

    Optional<TimetableSubject> findByDepartmentCodeAndRtuCodeAndKind(String departmentCode, String rtuCode, SubjectKind kind);

    Optional<TimetableSubject> findByDepartmentCodeAndShortCode(String departmentCode, String shortCode);

    List<TimetableSubject> findByDepartmentCode(String departmentCode);
}

