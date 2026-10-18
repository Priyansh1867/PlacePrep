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
@Table(name = "interview_experiences")
public class InterviewExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String experienceId;

    @Column(nullable = false)
    private String companyId;

    private String companyName;

    private String studentName;

    private String batch;

    private String role;

    private String interviewDate;

    private String college;

    private String branch;

    private int overallRating;

    private String outcome;

    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String tips;

    private boolean verified;

    private int helpfulVotes;

    private boolean isAnonymous;

    @ElementCollection
    @CollectionTable(name = "experience_rounds_faced", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "round_faced")
    private List<String> roundsFaced = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "experience_questions_encountered", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "question_encountered", columnDefinition = "TEXT")
    private List<String> questionsEncountered = new ArrayList<>();

    public InterviewExperience() {
    }

    public InterviewExperience(Long id, String experienceId, String companyId, String companyName,
                               String studentName, String batch, String role, String interviewDate,
                               String college, String branch, int overallRating, String outcome,
                               String difficulty, String tips, boolean verified, int helpfulVotes,
                               boolean isAnonymous, List<String> roundsFaced, List<String> questionsEncountered) {
        this.id = id;
        this.experienceId = experienceId;
        this.companyId = companyId;
        this.companyName = companyName;
        this.studentName = studentName;
        this.batch = batch;
        this.role = role;
        this.interviewDate = interviewDate;
        this.college = college;
        this.branch = branch;
        this.overallRating = overallRating;
        this.outcome = outcome;
        this.difficulty = difficulty;
        this.tips = tips;
        this.verified = verified;
        this.helpfulVotes = helpfulVotes;
        this.isAnonymous = isAnonymous;
        this.roundsFaced = roundsFaced != null ? roundsFaced : new ArrayList<>();
        this.questionsEncountered = questionsEncountered != null ? questionsEncountered : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExperienceId() {
        return experienceId;
    }

    public void setExperienceId(String experienceId) {
        this.experienceId = experienceId;
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(String interviewDate) {
        this.interviewDate = interviewDate;
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

    public int getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(int overallRating) {
        this.overallRating = overallRating;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTips() {
        return tips;
    }

    public void setTips(String tips) {
        this.tips = tips;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public int getHelpfulVotes() {
        return helpfulVotes;
    }

    public void setHelpfulVotes(int helpfulVotes) {
        this.helpfulVotes = helpfulVotes;
    }

    public boolean isAnonymous() {
        return isAnonymous;
    }

    public void setAnonymous(boolean anonymous) {
        isAnonymous = anonymous;
    }

    public List<String> getRoundsFaced() {
        return roundsFaced;
    }

    public void setRoundsFaced(List<String> roundsFaced) {
        this.roundsFaced = roundsFaced;
    }

    public List<String> getQuestionsEncountered() {
        return questionsEncountered;
    }

    public void setQuestionsEncountered(List<String> questionsEncountered) {
        this.questionsEncountered = questionsEncountered;
    }
}
