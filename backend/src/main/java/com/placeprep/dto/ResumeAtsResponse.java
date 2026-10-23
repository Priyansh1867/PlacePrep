package com.placeprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAtsResponse {

    private String company;
    private String role;
    private String fileName;
    private int matchScore;
    private String approvalStatus; // "APPROVED" or "NEEDS_REVISION"
    private int approvalThreshold;
    private int totalJobKeywords;
    private int matchedCount;
    private int missingCount;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> recommendations;
    private String summary;
    private String disclaimer;
    private String analyzedAt;
}
