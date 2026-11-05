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
@Table(name = "internships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String companyLogo;

    private String title;

    @Column(nullable = false)
    private String role; // e.g. "Software Engineering Intern", "Data Analyst Intern"

    private String domain; // e.g. "Core Software Engineering", "Cloud Computing"

    private String stipend; // e.g. "₹1,10,000 / month"

    private String duration; // e.g. "10–12 Weeks (May–July 2026)"

    private String location; // e.g. "Bengaluru / Hyderabad"

    private String workMode; // "Remote", "Hybrid", "On-site"

    private String deadline;

    private String postedDate;

    private String eligibleBatches; // e.g. "2026, 2027"

    private String eligibleBranches; // e.g. "CSE, IT, ECE"

    private String qualifications;

    private String skillsRequired; // e.g. "Java, Spring Boot, React, SQL"

    private String experienceRequired; // e.g. "Pre-final Year Students"

    private String applicationUrl;

    private boolean ppoOpportunity; // Has PPO (Pre-placement offer) conversion opportunity

    private String source; // e.g. "Google Careers Official Portal", "Microsoft Careers"

    private String lastVerifiedDate;

    private String status; // "Active", "Closing Soon", "Expired"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private boolean isPublished = true;
}
