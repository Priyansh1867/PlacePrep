package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionDto {
    private Long id;
    private Long timetableId;
    private String name;
    private Long homeRoomId;
    private String homeRoomCode;
    private Long classCoordinatorId;
    private String classCoordinatorName;
    private List<LabGroupDto> labGroups;
}

