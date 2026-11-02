package com.placeprep.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "master_timetables")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MasterTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String academicSession; // e.g. "2026-2027"

    @Column(nullable = false)
    private String department; // e.g. "Computer Science & Engineering"

    private String branch; // e.g. "CSE"

    @Column(nullable = false)
    private String semester; // e.g. "Semester 5"

    @Column(nullable = false)
    private String academicYear; // e.g. "3rd Year"

    @Column(nullable = false)
    private String section; // e.g. "Section A", "All Sections"

    private LocalDate effectiveStartDate;

    private LocalDate effectiveEndDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED

    private String fileName;

    private String fileType; // MIME type or extension, e.g. application/pdf, image/png, text/csv

    private Long fileSize; // Bytes

    private String filePath;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fileBase64; // Stored base64 string for preview resilience

    @Column(nullable = false)
    private Integer version = 1;

    private String uploadedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    private LocalDateTime lastUpdated;

    private String lastUpdatedBy;

    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("versionNumber DESC")
    private List<TimetableVersion> versions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
        this.lastUpdated = LocalDateTime.now();
        if (this.version == null) {
            this.version = 1;
        }
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "DRAFT";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
