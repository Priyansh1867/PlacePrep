package com.placeprep.controller;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    public QuestionController() {
    }

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public ResponseEntity<List<InterviewQuestion>> getQuestions(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String round,
            @RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(questionService.getByCategory(category.trim()));
        }
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

    @GetMapping("/company/{companyId}/round/{round}")
    public ResponseEntity<List<InterviewQuestion>> getByCompanyAndRound(
            @PathVariable String companyId,
            @PathVariable String round) {
        return ResponseEntity.ok(questionService.getByCompanyIdAndRound(companyId, round));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(questionService.getAllCategories());
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

    @PutMapping("/{questionId}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable String questionId,
            @RequestBody InterviewQuestion question) {
        try {
            InterviewQuestion updated = questionService.update(questionId, question);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String questionId) {
        try {
            questionService.delete(questionId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Question deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
