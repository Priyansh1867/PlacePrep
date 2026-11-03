package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportStatsDto {
    private int totalSheets;
    private int totalSections;
    private int totalLabGroups;
    private int totalSubjects;
    private int totalRooms;
    private int totalFaculty;
    private int totalSlots;
    private int totalWarnings;
    private int totalErrors;
    private int totalClashes;
    private int unresolvedFaculty;

    public ImportStatsDto(int totalSheets, int totalSections, int totalLabGroups, int totalSubjects, int totalRooms, int totalFaculty, int totalSlots, int totalWarnings, int totalErrors, int totalClashes) {
        this.totalSheets = totalSheets;
        this.totalSections = totalSections;
        this.totalLabGroups = totalLabGroups;
        this.totalSubjects = totalSubjects;
        this.totalRooms = totalRooms;
        this.totalFaculty = totalFaculty;
        this.totalSlots = totalSlots;
        this.totalWarnings = totalWarnings;
        this.totalErrors = totalErrors;
        this.totalClashes = totalClashes;
        this.unresolvedFaculty = 0;
    }
}

