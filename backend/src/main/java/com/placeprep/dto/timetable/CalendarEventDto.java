package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.CalendarEventScope;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private CalendarEventKind kind;
    private CalendarEventScope scope;
    private String departmentCode;
    private Integer yearOfStudy;
    private String sectionName;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}

