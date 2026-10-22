package com.placeprep.dto.coding;

import java.time.LocalDateTime;
import java.util.List;

public record CodingSubmissionDto(
        Long id,
        String problemId,
        String language,
        String sourceCode,
        String verdict,
        String submissionType,
        LocalDateTime submittedAt,
        Long executionTimeMs,
        Long memoryKb,
        List<CodingTestResultDto> testResults
) {
}
