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
@Table(name = "drive_rounds_config")
@Getter
@Setter
@NoArgsConstructor
public class DriveRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String driveId;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(nullable = false)
    private String name;

    private String type;

    private Double cutoffScore;
}
