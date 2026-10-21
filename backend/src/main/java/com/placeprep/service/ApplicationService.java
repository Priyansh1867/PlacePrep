package com.placeprep.service;

import com.placeprep.model.PlacementApplication;
import com.placeprep.repository.PlacementApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    public ApplicationService() {
    }

    public ApplicationService(PlacementApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public List<PlacementApplication> getStudentApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public PlacementApplication trackApplication(Long userId, PlacementApplication app) {
        Optional<PlacementApplication> existing = applicationRepository.findByUserIdAndDriveId(userId, app.getDriveId());
        if (existing.isPresent()) {
            PlacementApplication current = existing.get();
            current.setStatus(app.getStatus());
            current.setNotes(app.getNotes());
            current.setUpdatedAt(LocalDateTime.now().toString());
            return applicationRepository.save(current);
        }

        app.setUserId(userId);
        if (app.getStatus() == null || app.getStatus().trim().isEmpty()) {
            app.setStatus("INTERESTED");
        }
        if (app.getAppliedDate() == null || app.getAppliedDate().trim().isEmpty()) {
            app.setAppliedDate(LocalDateTime.now().toLocalDate().toString());
        }
        app.setCreatedAt(LocalDateTime.now().toString());
        app.setUpdatedAt(LocalDateTime.now().toString());
        return applicationRepository.save(app);
    }

    public PlacementApplication updateStatus(Long userId, Long applicationId, String status, String notes) {
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        if (!app.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to this application record");
        }

        app.setStatus(status);
        if (notes != null) {
            app.setNotes(notes);
        }
        app.setUpdatedAt(LocalDateTime.now().toString());
        return applicationRepository.save(app);
    }

    public void withdrawApplication(Long userId, Long applicationId) {
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        if (!app.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to this application record");
        }

        applicationRepository.delete(app);
    }

    public Map<String, Object> getStudentApplicationStats(Long userId) {
        List<PlacementApplication> apps = applicationRepository.findByUserId(userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTracked", apps.size());
        stats.put("interestedCount", apps.stream().filter(a -> "INTERESTED".equalsIgnoreCase(a.getStatus())).count());
        stats.put("appliedCount", apps.stream().filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus())).count());
        stats.put("assessmentCount", apps.stream().filter(a -> "ASSESSMENT".equalsIgnoreCase(a.getStatus())).count());
        stats.put("interviewCount", apps.stream().filter(a -> "INTERVIEW".equalsIgnoreCase(a.getStatus())).count());
        stats.put("offerCount", apps.stream().filter(a -> "OFFER".equalsIgnoreCase(a.getStatus())).count());
        stats.put("rejectedCount", apps.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count());
        return stats;
    }
}
