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
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "CS301"

    @Column(nullable = false)
    private String name; // e.g. "Database Management Systems"

    @Column(nullable = false)
    private String department; // e.g. "CSE"

    @Column(nullable = false)
    private String semester; // e.g. "6"

    private String facultyName;

    private String facultyEmail;

    @Builder.Default
    private Integer credits = 4;

    @Builder.Default
    private Double minAttendancePercentage = 75.0;

    private String description;
}
