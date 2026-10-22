package com.placeprep.repository;

import com.placeprep.model.CodingSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    Page<CodingSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId, Pageable pageable);

    Page<CodingSubmission> findByStudentIdAndProblemIdOrderBySubmittedAtDesc(
            Long studentId, String problemId, Pageable pageable);

    Optional<CodingSubmission> findByIdAndStudentId(Long id, Long studentId);

    List<CodingSubmission> findByStudentIdAndSubmissionType(Long studentId, String submissionType);
}
