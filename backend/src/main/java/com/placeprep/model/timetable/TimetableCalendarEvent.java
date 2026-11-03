package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tt_calendar_event",
        indexes = {
                @Index(name = "idx_tt_cal_event_dates", columnList = "start_date, end_date"),
                @Index(name = "idx_tt_cal_event_dept", columnList = "department_code"),
                @Index(name = "idx_tt_cal_event_scope", columnList = "scope")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableCalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private CalendarEventKind kind;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private CalendarEventScope scope;

    @Column(name = "department_code", length = 32)
    private String departmentCode;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @Column(name = "section_name", length = 16)
    private String sectionName;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(name = "created_by", length = 128)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 128)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

