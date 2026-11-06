package com.placeprep.tools;

import com.placeprep.service.ApplicationService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StudentApplicationTool {
    private final ApplicationService applicationService;

    public StudentApplicationTool(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Tool(description = "List only the authenticated student's placement applications, statuses, round progress, and results. Never accepts another student's identifier.")
    public Object listMyApplications(ToolContext context) {
        String userId = AiToolAuthorization.userId(context);
        Object emailObj = context.getContext().get("userEmail");
        String email = emailObj instanceof String ? ((String) emailObj).trim() : "";

        var apps = applicationService.getStudentApplications(userId);
        if ((apps == null || apps.isEmpty()) && !email.isBlank()) {
            apps = applicationService.getStudentApplications(email);
        }
        return EntityResponseMapper.toJsonSafe(apps != null ? apps : List.of());
    }
}
