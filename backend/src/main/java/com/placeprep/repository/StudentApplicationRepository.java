package com.placeprep.repository;

import com.placeprep.model.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentApplicationRepository extends JpaRepository<StudentApplication, Long> {

    List<StudentApplication> findByStudentId(String studentId);

    List<StudentApplication> findByStudentEmail(String studentEmail);

    List<StudentApplication> findByStudentIdOrStudentEmail(String studentId, String studentEmail);

    List<StudentApplication> findByDriveId(String driveId);

    List<StudentApplication> findByCompanyId(String companyId);

    Optional<StudentApplication> findByApplicationId(String applicationId);

    Optional<StudentApplication> findByDriveIdAndStudentId(String driveId, String studentId);

    List<StudentApplication> findByStudentIdAndScheduledDate(String studentId, String scheduledDate);
}
