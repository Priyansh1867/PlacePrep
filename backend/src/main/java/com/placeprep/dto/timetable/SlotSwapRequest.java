package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotSwapRequest {
    private Long slotIdA;
    private Long slotIdB;
}
