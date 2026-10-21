package com.placeprep.dto.selection;

import com.placeprep.model.SelectionResult;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SelectionPipelineDto {

    private String applicationId;
    private String driveId;
    private String studentId;
    private Integer currentRoundNumber;
    private String pipelineStatus;
    private Integer rejectedAtRound;
    private String rejectionFeedback;
    private String offerCtc;
    private String joiningDate;
    private String offerDetails;
    private String lastUpdatedAt;

    public static SelectionPipelineDto from(SelectionResult entity) {
        return SelectionPipelineDto.builder()
                .applicationId(entity.getApplicationId())
                .driveId(entity.getDriveId())
                .studentId(entity.getStudentId())
                .currentRoundNumber(entity.getCurrentRoundNumber())
                .pipelineStatus(entity.getPipelineStatus())
                .rejectedAtRound(entity.getRejectedAtRound())
                .rejectionFeedback(entity.getRejectionFeedback())
                .offerCtc(entity.getOfferCtc())
                .joiningDate(entity.getJoiningDate())
                .offerDetails(entity.getOfferDetails())
                .lastUpdatedAt(entity.getLastUpdatedAt())
                .build();
    }
}
