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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String college;

    private String branch;

    private String graduationBatch;

    @Column(nullable = false)
    private String role = "student";

    @Column(nullable = false)
    private String status = "ACTIVE";

    private String phone;

    private String rollNumber;

    private String resetPasswordToken;

    private String resetPasswordExpiry;

    @ElementCollection
    @CollectionTable(name = "user_saved_company_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "company_id")
    private List<String> savedCompanyIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_saved_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> savedQuestionIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_practiced_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> practicedQuestionIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_revision_question_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "question_id")
    private List<String> revisionQuestionIds = new ArrayList<>();

    private boolean onboardingCompleted;

    private Double cgpa = 8.5;

    private Double tenthPercentage = 88.0;

    private Double twelfthPercentage = 86.0;

    private Integer activeBacklogs = 0;

    @Column(columnDefinition = "LONGTEXT")
    private String fullProfileJson;
}
