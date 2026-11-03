package com.placeprep.dto.timetable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableAuditLogDto {
    private Long id;
    private String action;
    private String performedBy;
    private String performerRole;
    private String targetResource;
    private String details;
    private String ipAddress;
    private String timestamp;
}

