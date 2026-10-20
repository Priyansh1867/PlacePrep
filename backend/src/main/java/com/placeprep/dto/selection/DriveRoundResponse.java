package com.placeprep.dto.selection;

import com.placeprep.model.DriveRound;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriveRoundResponse {

    private Long id;
    private String driveId;
    private Integer roundNumber;
    private String name;
    private String type;
    private Double cutoffScore;

    public static DriveRoundResponse from(DriveRound entity) {
        return DriveRoundResponse.builder()
                .id(entity.getId())
                .driveId(entity.getDriveId())
                .roundNumber(entity.getRoundNumber())
                .name(entity.getName())
                .type(entity.getType())
                .cutoffScore(entity.getCutoffScore())
                .build();
    }
}
