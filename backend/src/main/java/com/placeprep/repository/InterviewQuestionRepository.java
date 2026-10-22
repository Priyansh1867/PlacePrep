package com.placeprep.repository;

import com.placeprep.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    Optional<InterviewQuestion> findByQuestionId(String questionId);
    List<InterviewQuestion> findByCompanyId(String companyId);
    List<InterviewQuestion> findByCompanyIdAndRound(String companyId, String round);
    List<InterviewQuestion> findByRound(String round);
    List<InterviewQuestion> findByCodingStatementIsNotNull();
}
