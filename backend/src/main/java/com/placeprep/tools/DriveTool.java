package com.placeprep.tools;

import com.placeprep.service.DriveService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class DriveTool {
    private final DriveService driveService;

    public DriveTool(DriveService driveService) {
        this.driveService = driveService;
    }

    @Tool(description = "List placement drives, optionally filtered by eligible batch.")
    public Object listDrives(@ToolParam(description = "Graduation batch, or blank for all drives") String batch) {
        return driveService.getAll(batch);
    }

    @Tool(description = "Get one placement drive by its identifier.")
    public Object getDrive(@ToolParam(description = "Placement drive identifier") String driveId) {
        return driveService.getByDriveId(driveId);
    }

    @Tool(description = "Get placement drive calendar events.")
    public Object getDriveCalendar() {
        return driveService.getCalendarEvents();
    }
}
