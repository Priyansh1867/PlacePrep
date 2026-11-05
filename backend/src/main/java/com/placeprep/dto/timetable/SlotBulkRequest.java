package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotBulkRequest {
    private List<SlotDto> slots;
    private Long timetableVersion;
}

