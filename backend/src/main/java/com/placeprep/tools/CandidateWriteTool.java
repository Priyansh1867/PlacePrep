package com.placeprep.tools;

import com.placeprep.service.WorkflowService;
import com.placeprep.mapper.EntityResponseMapper;
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
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("advance placement candidates", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(workflowService.advanceCandidateDto(candidateId, nextRound));
    }

    @Tool(description = "Shortlist a placement candidate. Requires placement staff permission.")
    public Object shortlistCandidate(String candidateId, ToolContext context) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("shortlist placement candidates", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(workflowService.shortlistCandidateDto(candidateId));
    }

    @Tool(description = "Select a placement candidate. Requires placement staff permission.")
    public Object selectCandidate(String candidateId, ToolContext context) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("select placement candidates", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(workflowService.selectCandidateDto(candidateId));
    }

    @Tool(description = "Eliminate a placement candidate. Requires placement staff permission.")
    public Object eliminateCandidate(String candidateId, @ToolParam(description = "Reason") String reason,
                                     ToolContext context) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("eliminate placement candidates", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(workflowService.eliminateCandidateDto(candidateId, reason));
    }

    @Tool(description = "Record placement candidate evaluation notes and scores. Requires placement staff permission.")
    public Object evaluateCandidate(String candidateId, Map<String, Object> evaluation, ToolContext context) {
        if (!AiToolAuthorization.isPlacementStaff(context)) {
            return AiToolAuthorization.accessDenied("evaluate placement candidates", "Placement Staff (HOD, TPO, MANAGEMENT, ADMIN)");
        }
        return EntityResponseMapper.toJsonSafe(workflowService.submitEvaluationDto(candidateId, evaluation));
    }
}
