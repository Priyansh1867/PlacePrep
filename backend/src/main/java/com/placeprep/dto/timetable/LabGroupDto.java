package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabGroupDto {
    private Long id;
    private Long sectionId;
    private String code;
    private Long mentorId;
    private String mentorName;
}

