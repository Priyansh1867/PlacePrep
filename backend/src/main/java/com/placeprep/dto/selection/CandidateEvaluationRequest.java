package com.placeprep.dto.selection;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CandidateEvaluationRequest {

    @NotBlank
    private String applicationId;

    private String driveId;

    @NotNull
    @Min(1)
    private Integer roundNumber;

    private String evaluatorId;

    private String evaluatorName;

    @Min(1)
    @Max(10)
    private Integer technicalScore;

    @Min(1)
    @Max(10)
    private Integer problemSolvingScore;

    @Min(1)
    @Max(10)
    private Integer communicationScore;

    private String comments;

    @Pattern(regexp = "ADVANCE|HOLD|REJECT", message = "must be ADVANCE, HOLD, or REJECT")
    private String verdict;
}
