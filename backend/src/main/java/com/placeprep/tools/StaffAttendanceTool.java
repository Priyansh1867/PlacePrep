package com.placeprep.tools;

import com.placeprep.service.AttendanceService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class StaffAttendanceTool {
    private final AttendanceService attendanceService;

    public StaffAttendanceTool(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Tool(description = "Get class attendance sessions for authorized teaching or management staff.")
    public Object listClassSessions(String department, String semester, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("view departmental class attendance sessions", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.getClassSessionsDto(department, semester));
    }

    @Tool(description = "Get attendance records for a session, for authorized staff only.")
    public Object getSessionRecords(@ToolParam(description = "Class session ID") Long sessionId, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("view student class session records", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.getSessionRecordsDto(sessionId));
    }

    @Tool(description = "Get a department attendance report, for authorized staff only.")
    public Object getAttendanceReport(String department, String semester, String subjectCode, String targetDate,
                                      ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("view department attendance reports", "Teaching or Management Staff");
        }
        return attendanceService.getClassAttendanceReport(department, semester, subjectCode, targetDate);
    }
}
