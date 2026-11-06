package com.placeprep.tools;

import com.placeprep.model.Notification;
import com.placeprep.service.NotificationService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class NotificationWriteTool {
    private final NotificationService notificationService;

    public NotificationWriteTool(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Tool(description = "Broadcast a campus announcement or placement alert. Requires TPO, Director, Management, or Administrator permission.")
    public Object broadcast(
            @ToolParam(description = "Notification title or headline") String title,
            @ToolParam(description = "Detailed announcement message") String message,
            @ToolParam(description = "Target audience: 'ALL', 'STUDENT', 'TEACHER', 'TPO'", required = false) String targetRole,
            @ToolParam(description = "Type: 'GENERAL_ANNOUNCEMENT', 'DRIVE_ALERT', 'SHORTLIST_NOTICE', 'HACKATHON'", required = false) String type,
            @ToolParam(description = "Target batch, e.g. '2026' or blank for all", required = false) String targetBatch,
            @ToolParam(description = "Sender name or office, e.g. 'TPO Office'", required = false) String senderName,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canBroadcastNotifications(context)) {
            return AiToolAuthorization.accessDenied("broadcast notifications", "TPO, Director, Management, or Administrator");
        }
        Notification n = Notification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole != null && !targetRole.isBlank() ? targetRole.toUpperCase() : "ALL")
                .type(type != null && !type.isBlank() ? type.toUpperCase() : "GENERAL_ANNOUNCEMENT")
                .targetBatch(targetBatch)
                .senderName(senderName != null && !senderName.isBlank() ? senderName : "Placement Cell")
                .build();
        return EntityResponseMapper.toJsonSafe(notificationService.broadcast(n));
    }

    public Object broadcast(Notification notification, ToolContext context) {
        if (!AiToolAuthorization.canBroadcastNotifications(context)) {
            return AiToolAuthorization.accessDenied("broadcast notifications", "TPO, Director, Management, or Administrator");
        }
        return EntityResponseMapper.toJsonSafe(notificationService.broadcast(notification));
    }
}
