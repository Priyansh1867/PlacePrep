package com.placeprep.mapper;

import com.placeprep.dto.academic.StudentAcademicRecordRequest;
import com.placeprep.model.StudentAcademicRecord;

public final class AcademicMapper {

    private AcademicMapper() {
    }

    public static StudentAcademicRecord toEntity(StudentAcademicRecordRequest request) {
        StudentAcademicRecord record = new StudentAcademicRecord();
        record.setStudentId(
                request.getStudentId() != null && !request.getStudentId().isBlank()
                        ? request.getStudentId()
                        : request.getEmail()
        );
        record.setEmail(request.getEmail());
        record.setName(request.getName());
        record.setBranch(request.getBranch());
        record.setGraduationBatch(request.getGraduationBatch());
        record.setTenthPercentage(request.getTenthPercentage());
        record.setTwelfthPercentage(request.getTwelfthPercentage());
        record.setDiplomaPercentage(request.getDiplomaPercentage());
        record.setSem1Sgpa(request.getSem1Sgpa());
        record.setSem2Sgpa(request.getSem2Sgpa());
        record.setSem3Sgpa(request.getSem3Sgpa());
        record.setSem4Sgpa(request.getSem4Sgpa());
        record.setSem5Sgpa(request.getSem5Sgpa());
        record.setSem6Sgpa(request.getSem6Sgpa());
        record.setSem7Sgpa(request.getSem7Sgpa());
        record.setSem8Sgpa(request.getSem8Sgpa());
        record.setCgpa(request.getCgpa());
        record.setActiveBacklogs(request.getActiveBacklogs());
        record.setVerified(true);
        record.setVerifiedBy(request.getVerifiedBy() != null ? request.getVerifiedBy() : "TPO");
        return record;
    }
}
