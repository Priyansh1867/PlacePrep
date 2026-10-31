package com.placeprep.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record AiMessage(
        @NotBlank String role,
        @NotBlank String content
) {
}
