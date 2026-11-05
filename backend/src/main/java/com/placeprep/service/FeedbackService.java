package com.placeprep.service;

import com.placeprep.model.Feedback;
import com.placeprep.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public List<Feedback> getAll() {
        return feedbackRepository.findAll();
    }

    public Feedback submit(Feedback feedback) {
        if (feedback.getFeedbackId() == null || feedback.getFeedbackId().trim().isEmpty()) {
            feedback.setFeedbackId("FB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (feedback.getDate() == null || feedback.getDate().trim().isEmpty()) {
            feedback.setDate(LocalDate.now().toString());
        }
        return feedbackRepository.save(feedback);
    }

    @Autowired
    private com.placeprep.repository.RecruiterFeedbackRepository recruiterFeedbackRepo;

    public com.placeprep.model.RecruiterFeedback submitRecruiterFeedback(com.placeprep.model.RecruiterFeedback fb) {
        if (fb.getSubmittedAt() == null || fb.getSubmittedAt().trim().isEmpty()) {
            fb.setSubmittedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        return recruiterFeedbackRepo.save(fb);
    }

    public List<com.placeprep.model.RecruiterFeedback> getAllRecruiterFeedback(String driveId) {
        if (driveId != null && !driveId.trim().isEmpty()) {
            return recruiterFeedbackRepo.findByDriveIdOrderBySubmittedAtDesc(driveId);
        }
        return recruiterFeedbackRepo.findAllByOrderBySubmittedAtDesc();
    }
}
