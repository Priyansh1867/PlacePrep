package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.placeprep.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "tt_student_group",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tt_student_group_tt_roll", columnNames = {"timetable_id", "roll_number"})
        },
        indexes = {
                @Index(name = "idx_tt_student_group_timetable_id", columnList = "timetable_id"),
                @Index(name = "idx_tt_student_group_section_id", columnList = "section_id"),
                @Index(name = "idx_tt_student_group_lab_group_id", columnList = "lab_group_id"),
                @Index(name = "idx_tt_student_group_user_id", columnList = "user_id"),
                @Index(name = "idx_tt_student_group_roll_no", columnList = "roll_number")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableStudentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "roll_number", nullable = false, length = 64)
    private String rollNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable timetable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private TimetableSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_group_id")
    private TimetableLabGroup labGroup;
}

