package com.placeprep.tools;

import com.placeprep.model.MockSession;
import com.placeprep.service.MockSessionService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class MockSessionWriteTool {
    private final MockSessionService mockSessionService;

    public MockSessionWriteTool(MockSessionService mockSessionService) {
        this.mockSessionService = mockSessionService;
    }

    @Tool(description = "Create a mock interview session for the authenticated student.")
    public Object createMockSession(MockSession session, ToolContext context) {
        session.setUserId(AiToolAuthorization.userId(context));
        return EntityResponseMapper.toJsonSafe(mockSessionService.save(session));
    }
}
