package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResolutionsDto {
    @Builder.Default
    private List<FacultyResolutionDto> facultyResolutions = new ArrayList<>();

    @Builder.Default
    private Map<String, String> roomAliases = new HashMap<>();

    @Builder.Default
    private List<PeriodDto> periodOverrides = new ArrayList<>();

    @Builder.Default
    private List<SlotDto> slotEdits = new ArrayList<>();

    @Builder.Default
    private List<Long> slotRemovals = new ArrayList<>();
}

