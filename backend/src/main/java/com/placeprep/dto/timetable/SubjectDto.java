package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.SubjectKind;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private Long id;
    private String departmentCode;
    private String rtuCode;
    private String name;
    private String shortCode;
    private SubjectKind kind;
    private Integer semester;
}

