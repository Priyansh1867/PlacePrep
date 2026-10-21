package com.placeprep.controller;

import com.placeprep.model.StudentAcademicRecord;
import com.placeprep.service.StudentAcademicRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/academics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AcademicRecordController {

    @Autowired
    private StudentAcademicRecordService academicRecordService;

    @GetMapping("/students/{emailOrId}")
    public ResponseEntity<?> getRecord(@PathVariable String emailOrId) {
        return academicRecordService.findForStudent(emailOrId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "No academic record found")));
    }

    @PostMapping("/records")
    public ResponseEntity<?> upsertRecord(@RequestBody StudentAcademicRecord record) {
        try {
            record.setVerified(true);
            StudentAcademicRecord saved = academicRecordService.saveRecord(record);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/import/csv")
    public ResponseEntity<?> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "verifiedBy", required = false) String verifiedBy
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "CSV file is required"));
            }
            Map<String, Object> result = academicRecordService.importCsv(file.getInputStream(), verifiedBy);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
