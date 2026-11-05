package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityCellDto {
    private int dayOfWeek;
    private int periodIndex;
    private boolean isBreak;
    private int totalFaculty;
    private int freeCount;
    private int busyCount;
    private double freeRatio; // 0.0 (all busy) to 1.0 (all free)
    private List<FacultyProfileDto> freeFaculty;
    private List<BusyFacultyDto> busyFaculty;
}

