package com.placeprep.tools;

import com.placeprep.service.UserService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class UserWriteTool {
    private final UserService userService;

    public UserWriteTool(UserService userService) {
        this.userService = userService;
    }

    @Tool(description = "Update the authenticated student's graduation batch.")
    public Object updateMyBatch(String batch, ToolContext context) {
        return userService.updateBatch(Long.parseLong(AiToolAuthorization.userId(context)), batch);
    }

    @Tool(description = "Toggle a question in the authenticated student's saved questions.")
    public Object toggleMySavedQuestion(String questionId, ToolContext context) {
        return userService.toggleSavedQuestion(Long.parseLong(AiToolAuthorization.userId(context)), questionId);
    }

    @Tool(description = "Toggle a question in the authenticated student's practiced questions.")
    public Object toggleMyPracticedQuestion(String questionId, ToolContext context) {
        return userService.togglePracticedQuestion(Long.parseLong(AiToolAuthorization.userId(context)), questionId);
    }

    @Tool(description = "Toggle a question in the authenticated student's revision list.")
    public Object toggleMyRevisionQuestion(String questionId, ToolContext context) {
        return userService.toggleRevisionQuestion(Long.parseLong(AiToolAuthorization.userId(context)), questionId);
    }

    @Tool(description = "Toggle a company in the authenticated student's saved companies.")
    public Object toggleMySavedCompany(String companyId, ToolContext context) {
        return userService.toggleSavedCompany(Long.parseLong(AiToolAuthorization.userId(context)), companyId);
    }
}
