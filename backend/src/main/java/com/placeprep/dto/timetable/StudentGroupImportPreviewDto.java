package com.placeprep.dto.timetable;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupImportPreviewDto {
    private int totalRows;
    private int matchedUsersCount;
    private int unmatchedUsersCount;

    @Builder.Default
    private List<StudentGroupRowDto> rows = new ArrayList<>();

    @Builder.Default
    private List<String> unmatchedRollNumbers = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentGroupRowDto {
        private String rollNumber;
        private String email;
        private String section;
        private String labGroup;
        private Long matchedUserId;
        private String matchedUserName;
        private String status; // MATCHED, UNMATCHED, INVALID_SECTION
    }
}

