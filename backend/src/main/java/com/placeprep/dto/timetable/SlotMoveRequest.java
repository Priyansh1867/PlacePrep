package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotMoveRequest {
    private Integer dayOfWeek;
    private Integer startPeriod;
}

