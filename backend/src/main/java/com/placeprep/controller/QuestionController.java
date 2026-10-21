package com.placeprep.controller;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.service.QuestionService;
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

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
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
}
