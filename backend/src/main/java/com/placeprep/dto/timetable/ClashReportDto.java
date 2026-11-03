package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClashReportDto {
    private String clashType; // CLASH_FACULTY_DOUBLE_BOOKED, CLASH_ROOM_DOUBLE_BOOKED, CLASH_GROUP_DOUBLE_BOOKED, CLASH_SECTION_OVERLAP
    private String message;
    private String day;
    private Integer periodIndex;
    private String periodRange;
    @Builder.Default
    private List<String> slotSourceRefs = new ArrayList<>();
}

