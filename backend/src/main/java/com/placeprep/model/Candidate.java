package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String candidateId;

    @Column(nullable = false)
    private String name;

    private String email;

    private String college;

    private String branch;

    private String graduationBatch;

    private String companyId;

    private String companyName;

    private String currentRound;

    private String status; // ACTIVE, ADVANCED, SHORTLISTED, SELECTED, ELIMINATED

    private String eliminationReason;

    private int overallScore;

    private int technicalDepth;

    private int problemSolving;

    private int communication;

    @Column(columnDefinition = "TEXT")
    private String evaluatorNotes;

    private String updatedAt;

    public Candidate() {
    }

    public Candidate(String candidateId, String name, String email, String college, String branch,
                     String graduationBatch, String companyId, String companyName, String currentRound,
                     String status, int overallScore, int technicalDepth, int problemSolving,
                     int communication, String evaluatorNotes) {
        this.candidateId = candidateId;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.graduationBatch = graduationBatch;
        this.companyId = companyId;
        this.companyName = companyName;
        this.currentRound = currentRound;
        this.status = status;
        this.overallScore = overallScore;
        this.technicalDepth = technicalDepth;
        this.problemSolving = problemSolving;
        this.communication = communication;
        this.evaluatorNotes = evaluatorNotes;
        this.updatedAt = LocalDateTime.now().toString();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
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

    public String getCurrentRound() {
        return currentRound;
    }

    public void setCurrentRound(String currentRound) {
        this.currentRound = currentRound;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEliminationReason() {
        return eliminationReason;
    }

    public void setEliminationReason(String eliminationReason) {
        this.eliminationReason = eliminationReason;
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public int getTechnicalDepth() {
        return technicalDepth;
    }

    public void setTechnicalDepth(int technicalDepth) {
        this.technicalDepth = technicalDepth;
    }

    public int getProblemSolving() {
        return problemSolving;
    }

    public void setProblemSolving(int problemSolving) {
        this.problemSolving = problemSolving;
    }

    public int getCommunication() {
        return communication;
    }

    public void setCommunication(int communication) {
        this.communication = communication;
    }

    public String getEvaluatorNotes() {
        return evaluatorNotes;
    }

    public void setEvaluatorNotes(String evaluatorNotes) {
        this.evaluatorNotes = evaluatorNotes;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
