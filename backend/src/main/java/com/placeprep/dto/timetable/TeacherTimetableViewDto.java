package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherTimetableViewDto {
    private boolean needsLinking;
    private String message;
    private FacultyProfileDto facultyProfile;
    private List<FacultyProfileDto> suggestedProfiles;
    private List<PeriodDto> periods;
    private List<SlotDto> slots;
    private String etag;

    // Academic calendar integration
    private String eventNote;
    private List<CalendarEventDto> calendarEvents;
}
