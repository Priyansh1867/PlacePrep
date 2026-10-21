package com.placeprep.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String driveId;

    @Column(nullable = false)
    private String companyId;

    private String companyName;

    private String role;

    private String ctc;

    private String driveDate;

    private String driveTime;

    private String deadline;

    private String status;

    private boolean verifiedBadge;

    private String driveType = "ON_CAMPUS"; // ON_CAMPUS, OFF_CAMPUS, INTERNSHIP

    private boolean isOffCampus = false;

    private String registrationLink;

    private String venue;

    private String reportingTime;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private Double minCgpa;

    private Double minTenthPercentage;

    private Double minTwelfthPercentage;

    private Integer maxBacklogs;

    @Column(columnDefinition = "TEXT")
    private String roundConfigsJson;

    @ElementCollection
    @CollectionTable(name = "drive_eligible_batches", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "batch")
    private List<String> eligibleBatches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_locations", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "location")
    private List<String> locations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_allowed_branches", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "branch_name")
    private List<String> allowedBranches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_rounds", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "round_name")
    private List<String> rounds = new ArrayList<>();

    public PlacementDrive() {
    }

    public PlacementDrive(Long id, String driveId, String companyId, String companyName,
                          String role, String ctc, String driveDate, String driveTime,
                          String deadline, String status, boolean verifiedBadge,
                          String registrationLink, String venue, String reportingTime,
                          String instructions, Double minCgpa, Double minTenthPercentage,
                          Double minTwelfthPercentage, Integer maxBacklogs, String roundConfigsJson,
                          List<String> eligibleBatches, List<String> locations,
                          List<String> allowedBranches, List<String> rounds) {
        this.id = id;
        this.driveId = driveId;
        this.companyId = companyId;
        this.companyName = companyName;
        this.role = role;
        this.ctc = ctc;
        this.driveDate = driveDate;
        this.driveTime = driveTime;
        this.deadline = deadline;
        this.status = status;
        this.verifiedBadge = verifiedBadge;
        this.registrationLink = registrationLink;
        this.venue = venue;
        this.reportingTime = reportingTime;
        this.instructions = instructions;
        this.minCgpa = minCgpa != null ? minCgpa : 6.0;
        this.minTenthPercentage = minTenthPercentage != null ? minTenthPercentage : 60.0;
        this.minTwelfthPercentage = minTwelfthPercentage != null ? minTwelfthPercentage : 60.0;
        this.maxBacklogs = maxBacklogs != null ? maxBacklogs : 0;
        this.roundConfigsJson = roundConfigsJson;
        this.eligibleBatches = eligibleBatches != null ? eligibleBatches : new ArrayList<>();
        this.locations = locations != null ? locations : new ArrayList<>();
        this.allowedBranches = allowedBranches != null ? allowedBranches : new ArrayList<>();
        this.rounds = rounds != null ? rounds : new ArrayList<>();
    }

    public PlacementDrive(Long id, String driveId, String companyId, String companyName,
                          String role, String ctc, String driveDate, String deadline,
                          String status, boolean verifiedBadge, String registrationLink,
                          List<String> eligibleBatches, List<String> locations, List<String> rounds) {
        this(id, driveId, companyId, companyName, role, ctc, driveDate, "09:00 AM",
             deadline, status, verifiedBadge, registrationLink,
             "Main Campus Placement Auditorium", "08:30 AM",
             "Carry printed copies of resume, government ID, and college ID card.",
             6.0, 60.0, 60.0, 0, null,
             eligibleBatches, locations, new ArrayList<>(), rounds);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCtc() {
        return ctc;
    }

    public void setCtc(String ctc) {
        this.ctc = ctc;
    }

    public String getDriveDate() {
        return driveDate;
    }

    public void setDriveDate(String driveDate) {
        this.driveDate = driveDate;
    }

    public String getDriveTime() {
        return driveTime;
    }

    public void setDriveTime(String driveTime) {
        this.driveTime = driveTime;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isVerifiedBadge() {
        return verifiedBadge;
    }

    public void setVerifiedBadge(boolean verifiedBadge) {
        this.verifiedBadge = verifiedBadge;
    }

    public String getRegistrationLink() {
        return registrationLink;
    }

    public void setRegistrationLink(String registrationLink) {
        this.registrationLink = registrationLink;
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

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Double getMinCgpa() {
        return minCgpa;
    }

    public void setMinCgpa(Double minCgpa) {
        this.minCgpa = minCgpa;
    }

    public Double getMinTenthPercentage() {
        return minTenthPercentage;
    }

    public void setMinTenthPercentage(Double minTenthPercentage) {
        this.minTenthPercentage = minTenthPercentage;
    }

    public Double getMinTwelfthPercentage() {
        return minTwelfthPercentage;
    }

    public void setMinTwelfthPercentage(Double minTwelfthPercentage) {
        this.minTwelfthPercentage = minTwelfthPercentage;
    }

    public Integer getMaxBacklogs() {
        return maxBacklogs;
    }

    public void setMaxBacklogs(Integer maxBacklogs) {
        this.maxBacklogs = maxBacklogs;
    }

    public String getRoundConfigsJson() {
        return roundConfigsJson;
    }

    public void setRoundConfigsJson(String roundConfigsJson) {
        this.roundConfigsJson = roundConfigsJson;
    }

    public List<String> getEligibleBatches() {
        return eligibleBatches;
    }

    public void setEligibleBatches(List<String> eligibleBatches) {
        this.eligibleBatches = eligibleBatches;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public List<String> getAllowedBranches() {
        return allowedBranches;
    }

    public void setAllowedBranches(List<String> allowedBranches) {
        this.allowedBranches = allowedBranches;
    }

    public List<String> getRounds() {
        return rounds;
    }

    public void setRounds(List<String> rounds) {
        this.rounds = rounds;
    }

    public String getDriveType() {
        return driveType;
    }

    public void setDriveType(String driveType) {
        this.driveType = driveType;
    }

    public boolean isOffCampus() {
        return isOffCampus;
    }

    public void setOffCampus(boolean offCampus) {
        isOffCampus = offCampus;
    }
}
