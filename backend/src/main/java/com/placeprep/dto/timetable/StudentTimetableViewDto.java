package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.Term;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentTimetableViewDto {
    private boolean unassigned;
    private String message;
    private Long timetableId;
    private String academicSession;
    private Term term;
    private String departmentCode;
    private Integer semester;
    private String sectionName;
    private String labGroupCode;
    private List<PeriodDto> periods;
    private List<SlotDto> slots;
    private String etag;

    // Academic calendar integration
    private String eventNote;
    private List<CalendarEventDto> calendarEvents;
}
