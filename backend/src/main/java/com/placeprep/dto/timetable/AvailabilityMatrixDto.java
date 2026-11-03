package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityMatrixDto {
    private List<PeriodDto> periods;
    private List<FacultyProfileDto> facultyMembers;
    private List<AvailabilityCellDto> cells;
    private String academicSession;
    private String term;
}

