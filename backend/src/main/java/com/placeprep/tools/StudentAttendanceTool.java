package com.placeprep.tools;

import com.placeprep.service.AttendanceService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class StudentAttendanceTool {
    private final AttendanceService attendanceService;

    public StudentAttendanceTool(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Tool(description = "Get only the authenticated student's attendance summary.")
    public Object getMyAttendance(ToolContext context) {
        return attendanceService.getStudentAttendanceSummary(AiToolAuthorization.userId(context));
    }
}
