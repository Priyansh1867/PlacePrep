package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tt_version",
        indexes = {
                @Index(name = "idx_tt_version_timetable_id", columnList = "timetable_id"),
                @Index(name = "idx_tt_version_tt_ver_no", columnList = "timetable_id, version_no")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    @JsonIgnore
    private Timetable timetable;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Lob
    @Column(name = "snapshot_json", columnDefinition = "LONGTEXT", nullable = false)
    private String snapshotJson; // Full timetable state as JSON

    @Column(name = "source_file_name", length = 255)
    private String sourceFileName;

    @Column(name = "source_file_path", length = 512)
    private String sourceFilePath;

    @Column(name = "change_summary", length = 512)
    private String changeSummary;

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

