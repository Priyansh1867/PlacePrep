package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.repository.PlacementDriveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
