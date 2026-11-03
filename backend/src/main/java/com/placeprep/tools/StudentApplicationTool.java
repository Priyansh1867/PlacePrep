package com.placeprep.tools;

import com.placeprep.service.ApplicationService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class StudentApplicationTool {
    private final ApplicationService applicationService;

    public StudentApplicationTool(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Tool(description = "List only the authenticated student's placement applications. Never accepts another student's identifier.")
    public Object listMyApplications(ToolContext context) {
        return EntityResponseMapper.toJsonSafe(applicationService.getStudentApplications(AiToolAuthorization.userId(context)));
    }
}
