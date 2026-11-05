package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.OverrideKind;
import com.placeprep.model.timetable.OverrideStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverrideDto {
    private Long id;
    private Long slotId;
    private LocalDate onDate;
    private OverrideKind kind;
    private FacultyProfileDto substituteFaculty;
    private RoomDto newRoom;
    private LocalTime newStart;
    private LocalTime newEnd;
    private String reason;
    private OverrideStatus status;
    private String requestedBy;
    private String decidedBy;
    private LocalDateTime decidedAt;
    private SlotDto originalSlot;
    private Long peerOverrideId;
}
