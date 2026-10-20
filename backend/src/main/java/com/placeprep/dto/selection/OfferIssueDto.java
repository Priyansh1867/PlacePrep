package com.placeprep.dto.selection;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OfferIssueDto {

    @NotBlank
    private String applicationId;

    private String ctc;

    private String joiningDate;

    private String offerDetails;
}
