package com.placeprep.dto.application;

import com.placeprep.model.StudentApplication;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentApplicationSummaryDto {

    private String applicationId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String branch;
    private String graduationBatch;
    private Double cgpa;
    private String driveId;
    private String companyName;
    private String role;
    private String status;
    private String currentRound;
    private String eligibilityStatus;

    public static StudentApplicationSummaryDto from(StudentApplication app) {
        return StudentApplicationSummaryDto.builder()
                .applicationId(app.getApplicationId())
                .studentId(app.getStudentId())
                .studentName(app.getStudentName())
                .studentEmail(app.getStudentEmail())
                .branch(app.getBranch())
                .graduationBatch(app.getGraduationBatch())
                .cgpa(app.getCgpa())
                .driveId(app.getDriveId())
                .companyName(app.getCompanyName())
                .role(app.getRole())
                .status(app.getStatus())
                .currentRound(app.getCurrentRound())
                .eligibilityStatus(app.getEligibilityStatus())
                .build();
    }
}
