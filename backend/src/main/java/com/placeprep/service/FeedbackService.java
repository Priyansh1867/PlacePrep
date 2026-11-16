package com.placeprep.service;

import com.placeprep.model.Feedback;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public FeedbackService() {
    }

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAll() {
        return EntityResponseMapper.toDtoList(feedbackRepository.findAll());
    }

    @Transactional
    public EntityResponseDto submit(Feedback feedback) {
        if (feedback.getFeedbackId() == null || feedback.getFeedbackId().trim().isEmpty()) {
            feedback.setFeedbackId("FB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (feedback.getDate() == null || feedback.getDate().trim().isEmpty()) {
            feedback.setDate(LocalDate.now().toString());
        }
        return EntityResponseMapper.toDto(feedbackRepository.save(feedback));
    }

    @Autowired
    private com.placeprep.repository.RecruiterFeedbackRepository recruiterFeedbackRepo;

    @Autowired
    private com.placeprep.repository.PlacementDriveRepository placementDriveRepo;

    @Transactional
    public EntityResponseDto submitRecruiterFeedback(com.placeprep.model.RecruiterFeedback fb, com.placeprep.model.User caller) {
        if (caller != null && ("HR".equalsIgnoreCase(caller.getRole()) || "RECRUITER".equalsIgnoreCase(caller.getRole()))) {
            String authorizedCompany = caller.getResolvedCompany();
            if (authorizedCompany.isEmpty()) {
                throw new org.springframework.security.access.AccessDeniedException("Recruiter account is not associated with an authorized company.");
            }
            if (fb.getCompanyName() == null || !fb.getCompanyName().trim().equalsIgnoreCase(authorizedCompany)) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Recruiters can only submit assessments for their associated company: " + authorizedCompany);
            }
            if (fb.getDriveId() != null && !fb.getDriveId().trim().isEmpty()) {
                var driveOpt = placementDriveRepo.findByDriveId(fb.getDriveId().trim());
                if (driveOpt.isPresent()) {
                    String driveComp = driveOpt.get().getCompanyName();
                    if (driveComp != null && !driveComp.trim().equalsIgnoreCase(authorizedCompany)) {
                        throw new org.springframework.security.access.AccessDeniedException("Selected drive does not belong to your company: " + authorizedCompany);
                    }
                }
            }
            fb.setRecruiterName(caller.getName());
            fb.setRecruiterEmail(caller.getEmail());
            fb.setCompanyName(authorizedCompany);
        }

        if (fb.getOverallRating() == null || fb.getOverallRating() < 1 || fb.getOverallRating() > 5) {
            throw new IllegalArgumentException("Overall rating must be between 1 and 5.");
        }

        String remarks = fb.getHiringRemarks() != null ? fb.getHiringRemarks().trim() : "";
        if (remarks.length() < 10 || remarks.length() > 2000) {
            throw new IllegalArgumentException("Hiring remarks must be between 10 and 2000 characters.");
        }

        if (fb.getSubmittedAt() == null || fb.getSubmittedAt().trim().isEmpty()) {
            fb.setSubmittedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        return EntityResponseMapper.toDto(recruiterFeedbackRepo.save(fb));
    }

    @Transactional
    public EntityResponseDto submitRecruiterFeedback(com.placeprep.model.RecruiterFeedback fb) {
        return submitRecruiterFeedback(fb, null);
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAllRecruiterFeedback(String driveId, com.placeprep.model.User caller) {
        if (caller != null && ("HR".equalsIgnoreCase(caller.getRole()) || "RECRUITER".equalsIgnoreCase(caller.getRole()))) {
            String authorizedCompany = caller.getResolvedCompany();
            if (authorizedCompany.isEmpty()) {
                return java.util.Collections.emptyList();
            }
            return EntityResponseMapper.toDtoList(recruiterFeedbackRepo.findByCompanyNameIgnoreCaseOrderBySubmittedAtDesc(authorizedCompany));
        }
        if (driveId != null && !driveId.trim().isEmpty()) {
            return EntityResponseMapper.toDtoList(recruiterFeedbackRepo.findByDriveIdOrderBySubmittedAtDesc(driveId));
        }
        return EntityResponseMapper.toDtoList(recruiterFeedbackRepo.findAllByOrderBySubmittedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAllRecruiterFeedback(String driveId) {
        return getAllRecruiterFeedback(driveId, null);
    }
}
