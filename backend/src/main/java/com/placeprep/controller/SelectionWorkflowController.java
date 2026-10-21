package com.placeprep.controller;

import com.placeprep.dto.selection.AdvanceRoundRequest;
import com.placeprep.dto.selection.AdvanceRoundResponse;
import com.placeprep.dto.selection.CandidateEvaluationRequest;
import com.placeprep.dto.selection.DefineDriveRoundsRequest;
import com.placeprep.dto.selection.DriveRoundResponse;
import com.placeprep.dto.selection.FinalizeOffersRequest;
import com.placeprep.dto.selection.FinalizeOffersResponse;
import com.placeprep.dto.selection.RoundCandidateResponse;
import com.placeprep.mapper.SelectionMapper;
import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.DriveRound;
import com.placeprep.service.EvaluationService;
import com.placeprep.service.SelectionWorkflowService;
import jakarta.validation.Valid;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/selection")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SelectionWorkflowController {

    @Autowired
    private SelectionWorkflowService workflowService;

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/drives/{driveId}/rounds")
    public ResponseEntity<List<DriveRoundResponse>> defineRounds(
            @PathVariable String driveId,
            @Valid @RequestBody DefineDriveRoundsRequest payload
    ) {
        List<DriveRound> saved = workflowService.defineDriveRounds(driveId, payload.getRounds());
        List<DriveRoundResponse> body = saved.stream()
                .map(DriveRoundResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/drives/{driveId}/rounds")
    public ResponseEntity<List<DriveRoundResponse>> listRounds(@PathVariable String driveId) {
        List<DriveRoundResponse> body = workflowService.getDriveRounds(driveId).stream()
                .map(DriveRoundResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/drives/{driveId}/rounds/{roundNumber}/candidates")
    public ResponseEntity<List<RoundCandidateResponse>> candidatesInRound(
            @PathVariable String driveId,
            @PathVariable int roundNumber
    ) {
        return ResponseEntity.ok(workflowService.getCandidatesInRound(driveId, roundNumber));
    }

    @PostMapping("/evaluations")
    public ResponseEntity<CandidateEvaluation> submitEvaluation(
            @Valid @RequestBody CandidateEvaluationRequest evaluation
    ) {
        CandidateEvaluation saved = evaluationService.submitEvaluation(SelectionMapper.toEntity(evaluation));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/drives/{driveId}/rounds/{roundNumber}/advance")
    public ResponseEntity<AdvanceRoundResponse> advanceRound(
            @PathVariable String driveId,
            @PathVariable int roundNumber,
            @RequestBody(required = false) AdvanceRoundRequest options
    ) {
        return ResponseEntity.ok(workflowService.advanceRound(driveId, roundNumber, options));
    }

    @PostMapping("/drives/{driveId}/finalize-offers")
    public ResponseEntity<FinalizeOffersResponse> finalizeOffers(
            @PathVariable String driveId,
            @RequestBody(required = false) FinalizeOffersRequest payload
    ) {
        return ResponseEntity.ok(workflowService.finalizeOffers(driveId, payload));
    }
}
