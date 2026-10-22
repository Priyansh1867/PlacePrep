package com.placeprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAtsResponse {

    private String company;
    private String role;
    private int matchScore;
    private String approvalStatus; // "APPROVED" or "NEEDS_REVISION"
    private int approvalThreshold; // default 75
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> recommendations;
    private int totalKeywordsCount;
    private int matchedCount;
    private int missingCount;
    private String fileName;
    private String fileType;
    private long fileSizeBytes;
    private Instant analyzedAt;
    private String disclaimer;
}
