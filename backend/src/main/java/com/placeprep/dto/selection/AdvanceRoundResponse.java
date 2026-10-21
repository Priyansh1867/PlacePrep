package com.placeprep.dto.selection;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdvanceRoundResponse {

    private String driveId;
    private int roundNumber;
    private double cutoffUsed;
    private int advancedCount;
    private int rejectedCount;
    private int heldCount;
    private List<String> advancedApplicationIds;
    private List<String> rejectedApplicationIds;
    private List<String> heldApplicationIds;
    private List<Map<String, String>> notifications;
}
