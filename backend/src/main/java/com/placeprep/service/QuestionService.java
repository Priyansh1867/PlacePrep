package com.placeprep.service;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.InterviewQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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

    public List<InterviewQuestion> getByCategory(String category) {
        return interviewQuestionRepository.findAll().stream()
                .filter(q -> q.getCategory() != null && q.getCategory().equalsIgnoreCase(category.trim()))
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return interviewQuestionRepository.findAll().stream()
                .map(InterviewQuestion::getCategory)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(c -> !c.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public InterviewQuestion getByQuestionId(String questionId) {
        return interviewQuestionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with questionId: " + questionId));
    }

    public InterviewQuestion create(InterviewQuestion question) {
        if (question.getQuestionId() == null || question.getQuestionId().trim().isEmpty()) {
            question.setQuestionId("q-" + System.currentTimeMillis());
        }
        return interviewQuestionRepository.save(question);
    }

    public InterviewQuestion update(String questionId, InterviewQuestion updated) {
        InterviewQuestion existing = getByQuestionId(questionId);
        if (updated.getQuestion() != null) existing.setQuestion(updated.getQuestion());
        if (updated.getApproach() != null) existing.setApproach(updated.getApproach());
        if (updated.getSuggestedAnswer() != null) existing.setSuggestedAnswer(updated.getSuggestedAnswer());
        if (updated.getSampleCode() != null) existing.setSampleCode(updated.getSampleCode());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getDifficulty() != null) existing.setDifficulty(updated.getDifficulty());
        if (updated.getRound() != null) existing.setRound(updated.getRound());
        if (updated.getCompanyId() != null) existing.setCompanyId(updated.getCompanyId());
        if (updated.getSkills() != null) existing.setSkills(updated.getSkills());
        if (updated.getFollowUps() != null) existing.setFollowUps(updated.getFollowUps());
        if (updated.getFrequencyScore() > 0) existing.setFrequencyScore(updated.getFrequencyScore());
        existing.setVerifiedHistorical(updated.isVerifiedHistorical());
        return interviewQuestionRepository.save(existing);
    }

    public void delete(String questionId) {
        InterviewQuestion existing = getByQuestionId(questionId);
        interviewQuestionRepository.delete(existing);
    }
}
