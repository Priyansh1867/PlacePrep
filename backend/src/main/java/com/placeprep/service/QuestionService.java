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
}
