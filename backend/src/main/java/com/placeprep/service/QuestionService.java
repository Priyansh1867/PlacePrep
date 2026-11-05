package com.placeprep.service;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.InterviewQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    public QuestionService() {
    }

    public QuestionService(InterviewQuestionRepository interviewQuestionRepository) {
        this.interviewQuestionRepository = interviewQuestionRepository;
    }

    public List<InterviewQuestion> getAll() {
        return interviewQuestionRepository.findAll();
    }

    public List<InterviewQuestion> getByCompanyId(String companyId) {
        return interviewQuestionRepository.findByCompanyId(companyId);
    }

    public List<InterviewQuestion> getByCompanyIdAndRound(String companyId, String round) {
        return interviewQuestionRepository.findByCompanyIdAndRound(companyId, round);
    }

    public List<InterviewQuestion> getByRound(String round) {
        return interviewQuestionRepository.findByRound(round);
    }

    public InterviewQuestion getByQuestionId(String questionId) {
        return interviewQuestionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with questionId: " + questionId));
    }

    public InterviewQuestion create(InterviewQuestion question) {
        return interviewQuestionRepository.save(question);
    }
}
