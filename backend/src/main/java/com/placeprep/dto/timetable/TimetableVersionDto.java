package com.placeprep.dto.timetable;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableVersionDto {
    private Long id;
    private Long timetableId;
    private Integer versionNo;
    private String snapshotJson;
    private String sourceFileName;
    private String sourceFilePath;
    private String changeSummary;
    private String createdBy;
    private LocalDateTime createdAt;
}

