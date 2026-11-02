package com.placeprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterTimetableDto {
    private Long id;
    private String title;
    private String academicSession;
    private String department;
    private String branch;
    private String semester;
    private String academicYear;
    private String section;
    private LocalDate effectiveStartDate;
    private LocalDate effectiveEndDate;
    private String description;
    private String status;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Integer version;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private LocalDateTime lastUpdated;
    private String lastUpdatedBy;
    private Integer versionsCount;
    private List<TimetableVersionDto> versions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimetableVersionDto {
        private Long id;
        private Integer versionNumber;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String changeSummary;
        private String uploadedBy;
        private LocalDateTime uploadedAt;
    }
}
