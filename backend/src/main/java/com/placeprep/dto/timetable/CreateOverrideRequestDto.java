package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.OverrideKind;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOverrideRequestDto {
    @NotNull
    private Long slotId;
    @NotNull
    private LocalDate onDate;
    @NotNull
    private OverrideKind kind;

    private Long substituteFacultyId;
    private Long newRoomId;
    private LocalTime newStart;
    private LocalTime newEnd;
    private String reason;
}

