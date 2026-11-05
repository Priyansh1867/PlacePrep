package com.placeprep.dto.timetable;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableStatsDto {
    private long totalTimetables;
    private long activePublished;
    private long draftCount;
    private long archivedCount;
    private long sectionsWithoutTimetable;
    private long openClashes;
    private long pendingSubstitutions;
    private Map<String, Long> statusBreakdown;
}

