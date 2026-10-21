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
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // e.g. "USER_ROLE_UPDATED", "USER_SUSPENDED", "DRIVE_CREATED", "ROUND_ADVANCED"

    private String performedBy; // email or user id

    private String performerRole; // e.g. "SUPER_ADMIN", "TPO"

    private String targetResource; // e.g. "User:12", "Drive:drv-hcl-2026"

    @Column(columnDefinition = "TEXT")
    private String details;

    private String ipAddress;

    private String timestamp;
}
