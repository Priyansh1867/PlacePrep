package com.placeprep.service;

import com.placeprep.model.Notification;
import com.placeprep.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification broadcast(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now().format(TS));
        }
        if (notification.getTargetRole() == null || notification.getTargetRole().trim().isEmpty()) {
            notification.setTargetRole("ALL");
        }
        if (notification.getType() == null || notification.getType().trim().isEmpty()) {
            notification.setType("GENERAL_ANNOUNCEMENT");
        }
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String role, String batch) {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();

        return all.stream()
                .filter(n -> {
                    String target = n.getTargetRole();
                    if ("ALL".equalsIgnoreCase(target)) {
                        // Check batch filter if specified on notification
                        if (n.getTargetBatch() != null && !n.getTargetBatch().trim().isEmpty() && batch != null) {
                            return n.getTargetBatch().equalsIgnoreCase(batch);
                        }
                        return true;
                    }
                    if (role != null && target.equalsIgnoreCase(role)) {
                        if (n.getTargetBatch() != null && !n.getTargetBatch().trim().isEmpty() && batch != null) {
                            return n.getTargetBatch().equalsIgnoreCase(batch);
                        }
                        return true;
                    }
                    if ("FINAL_YEAR_ONLY".equalsIgnoreCase(target)) {
                        return "2026".equalsIgnoreCase(batch);
                    }
                    return false;
                })
                .toList();
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
