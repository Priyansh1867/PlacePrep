package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class ImportPreviewDto {
    private Long jobId;
    private TimetableDto timetableMeta;
    @Builder.Default
    private List<PeriodDto> periods = new ArrayList<>();
    @Builder.Default
    private List<SectionDto> sections = new ArrayList<>();
    @Builder.Default
    private List<LabGroupDto> labGroups = new ArrayList<>();
    @Builder.Default
    private List<SubjectDto> subjects = new ArrayList<>();
    @Builder.Default
    private List<FacultyResolutionDto> faculty = new ArrayList<>();
    @Builder.Default
    private List<RoomDto> rooms = new ArrayList<>();
    @Builder.Default
    private List<SlotDto> slots = new ArrayList<>();
    @Builder.Default
    private List<ImportIssueDto> warnings = new ArrayList<>();
    @Builder.Default
    private List<ImportIssueDto> errors = new ArrayList<>();
    @Builder.Default
    private List<ClashReportDto> clashes = new ArrayList<>();
    private ImportStatsDto stats;
    @Builder.Default
    private Map<String, Integer> slotCountsPerSection = new HashMap<>();
}

