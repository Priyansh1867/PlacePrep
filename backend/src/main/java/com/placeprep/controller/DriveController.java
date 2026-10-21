package com.placeprep.controller;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/drives")
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

    @GetMapping("/{driveId}")
    public ResponseEntity<?> getDriveById(@PathVariable String driveId) {
        try {
            PlacementDrive drive = driveService.getByDriveId(driveId);
            return ResponseEntity.ok(drive);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<PlacementDrive> createDrive(@RequestBody PlacementDrive drive) {
        PlacementDrive created = driveService.create(drive);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{driveId}")
    public ResponseEntity<?> updateDrive(@PathVariable String driveId, @RequestBody PlacementDrive drive) {
        try {
            PlacementDrive updated = driveService.update(driveId, drive);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{driveId}")
    public ResponseEntity<?> deleteDrive(@PathVariable String driveId) {
        try {
            driveService.delete(driveId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Drive deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
