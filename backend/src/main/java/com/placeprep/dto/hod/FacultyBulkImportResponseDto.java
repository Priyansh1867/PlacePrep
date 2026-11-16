package com.placeprep.dto.hod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyBulkImportResponseDto {
    private int totalProcessed;
    private int successCount;
    private int failureCount;

    @Builder.Default
    private List<FacultyRegistrationDto> successful = new ArrayList<>();

    @Builder.Default
    private List<Map<String, Object>> failed = new ArrayList<>();
}
