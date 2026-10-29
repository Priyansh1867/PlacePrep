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
@Table(name = "class_attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassAttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionDate; // YYYY-MM-DD

    private Integer periodNumber;

    @Column(nullable = false)
    private String department; // e.g. "CSE", "IT"

    private String semester; // e.g. "6"

    private String section; // e.g. "A"

    @Column(nullable = false)
    private String subjectCode; // e.g. "CS301"

    private String subjectName; // e.g. "Database Management Systems"

    private String facultyId;

    private String facultyName;

    // Advanced Lecture & Geofencing fields
    private Integer lectureNumber; // e.g. 1, 2, 3

    private String lectureTitle; // e.g. "Lecture 1: SQL Indexing & Query Tuning"

    private String startTime; // e.g. "09:00 AM"

    private String endTime; // e.g. "10:00 AM"

    private String openingTime; // e.g. "2026-10-29T09:00:00"

    private String closingTime; // e.g. "2026-10-29T10:15:00"

    @Builder.Default
    private String status = "OPEN"; // "SCHEDULED", "OPEN", "COMPLETED", "CANCELLED"

    private String instituteName;

    private String createdAt;
}
