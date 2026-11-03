package com.placeprep.service;

import com.placeprep.model.InterviewExperience;
import com.placeprep.repository.InterviewExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public List<InterviewExperience> getAll() {
        return interviewExperienceRepository.findAll();
    }

    public List<InterviewExperience> getByCompanyId(String companyId) {
        return interviewExperienceRepository.findByCompanyId(companyId);
    }

    public List<InterviewExperience> getByBatch(String batch) {
        return interviewExperienceRepository.findByBatch(batch);
    }

    public InterviewExperience create(InterviewExperience experience) {
        return interviewExperienceRepository.save(experience);
    }
}
