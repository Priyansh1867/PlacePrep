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
@Table(name = "hackathons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hackathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String organizer; // e.g. "Ministry of Education Innovation Cell & AICTE", "Google Developers", "Flipkart"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    private String registrationStartDate;

    private String registrationDeadline;

    private String eventDate;

    private String teamSize; // e.g. "Team of 6 Members", "1–4 Members"

    private String participationRules;

    private String eligibilityCriteria;

    private String prizePool; // e.g. "₹1,00,000 per problem statement", "$100,000 USD"

    private String rewards;

    private String registrationUrl;

    private String tags; // e.g. "AI/ML, Web3, IoT"

    private String domains; // e.g. "AI/ML, Cloud, IoT, Robotics"

    private String mode; // "ONLINE", "OFFLINE", "HYBRID"

    private String format;

    private String bannerUrl;

    private String logo;

    private String source; // e.g. "Government of India (AICTE)", "Devfolio", "Unstop", "Google Developers"

    private String lastVerifiedDate;

    private String status; // "Active", "Closing Soon", "Expired"

    @Builder.Default
    private boolean isPublished = true;
}
