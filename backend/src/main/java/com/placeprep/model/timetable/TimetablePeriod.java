package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(
        name = "tt_period",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tt_period_timetable_index", columnNames = {"timetable_id", "period_index"})
        },
        indexes = {
                @Index(name = "idx_tt_period_timetable_id", columnList = "timetable_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetablePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    @JsonIgnore
    private Timetable timetable;

    @Column(name = "period_index", nullable = false)
    private Integer periodIndex; // 1-based

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_break", nullable = false)
    private Boolean isBreak = false;

    @Column(length = 64)
    private String label;
}

