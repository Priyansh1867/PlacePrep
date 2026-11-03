package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableDiffDto {
    private Integer fromVersion;
    private Integer toVersion;

    @Builder.Default
    private List<SlotDto> addedSlots = new ArrayList<>();

    @Builder.Default
    private List<SlotDto> removedSlots = new ArrayList<>();

    @Builder.Default
    private List<SlotChangeDto> modifiedSlots = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotChangeDto {
        private SlotDto before;
        private SlotDto after;
        private String changeDescription;
    }
}

