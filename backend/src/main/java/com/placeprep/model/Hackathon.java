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
    private String organizer; // e.g. "Smart India Hackathon", "Google Solution Challenge", "HackDTU"

    @Column(columnDefinition = "TEXT")
    private String description;

    private String registrationDeadline;

    private String eventDate;

    private String teamSize; // e.g. "2-4 Members"

    private String prizePool; // e.g. "₹1,00,000 + Internship"

    private String registrationUrl;

    private String tags; // e.g. "AI/ML, Web3, IoT"

    private String mode; // "ONLINE" or "OFFLINE"

    private String bannerUrl;
}
