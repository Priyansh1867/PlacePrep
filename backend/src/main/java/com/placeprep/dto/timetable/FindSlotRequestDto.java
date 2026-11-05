package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.RoomType;
import com.placeprep.model.timetable.SlotKind;
import com.placeprep.model.timetable.Term;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FindSlotRequestDto {
    private Long timetableId;
    private String academicSession;
    private Term term;
    private Long sectionId;
    private Long labGroupId;
    private Long subjectId;
    private SlotKind subjectKind;

    @Min(1)
    @Max(3)
    @Builder.Default
    private int duration = 1;

    @NotEmpty(message = "At least one faculty ID must be provided")
    private List<Long> facultyIds;

    private RoomType roomType;
    private Long preferredRoomId;
}

