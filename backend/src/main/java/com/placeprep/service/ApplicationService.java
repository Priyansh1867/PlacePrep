package com.placeprep.service;

import com.placeprep.model.PlacementApplication;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.PlacementApplicationRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApplicationService {

    @Autowired(required = false)
    private PlacementApplicationRepository applicationRepository;

    @Autowired(required = false)
    private StudentApplicationRepository studentApplicationRepository;

    @Autowired(required = false)
    private PlacementDriveRepository driveRepository;

    @Autowired(required = false)
    private EligibilityService eligibilityService;

    @Autowired(required = false)
    private ScheduleConflictService conflictService;

    @Autowired
    private StudentAcademicRecordService academicRecordService;

    @Autowired
    private SelectionWorkflowService selectionWorkflowService;

    public ApplicationService() {
    }

    public ApplicationService(PlacementApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public ApplicationService(StudentApplicationRepository studentApplicationRepository,
                              PlacementDriveRepository driveRepository,
                              EligibilityService eligibilityService,
                              ScheduleConflictService conflictService) {
        this.studentApplicationRepository = studentApplicationRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.conflictService = conflictService;
    }

    public ApplicationService(PlacementApplicationRepository applicationRepository,
                              StudentApplicationRepository studentApplicationRepository,
                              PlacementDriveRepository driveRepository,
                              EligibilityService eligibilityService,
                              ScheduleConflictService conflictService) {
        this.applicationRepository = applicationRepository;
        this.studentApplicationRepository = studentApplicationRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.conflictService = conflictService;
    }

    // ==========================================
    // 1. Student Personal Placement Applications
    // ==========================================

    public List<PlacementApplication> getStudentApplications(Long userId) {
        if (applicationRepository == null) return List.of();
        return applicationRepository.findByUserId(userId);
    }

    public PlacementApplication trackApplication(Long userId, PlacementApplication app) {
        if (applicationRepository == null) {
            throw new IllegalStateException("PlacementApplicationRepository unavailable");
        }
        Optional<PlacementApplication> existing = applicationRepository.findByUserIdAndDriveId(userId, app.getDriveId());
        if (existing.isPresent()) {
            PlacementApplication current = existing.get();
            current.setStatus(app.getStatus());
            current.setNotes(app.getNotes());
            current.setUpdatedAt(LocalDateTime.now().toString());
            return applicationRepository.save(current);
        }

        app.setUserId(userId);
        if (app.getStatus() == null || app.getStatus().trim().isEmpty()) {
            app.setStatus("INTERESTED");
        }
        if (app.getAppliedDate() == null || app.getAppliedDate().trim().isEmpty()) {
            app.setAppliedDate(LocalDateTime.now().toLocalDate().toString());
        }
        app.setCreatedAt(LocalDateTime.now().toString());
        app.setUpdatedAt(LocalDateTime.now().toString());
        return applicationRepository.save(app);
    }

    public PlacementApplication updateStatus(Long userId, Long applicationId, String status, String notes) {
        if (applicationRepository == null) {
            throw new IllegalStateException("PlacementApplicationRepository unavailable");
        }
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        if (!app.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to this application record");
        }

        app.setStatus(status);
        if (notes != null) {
            app.setNotes(notes);
        }
        app.setUpdatedAt(LocalDateTime.now().toString());
        return applicationRepository.save(app);
    }

    public void withdrawApplication(Long userId, Long applicationId) {
        if (applicationRepository == null) {
            throw new IllegalStateException("PlacementApplicationRepository unavailable");
        }
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        if (!app.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to this application record");
        }

        applicationRepository.delete(app);
    }

    public Map<String, Object> getStudentApplicationStats(Long userId) {
        if (applicationRepository == null) return Map.of();
        List<PlacementApplication> apps = applicationRepository.findByUserId(userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTracked", apps.size());
        stats.put("interestedCount", apps.stream().filter(a -> "INTERESTED".equalsIgnoreCase(a.getStatus())).count());
        stats.put("appliedCount", apps.stream().filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus())).count());
        stats.put("assessmentCount", apps.stream().filter(a -> "ASSESSMENT".equalsIgnoreCase(a.getStatus())).count());
        stats.put("interviewCount", apps.stream().filter(a -> "INTERVIEW".equalsIgnoreCase(a.getStatus())).count());
        stats.put("offerCount", apps.stream().filter(a -> "OFFER".equalsIgnoreCase(a.getStatus())).count());
        stats.put("rejectedCount", apps.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count());
        return stats;
    }

    // ==========================================
    // 2. Student Application Registration Passes
    // ==========================================

    public StudentApplication registerApplication(StudentApplication app) {
        if (studentApplicationRepository == null) {
            throw new IllegalStateException("StudentApplicationRepository unavailable");
        }

        if (app.getApplicationId() == null || app.getApplicationId().trim().isEmpty()) {
            app.setApplicationId("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (app.getAppliedAt() == null) {
            app.setAppliedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }

        // Find drive to run real eligibility check
        PlacementDrive drive = null;
        if (driveRepository != null && app.getDriveId() != null) {
            List<PlacementDrive> allDrives = driveRepository.findAll();
            for (PlacementDrive d : allDrives) {
                if (d.getDriveId() != null && d.getDriveId().equalsIgnoreCase(app.getDriveId())) {
                    drive = d;
                    break;
                }
            }
        }

        StudentAcademicRecordService.ApplicationAcademicSnapshot academics =
                new StudentAcademicRecordService.ApplicationAcademicSnapshot();
        academics.cgpa = app.getCgpa();
        academics.tenth = app.getTenthPercentage();
        academics.twelfth = app.getTwelfthPercentage();
        academics.backlogs = app.getActiveBacklogs();
        academics.branch = app.getBranch();
        academics.batch = app.getGraduationBatch();
        academicRecordService.enrichApplicationFromVerifiedRecord(
                app.getStudentId(),
                app.getStudentEmail(),
                academics
        );
        if (academics.verified) {
            if (academics.cgpa != null) app.setCgpa(academics.cgpa);
            if (academics.tenth != null) app.setTenthPercentage(academics.tenth);
            if (academics.twelfth != null) app.setTwelfthPercentage(academics.twelfth);
            if (academics.backlogs != null) app.setActiveBacklogs(academics.backlogs);
            if (academics.branch != null) app.setBranch(academics.branch);
            if (academics.batch != null) app.setGraduationBatch(academics.batch);
        }

        if (drive != null) {
            if (app.getCompanyName() == null) app.setCompanyName(drive.getCompanyName());
            if (app.getCompanyId() == null) app.setCompanyId(drive.getCompanyId());
            if (app.getRole() == null) app.setRole(drive.getRole());
            if (app.getVenue() == null) app.setVenue(drive.getVenue());
            if (app.getReportingTime() == null) app.setReportingTime(drive.getReportingTime());
            if (app.getCandidateInstructions() == null) app.setCandidateInstructions(drive.getInstructions());

            // Run Eligibility Engine if available
            if (eligibilityService != null) {
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
            }

            // Check Schedule Conflict if available
            if (conflictService != null && drive.getDriveDate() != null) {
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

