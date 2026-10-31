package com.placeprep.tools;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.service.AttendanceService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AttendanceWriteTool {
    private final AttendanceService attendanceService;

    public AttendanceWriteTool(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Tool(description = "Create a class attendance session. Requires teaching or management staff permission.")
    public Object createClassSession(ClassAttendanceSession session, ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.createClassSession(session);
    }

    @Tool(description = "Mark attendance for a class session. Requires teaching or management staff permission.")
    public Object markClassAttendance(Long sessionId, List<ClassAttendanceRecord> records, ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.markClassAttendance(sessionId, records);
    }

    @Tool(description = "Create a CRT training session. Requires teaching or management staff permission.")
    public Object createCrtSession(CrtTrainingSession session, ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.createCrtSession(session);
    }

    @Tool(description = "Update a CRT training session. Requires teaching or management staff permission.")
    public Object updateCrtSession(Long sessionId, CrtTrainingSession session, ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.updateCrtSession(sessionId, session);
    }

    @Tool(description = "Update CRT session status. Requires teaching or management staff permission.")
    public Object updateCrtSessionStatus(Long sessionId, String status, ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.updateCrtSessionStatus(sessionId, status);
    }

    @Tool(description = "Mark CRT attendance. Requires teaching or management staff permission.")
    public Object markCrtAttendance(Long sessionId, List<CrtAttendanceRecord> records,
                                    @ToolParam(description = "Staff identifier recording attendance") String recordedBy,
                                    ToolContext context) {
        AiToolAuthorization.requireStaff(context);
        return attendanceService.markCrtAttendance(sessionId, records, recordedBy);
    }
}
