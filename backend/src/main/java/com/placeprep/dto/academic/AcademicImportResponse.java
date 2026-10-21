package com.placeprep.dto.academic;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AcademicImportResponse {

    private int imported;
    private int updated;
    private String summary;
    private List<Map<String, String>> errors;
}
