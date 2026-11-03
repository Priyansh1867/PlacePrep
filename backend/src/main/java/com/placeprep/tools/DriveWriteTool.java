package com.placeprep.tools;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DriveWriteTool {
    private final DriveService driveService;

    public DriveWriteTool(DriveService driveService) {
        this.driveService = driveService;
    }

    @Tool(description = "Create a placement drive from the supplied details. Requires ADMIN permission.")
    public Object createDrive(PlacementDrive drive, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return driveService.createDto(drive);
    }

    @Tool(description = "Update rounds and round configuration for a placement drive. Requires ADMIN permission.")
    public Object updateDriveRounds(String driveId, List<String> rounds, JsonNode roundConfigsJson, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        String serialized = roundConfigsJson == null || roundConfigsJson.isNull() ? null
                : roundConfigsJson.isTextual() ? roundConfigsJson.asText() : roundConfigsJson.toString();
        return driveService.updateRoundsDto(driveId, rounds, serialized);
    }

    @Tool(description = "Update venue, reporting time, and instructions for a placement drive. Requires ADMIN permission.")
    public Object updateDriveInstructions(String driveId, String venue, String reportingTime,
                                          String instructions, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return driveService.updateInstructionsDto(driveId, venue, reportingTime, instructions);
    }
}
