package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidate_evaluations")
@Getter
@Setter
@NoArgsConstructor
public class CandidateEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String applicationId;

    @Column(nullable = false)
    private String driveId;

    @Column(nullable = false)
    private Integer roundNumber;

    private String evaluatorId;

    private String evaluatorName;

    private Integer technicalScore;

    private Integer problemSolvingScore;

    private Integer communicationScore;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private String verdict;

    private String submittedAt;

    public double compositeScore() {
        int t = technicalScore != null ? technicalScore : 0;
        int p = problemSolvingScore != null ? problemSolvingScore : 0;
        int c = communicationScore != null ? communicationScore : 0;
        return (t + p + c) / 3.0;
    }
}
