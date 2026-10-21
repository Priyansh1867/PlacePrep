package com.placeprep.dto.selection;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriveRoundDefinitionDto {

    @NotNull
    @Min(1)
    private Integer roundNumber;

    @NotBlank
    private String name;

    private String type;

    @Min(0)
    @Max(10)
    private Double cutoffScore;
}
