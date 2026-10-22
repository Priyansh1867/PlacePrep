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
@Table(name = "crt_attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrtAttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long crtSessionId;

    @Column(nullable = false)
    private String studentId;

    private String studentRollNumber;

    private String studentName;

    private String department;

    // PRESENT, ABSENT, LATE, UNMARKED
    @Column(nullable = false)
    private String status;

    private Double assessmentScore; // optional score out of 100 for post-session quiz

    private String remarks;

    private String recordedBy;

    private String recordedAt;
}
