package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "recruiter_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String driveId;

    private String companyId;

    @Column(nullable = false)
    private String companyName;

    private String recruiterName;

    private String recruiterEmail;

    private Integer overallRating; // 1-5

    private Integer batchPreparednessRating; // 1-5

    private Integer technicalCompetencyRating; // 1-5

    private Integer communicationRating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String hiringRemarks;

    @Column(columnDefinition = "TEXT")
    private String suggestionsForTpo;

    private String submittedAt;
}
