package com.placeprep.tools;

import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.service.NotificationService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationTool {
    private final NotificationService notificationService;

    public NotificationTool(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Tool(description = "Get the authenticated user's campus announcements, recruitment drive alerts, and notices.")
    public Object getMyNotifications(ToolContext context) {
        String role = AiToolAuthorization.userRole(context);
        return EntityResponseMapper.toJsonSafe(notificationService.getNotificationsForUser(role, ""));
    }

    @Tool(description = "Get all campus announcements filtered by target role and batch.")
    public Object getNotificationsByRole(String role, String batch) {
        return EntityResponseMapper.toJsonSafe(notificationService.getNotificationsForUser(role, batch));
    }
}

