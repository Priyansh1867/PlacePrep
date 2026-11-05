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
@Table(name = "off_campus_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffCampusJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String companyLogo;

    private String title;

    @Column(nullable = false)
    private String role; // e.g. "Software Engineer (Early Career)"

    private String domain; // e.g. "Distributed Systems & Cloud"

    private String ctc; // e.g. "₹18–32 LPA"

    private String salaryRange;

    private String location; // e.g. "Bengaluru, Hyderabad"

    private String workMode; // "Remote", "Hybrid", "On-site"

    private String eligibleBatches; // e.g. "2025, 2026"

    private String eligibleBranches; // e.g. "All Engineering Branches", "CSE, IT, ECE"

    private String qualifications;

    private String skillsRequired; // e.g. "Data Structures, C++, Java, System Design"

    private Integer minExperience; // 0

    private Integer maxExperience; // 1

    private String experienceLevel; // "Freshers & 0–1 Years"

    private String applicationDeadline;

    private String postedDate;

    private String applicationUrl;

    private String source; // e.g. "Google Careers Official Portal", "TCS NextStep"

    private String lastVerifiedDate;

    private String status; // "Active", "Closing Soon", "Expired"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private boolean isPublished = true;
}

