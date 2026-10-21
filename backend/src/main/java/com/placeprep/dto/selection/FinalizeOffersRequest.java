package com.placeprep.dto.selection;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class FinalizeOffersRequest {

    private String defaultCtc;

    private String defaultJoiningDate;

    private String defaultOfferDetails;

    @Valid
    private List<OfferIssueDto> offers;
}
