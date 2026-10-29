package com.placeprep.tools;

import com.placeprep.service.MockSessionService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class StudentMockSessionTool {
    private final MockSessionService mockSessionService;

    public StudentMockSessionTool(MockSessionService mockSessionService) {
        this.mockSessionService = mockSessionService;
    }

    @Tool(description = "List only the authenticated student's mock interview sessions.")
    public Object listMyMockSessions(ToolContext context) {
        return mockSessionService.getByUserId(AiToolAuthorization.userId(context));
    }
}
