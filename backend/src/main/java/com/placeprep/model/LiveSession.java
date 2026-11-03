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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "live_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String driveId;

    private String driveTitle;

    // Pre-Placement Talk, Company Webinar, Recruitment Orientation, Technical Information Session, Other
    @Column(nullable = false)
    private String sessionType;

    // Google Meet, Microsoft Teams, Zoom, Other
    @Column(nullable = false)
    private String platform;

    @Column(nullable = false, length = 1000)
    private String joinUrl;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String startTime;

    @Column(nullable = false)
    private String endTime;

    private String time; // e.g. "11:00 AM – 12:00 PM"

    private String speaker;

    @Column(columnDefinition = "TEXT")
    private String agenda;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    // PUBLISHED, UPCOMING, COMPLETED, CANCELLED, RESCHEDULED
    @Column(nullable = false)
    private String status;

    private int eligibleStudentsCount;

    private int notifiedCount;

    private int rsvpsCount;

    @Builder.Default
    private boolean isLiveNow = false;

    private String createdBy;

    private String createdAt;

    private String updatedAt;

    @Column(columnDefinition = "TEXT")
    private String auditTrailJson;

    @ElementCollection
    @CollectionTable(name = "live_session_eligible_students", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "student_email")
    @Builder.Default
    private List<String> eligibleStudentEmails = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "live_session_attendees", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "student_email")
    @Builder.Default
    private List<String> attendeeEmails = new ArrayList<>();
}

