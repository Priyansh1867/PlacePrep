package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusyFacultyDto {
    private Long facultyId;
    private String fullName;
    private String shortCode;
    private Long slotId;
    private String subjectName;
    private String subjectCode;
    private String sectionName;
    private String roomCode;
}

