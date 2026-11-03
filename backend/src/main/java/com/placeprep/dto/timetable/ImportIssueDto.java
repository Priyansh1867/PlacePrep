package com.placeprep.dto.timetable;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportIssueDto {
    private String sheetName;
    private String cellRef;
    private String code;
    private String message;
    private String severity; // WARNING or ERROR
}

