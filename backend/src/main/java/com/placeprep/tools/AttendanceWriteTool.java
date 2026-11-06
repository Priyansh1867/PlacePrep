package com.placeprep.tools;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.service.AttendanceService;
import com.placeprep.mapper.EntityResponseMapper;
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
    public Object createClassSession(
            @ToolParam(description = "Department, e.g. 'CSE', 'IT'") String department,
            @ToolParam(description = "Semester, e.g. '6'") String semester,
            @ToolParam(description = "Subject code, e.g. 'CS601'") String subjectCode,
            @ToolParam(description = "Subject name, e.g. 'Computer Networks'") String subjectName,
            @ToolParam(description = "Session date in YYYY-MM-DD", required = false) String sessionDate,
            @ToolParam(description = "Period number, e.g. 1", required = false) Integer periodNumber,
            @ToolParam(description = "Section, e.g. 'A'", required = false) String section,
            ToolContext context
    ) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("create class attendance sessions", "Teaching or Management Staff");
        }
        ClassAttendanceSession session = ClassAttendanceSession.builder()
                .department(department)
                .semester(semester)
                .subjectCode(subjectCode)
                .subjectName(subjectName)
                .sessionDate(sessionDate != null && !sessionDate.isBlank() ? sessionDate : java.time.LocalDate.now().toString())
                .periodNumber(periodNumber != null ? periodNumber : 1)
                .section(section != null && !section.isBlank() ? section : "A")
                .facultyId(AiToolAuthorization.userId(context))
                .build();
        return EntityResponseMapper.toJsonSafe(attendanceService.createClassSessionDto(session));
    }

    public Object createClassSession(ClassAttendanceSession session, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("create class attendance sessions", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.createClassSessionDto(session));
    }

    @Tool(description = "Mark attendance for a class session. Requires teaching or management staff permission.")
    public Object markClassAttendance(Long sessionId, List<ClassAttendanceRecord> records, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("mark class attendance", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.markClassAttendanceDto(sessionId, records));
    }

    @Tool(description = "Create a CRT training session. Requires teaching or management staff permission.")
    public Object createCrtSession(CrtTrainingSession session, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("create CRT training sessions", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.createCrtSessionDto(session));
    }

    @Tool(description = "Update a CRT training session. Requires teaching or management staff permission.")
    public Object updateCrtSession(Long sessionId, CrtTrainingSession session, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("update CRT training sessions", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.updateCrtSessionDto(sessionId, session));
    }

    @Tool(description = "Update CRT session status. Requires teaching or management staff permission.")
    public Object updateCrtSessionStatus(Long sessionId, String status, ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("update CRT session status", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.updateCrtSessionStatusDto(sessionId, status));
    }

    @Tool(description = "Mark CRT attendance. Requires teaching or management staff permission.")
    public Object markCrtAttendance(Long sessionId, List<CrtAttendanceRecord> records,
                                    @ToolParam(description = "Staff identifier recording attendance") String recordedBy,
                                    ToolContext context) {
        if (!AiToolAuthorization.isStaff(context)) {
            return AiToolAuthorization.accessDenied("mark CRT attendance", "Teaching or Management Staff");
        }
        return EntityResponseMapper.toJsonSafe(attendanceService.markCrtAttendanceDto(sessionId, records, AiToolAuthorization.userId(context)));
    }
}
