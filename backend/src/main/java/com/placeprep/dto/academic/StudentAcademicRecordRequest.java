package com.placeprep.dto.academic;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentAcademicRecordRequest {

    private String studentId;

    @NotBlank
    @Email
    private String email;

    private String name;
    private String branch;
    private String graduationBatch;

    @Min(0)
    @Max(100)
    private Double tenthPercentage;

    @Min(0)
    @Max(100)
    private Double twelfthPercentage;

    @Min(0)
    @Max(100)
    private Double diplomaPercentage;

    @Min(0)
    @Max(10)
    private Double sem1Sgpa;
    @Min(0)
    @Max(10)
    private Double sem2Sgpa;
    @Min(0)
    @Max(10)
    private Double sem3Sgpa;
    @Min(0)
    @Max(10)
    private Double sem4Sgpa;
    @Min(0)
    @Max(10)
    private Double sem5Sgpa;
    @Min(0)
    @Max(10)
    private Double sem6Sgpa;
    @Min(0)
    @Max(10)
    private Double sem7Sgpa;
    @Min(0)
    @Max(10)
    private Double sem8Sgpa;

    @Min(0)
    @Max(10)
    private Double cgpa;

    @Min(0)
    private Integer activeBacklogs;

    private String verifiedBy;
}
