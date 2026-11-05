package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetableStudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableStudentGroupRepository extends JpaRepository<TimetableStudentGroup, Long> {

    List<TimetableStudentGroup> findByTimetableId(Long timetableId);

    Optional<TimetableStudentGroup> findByTimetableIdAndRollNumber(Long timetableId, String rollNumber);

    Optional<TimetableStudentGroup> findByTimetableIdAndUserId(Long timetableId, Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT sg FROM TimetableStudentGroup sg JOIN sg.timetable t WHERE sg.user.id = :userId AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableStudentGroup> findPublishedByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT sg FROM TimetableStudentGroup sg JOIN sg.timetable t WHERE sg.rollNumber = :rollNumber AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableStudentGroup> findPublishedByRollNumber(@org.springframework.data.repository.query.Param("rollNumber") String rollNumber);

    List<TimetableStudentGroup> findByTimetableIdAndSectionId(Long timetableId, Long sectionId);


    boolean existsBySectionId(Long sectionId);

    boolean existsByLabGroupId(Long labGroupId);

    void deleteByTimetableId(Long timetableId);
}

