package com.placeprep.dto.timetable;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyWorkloadReportDto {
    private Long facultyId;
    private String fullName;
    private String shortCode;
    private String departmentCode;
    private int theoryPeriods;
    private int labPeriods;
    private int totalPeriods;
    private int perDayPeak;
    private int maxConsecutivePeriods;
    private Map<Integer, Integer> perDayCounts; // 1-6 -> count
}

