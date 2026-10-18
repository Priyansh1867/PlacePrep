package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApplicationService {

    @Autowired
    private StudentApplicationRepository applicationRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private ScheduleConflictService conflictService;

    public ApplicationService() {
    }

    public ApplicationService(StudentApplicationRepository applicationRepository,
                              PlacementDriveRepository driveRepository,
                              EligibilityService eligibilityService,
                              ScheduleConflictService conflictService) {
        this.applicationRepository = applicationRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.conflictService = conflictService;
    }

    public StudentApplication registerApplication(StudentApplication app) {
        if (app.getApplicationId() == null || app.getApplicationId().trim().isEmpty()) {
            app.setApplicationId("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (app.getAppliedAt() == null) {
            app.setAppliedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }

        // Find drive to run real eligibility check
        PlacementDrive drive = null;
        List<PlacementDrive> allDrives = driveRepository.findAll();
        for (PlacementDrive d : allDrives) {
            if (d.getDriveId().equalsIgnoreCase(app.getDriveId())) {
                drive = d;
                break;
            }
        }

        if (drive != null) {
            if (app.getCompanyName() == null) app.setCompanyName(drive.getCompanyName());
            if (app.getCompanyId() == null) app.setCompanyId(drive.getCompanyId());
            if (app.getRole() == null) app.setRole(drive.getRole());
            if (app.getVenue() == null) app.setVenue(drive.getVenue());
            if (app.getReportingTime() == null) app.setReportingTime(drive.getReportingTime());
            if (app.getCandidateInstructions() == null) app.setCandidateInstructions(drive.getInstructions());

            // Run Eligibility Engine
            Map<String, Object> eligResult = eligibilityService.evaluateEligibility(
                    app.getCgpa(),
                    app.getTenthPercentage(),
                    app.getTwelfthPercentage(),
                    app.getActiveBacklogs(),
                    app.getBranch(),
                    app.getGraduationBatch(),
                    drive
            );

            boolean isEligible = Boolean.TRUE.equals(eligResult.get("isEligible"));
            app.setEligibilityStatus(isEligible ? "ELIGIBLE" : "INELIGIBLE");
            app.setEligibilityRemarks((String) eligResult.get("summary"));

            if (isEligible) {
                app.setStatus("ELIGIBILITY_PASSED");
            } else {
                app.setStatus("INELIGIBLE_REJECTED");
            }

            // Check Schedule Conflict
            if (drive.getDriveDate() != null) {
                Map<String, Object> conflictReport = conflictService.checkStudentInterviewConflict(
                        app.getStudentId(),
                        drive.getCompanyId(),
                        drive.getDriveId(),
                        "Round 1 Screening",
                        drive.getDriveDate(),
                        drive.getDriveTime() != null ? drive.getDriveTime() : "09:00 AM",
                        "05:00 PM"
                );

                boolean hasConflict = Boolean.TRUE.equals(conflictReport.get("hasConflict"));
                app.setConflictFlagged(hasConflict);
                if (hasConflict) {
                    List<?> conflicts = (List<?>) conflictReport.get("conflicts");
                    app.setConflictReason(conflicts != null && !conflicts.isEmpty()
                            ? conflicts.get(0).toString()
                            : "Overlaps with another scheduled campus interview.");
                }
            }
        }

        return applicationRepository.save(app);
    }

    public List<StudentApplication> getStudentApplications(String studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public List<StudentApplication> getDriveApplications(String driveId) {
        return applicationRepository.findByDriveId(driveId);
    }

    public List<StudentApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Optional<StudentApplication> getByApplicationId(String applicationId) {
        return applicationRepository.findByApplicationId(applicationId);
    }

    public StudentApplication updateStatus(
            String applicationId,
            String newStatus,
            String currentRound,
            String scheduledDate,
            String scheduledTime,
            String scheduledEndTime,
            String venue,
            String instructions
    ) {
        Optional<StudentApplication> opt = applicationRepository.findByApplicationId(applicationId);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Application not found: " + applicationId);
        }

        StudentApplication app = opt.get();
        if (newStatus != null) app.setStatus(newStatus);
        if (currentRound != null) app.setCurrentRound(currentRound);
        if (scheduledDate != null) app.setScheduledDate(scheduledDate);
        if (scheduledTime != null) app.setScheduledTime(scheduledTime);
        if (scheduledEndTime != null) app.setScheduledEndTime(scheduledEndTime);
        if (venue != null) app.setVenue(venue);
        if (instructions != null) app.setCandidateInstructions(instructions);

        // Re-check conflict if scheduledDate is modified
        if (scheduledDate != null && scheduledTime != null) {
            Map<String, Object> conflictReport = conflictService.checkStudentInterviewConflict(
                    app.getStudentId(),
                    app.getCompanyId(),
                    app.getDriveId(),
                    app.getCurrentRound(),
                    scheduledDate,
                    scheduledTime,
                    scheduledEndTime != null ? scheduledEndTime : "05:00 PM"
            );
            boolean hasConflict = Boolean.TRUE.equals(conflictReport.get("hasConflict"));
            app.setConflictFlagged(hasConflict);
            if (hasConflict) {
                List<?> conflicts = (List<?>) conflictReport.get("conflicts");
                app.setConflictReason(conflicts != null && !conflicts.isEmpty() ? conflicts.get(0).toString() : "Time conflict");
            } else {
                app.setConflictReason(null);
            }
        }

        return applicationRepository.save(app);
    }
}
