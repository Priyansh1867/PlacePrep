package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "tt_override",
        indexes = {
                @Index(name = "idx_tt_override_slot_id", columnList = "slot_id"),
                @Index(name = "idx_tt_override_slot_date", columnList = "slot_id, on_date"),
                @Index(name = "idx_tt_override_sub_fac_id", columnList = "substitute_faculty_id"),
                @Index(name = "idx_tt_override_new_room_id", columnList = "new_room_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private TimetableSlot slot;

    @Column(name = "on_date", nullable = false)
    private LocalDate onDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OverrideKind kind = OverrideKind.CANCEL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "substitute_faculty_id")
    private FacultyProfile substituteFaculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_room_id")
    private TimetableRoom newRoom;

    @Column(name = "new_start")
    private LocalTime newStart;

    @Column(name = "new_end")
    private LocalTime newEnd;

    @Column(length = 255)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OverrideStatus status = OverrideStatus.PENDING;

    @Column(name = "requested_by", length = 128)
    private String requestedBy;

    @Column(name = "decided_by", length = 128)
    private String decidedBy;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "peer_override_id")
    private Long peerOverrideId;
}

