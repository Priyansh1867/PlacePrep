package com.placeprep.dto.timetable;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupImportCommitRequest {
    private Long timetableId;
    private List<StudentGroupImportPreviewDto.StudentGroupRowDto> rows;
}

