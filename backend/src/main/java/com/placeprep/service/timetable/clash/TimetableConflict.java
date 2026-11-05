package com.placeprep.service.timetable.clash;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableConflict {
    private ConflictSeverity severity;
    private String code;
    private String message;

    @Builder.Default
    private List<Long> slotIds = new ArrayList<>();

    @Builder.Default
    private List<String> cellRefs = new ArrayList<>();
}

