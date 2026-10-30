package com.placeprep.controller;

import com.placeprep.model.StudentAcademicRecord;
import com.placeprep.service.StudentAcademicRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AcademicRecordController {

    @Autowired
    private StudentAcademicRecordService academicRecordService;

    @GetMapping("/student/{emailOrId}")
    public ResponseEntity<?> getStudentRecord(@PathVariable String emailOrId) {
        return academicRecordService.findForStudent(emailOrId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Academic record not found for: " + emailOrId)));
    }

    @PostMapping("/student")
    public ResponseEntity<?> saveStudentRecord(@RequestBody StudentAcademicRecord record) {
        try {
            StudentAcademicRecord saved = academicRecordService.saveRecord(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAcademicCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "TPO_ADMIN") String verifiedBy
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "CSV file is empty"));
        }
        try {
            Map<String, Object> result = academicRecordService.importCsv(file.getInputStream(), verifiedBy);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to process CSV: " + e.getMessage()));
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        String template = "email,studentId,name,branch,graduationBatch,tenthPercentage,twelfthPercentage,diplomaPercentage,sem1Sgpa,sem2Sgpa,sem3Sgpa,sem4Sgpa,sem5Sgpa,sem6Sgpa,sem7Sgpa,sem8Sgpa,cgpa,activeBacklogs\n";

        byte[] bytes = template.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"academic_records_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
