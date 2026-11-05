package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportPreviewReportDto {
    private boolean valid;
    private int totalSlots;
    private int totalSections;
    private int totalRooms;
    private int totalFaculty;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}

