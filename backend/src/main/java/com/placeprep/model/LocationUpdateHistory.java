package com.placeprep.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "location_update_history")
@Getter
@Setter
@NoArgsConstructor
public class LocationUpdateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long instituteLocationId;

    private Double previousLatitude;

    private Double previousLongitude;

    @Column(nullable = false)
    private Double newLatitude;

    @Column(nullable = false)
    private Double newLongitude;

    @Column(nullable = false)
    private String updatedByEmail;

    private Long updatedByUserId;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private String changeReason;

    @PrePersist
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
    }
}
