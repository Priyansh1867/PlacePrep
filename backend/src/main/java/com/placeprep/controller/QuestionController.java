package com.placeprep.controller;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.service.QuestionImportService;
import com.placeprep.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuestionImportService questionImportService;

    public QuestionController() {
    }

    public QuestionController(QuestionService questionService, QuestionImportService questionImportService) {
        this.questionService = questionService;
        this.questionImportService = questionImportService;
    }

    @GetMapping
    public ResponseEntity<List<InterviewQuestion>> getQuestions(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String round) {
        boolean hasCompany = companyId != null && !companyId.trim().isEmpty();
        boolean hasRound = round != null && !round.trim().isEmpty();

        if (hasCompany && hasRound) {
            return ResponseEntity.ok(questionService.getByCompanyIdAndRound(companyId.trim(), round.trim()));
        } else if (hasCompany) {
            return ResponseEntity.ok(questionService.getByCompanyId(companyId.trim()));
        } else if (hasRound) {
            return ResponseEntity.ok(questionService.getByRound(round.trim()));
        } else {
            return ResponseEntity.ok(questionService.getAll());
        }
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<?> getQuestionById(@PathVariable String questionId) {
        try {
            InterviewQuestion question = questionService.getByQuestionId(questionId);
            return ResponseEntity.ok(question);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<InterviewQuestion> createQuestion(@RequestBody InterviewQuestion question) {
        InterviewQuestion created = questionService.create(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/import-file")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'MANAGEMENT', 'HOD', 'TPO')")
    public ResponseEntity<Map<String, Object>> importQuestionsFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> summary = questionImportService.importQuestions(file);
        return ResponseEntity.ok(summary);
    }
}
