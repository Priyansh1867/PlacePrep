package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSlotDto {
    private int dayOfWeek;
    private String dayName;
    private int startPeriod;
    private int endPeriod;
    private int span;
    private RoomDto room;
    private int score;
    private List<String> scoreReasons;
}

