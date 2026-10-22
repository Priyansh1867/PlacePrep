package com.placeprep.dto.coding;

public record CodingTestResultDto(
        int testCaseNumber,
        boolean hidden,
        boolean passed,
        String verdict,
        String input,
        String expectedOutput,
        String actualOutput,
        Long executionTimeMs,
        Long memoryKb
) {
}
