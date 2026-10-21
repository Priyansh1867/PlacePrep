package com.placeprep.dto.academic;

import com.placeprep.model.StudentAcademicRecord;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentAcademicRecordResponse {

    private Long id;
    private String studentId;
    private String email;
    private String name;
    private String branch;
    private String graduationBatch;
    private Double tenthPercentage;
    private Double twelfthPercentage;
    private Double diplomaPercentage;
    private Double sem1Sgpa;
    private Double sem2Sgpa;
    private Double sem3Sgpa;
    private Double sem4Sgpa;
    private Double sem5Sgpa;
    private Double sem6Sgpa;
    private Double sem7Sgpa;
    private Double sem8Sgpa;
    private Double cgpa;
    private Integer activeBacklogs;
    private boolean verified;
    private String verifiedAt;
    private String verifiedBy;

    public static StudentAcademicRecordResponse from(StudentAcademicRecord entity) {
        return StudentAcademicRecordResponse.builder()
                .id(entity.getId())
                .studentId(entity.getStudentId())
                .email(entity.getEmail())
                .name(entity.getName())
                .branch(entity.getBranch())
                .graduationBatch(entity.getGraduationBatch())
                .tenthPercentage(entity.getTenthPercentage())
                .twelfthPercentage(entity.getTwelfthPercentage())
                .diplomaPercentage(entity.getDiplomaPercentage())
                .sem1Sgpa(entity.getSem1Sgpa())
                .sem2Sgpa(entity.getSem2Sgpa())
                .sem3Sgpa(entity.getSem3Sgpa())
                .sem4Sgpa(entity.getSem4Sgpa())
                .sem5Sgpa(entity.getSem5Sgpa())
                .sem6Sgpa(entity.getSem6Sgpa())
                .sem7Sgpa(entity.getSem7Sgpa())
                .sem8Sgpa(entity.getSem8Sgpa())
                .cgpa(entity.getCgpa())
                .activeBacklogs(entity.getActiveBacklogs())
                .verified(entity.isVerified())
                .verifiedAt(entity.getVerifiedAt())
                .verifiedBy(entity.getVerifiedBy())
                .build();
    }
}
