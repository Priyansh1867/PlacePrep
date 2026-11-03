package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.ImportJobStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportJobDto {
    private Long id;
    private String fileName;
    private String fileType;
    private ImportJobStatus status;
    private String reportJson;
    private String createdBy;
    private LocalDateTime createdAt;
}

