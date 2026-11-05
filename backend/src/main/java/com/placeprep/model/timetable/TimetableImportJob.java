package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tt_import_job",
        indexes = {
                @Index(name = "idx_tt_import_job_status", columnList = "status"),
                @Index(name = "idx_tt_import_job_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", length = 128)
    private String fileType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ImportJobStatus status = ImportJobStatus.PARSED;

    @Lob
    @Column(name = "report_json", columnDefinition = "LONGTEXT")
    private String reportJson; // JSON report of warnings, errors, previews

    @Column(name = "created_by", length = 128)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

