package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionFreePeriodsReportDto {
    private Long sectionId;
    private String sectionName;
    private Integer semester;
    private String departmentCode;
    private Long timetableId;
    private int totalFreePeriods;
    private Map<Integer, List<Integer>> freePeriodsPerDay; // dayOfWeek (1-6) -> list of free period indices
}

