package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "tt_subject",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tt_subject_dept_rtu_kind", columnNames = {"department_code", "rtu_code", "kind"})
        },
        indexes = {
                @Index(name = "idx_tt_subject_dept_sem", columnList = "department_code, semester"),
                @Index(name = "idx_tt_subject_short_code", columnList = "short_code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_code", nullable = false, length = 32)
    private String departmentCode; // e.g. "AIDS"

    @Column(name = "rtu_code", nullable = false, length = 64)
    private String rtuCode; // e.g. "5AID4-02"

    @Column(nullable = false, length = 128)
    private String name; // e.g. "Compiler Design"

    @Column(name = "short_code", nullable = false, length = 32)
    private String shortCode; // e.g. "CD"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private SubjectKind kind = SubjectKind.THEORY;

    @Column(nullable = false)
    private Integer semester; // e.g. 5
}

