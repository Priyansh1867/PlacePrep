package com.placeprep.dto.timetable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.placeprep.model.timetable.OverrideKind;
import com.placeprep.model.timetable.SlotKind;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class SlotDto {
    private Long id;
    private Long timetableId;
    private Long sectionId;
    private String sectionName;
    private Long labGroupId;
    private String labGroupCode;
    private Integer dayOfWeek;
    private Integer startPeriod;
    private Integer span;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long roomId;
    private String roomCode;
    private SlotKind slotKind;
    private LocalTime customStart;
    private LocalTime customEnd;
    private String note;
    private String sourceRef;
    private List<Long> facultyIds;
    private List<String> facultyNames;
    private Long version;
    private Boolean isCancelled;
    private String overrideNotice;
    private OverrideKind overrideKind;
    @Builder.Default
    private Double confidence = 1.0;

    // Academic Calendar & Event Note
    private String eventNote;

    // Integration aliases for attendance & external modules
    @JsonProperty("slotId")
    public Long getSlotId() {
        return id;
    }

    @JsonProperty("section")
    public String getSection() {
        return sectionName;
    }

    @JsonProperty("labGroup")
    public String getLabGroup() {
        return labGroupCode;
    }

    @JsonProperty("subject")
    public String getSubject() {
        if (subjectName != null && !subjectName.isBlank()) return subjectName;
        return subjectCode;
    }

    @JsonProperty("time")
    public String getTime() {
        if (customStart != null && customEnd != null) {
            return customStart + " - " + customEnd;
        }
        if (startPeriod != null) {
            return "P" + startPeriod + (span != null && span > 1 ? " (" + span + "h)" : "");
        }
        return "";
    }

    @JsonProperty("room")
    public String getRoom() {
        return roomCode;
    }
}
