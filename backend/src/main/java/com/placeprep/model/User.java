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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    private String college;

    private String branch;

    private String graduationBatch;

    @Column(nullable = false)
    private String role = "student";

    @ElementCollection
    @CollectionTable(name = "user_saved_company_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "company_id")
    private List<String> savedCompanyIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_saved_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> savedQuestionIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_practiced_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> practicedQuestionIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_revision_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> revisionQuestionIds = new ArrayList<>();

    private boolean onboardingCompleted;

    private Double cgpa = 8.5;

    private Double tenthPercentage = 88.0;

    private Double twelfthPercentage = 86.0;

    private Integer activeBacklogs = 0;

    public User() {
    }

    public User(Long id, String name, String email, String password, String college, String branch,
                String graduationBatch, String role, List<String> savedCompanyIds,
                List<String> savedQuestionIds, List<String> practicedQuestionIds,
                List<String> revisionQuestionIds, boolean onboardingCompleted) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.college = college;
        this.branch = branch;
        this.graduationBatch = graduationBatch;
        this.role = role != null ? role : "student";
        this.savedCompanyIds = savedCompanyIds != null ? savedCompanyIds : new ArrayList<>();
        this.savedQuestionIds = savedQuestionIds != null ? savedQuestionIds : new ArrayList<>();
        this.practicedQuestionIds = practicedQuestionIds != null ? practicedQuestionIds : new ArrayList<>();
        this.revisionQuestionIds = revisionQuestionIds != null ? revisionQuestionIds : new ArrayList<>();
        this.onboardingCompleted = onboardingCompleted;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getSavedCompanyIds() {
        return savedCompanyIds;
    }

    public void setSavedCompanyIds(List<String> savedCompanyIds) {
        this.savedCompanyIds = savedCompanyIds;
    }

    public List<String> getSavedQuestionIds() {
        return savedQuestionIds;
    }

    public void setSavedQuestionIds(List<String> savedQuestionIds) {
        this.savedQuestionIds = savedQuestionIds;
    }

    public List<String> getPracticedQuestionIds() {
        return practicedQuestionIds;
    }

    public void setPracticedQuestionIds(List<String> practicedQuestionIds) {
        this.practicedQuestionIds = practicedQuestionIds;
    }

    public List<String> getRevisionQuestionIds() {
        return revisionQuestionIds;
    }

    public void setRevisionQuestionIds(List<String> revisionQuestionIds) {
        this.revisionQuestionIds = revisionQuestionIds;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
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
}
