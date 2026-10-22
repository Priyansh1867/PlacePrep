package com.placeprep.dto.coding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CodingExecutionRequest {

    @NotBlank
    @Size(max = 80)
    private String problemId;

    @NotBlank
    @Size(max = 20)
    private String language;

    @NotBlank
    @Size(max = 40000)
    private String sourceCode;

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }
}
