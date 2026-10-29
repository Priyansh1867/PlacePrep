package com.placeprep.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "institute_locations")
@Getter
@Setter
@NoArgsConstructor
public class InstituteLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String instituteName;

    @Column(columnDefinition = "TEXT")
    private String instituteAddress;

    private String city;

    private String state;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Integer geofenceRadiusMeters = 100;

    @Column(nullable = false)
    private String locationStatus = "ACTIVE";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String updatedByEmail;

    private Long updatedByUserId;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.geofenceRadiusMeters = 100; // Always enforce 100 meters
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.geofenceRadiusMeters = 100; // Never allow radius change
    }
}
