package com.placeprep.service;

import com.placeprep.model.AuditLog;
import com.placeprep.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AuditLogService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AuditLog logAction(String action, String performedBy, String performerRole, String targetResource, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy != null ? performedBy : "SYSTEM")
                .performerRole(performerRole != null ? performerRole : "ADMIN")
                .targetResource(targetResource)
                .details(details)
                .timestamp(LocalDateTime.now().format(TS))
                .build();
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
