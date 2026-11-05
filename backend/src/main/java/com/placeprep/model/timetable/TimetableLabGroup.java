package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "tt_lab_group",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tt_lab_group_section_code", columnNames = {"section_id", "code"})
        },
        indexes = {
                @Index(name = "idx_tt_lab_group_section_id", columnList = "section_id"),
                @Index(name = "idx_tt_lab_group_mentor_id", columnList = "mentor_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableLabGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private TimetableSection section;

    @Column(nullable = false, length = 32)
    private String code; // e.g. "A1", "A2"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private FacultyProfile mentor;
}

