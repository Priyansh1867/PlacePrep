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

    @Column(nullable = false)
    private String role; // e.g. "Software Engineering Intern", "Data Analyst Intern"

    private String stipend; // e.g. "₹45,000 / month"

    private String duration; // e.g. "6 Months (Jan - June 2027)"

    private String location; // e.g. "Bengaluru (Hybrid)"

    private String deadline;

    private String eligibleBatches; // e.g. "2026, 2027"

    private String eligibleBranches; // e.g. "CSE, IT, ECE"

    private String skillsRequired; // e.g. "Java, Spring Boot, React, SQL"

    private String applicationUrl;

    private boolean ppoOpportunity; // Has PPO (Pre-placement offer) conversion opportunity
}
