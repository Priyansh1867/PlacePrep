package com.placeprep.dto.selection;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DefineDriveRoundsRequest {

    @NotEmpty
    @Valid
    private List<DriveRoundDefinitionDto> rounds;
}
