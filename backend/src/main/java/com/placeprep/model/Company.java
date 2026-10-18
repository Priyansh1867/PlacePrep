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
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String companyId;

    @Column(nullable = false)
    private String name;

    private String slug;

    private String logo;

    private String banner;

    private String tier;

    private String headquarters;

    private String industry;

    private String ctcRange;

    private boolean verifiedUpcomingDrive;

    private String upcomingDriveDate;

    private String driveStatus;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    @Column(columnDefinition = "TEXT")
    private String recruitmentProcessJson;

    private int experienceCount;

    private int popularityScore;

    private String latestUpdateDate;

    private String verifiedHistoricalSource;

    @ElementCollection
    @CollectionTable(name = "company_eligible_batches", joinColumns = @JoinColumn(name = "company_id"))
    @Column(name = "batch")
    private List<String> eligibleBatches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "company_roles", joinColumns = @JoinColumn(name = "company_id"))
    @Column(name = "role_name")
    private List<String> roles = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "company_frequent_topics", joinColumns = @JoinColumn(name = "company_id"))
    @Column(name = "topic")
    private List<String> frequentTopics = new ArrayList<>();

    public Company() {
    }

    public Company(Long id, String companyId, String name, String slug, String logo, String banner,
                   String tier, String headquarters, String industry, String ctcRange,
                   boolean verifiedUpcomingDrive, String upcomingDriveDate, String driveStatus,
                   String eligibilityCriteria, String recruitmentProcessJson, int experienceCount,
                   int popularityScore, String latestUpdateDate, String verifiedHistoricalSource,
                   List<String> eligibleBatches, List<String> roles, List<String> frequentTopics) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.slug = slug;
        this.logo = logo;
        this.banner = banner;
        this.tier = tier;
        this.headquarters = headquarters;
        this.industry = industry;
        this.ctcRange = ctcRange;
        this.verifiedUpcomingDrive = verifiedUpcomingDrive;
        this.upcomingDriveDate = upcomingDriveDate;
        this.driveStatus = driveStatus;
        this.eligibilityCriteria = eligibilityCriteria;
        this.recruitmentProcessJson = recruitmentProcessJson;
        this.experienceCount = experienceCount;
        this.popularityScore = popularityScore;
        this.latestUpdateDate = latestUpdateDate;
        this.verifiedHistoricalSource = verifiedHistoricalSource;
        this.eligibleBatches = eligibleBatches != null ? eligibleBatches : new ArrayList<>();
        this.roles = roles != null ? roles : new ArrayList<>();
        this.frequentTopics = frequentTopics != null ? frequentTopics : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getBanner() {
        return banner;
    }

    public void setBanner(String banner) {
        this.banner = banner;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getHeadquarters() {
        return headquarters;
    }

    public void setHeadquarters(String headquarters) {
        this.headquarters = headquarters;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCtcRange() {
        return ctcRange;
    }

    public void setCtcRange(String ctcRange) {
        this.ctcRange = ctcRange;
    }

    public boolean isVerifiedUpcomingDrive() {
        return verifiedUpcomingDrive;
    }

    public void setVerifiedUpcomingDrive(boolean verifiedUpcomingDrive) {
        this.verifiedUpcomingDrive = verifiedUpcomingDrive;
    }

    public String getUpcomingDriveDate() {
        return upcomingDriveDate;
    }

    public void setUpcomingDriveDate(String upcomingDriveDate) {
        this.upcomingDriveDate = upcomingDriveDate;
    }

    public String getDriveStatus() {
        return driveStatus;
    }

    public void setDriveStatus(String driveStatus) {
        this.driveStatus = driveStatus;
    }

    public String getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(String eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public String getRecruitmentProcessJson() {
        return recruitmentProcessJson;
    }

    public void setRecruitmentProcessJson(String recruitmentProcessJson) {
        this.recruitmentProcessJson = recruitmentProcessJson;
    }

    public int getExperienceCount() {
        return experienceCount;
    }

    public void setExperienceCount(int experienceCount) {
        this.experienceCount = experienceCount;
    }

    public int getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(int popularityScore) {
        this.popularityScore = popularityScore;
    }

    public String getLatestUpdateDate() {
        return latestUpdateDate;
    }

    public void setLatestUpdateDate(String latestUpdateDate) {
        this.latestUpdateDate = latestUpdateDate;
    }

    public String getVerifiedHistoricalSource() {
        return verifiedHistoricalSource;
    }

    public void setVerifiedHistoricalSource(String verifiedHistoricalSource) {
        this.verifiedHistoricalSource = verifiedHistoricalSource;
    }

    public List<String> getEligibleBatches() {
        return eligibleBatches;
    }

    public void setEligibleBatches(List<String> eligibleBatches) {
        this.eligibleBatches = eligibleBatches;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getFrequentTopics() {
        return frequentTopics;
    }

    public void setFrequentTopics(List<String> frequentTopics) {
        this.frequentTopics = frequentTopics;
    }
}
