package com.placeprep.dto.hod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyRegistrationDto {
    private Long id;
    private String name;
    private String email;
    private String facultyId;
    private String phone;
    private String department;
    private String designation;
    private String specialization;
    private String qualification;
    private String joiningDate;
    private String status;
    private Long userId;
    private String shortCode;
}
