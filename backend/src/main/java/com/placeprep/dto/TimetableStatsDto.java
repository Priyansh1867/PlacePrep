package com.placeprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableStatsDto {
    private long totalTimetables;
    private long publishedTimetables;
    private long draftTimetables;
    private long archivedTimetables;
    private LocalDateTime lastUpdated;
}
