package com.placeprep.tools;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DriveWriteTool {
    private final DriveService driveService;

    public DriveWriteTool(DriveService driveService) {
        this.driveService = driveService;
    }

    @Tool(description = "Create a new placement drive. Requires TPO, Director, Management, or Administrator permission.")
    public Object createDrive(
            @ToolParam(description = "Company name, e.g. 'Google', 'Microsoft'") String companyName,
            @ToolParam(description = "Role title, e.g. 'Software Engineer'") String role,
            @ToolParam(description = "CTC package or stipend, e.g. '18 LPA' or '₹50,000/month'") String ctc,
            @ToolParam(description = "Minimum CGPA requirement, e.g. 7.5", required = false) Double minCgpa,
            @ToolParam(description = "Application deadline date, e.g. '2026-11-30'", required = false) String deadline,
            @ToolParam(description = "Drive date, e.g. '2026-12-10'", required = false) String driveDate,
            @ToolParam(description = "Venue or link, e.g. 'Auditorium' or 'Virtual'", required = false) String venue,
            @ToolParam(description = "Eligible graduation batch, e.g. '2026'", required = false) String batch,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canManageDrives(context)) {
            return AiToolAuthorization.accessDenied("create placement drives", "TPO, Director, Management, or Administrator");
        }
        PlacementDrive drive = new PlacementDrive();
        drive.setCompanyName(companyName != null && !companyName.isBlank() ? companyName : "Campus Recruiter");
        drive.setRole(role != null && !role.isBlank() ? role : "Graduate Engineer Trainee");
        drive.setCtc(ctc != null && !ctc.isBlank() ? ctc : "Competitive");
        drive.setMinCgpa(minCgpa != null ? minCgpa : 6.0);
        drive.setDeadline(deadline != null && !deadline.isBlank() ? deadline : "Open");
        drive.setDriveDate(driveDate != null && !driveDate.isBlank() ? driveDate : "TBA");
        drive.setVenue(venue != null && !venue.isBlank() ? venue : "Main Campus");
        drive.setStatus("ACTIVE");
        if (batch != null && !batch.isBlank()) {
            drive.setEligibleBatches(List.of(batch));
        }
        return driveService.createDto(drive);
    }

    public Object createDrive(PlacementDrive drive, ToolContext context) {
        if (!AiToolAuthorization.canManageDrives(context)) {
            return AiToolAuthorization.accessDenied("create placement drives", "TPO, Director, Management, or Administrator");
        }
        return driveService.createDto(drive);
    }

    @Tool(description = "Update rounds and round configuration for a placement drive. Requires placement staff permission.")
    public Object updateDriveRounds(String driveId, List<String> rounds, JsonNode roundConfigsJson, ToolContext context) {
        if (!AiToolAuthorization.canManageDrives(context)) {
            return AiToolAuthorization.accessDenied("update drive rounds", "TPO, Director, Management, or Administrator");
        }
        String serialized = roundConfigsJson == null || roundConfigsJson.isNull() ? null
                : roundConfigsJson.isTextual() ? roundConfigsJson.asText() : roundConfigsJson.toString();
        return driveService.updateRoundsDto(driveId, rounds, serialized);
    }

    @Tool(description = "Update venue, reporting time, and instructions for a placement drive. Requires placement staff permission.")
    public Object updateDriveInstructions(String driveId, String venue, String reportingTime,
                                          String instructions, ToolContext context) {
        if (!AiToolAuthorization.canManageDrives(context)) {
            return AiToolAuthorization.accessDenied("update drive instructions", "TPO, Director, Management, or Administrator");
        }
        return driveService.updateInstructionsDto(driveId, venue, reportingTime, instructions);
    }
}
