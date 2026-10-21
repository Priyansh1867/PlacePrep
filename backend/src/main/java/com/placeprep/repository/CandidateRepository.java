package com.placeprep.repository;

import com.placeprep.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByCandidateId(String candidateId);
    List<Candidate> findByCompanyId(String companyId);
    List<Candidate> findByCurrentRound(String currentRound);
    List<Candidate> findByCompanyIdAndCurrentRound(String companyId, String currentRound);
}
