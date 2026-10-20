package com.placeprep.controller;

import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.DriveRound;
import com.placeprep.service.EvaluationService;
import com.placeprep.service.SelectionWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/selection")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SelectionWorkflowController {

    @Autowired
    private SelectionWorkflowService workflowService;

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/drives/{driveId}/rounds")
    public ResponseEntity<?> defineRounds(
            @PathVariable String driveId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rounds = (List<Map<String, Object>>) payload.get("rounds");
            List<DriveRound> saved = workflowService.defineDriveRounds(driveId, rounds);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/drives/{driveId}/rounds")
    public ResponseEntity<List<DriveRound>> listRounds(@PathVariable String driveId) {
        return ResponseEntity.ok(workflowService.getDriveRounds(driveId));
    }

    @GetMapping("/drives/{driveId}/rounds/{roundNumber}/candidates")
    public ResponseEntity<?> candidatesInRound(
            @PathVariable String driveId,
            @PathVariable int roundNumber
    ) {
        return ResponseEntity.ok(workflowService.getCandidatesInRound(driveId, roundNumber));
    }

    @PostMapping("/evaluations")
    public ResponseEntity<?> submitEvaluation(@RequestBody CandidateEvaluation evaluation) {
        try {
            CandidateEvaluation saved = evaluationService.submitEvaluation(evaluation);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/drives/{driveId}/rounds/{roundNumber}/advance")
    public ResponseEntity<?> advanceRound(
            @PathVariable String driveId,
            @PathVariable int roundNumber,
            @RequestBody(required = false) Map<String, Object> options
    ) {
        try {
            Map<String, Object> summary = workflowService.advanceRound(driveId, roundNumber, options);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/drives/{driveId}/finalize-offers")
    public ResponseEntity<?> finalizeOffers(
            @PathVariable String driveId,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        try {
            Map<String, Object> result = workflowService.finalizeOffers(driveId, payload);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
