package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyResolutionDto {
    private String rawNameOrCode;
    private String normalizedName;
    private String resolvedShortCode;
    private String resolvedFullName;
    private String status; // RESOLVED, UNRESOLVED, AMBIGUOUS
    @Builder.Default
    private List<String> candidates = new ArrayList<>();
}

