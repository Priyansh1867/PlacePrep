package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.RoomType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomUtilisationReportDto {
    private Long roomId;
    private String roomCode;
    private String displayName;
    private RoomType roomType;
    private String building;
    private Integer capacity;
    private int hoursUsed;
    private int gridHours;
    private double utilizationPercent;
    private boolean isIdle;
}

