package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
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

    @Autowired
    private StudentAcademicRecordService academicRecordService;

    @Autowired
    private SelectionWorkflowService selectionWorkflowService;

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

    @Transactional
    public EntityResponseDto registerApplication(StudentApplication app) {
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

        StudentApplication saved = applicationRepository.save(app);

        if (drive != null && "ELIGIBILITY_PASSED".equals(saved.getStatus())) {
            selectionWorkflowService.initializePipeline(saved);
        }

        return EntityResponseMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getMyApplications(String userEmailOrId) {
        if (userEmailOrId == null || userEmailOrId.trim().isEmpty()) {
            return List.of();
        }
        return EntityResponseMapper.toDtoList(applicationRepository.findByStudentIdOrStudentEmail(userEmailOrId, userEmailOrId));
    }

    public List<EntityResponseDto> getStudentApplications(String studentId) {
        return EntityResponseMapper.toDtoList(applicationRepository.findByStudentId(studentId));
    }

    public List<EntityResponseDto> getDriveApplications(String driveId) {
        return EntityResponseMapper.toDtoList(applicationRepository.findByDriveId(driveId));
    }

    public List<EntityResponseDto> getAllApplications() {
        return EntityResponseMapper.toDtoList(applicationRepository.findAll());
    }

    public Optional<EntityResponseDto> getByApplicationId(String applicationId) {
        return EntityResponseMapper.toDtoOptional(applicationRepository.findByApplicationId(applicationId));
    }

    @Transactional
    public void deleteApplication(String applicationId) {
        Optional<StudentApplication> opt = applicationRepository.findByApplicationId(applicationId);
        if (opt.isPresent()) {
            applicationRepository.delete(opt.get());
        } else {
            try {
                Long id = Long.parseLong(applicationId);
                applicationRepository.findById(id).ifPresent(applicationRepository::delete);
            } catch (NumberFormatException ignored) {
            }
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getApplicationStats() {
        List<StudentApplication> all = applicationRepository.findAll();
        long total = all.size();
        long shortlisted = all.stream().filter(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus()) || "ELIGIBILITY_PASSED".equalsIgnoreCase(a.getStatus())).count();
        long interviews = all.stream().filter(a -> a.getStatus() != null && a.getStatus().toUpperCase().contains("INTERVIEW")).count();
        long offers = all.stream().filter(a -> "OFFERED".equalsIgnoreCase(a.getStatus()) || "ACCEPTED".equalsIgnoreCase(a.getStatus()) || "PLACED".equalsIgnoreCase(a.getStatus())).count();
        long rejected = all.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus()) || "INELIGIBLE_REJECTED".equalsIgnoreCase(a.getStatus())).count();
        long withdrawn = all.stream().filter(a -> "WITHDRAWN".equalsIgnoreCase(a.getStatus())).count();
        long inProgress = total - offers - rejected - withdrawn;

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("applied", total);
        stats.put("shortlisted", shortlisted);
        stats.put("interviews", interviews);
        stats.put("offers", offers);
        stats.put("placed", offers);
        stats.put("rejected", rejected);
        stats.put("withdrawn", withdrawn);
        stats.put("inProgress", inProgress >= 0 ? inProgress : 0);
        return stats;
    }

    @Transactional
    public EntityResponseDto updateStatus(
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

        return EntityResponseMapper.toDto(applicationRepository.save(app));
    }
}
