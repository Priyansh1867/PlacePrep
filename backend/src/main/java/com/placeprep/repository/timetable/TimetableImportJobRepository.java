package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.ImportJobStatus;
import com.placeprep.model.timetable.TimetableImportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableImportJobRepository extends JpaRepository<TimetableImportJob, Long> {

    List<TimetableImportJob> findByStatus(ImportJobStatus status);

    List<TimetableImportJob> findAllByOrderByCreatedAtDesc();
}

