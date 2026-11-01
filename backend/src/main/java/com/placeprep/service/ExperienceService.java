package com.placeprep.service;

import com.placeprep.model.InterviewExperience;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.InterviewExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExperienceService {

    @Autowired
    private InterviewExperienceRepository interviewExperienceRepository;

    public ExperienceService() {
    }

    public ExperienceService(InterviewExperienceRepository interviewExperienceRepository) {
        this.interviewExperienceRepository = interviewExperienceRepository;
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAll() {
        return EntityResponseMapper.toDtoList(interviewExperienceRepository.findAll());
    }

    public List<EntityResponseDto> getByCompanyId(String companyId) {
        return EntityResponseMapper.toDtoList(interviewExperienceRepository.findByCompanyId(companyId));
    }

    public List<EntityResponseDto> getByBatch(String batch) {
        return EntityResponseMapper.toDtoList(interviewExperienceRepository.findByBatch(batch));
    }

    @Transactional
    public EntityResponseDto create(InterviewExperience experience) {
        return EntityResponseMapper.toDto(interviewExperienceRepository.save(experience));
    }
}
