package com.placeprep.tools;

import com.placeprep.service.UserService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class UserTool {
    private final UserService userService;

    public UserTool(UserService userService) {
        this.userService = userService;
    }

    @Tool(description = "Get the authenticated student's placement preparation dashboard.")
    public Object getMyDashboard(ToolContext toolContext) {
        Object userId = toolContext.getContext().get("userId");
        if (!(userId instanceof Number number)) {
            throw new IllegalStateException("Authenticated user context is missing");
        }
        return userService.getDashboardData(number.longValue());
    }
}
