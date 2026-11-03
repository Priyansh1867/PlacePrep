package com.placeprep.tools;

import com.placeprep.service.WorkflowService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CandidateWriteTool {
    private final WorkflowService workflowService;

    public CandidateWriteTool(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @Tool(description = "Advance a placement candidate to the next round. Requires placement staff permission.")
    public Object advanceCandidate(String candidateId, String nextRound, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.advanceCandidate(candidateId, nextRound);
    }

    @Tool(description = "Shortlist a placement candidate. Requires placement staff permission.")
    public Object shortlistCandidate(String candidateId, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.shortlistCandidate(candidateId);
    }

    @Tool(description = "Select a placement candidate. Requires placement staff permission.")
    public Object selectCandidate(String candidateId, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.selectCandidate(candidateId);
    }

    @Tool(description = "Eliminate a placement candidate. Requires placement staff permission.")
    public Object eliminateCandidate(String candidateId, @ToolParam(description = "Reason") String reason,
                                     ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.eliminateCandidate(candidateId, reason);
    }

    @Tool(description = "Record placement candidate evaluation notes and scores. Requires placement staff permission.")
    public Object evaluateCandidate(String candidateId, Map<String, Object> evaluation, ToolContext context) {
        AiToolAuthorization.requirePlacementStaff(context);
        return workflowService.submitEvaluation(candidateId, evaluation);
    }
}
