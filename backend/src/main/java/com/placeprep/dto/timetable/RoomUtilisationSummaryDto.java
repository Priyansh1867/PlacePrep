package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomUtilisationSummaryDto {
    private int totalRooms;
    private int idleRoomsCount;
    private double averageUtilizationPercent;
    private List<RoomUtilisationReportDto> rooms;
}

