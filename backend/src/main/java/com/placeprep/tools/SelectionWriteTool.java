package com.placeprep.tools;

import com.placeprep.dto.selection.AdvanceRoundRequest;
import com.placeprep.dto.selection.DefineDriveRoundsRequest;
import com.placeprep.dto.selection.FinalizeOffersRequest;
import com.placeprep.dto.selection.CandidateEvaluationRequest;
import com.placeprep.mapper.SelectionMapper;
import com.placeprep.service.EvaluationService;
import com.placeprep.service.SelectionWorkflowService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class SelectionWriteTool {
    private final SelectionWorkflowService workflowService;
    private final EvaluationService evaluationService;

    public SelectionWriteTool(SelectionWorkflowService workflowService, EvaluationService evaluationService) {
        this.workflowService = workflowService;
        this.evaluationService = evaluationService;
    }

    @Tool(description = "Define placement drive rounds. Requires placement staff permission.")
    public Object defineDriveRounds(String driveId, DefineDriveRoundsRequest request, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.defineDriveRounds(driveId, request.getRounds());
    }

    @Tool(description = "Advance candidates through a placement round. Requires placement staff permission.")
    public Object advanceRound(String driveId, Integer roundNumber, AdvanceRoundRequest request, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.advanceRound(driveId, roundNumber, request);
    }

    @Tool(description = "Finalize placement offers. Requires placement staff permission.")
    public Object finalizeOffers(String driveId, FinalizeOffersRequest request, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.finalizeOffers(driveId, request);
    }

    @Tool(description = "Submit a candidate round evaluation. Requires placement staff permission.")
    public Object submitEvaluation(CandidateEvaluationRequest request, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return evaluationService.submitEvaluation(SelectionMapper.toEntity(request));
    }
}
