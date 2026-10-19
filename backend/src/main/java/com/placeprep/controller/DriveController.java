package com.placeprep.controller;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/drives")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DriveController {

    @Autowired
    private DriveService driveService;

    public DriveController() {
    }

    public DriveController(DriveService driveService) {
        this.driveService = driveService;
    }

    @GetMapping
    public ResponseEntity<List<PlacementDrive>> getDrives(@RequestParam(required = false) String batch) {
        return ResponseEntity.ok(driveService.getAll(batch));
    }

    @PostMapping
    public ResponseEntity<PlacementDrive> createDrive(@RequestBody PlacementDrive drive) {
        PlacementDrive created = driveService.create(drive);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
