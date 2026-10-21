package com.placeprep.controller;

import com.placeprep.model.Candidate;
import com.placeprep.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    public WorkflowController() {
    }

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> getCandidates(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String round) {
        return ResponseEntity.ok(workflowService.getCandidates(companyId, round));
    }

    @PostMapping("/candidates/{candidateId}/advance")
    public ResponseEntity<?> advanceCandidate(
            @PathVariable String candidateId,
            @RequestParam(defaultValue = "Technical Interview") String nextRound) {
        try {
            Candidate updated = workflowService.advanceCandidate(candidateId, nextRound);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/candidates/{candidateId}/eliminate")
    public ResponseEntity<?> eliminateCandidate(
            @PathVariable String candidateId,
            @RequestParam(defaultValue = "") String reason) {
        try {
            Candidate updated = workflowService.eliminateCandidate(candidateId, reason);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/candidates/{candidateId}/shortlist")
    public ResponseEntity<?> shortlistCandidate(@PathVariable String candidateId) {
        try {
            Candidate updated = workflowService.shortlistCandidate(candidateId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/candidates/{candidateId}/select")
    public ResponseEntity<?> selectCandidate(@PathVariable String candidateId) {
        try {
            Candidate updated = workflowService.selectCandidate(candidateId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/candidates/{candidateId}/evaluate")
    public ResponseEntity<?> submitEvaluation(
            @PathVariable String candidateId,
            @RequestBody Map<String, Object> evaluationData) {
        try {
            Candidate updated = workflowService.submitEvaluation(candidateId, evaluationData);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
