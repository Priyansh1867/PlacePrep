package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetableAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableAssignmentRepository extends JpaRepository<TimetableAssignment, Long> {

    List<TimetableAssignment> findByTimetableId(Long timetableId);

    List<TimetableAssignment> findByTimetableIdAndSectionId(Long timetableId, Long sectionId);

    boolean existsBySectionId(Long sectionId);
    boolean existsByLabGroupId(Long labGroupId);
    boolean existsBySubjectId(Long subjectId);

    @Query("SELECT COUNT(a) > 0 FROM TimetableAssignment a JOIN a.faculty f WHERE f.id = :facultyId")
    boolean existsByFacultyId(@Param("facultyId") Long facultyId);

    @Query("SELECT a FROM TimetableAssignment a JOIN a.faculty f WHERE a.timetable.id = :ttId AND a.section.id = :secId AND a.subject.id = :subId AND f.id = :facId")
    List<TimetableAssignment> findMatching(
            @Param("ttId") Long ttId,
            @Param("secId") Long secId,
            @Param("subId") Long subId,
            @Param("facId") Long facId
    );

    void deleteByTimetableId(Long timetableId);
}

