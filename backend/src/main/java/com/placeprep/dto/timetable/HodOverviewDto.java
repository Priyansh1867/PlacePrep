package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HodOverviewDto {
    private String departmentCode;
    private String departmentName;
    private List<FacultyLoadDto> facultyLoads;
    private List<SectionDto> sections;
    private List<RoomDto> roomsInUse;
    private List<TimetableDto> publishedTimetables;
    private String etag;
}

