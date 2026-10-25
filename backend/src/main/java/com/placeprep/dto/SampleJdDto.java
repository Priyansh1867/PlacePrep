package com.placeprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SampleJdDto {
    private String id;
    private String company;
    private String role;
    private String category;
    private String ctc;
    private String description;
    private List<String> keySkills;
}
