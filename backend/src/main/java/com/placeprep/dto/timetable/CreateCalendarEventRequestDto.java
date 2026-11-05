package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.CalendarEventKind;
import com.placeprep.model.timetable.CalendarEventScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCalendarEventRequestDto {

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    @NotNull(message = "endDate is required")
    private LocalDate endDate;

    @NotNull(message = "kind is required")
    private CalendarEventKind kind;

    @NotNull(message = "scope is required")
    private CalendarEventScope scope;

    private String departmentCode;
    private Integer yearOfStudy;
    private String sectionName;

    @NotBlank(message = "title is required")
    private String title;

    private String description;
}

