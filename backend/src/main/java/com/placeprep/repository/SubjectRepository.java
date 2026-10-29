package com.placeprep.repository;

import com.placeprep.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
    List<Subject> findByDepartmentAndSemester(String department, String semester);
    List<Subject> findByDepartment(String department);
}
