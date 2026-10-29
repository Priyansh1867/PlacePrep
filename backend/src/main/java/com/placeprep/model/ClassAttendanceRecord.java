package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "class_attendance_records",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_student", columnNames = {"sessionId", "studentId"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassAttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sessionId;

    @Column(nullable = false)
    private String studentId; // Email or User ID

    private String studentRollNumber;

    private String studentName;

    private String subjectCode;

    // PRESENT, ABSENT, LATE, EXCUSED
    @Column(nullable = false)
    private String status;

    private Double latitude;

    private Double longitude;

    private Double distanceMeters;

    private Double gpsAccuracy;

    private String verificationMethod; // "100M_GEOFENCE_AND_FACIAL_BIOMETRIC"

    private String markedBy; // "STUDENT_GEOFENCE" or "FACULTY"

    private String remarks;

    private String recordedAt;
}
