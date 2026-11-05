package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.TimetableLabGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableLabGroupRepository extends JpaRepository<TimetableLabGroup, Long> {

    List<TimetableLabGroup> findBySectionIdOrderByCodeAsc(Long sectionId);

    Optional<TimetableLabGroup> findBySectionIdAndCode(Long sectionId, String code);

    boolean existsByMentorId(Long mentorId);

    void deleteBySectionId(Long sectionId);
}

