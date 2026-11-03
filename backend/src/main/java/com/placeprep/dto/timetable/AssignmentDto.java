package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDto {
    private Long id;
    private Long timetableId;
    private Long sectionId;
    private String sectionName;
    private Long labGroupId;
    private String labGroupCode;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private List<Long> facultyIds;
    private List<String> facultyNames;
}

