package com.placeprep.dto.selection;

import com.placeprep.model.CandidateEvaluation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CandidateEvaluationResponse {

    private Long id;
    private String applicationId;
    private String driveId;
    private Integer roundNumber;
    private String evaluatorId;
    private String evaluatorName;
    private Integer technicalScore;
    private Integer problemSolvingScore;
    private Integer communicationScore;
    private String comments;
    private String verdict;
    private String submittedAt;
    private double compositeScore;

    public static CandidateEvaluationResponse from(CandidateEvaluation entity) {
        return CandidateEvaluationResponse.builder()
                .id(entity.getId())
                .applicationId(entity.getApplicationId())
                .driveId(entity.getDriveId())
                .roundNumber(entity.getRoundNumber())
                .evaluatorId(entity.getEvaluatorId())
                .evaluatorName(entity.getEvaluatorName())
                .technicalScore(entity.getTechnicalScore())
                .problemSolvingScore(entity.getProblemSolvingScore())
                .communicationScore(entity.getCommunicationScore())
                .comments(entity.getComments())
                .verdict(entity.getVerdict())
                .submittedAt(entity.getSubmittedAt())
                .compositeScore(entity.compositeScore())
                .build();
    }
}
