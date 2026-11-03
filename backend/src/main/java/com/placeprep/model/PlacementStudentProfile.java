package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "placement_student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlacementStudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String email;

    // Personal Information
    private String fullName;
    private String fatherName;
    private String motherName;
    private String dateOfBirth;
    private String gender;
    private String registrationNumber;
    private String university;
    private String college;
    private String branch;
    private String currentYear;
    private String currentSemester;

    // Contact Information
    private String primaryEmail;
    private String personalEmail;
    private String mobileNumber;
    private Boolean emailVerified = false;
    private Boolean mobileVerified = false;

    @Column(columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(columnDefinition = "TEXT")
    private String currentAddress;

    // Current / Most Recent Education
    private String degree;
    private String currentUniversity;
    private String currentCollege;
    private String currentBranch;
    private String admissionYear;
    private String graduationYear;
    private Double cgpa;
    private Integer backlogs = 0;

    // Previous Education
    private String tenthSchool;
    private String tenthBoard;
    private Double tenthPercentage;
    private String tenthYear;

    private String twelfthSchool;
    private String twelfthBoard;
    private Double twelfthPercentage;
    private String twelfthYear;

    private Boolean hasDiploma = false;
    private String diplomaInstitute;
    private String diplomaBranch;
    private Double diplomaPercentage;
    private String diplomaYear;

    @Column(columnDefinition = "LONGTEXT")
    private String previousEducationJson;

    // Internships & Work Experience (JSON array)
    @Column(columnDefinition = "LONGTEXT")
    private String internshipsJson;

    // Profile Photo & Documents
    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    private String resumeFileName;

    @Column(columnDefinition = "LONGTEXT")
    private String resumeUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String documentsJson;

    // Placement Details
    private String placementStatus = "ENROLLED";
    private String placementCycle = "2026-2027";
    private String enrollmentDate;

    @Column(columnDefinition = "TEXT")
    private String placementNotes;

    private Boolean declarationAgreed = false;

    // Workflow state
    private Boolean isCompleted = false;
    private Integer currentStep = 1;
    private String lastUpdatedAt;

    // Complete payload representation for dynamic synchronization
    @Column(columnDefinition = "LONGTEXT")
    private String fullDataJson;
}
