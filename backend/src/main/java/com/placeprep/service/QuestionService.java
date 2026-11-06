package com.placeprep.service;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.InterviewQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAll() {
        return EntityResponseMapper.toDtoList(interviewQuestionRepository.findAll());
    }

    public List<EntityResponseDto> getByCompanyId(String companyId) {
        return EntityResponseMapper.toDtoList(interviewQuestionRepository.findByCompanyId(companyId));
    }

    public List<EntityResponseDto> getByCompanyIdAndRound(String companyId, String round) {
        return EntityResponseMapper.toDtoList(interviewQuestionRepository.findByCompanyIdAndRound(companyId, round));
    }

    public List<EntityResponseDto> getByRound(String round) {
        return EntityResponseMapper.toDtoList(interviewQuestionRepository.findByRound(round));
    }

    public EntityResponseDto getByQuestionId(String questionId) {
        return EntityResponseMapper.toDto(interviewQuestionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with questionId: " + questionId)));
    }

    @Transactional
    public EntityResponseDto create(InterviewQuestion question) {
        return EntityResponseMapper.toDto(interviewQuestionRepository.save(question));
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return interviewQuestionRepository.findAll().stream()
                .map(InterviewQuestion::getCategory)
                .filter(c -> c != null && !c.trim().isEmpty())
                .distinct()
                .toList();
    }

    @Transactional
    public EntityResponseDto update(String questionId, InterviewQuestion updatedData) {
        InterviewQuestion q = interviewQuestionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with questionId: " + questionId));
        if (updatedData.getQuestion() != null) q.setQuestion(updatedData.getQuestion());
        if (updatedData.getCategory() != null) q.setCategory(updatedData.getCategory());
        if (updatedData.getDifficulty() != null) q.setDifficulty(updatedData.getDifficulty());
        if (updatedData.getRound() != null) q.setRound(updatedData.getRound());
        if (updatedData.getApproach() != null) q.setApproach(updatedData.getApproach());
        if (updatedData.getSuggestedAnswer() != null) q.setSuggestedAnswer(updatedData.getSuggestedAnswer());
        if (updatedData.getSampleCode() != null) q.setSampleCode(updatedData.getSampleCode());
        if (updatedData.getCompanyId() != null) q.setCompanyId(updatedData.getCompanyId());
        if (updatedData.getSkills() != null && !updatedData.getSkills().isEmpty()) q.setSkills(updatedData.getSkills());
        return EntityResponseMapper.toDto(interviewQuestionRepository.save(q));
    }

    @Transactional
    public void delete(String questionId) {
        InterviewQuestion q = interviewQuestionRepository.findByQuestionId(questionId).orElse(null);
        if (q != null) {
            interviewQuestionRepository.delete(q);
        } else {
            try {
                Long id = Long.parseLong(questionId);
                interviewQuestionRepository.findById(id).ifPresent(interviewQuestionRepository::delete);
            } catch (NumberFormatException ignored) {
            }
        }
    }
}
