package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_applications")
public class StudentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationId;

    @Column(nullable = false)
    private String studentId;

    private String studentName;

    private String studentEmail;

    private String college;

    private String branch;

    private String graduationBatch;

    private Double cgpa;

    private Double tenthPercentage;

    private Double twelfthPercentage;

    private Integer activeBacklogs;

    @Column(nullable = false)
    private String driveId;

    private String companyId;

    private String companyName;

    private String role;

    private String appliedAt;

    // Status: APPLIED, ELIGIBILITY_PASSED, SHORTLISTED, INTERVIEW_SCHEDULED, REJECTED, OFFERED
    private String status;

    // Eligibility check status: ELIGIBLE, INELIGIBLE, CONDITIONAL
    private String eligibilityStatus;

    @Column(columnDefinition = "TEXT")
    private String eligibilityRemarks;

    private String currentRound;

    private String scheduledDate;

    private String scheduledTime;

    private String scheduledEndTime;

    private String venue;

    private String reportingTime;

    @Column(columnDefinition = "TEXT")
    private String candidateInstructions;

    private boolean conflictFlagged;

    private String conflictReason;

    public StudentApplication() {
    }

    public StudentApplication(Long id, String applicationId, String studentId, String studentName,
                              String studentEmail, String college, String branch, String graduationBatch,
                              Double cgpa, Double tenthPercentage, Double twelfthPercentage,
                              Integer activeBacklogs, String driveId, String companyId,
                              String companyName, String role, String appliedAt, String status,
                              String eligibilityStatus, String eligibilityRemarks, String currentRound,
                              String scheduledDate, String scheduledTime, String scheduledEndTime,
                              String venue, String reportingTime, String candidateInstructions,
                              boolean conflictFlagged, String conflictReason) {
        this.id = id;
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.college = college;
        this.branch = branch;
        this.graduationBatch = graduationBatch;
        this.cgpa = cgpa;
        this.tenthPercentage = tenthPercentage;
        this.twelfthPercentage = twelfthPercentage;
        this.activeBacklogs = activeBacklogs != null ? activeBacklogs : 0;
        this.driveId = driveId;
        this.companyId = companyId;
        this.companyName = companyName;
        this.role = role;
        this.appliedAt = appliedAt;
        this.status = status != null ? status : "APPLIED";
        this.eligibilityStatus = eligibilityStatus != null ? eligibilityStatus : "ELIGIBLE";
        this.eligibilityRemarks = eligibilityRemarks;
        this.currentRound = currentRound != null ? currentRound : "Round 1: Screening";
        this.scheduledDate = scheduledDate;
        this.scheduledTime = scheduledTime;
        this.scheduledEndTime = scheduledEndTime;
        this.venue = venue;
        this.reportingTime = reportingTime;
        this.candidateInstructions = candidateInstructions;
        this.conflictFlagged = conflictFlagged;
        this.conflictReason = conflictReason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getGraduationBatch() {
        return graduationBatch;
    }

    public void setGraduationBatch(String graduationBatch) {
        this.graduationBatch = graduationBatch;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Double getTenthPercentage() {
        return tenthPercentage;
    }

    public void setTenthPercentage(Double tenthPercentage) {
        this.tenthPercentage = tenthPercentage;
    }

    public Double getTwelfthPercentage() {
        return twelfthPercentage;
    }

    public void setTwelfthPercentage(Double twelfthPercentage) {
        this.twelfthPercentage = twelfthPercentage;
    }

    public Integer getActiveBacklogs() {
        return activeBacklogs;
    }

    public void setActiveBacklogs(Integer activeBacklogs) {
        this.activeBacklogs = activeBacklogs;
    }

    public String getDriveId() {
        return driveId;
    }

    public void setDriveId(String driveId) {
        this.driveId = driveId;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(String appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public String getEligibilityRemarks() {
        return eligibilityRemarks;
    }

    public void setEligibilityRemarks(String eligibilityRemarks) {
        this.eligibilityRemarks = eligibilityRemarks;
    }

    public String getCurrentRound() {
        return currentRound;
    }

    public void setCurrentRound(String currentRound) {
        this.currentRound = currentRound;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(String scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getScheduledEndTime() {
        return scheduledEndTime;
    }

    public void setScheduledEndTime(String scheduledEndTime) {
        this.scheduledEndTime = scheduledEndTime;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getReportingTime() {
        return reportingTime;
    }

    public void setReportingTime(String reportingTime) {
        this.reportingTime = reportingTime;
    }

    public String getCandidateInstructions() {
        return candidateInstructions;
    }

    public void setCandidateInstructions(String candidateInstructions) {
        this.candidateInstructions = candidateInstructions;
    }

    public boolean isConflictFlagged() {
        return conflictFlagged;
    }

    public void setConflictFlagged(boolean conflictFlagged) {
        this.conflictFlagged = conflictFlagged;
    }

    public String getConflictReason() {
        return conflictReason;
    }

    public void setConflictReason(String conflictReason) {
        this.conflictReason = conflictReason;
    }
}
