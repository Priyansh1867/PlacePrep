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

    public InterviewExperience getByExperienceId(String experienceId) {
        return interviewExperienceRepository.findByExperienceId(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));
    }

    public InterviewExperience create(InterviewExperience experience) {
        if (experience.getExperienceId() == null || experience.getExperienceId().trim().isEmpty()) {
            experience.setExperienceId("exp-" + System.currentTimeMillis());
        }
        if (experience.getModerationStatus() == null) {
            experience.setModerationStatus("APPROVED");
        }
        return interviewExperienceRepository.save(experience);
    }

    public InterviewExperience voteHelpful(String experienceId) {
        InterviewExperience exp = getByExperienceId(experienceId);
        exp.setHelpfulVotes(exp.getHelpfulVotes() + 1);
        return interviewExperienceRepository.save(exp);
    }

    public InterviewExperience reportExperience(String experienceId, String reason) {
        InterviewExperience exp = getByExperienceId(experienceId);
        exp.setReported(true);
        exp.setReportReason(reason);
        return interviewExperienceRepository.save(exp);
    }

    public InterviewExperience moderateExperience(String experienceId, String status) {
        InterviewExperience exp = getByExperienceId(experienceId);
        exp.setModerationStatus(status != null ? status.toUpperCase() : "APPROVED");
        if ("APPROVED".equalsIgnoreCase(status)) {
            exp.setReported(false);
            exp.setVerified(true);
        }
        return interviewExperienceRepository.save(exp);
    }
}
