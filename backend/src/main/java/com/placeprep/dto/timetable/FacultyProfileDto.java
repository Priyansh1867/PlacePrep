package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyProfileDto {
    private Long id;
    private String shortCode;
    private String fullName;
    private String departmentCode;
    private Long userId;
    private String email;
    private Boolean active;
    private List<String> aliases;
}

