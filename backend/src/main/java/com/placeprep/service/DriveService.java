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
        if (batch != null && !batch.trim().isEmpty()) {
            return placementDriveRepository.findByEligibleBatch(batch.trim());
        }
        return placementDriveRepository.findAll();
    }

    public List<PlacementDrive> getByCompanyId(String companyId) {
        return placementDriveRepository.findByCompanyId(companyId);
    }

    public PlacementDrive create(PlacementDrive drive) {
        return placementDriveRepository.save(drive);
    }
}
