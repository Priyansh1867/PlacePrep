package com.placeprep.repository;

import com.placeprep.model.MasterTimetable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterTimetableRepository extends JpaRepository<MasterTimetable, Long> {

    long countByStatus(String status);

    Optional<MasterTimetable> findTopByOrderByLastUpdatedDesc();

    List<MasterTimetable> findByStatusOrderByLastUpdatedDesc(String status);

    @Query("SELECT t FROM MasterTimetable t WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(t.department) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(t.branch) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:academicSession IS NULL OR :academicSession = '' OR t.academicSession = :academicSession) AND " +
            "(:branch IS NULL OR :branch = '' OR LOWER(t.branch) = LOWER(:branch) OR LOWER(t.department) LIKE LOWER(CONCAT('%', :branch, '%'))) AND " +
            "(:semester IS NULL OR :semester = '' OR LOWER(t.semester) = LOWER(:semester)) AND " +
            "(:year IS NULL OR :year = '' OR LOWER(t.academicYear) = LOWER(:year)) AND " +
            "(:section IS NULL OR :section = '' OR LOWER(t.section) = LOWER(:section) OR t.section = 'All Sections') AND " +
            "(:status IS NULL OR :status = '' OR UPPER(t.status) = UPPER(:status)) " +
            "ORDER BY t.lastUpdated DESC")
    Page<MasterTimetable> findWithFilters(
            @Param("search") String search,
            @Param("academicSession") String academicSession,
            @Param("branch") String branch,
            @Param("semester") String semester,
            @Param("year") String year,
            @Param("section") String section,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT t FROM MasterTimetable t WHERE t.status = 'PUBLISHED' AND " +
            "(:branch IS NULL OR :branch = '' OR LOWER(t.branch) = LOWER(:branch) OR LOWER(t.department) LIKE LOWER(CONCAT('%', :branch, '%')) OR LOWER(t.department) = 'all') AND " +
            "(:semester IS NULL OR :semester = '' OR LOWER(t.semester) = LOWER(:semester) OR LOWER(t.semester) = 'all') " +
            "ORDER BY t.effectiveStartDate DESC, t.lastUpdated DESC")
    List<MasterTimetable> findActiveForStudent(
            @Param("branch") String branch,
            @Param("semester") String semester
    );
}
