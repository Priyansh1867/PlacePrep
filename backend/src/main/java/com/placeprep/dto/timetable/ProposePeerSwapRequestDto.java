package com.placeprep.dto.timetable;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposePeerSwapRequestDto {
    @NotNull(message = "mySlotId is required")
    private Long mySlotId;

    @NotNull(message = "peerSlotId is required")
    private Long peerSlotId;

    @NotNull(message = "onDate is required")
    private LocalDate onDate;

    private String reason;
}

