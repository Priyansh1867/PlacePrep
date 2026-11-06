package com.placeprep.tools;

import com.placeprep.model.PlacementDrive;
import com.placeprep.service.DriveService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DriveTool {
    private final DriveService driveService;

    public DriveTool(DriveService driveService) {
        this.driveService = driveService;
    }

    @Tool(description = "List all campus placement drives, company roles, CTC packages, minimum CGPAs, and deadlines, optionally filtered by eligible batch.")
    public Object listDrives(@ToolParam(description = "Graduation batch, or blank for all drives") String batch) {
        List<PlacementDrive> drives = driveService.getAll(batch);
        return drives != null ? drives : List.of();
    }

    @Tool(description = "Get one placement drive by its identifier.")
    public Object getDrive(@ToolParam(description = "Placement drive identifier") String driveId) {
        PlacementDrive drive = driveService.getByDriveId(driveId);
        return drive != null ? drive : driveService.getByDriveIdDto(driveId);
    }

    @Tool(description = "Get placement drive calendar events.")
    public Object getDriveCalendar() {
        return driveService.getCalendarEvents();
    }

    @Tool(description = "Get all placement drives for a specific company identifier.")
    public Object getDrivesByCompany(@ToolParam(description = "Company identifier, e.g. 'google', 'microsoft'") String companyId) {
        List<PlacementDrive> drives = driveService.getByCompanyId(companyId);
        return drives != null ? drives : List.of();
    }
}
