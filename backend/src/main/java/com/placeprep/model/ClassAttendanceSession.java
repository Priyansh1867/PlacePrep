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
    private String subjectCode; // e.g. "CS601"

    private String subjectName; // e.g. "Compiler Design"

    private String facultyId;

    private String facultyName;

    private String createdAt;
}
