package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "tt_slot",
        indexes = {
                @Index(name = "idx_tt_slot_tt_sec_day", columnList = "timetable_id, section_id, day_of_week"),
                @Index(name = "idx_tt_slot_tt_day_start", columnList = "timetable_id, day_of_week, start_period"),
                @Index(name = "idx_tt_slot_timetable_id", columnList = "timetable_id"),
                @Index(name = "idx_tt_slot_section_id", columnList = "section_id"),
                @Index(name = "idx_tt_slot_lab_group_id", columnList = "lab_group_id"),
                @Index(name = "idx_tt_slot_subject_id", columnList = "subject_id"),
                @Index(name = "idx_tt_slot_room_id", columnList = "room_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableSlot {

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
    private TimetableLabGroup labGroup; // null = whole section

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1 (Mon) to 6 (Sat)

    @Column(name = "start_period", nullable = false)
    private Integer startPeriod; // 1-based index matching TimetablePeriod.periodIndex

    @Column(nullable = false)
    private Integer span = 1; // >= 1

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private TimetableSubject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private TimetableRoom room;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_kind", nullable = false, length = 24)
    private SlotKind slotKind = SlotKind.THEORY;

    @Column(name = "custom_start")
    private LocalTime customStart; // e.g. for half-period labs like 2:00

    @Column(name = "custom_end")
    private LocalTime customEnd; // e.g. 3:30

    @Column(length = 255)
    private String note;

    @Column(name = "source_ref", length = 128)
    private String sourceRef; // e.g. "V Sem Master TT!B6"

    @ManyToMany
    @JoinTable(
            name = "tt_slot_faculty",
            joinColumns = @JoinColumn(name = "slot_id"),
            inverseJoinColumns = @JoinColumn(name = "faculty_id"),
            indexes = {
                    @Index(name = "idx_tt_slot_fac_slot_id", columnList = "slot_id"),
                    @Index(name = "idx_tt_slot_fac_faculty_id", columnList = "faculty_id")
            }
    )
    private Set<FacultyProfile> faculty = new HashSet<>();

    @Version
    @Column(name = "opt_lock_version")
    private Long version;

    public Set<FacultyProfile> getFacultyMembers() {
        return faculty;
    }
}

