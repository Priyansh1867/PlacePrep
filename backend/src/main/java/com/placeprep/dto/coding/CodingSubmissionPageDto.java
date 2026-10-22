package com.placeprep.dto.coding;

import java.util.List;

public record CodingSubmissionPageDto(
        List<CodingSubmissionDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
