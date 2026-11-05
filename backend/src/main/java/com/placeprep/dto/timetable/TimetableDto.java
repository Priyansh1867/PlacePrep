package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.TimetableSourceType;
import com.placeprep.model.timetable.TimetableStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableDto {
    private Long id;
    private String academicSession;
    private Term term;
    private String departmentCode;
    private String departmentName;
    private Integer yearOfStudy;
    private Integer semester;
    private String title;
    private TimetableStatus status;
    private Integer versionNo;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private TimetableSourceType sourceType;
    private LocalDateTime publishedAt;
    private String publishedBy;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private Long version;

    private List<PeriodDto> periods;
    private List<SectionDto> sections;
    private List<SlotDto> slots;
    private CoverageReportDto coverageReport;
}


