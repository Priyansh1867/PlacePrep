package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"subject", "section", "labGroup", "room", "faculty"})
    List<TimetableSlot> findByTimetableId(Long timetableId);

    List<TimetableSlot> findByTimetableIdIn(Collection<Long> timetableIds);

    List<TimetableSlot> findByTimetableIdAndSectionIdAndDayOfWeek(Long timetableId, Long sectionId, Integer dayOfWeek);

    List<TimetableSlot> findByTimetableIdAndDayOfWeekAndStartPeriod(Long timetableId, Integer dayOfWeek, Integer startPeriod);

    List<TimetableSlot> findByTimetableIdAndRoomId(Long timetableId, Long roomId);

    @Query("SELECT s FROM TimetableSlot s JOIN s.faculty f WHERE s.timetable.id = :ttId AND f.id = :facId")
    List<TimetableSlot> findByTimetableIdAndFacultyId(@Param("ttId") Long timetableId, @Param("facId") Long facultyId);

    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE t.academicSession = :session AND t.term = :term AND t.status != com.placeprep.model.timetable.TimetableStatus.ARCHIVED")
    List<TimetableSlot> findActiveSlotsForSessionAndTerm(@Param("session") String session, @Param("term") Term term);

    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE t.academicSession = :session AND t.term = :term AND t.status != com.placeprep.model.timetable.TimetableStatus.ARCHIVED")
    List<TimetableSlot> findByAcademicSessionAndTermNonArchived(@Param("session") String session, @Param("term") Term term);

    boolean existsBySectionId(Long sectionId);
    boolean existsByLabGroupId(Long labGroupId);
    boolean existsBySubjectId(Long subjectId);
    boolean existsByRoomId(Long roomId);

    @Query("SELECT COUNT(s) > 0 FROM TimetableSlot s JOIN s.faculty f WHERE f.id = :facultyId")
    boolean existsByFacultyId(@Param("facultyId") Long facultyId);

    List<TimetableSlot> findBySectionId(Long sectionId);
    List<TimetableSlot> findByLabGroupId(Long labGroupId);
    List<TimetableSlot> findBySubjectId(Long subjectId);
    List<TimetableSlot> findByRoomId(Long roomId);

    @Query("SELECT s FROM TimetableSlot s JOIN s.faculty f WHERE f.id = :facultyId")
    List<TimetableSlot> findByFacultyId(@Param("facultyId") Long facultyId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"subject", "section", "labGroup", "room", "faculty"})
    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t JOIN s.faculty f WHERE f.id = :facId AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableSlot> findPublishedSlotsByFacultyId(@Param("facId") Long facultyId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"subject", "section", "labGroup", "room", "faculty"})
    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE s.section.id = :sectionId AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableSlot> findPublishedSlotsBySectionId(@Param("sectionId") Long sectionId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"subject", "section", "labGroup", "room", "faculty"})
    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE s.room.id = :roomId AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableSlot> findPublishedSlotsByRoomId(@Param("roomId") Long roomId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"subject", "section", "labGroup", "room", "faculty"})
    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE t.id = :timetableId AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableSlot> findPublishedSlotsByTimetableId(@Param("timetableId") Long timetableId);

    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE t.departmentCode = :dept AND t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED")
    List<TimetableSlot> findPublishedSlotsByDepartmentCode(@Param("dept") String departmentCode);

    @Query("SELECT s FROM TimetableSlot s JOIN s.timetable t WHERE t.status = com.placeprep.model.timetable.TimetableStatus.PUBLISHED AND s.dayOfWeek = :day AND :period BETWEEN s.startPeriod AND (s.startPeriod + s.span - 1)")
    List<TimetableSlot> findPublishedSlotsOccupyingPeriod(@Param("day") Integer day, @Param("period") Integer period);

    void deleteByTimetableId(Long timetableId);

}

