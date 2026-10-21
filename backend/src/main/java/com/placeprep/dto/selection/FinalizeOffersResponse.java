package com.placeprep.dto.selection;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class FinalizeOffersResponse {

    private String driveId;
    private int offersIssued;
    private List<Map<String, Object>> offers;
}
