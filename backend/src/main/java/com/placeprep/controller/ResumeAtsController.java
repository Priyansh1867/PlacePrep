package com.placeprep.controller;

import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.dto.SampleJdDto;
import com.placeprep.exception.BadRequestException;
import com.placeprep.service.ResumeAtsService;
import com.placeprep.service.ResumeParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume-ats")
@CrossOrigin
public class ResumeAtsController {

    private final ResumeParserService resumeParserService;
    private final ResumeAtsService resumeAtsService;

    @Autowired
    public ResumeAtsController(ResumeParserService resumeParserService, ResumeAtsService resumeAtsService) {
        this.resumeParserService = resumeParserService;
        this.resumeAtsService = resumeAtsService;
    }

    /**
     * Multipart endpoint for analyzing resume ATS compatibility.
     * Extracts text in-memory from PDF, DOCX, or DOC and performs deterministic keyword scoring.
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeAtsResponse> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam("jobDescription") String jobDescription
    ) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid resume document (.pdf, .docx, or .doc).");
        }
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            throw new BadRequestException("Job description is required. Please provide the target job requirements.");
        }

        // 1. In-memory text extraction from the uploaded file
        String extractedText = resumeParserService.extractText(file);

        // 2. ATS Keyword scoring and recommendations
        ResumeAtsResponse response = resumeAtsService.analyze(
                extractedText,
                company,
                role,
                jobDescription,
                file.getOriginalFilename()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint to fetch curated sample job descriptions for top campus recruiters.
     */
    @GetMapping("/sample-jds")
    public ResponseEntity<List<SampleJdDto>> getSampleJds() {
        return ResponseEntity.ok(resumeAtsService.getSampleJds());
    }
}
