package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "tt_section",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tt_section_timetable_name", columnNames = {"timetable_id", "name"})
        },
        indexes = {
                @Index(name = "idx_tt_section_timetable_id", columnList = "timetable_id"),
                @Index(name = "idx_tt_section_home_room_id", columnList = "home_room_id"),
                @Index(name = "idx_tt_section_class_coord_id", columnList = "class_coordinator_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    @JsonIgnore
    private Timetable timetable;

    @Column(nullable = false, length = 32)
    private String name; // e.g. "A", "B"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_room_id")
    private TimetableRoom homeRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_coordinator_id")
    private FacultyProfile classCoordinator;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimetableLabGroup> labGroups = new ArrayList<>();
}

