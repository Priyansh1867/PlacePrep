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
        if (batch != null && !batch.trim().isEmpty() && !batch.equalsIgnoreCase("all")) {
            return placementDriveRepository.findByEligibleBatch(batch.trim());
        }
        return placementDriveRepository.findAll();
    }

    public PlacementDrive getByDriveId(String driveId) {
        List<PlacementDrive> all = placementDriveRepository.findAll();
        for (PlacementDrive d : all) {
            if (d.getDriveId().equalsIgnoreCase(driveId)) {
                return d;
            }
        }
        return null;
    }

    public List<PlacementDrive> getByCompanyId(String companyId) {
        return placementDriveRepository.findByCompanyId(companyId);
    }

    public PlacementDrive create(PlacementDrive drive) {
        return placementDriveRepository.save(drive);
    }

    public PlacementDrive updateRounds(String driveId, List<String> rounds, String roundConfigsJson) {
        PlacementDrive drive = getByDriveId(driveId);
        if (drive == null) {
            throw new IllegalArgumentException("Placement Drive not found: " + driveId);
        }
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
        if (drive == null) {
            throw new IllegalArgumentException("Placement Drive not found: " + driveId);
        }
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
