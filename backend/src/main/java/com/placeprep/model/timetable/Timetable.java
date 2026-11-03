package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tt_timetable",
        indexes = {
                @Index(name = "idx_tt_timetable_lookup", columnList = "academic_session, term, department_code, semester"),
                @Index(name = "idx_tt_timetable_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "academic_session", nullable = false, length = 32)
    private String academicSession; // e.g. "2026-27"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Term term; // ODD / EVEN

    @Column(name = "department_code", nullable = false, length = 32)
    private String departmentCode; // e.g. "AIDS" or "CSE"

    @Column(name = "department_name", nullable = false, length = 128)
    private String departmentName; // e.g. "Artificial Intelligence & Data Science"

    @Column(name = "year_of_study", nullable = false)
    private Integer yearOfStudy; // 1 to 4

    @Column(nullable = false)
    private Integer semester; // 1 to 8

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TimetableStatus status = TimetableStatus.DRAFT;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo = 1;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 16)
    private TimetableSourceType sourceType = TimetableSourceType.MANUAL;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by", length = 128)
    private String publishedBy;

    @Column(name = "created_by", length = 128)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 128)
    private String updatedBy;

    @Version
    @Column(name = "opt_lock_version")
    private Long version;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.versionNo == null) {
            this.versionNo = 1;
        }
        if (this.status == null) {
            this.status = TimetableStatus.DRAFT;
        }
        if (this.sourceType == null) {
            this.sourceType = TimetableSourceType.MANUAL;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

