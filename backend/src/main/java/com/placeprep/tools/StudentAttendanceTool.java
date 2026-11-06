package com.placeprep.tools;

import com.placeprep.service.AttendanceService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StudentAttendanceTool {
    private final AttendanceService attendanceService;

    public StudentAttendanceTool(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Tool(description = "Get only the authenticated student's attendance summary, including attended classes, total classes, percentage, subject-wise breakdown, and 75% shortage alert.")
    public Object getMyAttendance(ToolContext context) {
        String userId = AiToolAuthorization.userId(context);
        Object emailObj = context.getContext().get("userEmail");
        String email = emailObj instanceof String ? ((String) emailObj).trim() : "";

        Map<String, Object> summary = null;
        if (!email.isBlank()) {
            summary = attendanceService.getStudentAttendanceSummary(email);
        }
        if (summary == null || ((Number) summary.getOrDefault("totalClasses", 0)).intValue() == 0) {
            Map<String, Object> byId = attendanceService.getStudentAttendanceSummary(userId);
            if (byId != null && ((Number) byId.getOrDefault("totalClasses", 0)).intValue() > 0) {
                summary = byId;
            } else if (summary == null) {
                summary = byId;
            }
        }
        return summary;
    }
}
