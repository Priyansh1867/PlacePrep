package com.placeprep.dto.coding;

public record CodingProgressDto(
        long solvedProblems,
        long attempts,
        long acceptedSubmissions,
        int accuracyPercent
) {
}
