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
@Table(name = "student_academic_records")
@Getter
@Setter
@NoArgsConstructor
public class StudentAcademicRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    private String branch;

    private String graduationBatch;

    private Double tenthPercentage;

    private Double twelfthPercentage;

    private Double diplomaPercentage;

    private Double sem1Sgpa;
    private Double sem2Sgpa;
    private Double sem3Sgpa;
    private Double sem4Sgpa;
    private Double sem5Sgpa;
    private Double sem6Sgpa;
    private Double sem7Sgpa;
    private Double sem8Sgpa;

    private Double cgpa;

    private Integer activeBacklogs;

    private boolean verified;

    private String verifiedAt;

    private String verifiedBy;

    public Double effectiveTwelfthOrDiploma() {
        if (diplomaPercentage != null) {
            return diplomaPercentage;
        }
        return twelfthPercentage;
    }
}
