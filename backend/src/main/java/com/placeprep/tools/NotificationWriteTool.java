package com.placeprep.tools;

import com.placeprep.model.Notification;
import com.placeprep.service.NotificationService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class NotificationWriteTool {
    private final NotificationService notificationService;

    public NotificationWriteTool(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Tool(description = "Broadcast a placement notification. Requires ADMIN permission.")
    public Object broadcast(Notification notification, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return notificationService.broadcast(notification);
    }
}
