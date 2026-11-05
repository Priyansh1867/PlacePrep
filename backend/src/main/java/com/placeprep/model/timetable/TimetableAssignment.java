package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "tt_assignment",
        indexes = {
                @Index(name = "idx_tt_assignment_timetable_id", columnList = "timetable_id"),
                @Index(name = "idx_tt_assignment_section_id", columnList = "section_id"),
                @Index(name = "idx_tt_assignment_lab_group_id", columnList = "lab_group_id"),
                @Index(name = "idx_tt_assignment_subject_id", columnList = "subject_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    @JsonIgnore
    private Timetable timetable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private TimetableSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_group_id")
    private TimetableLabGroup labGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private TimetableSubject subject;

    @ManyToMany
    @JoinTable(
            name = "tt_assignment_faculty",
            joinColumns = @JoinColumn(name = "assignment_id"),
            inverseJoinColumns = @JoinColumn(name = "faculty_id"),
            indexes = {
                    @Index(name = "idx_tt_assignment_fac_assignment_id", columnList = "assignment_id"),
                    @Index(name = "idx_tt_assignment_fac_faculty_id", columnList = "faculty_id")
            }
    )
    private Set<FacultyProfile> faculty = new HashSet<>();
}

