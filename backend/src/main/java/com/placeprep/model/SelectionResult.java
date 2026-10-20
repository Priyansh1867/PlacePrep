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
@Table(name = "selection_results")
@Getter
@Setter
@NoArgsConstructor
public class SelectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationId;

    @Column(nullable = false)
    private String driveId;

    private String studentId;

    private Integer currentRoundNumber;

    private String pipelineStatus;

    private Integer rejectedAtRound;

    @Column(columnDefinition = "TEXT")
    private String rejectionFeedback;

    private String offerCtc;

    private String joiningDate;

    @Column(columnDefinition = "TEXT")
    private String offerDetails;

    @Column(columnDefinition = "TEXT")
    private String promotionHistoryJson;

    private String lastUpdatedAt;
}
