package com.placeprep.dto.timetable;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodDto {
    private Long id;
    private Long timetableId;
    private Integer periodIndex;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isBreak;
    private String label;
}

