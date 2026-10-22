package com.placeprep.dto.coding;

import java.util.List;

public record CodingProblemDto(
        String id,
        String title,
        String topic,
        String difficulty,
        String statement,
        String inputFormat,
        String outputFormat,
        List<String> constraints,
        List<Example> examples,
        String starterCode,
        boolean solved
) {
    public record Example(String input, String output, String explanation) {
    }
}
