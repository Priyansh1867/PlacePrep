package com.placeprep.controller;

import com.placeprep.model.PlacementDrive;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.DriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<List<EntityResponseDto>> getDrives(@RequestParam(required = false) String batch) {
        return ResponseEntity.ok(driveService.getAllDtos(batch));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<Map<String, Object>>> getCalendar() {
        return ResponseEntity.ok(driveService.getCalendarEvents());
    }

    @GetMapping("/{driveId}")
    public ResponseEntity<?> getDriveById(@PathVariable String driveId) {
        com.placeprep.dto.EntityResponseDto drive = driveService.getByDriveIdDto(driveId);
        if (drive == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Drive not found for id: " + driveId));
        }
        return ResponseEntity.ok(drive);
    }

    @PostMapping
    public ResponseEntity<EntityResponseDto> createDrive(@RequestBody PlacementDrive drive) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driveService.createDto(drive));
    }

    @PutMapping("/{driveId}")
    public ResponseEntity<?> updateDrive(@PathVariable String driveId, @RequestBody PlacementDrive drive) {
        try {
            return ResponseEntity.ok(driveService.updateDto(driveId, drive));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{driveId}")
    public ResponseEntity<?> deleteDrive(@PathVariable String driveId) {
        try {
            driveService.delete(driveId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Drive deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{driveId}/rounds")
    public ResponseEntity<?> updateDriveRounds(
            @PathVariable String driveId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            @SuppressWarnings("unchecked")
            List<String> rounds = (List<String>) payload.get("rounds");
            String roundConfigsJson = (String) payload.get("roundConfigsJson");

            return ResponseEntity.ok(driveService.updateRoundsDto(driveId, rounds, roundConfigsJson));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{driveId}/instructions")
    public ResponseEntity<?> updateDriveInstructions(
            @PathVariable String driveId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            return ResponseEntity.ok(driveService.updateInstructionsDto(
                    driveId,
                    payload.get("venue"),
                    payload.get("reportingTime"),
                    payload.get("instructions")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
