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
@Table(name = "crt_training_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrtTrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic; // e.g. "Quantitative Aptitude - Probability & Permutations"

    // APTITUDE, CODING_DSA, SOFT_SKILLS, RESUME_MOCK
    @Column(nullable = false)
    private String moduleType;

    private String trainerName;

    private String trainerOrganization;

    @Column(nullable = false)
    private String scheduledDate; // YYYY-MM-DD

    private String timeSlot; // e.g. "10:00 AM - 01:00 PM"

    private String venue; // e.g. "Auditorium / Lab 3"

    private String targetBatch; // e.g. "2026"

    private String targetBranch; // e.g. "ALL" or "CSE"

    private String createdAt;
}
