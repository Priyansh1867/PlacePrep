package com.placeprep.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String questionId;

    @Column(nullable = false)
    private String companyId;

    private String round;

    private String category;

    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String approach;

    @Column(columnDefinition = "TEXT")
    private String suggestedAnswer;

    @Column(columnDefinition = "TEXT")
    private String sampleCode;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String codingStatement;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String starterCodeJava;

    @JsonIgnore
    @ElementCollection
    @CollectionTable(name = "interview_question_coding_constraints", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "constraint_text", columnDefinition = "TEXT")
    private List<String> codingConstraints = new ArrayList<>();

    @JsonIgnore
    @ElementCollection
    @CollectionTable(name = "interview_question_coding_examples", joinColumns = @JoinColumn(name = "question_id"))
    private List<CodingExample> codingExamples = new ArrayList<>();

    @JsonIgnore
    @ElementCollection
    @CollectionTable(name = "interview_question_public_test_cases", joinColumns = @JoinColumn(name = "question_id"))
    private List<CodingTestCase> publicTestCases = new ArrayList<>();

    @JsonIgnore
    @ElementCollection
    @CollectionTable(name = "interview_question_hidden_test_cases", joinColumns = @JoinColumn(name = "question_id"))
    private List<CodingTestCase> hiddenTestCases = new ArrayList<>();

    private int frequencyScore;

    private String recencyRating;

    private int timesReported;

    private String lastReportedDate;

    private boolean verifiedHistorical;

    @ElementCollection
    @CollectionTable(name = "interview_question_skills", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "interview_question_follow_ups", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "follow_up", columnDefinition = "TEXT")
    private List<String> followUps = new ArrayList<>();

    public InterviewQuestion() {
    }

    public InterviewQuestion(Long id, String questionId, String companyId, String round,
                             String category, String difficulty, String question,
                             String approach, String suggestedAnswer, String sampleCode,
                             int frequencyScore, String recencyRating, int timesReported,
                             String lastReportedDate, boolean verifiedHistorical,
                             List<String> skills, List<String> followUps) {
        this.id = id;
        this.questionId = questionId;
        this.companyId = companyId;
        this.round = round;
        this.category = category;
        this.difficulty = difficulty;
        this.question = question;
        this.approach = approach;
        this.suggestedAnswer = suggestedAnswer;
        this.sampleCode = sampleCode;
        this.frequencyScore = frequencyScore;
        this.recencyRating = recencyRating;
        this.timesReported = timesReported;
        this.lastReportedDate = lastReportedDate;
        this.verifiedHistorical = verifiedHistorical;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.followUps = followUps != null ? followUps : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getRound() {
        return round;
    }

    public void setRound(String round) {
        this.round = round;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getApproach() {
        return approach;
    }

    public void setApproach(String approach) {
        this.approach = approach;
    }

    public String getSuggestedAnswer() {
        return suggestedAnswer;
    }

    public void setSuggestedAnswer(String suggestedAnswer) {
        this.suggestedAnswer = suggestedAnswer;
    }

    public String getSampleCode() {
        return sampleCode;
    }

    public void setSampleCode(String sampleCode) {
        this.sampleCode = sampleCode;
    }

    public String getCodingStatement() {
        return codingStatement;
    }

    public void setCodingStatement(String codingStatement) {
        this.codingStatement = codingStatement;
    }

    public String getInputFormat() {
        return inputFormat;
    }

    public void setInputFormat(String inputFormat) {
        this.inputFormat = inputFormat;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public String getStarterCodeJava() {
        return starterCodeJava;
    }

    public void setStarterCodeJava(String starterCodeJava) {
        this.starterCodeJava = starterCodeJava;
    }

    public List<String> getCodingConstraints() {
        return codingConstraints;
    }

    public void setCodingConstraints(List<String> codingConstraints) {
        this.codingConstraints = codingConstraints;
    }

    public List<CodingExample> getCodingExamples() {
        return codingExamples;
    }

    public void setCodingExamples(List<CodingExample> codingExamples) {
        this.codingExamples = codingExamples;
    }

    public List<CodingTestCase> getPublicTestCases() {
        return publicTestCases;
    }

    public void setPublicTestCases(List<CodingTestCase> publicTestCases) {
        this.publicTestCases = publicTestCases;
    }

    @JsonIgnore
    public List<CodingTestCase> getHiddenTestCases() {
        return hiddenTestCases;
    }

    public void setHiddenTestCases(List<CodingTestCase> hiddenTestCases) {
        this.hiddenTestCases = hiddenTestCases;
    }

    public int getFrequencyScore() {
        return frequencyScore;
    }

    public void setFrequencyScore(int frequencyScore) {
        this.frequencyScore = frequencyScore;
    }

    public String getRecencyRating() {
        return recencyRating;
    }

    public void setRecencyRating(String recencyRating) {
        this.recencyRating = recencyRating;
    }

    public int getTimesReported() {
        return timesReported;
    }

    public void setTimesReported(int timesReported) {
        this.timesReported = timesReported;
    }

    public String getLastReportedDate() {
        return lastReportedDate;
    }

    public void setLastReportedDate(String lastReportedDate) {
        this.lastReportedDate = lastReportedDate;
    }

    public boolean isVerifiedHistorical() {
        return verifiedHistorical;
    }

    public void setVerifiedHistorical(boolean verifiedHistorical) {
        this.verifiedHistorical = verifiedHistorical;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getFollowUps() {
        return followUps;
    }

    public void setFollowUps(List<String> followUps) {
        this.followUps = followUps;
    }
}
