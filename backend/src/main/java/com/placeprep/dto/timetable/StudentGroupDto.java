package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupDto {
    private Long id;
    private Long userId;
    private String rollNumber;
    private Long timetableId;
    private Long sectionId;
    private String sectionName;
    private Long labGroupId;
    private String labGroupCode;
}

