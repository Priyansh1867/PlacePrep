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
}
