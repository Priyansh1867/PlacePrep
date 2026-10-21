package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.repository.PlacementDriveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DriveService {

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    public DriveService() {
    }

    public DriveService(PlacementDriveRepository placementDriveRepository) {
        this.placementDriveRepository = placementDriveRepository;
    }

    public List<PlacementDrive> getAll() {
        return placementDriveRepository.findAll();
    }

    public List<PlacementDrive> getAll(String batch) {
        if (batch != null && !batch.trim().isEmpty() && !"all".equalsIgnoreCase(batch.trim())) {
            return placementDriveRepository.findByEligibleBatch(batch.trim());
        }
        return placementDriveRepository.findAll();
    }

    public List<PlacementDrive> getByCompanyId(String companyId) {
        return placementDriveRepository.findByCompanyId(companyId);
    }

    public PlacementDrive getByDriveId(String driveId) {
        return placementDriveRepository.findByDriveId(driveId)
                .or(() -> {
                    if (driveId.startsWith("drv-")) {
                        return placementDriveRepository.findByDriveId("drive-" + driveId.substring(4));
                    } else if (driveId.startsWith("drive-")) {
                        return placementDriveRepository.findByDriveId("drv-" + driveId.substring(6));
                    }
                    return Optional.empty();
                })
                .orElseThrow(() -> new IllegalArgumentException("Drive not found with driveId: " + driveId));
    }

    public PlacementDrive create(PlacementDrive drive) {
        if (drive.getDriveId() == null || drive.getDriveId().trim().isEmpty()) {
            drive.setDriveId("drive-" + System.currentTimeMillis());
        }
        return placementDriveRepository.save(drive);
    }

    public PlacementDrive update(String driveId, PlacementDrive updated) {
        PlacementDrive existing = getByDriveId(driveId);
        if (updated.getRole() != null) existing.setRole(updated.getRole());
        if (updated.getCompanyName() != null) existing.setCompanyName(updated.getCompanyName());
        if (updated.getCompanyId() != null) existing.setCompanyId(updated.getCompanyId());
        if (updated.getCtc() != null) existing.setCtc(updated.getCtc());
        if (updated.getDriveDate() != null) existing.setDriveDate(updated.getDriveDate());
        if (updated.getDeadline() != null) existing.setDeadline(updated.getDeadline());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getRegistrationLink() != null) existing.setRegistrationLink(updated.getRegistrationLink());
        if (updated.getEligibleBatches() != null) existing.setEligibleBatches(updated.getEligibleBatches());
        if (updated.getLocations() != null) existing.setLocations(updated.getLocations());
        if (updated.getRounds() != null) existing.setRounds(updated.getRounds());
        existing.setVerifiedBadge(updated.isVerifiedBadge());
        return placementDriveRepository.save(existing);
    }

    public void delete(String driveId) {
        PlacementDrive existing = getByDriveId(driveId);
        placementDriveRepository.delete(existing);
    }

    public PlacementDrive updateRounds(String driveId, List<String> rounds, String roundConfigsJson) {
        PlacementDrive drive = getByDriveId(driveId);
        if (rounds != null) {
            drive.setRounds(rounds);
        }
        if (roundConfigsJson != null) {
            drive.setRoundConfigsJson(roundConfigsJson);
        }
        return placementDriveRepository.save(drive);
    }

    public PlacementDrive updateInstructions(String driveId, String venue, String reportingTime, String instructions) {
        PlacementDrive drive = getByDriveId(driveId);
        if (venue != null) drive.setVenue(venue);
        if (reportingTime != null) drive.setReportingTime(reportingTime);
        if (instructions != null) drive.setInstructions(instructions);
        return placementDriveRepository.save(drive);
    }

    public List<Map<String, Object>> getCalendarEvents() {
        List<PlacementDrive> drives = placementDriveRepository.findAll();
        List<Map<String, Object>> events = new ArrayList<>();

        for (PlacementDrive d : drives) {
            Map<String, Object> event = new HashMap<>();
            event.put("id", d.getDriveId());
            event.put("title", d.getCompanyName() + " - " + d.getRole());
            event.put("companyId", d.getCompanyId());
            event.put("companyName", d.getCompanyName());
            event.put("role", d.getRole());
            event.put("date", d.getDriveDate());
            event.put("time", d.getDriveTime() != null ? d.getDriveTime() : "09:00 AM");
            event.put("deadline", d.getDeadline());
            event.put("venue", d.getVenue() != null ? d.getVenue() : "Main Placement Auditorium");
            event.put("reportingTime", d.getReportingTime() != null ? d.getReportingTime() : "08:30 AM");
            event.put("instructions", d.getInstructions());
            event.put("eligibleBatches", d.getEligibleBatches());
            event.put("rounds", d.getRounds());
            event.put("roundConfigsJson", d.getRoundConfigsJson());
            event.put("status", d.getStatus());
            events.add(event);
        }

        return events;
    }
}
