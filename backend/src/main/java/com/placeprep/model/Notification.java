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
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // DRIVE_ALERT, SHORTLIST_NOTICE, ATTENDANCE_ALERT, GENERAL_ANNOUNCEMENT, HACKATHON
    @Column(nullable = false)
    private String type;

    // ALL, STUDENT, TEACHER, TPO, FINAL_YEAR_ONLY
    @Column(nullable = false)
    private String targetRole;

    private String targetBatch; // e.g. "2026", "2027", or null for all

    private String senderName; // e.g. "TPO Office", "HOD CSE"

    private String linkUrl;

    private String createdAt;
}
