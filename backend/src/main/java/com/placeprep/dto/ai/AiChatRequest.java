package com.placeprep.dto.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record AiChatRequest(
        @NotBlank String message,
        @Valid List<AiMessage> history
) {
    public List<AiMessage> safeHistory() {
        return history == null ? List.of() : history;
    }
}
