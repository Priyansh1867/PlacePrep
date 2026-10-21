package com.placeprep.dto;

import java.util.List;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String college;
    private String branch;
    private String graduationBatch;
    private String role;
    private boolean onboardingCompleted;
    private List<String> savedCompanyIds;
    private List<String> savedQuestionIds;
    private List<String> practicedQuestionIds;
    private List<String> revisionQuestionIds;

    public UserDto() {
    }

    public UserDto(Long id, String name, String email, String college, String branch,
                   String graduationBatch, String role, boolean onboardingCompleted,
                   List<String> savedCompanyIds, List<String> savedQuestionIds,
                   List<String> practicedQuestionIds, List<String> revisionQuestionIds) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.graduationBatch = graduationBatch;
        this.role = role;
        this.onboardingCompleted = onboardingCompleted;
        this.savedCompanyIds = savedCompanyIds;
        this.savedQuestionIds = savedQuestionIds;
        this.practicedQuestionIds = practicedQuestionIds;
        this.revisionQuestionIds = revisionQuestionIds;
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

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
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
}
