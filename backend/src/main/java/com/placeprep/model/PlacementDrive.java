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

    private String deadline;

    private String status;

    private boolean verifiedBadge;

    private String registrationLink;

    @ElementCollection
    @CollectionTable(name = "drive_eligible_batches", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "batch")
    private List<String> eligibleBatches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_locations", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "location")
    private List<String> locations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_rounds", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "round_name")
    private List<String> rounds = new ArrayList<>();

    public PlacementDrive() {
    }

    public PlacementDrive(Long id, String driveId, String companyId, String companyName,
                          String role, String ctc, String driveDate, String deadline,
                          String status, boolean verifiedBadge, String registrationLink,
                          List<String> eligibleBatches, List<String> locations, List<String> rounds) {
        this.id = id;
        this.driveId = driveId;
        this.companyId = companyId;
        this.companyName = companyName;
        this.role = role;
        this.ctc = ctc;
        this.driveDate = driveDate;
        this.deadline = deadline;
        this.status = status;
        this.verifiedBadge = verifiedBadge;
        this.registrationLink = registrationLink;
        this.eligibleBatches = eligibleBatches != null ? eligibleBatches : new ArrayList<>();
        this.locations = locations != null ? locations : new ArrayList<>();
        this.rounds = rounds != null ? rounds : new ArrayList<>();
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

    public List<String> getRounds() {
        return rounds;
    }

    public void setRounds(List<String> rounds) {
        this.rounds = rounds;
    }
}
