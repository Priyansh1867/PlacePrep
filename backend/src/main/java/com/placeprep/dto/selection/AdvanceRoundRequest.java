package com.placeprep.dto.selection;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AdvanceRoundRequest {

    @Min(0)
    @Max(10)
    private Double cutoffScore;

    private Boolean useVerdict;

    private String rejectionFeedback;
}
