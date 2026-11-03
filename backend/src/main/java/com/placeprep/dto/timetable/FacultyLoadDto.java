package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyLoadDto {
    private Long facultyId;
    private String fullName;
    private String shortCode;
    private int totalWeeklyPeriods;
    private Map<Integer, Integer> perDayLoad; // DayOfWeek (1-6) -> count of periods
    private Map<Integer, List<Integer>> freePeriodsPerDay; // DayOfWeek (1-6) -> free period indices (e.g. 1-8)
}

