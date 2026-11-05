package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverageReportDto {
    private int unassignedStudentsCount;
    private List<String> unassignedStudentRolls;
    private int unlinkedFacultyCount;
    private List<String> unlinkedFacultyNames;
    private int emptySectionsCount;
    private List<String> emptySectionNames;
    private String summary;
}

