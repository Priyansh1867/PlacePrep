package com.placeprep.service;

import com.placeprep.model.AuditLog;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AuditLogService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public EntityResponseDto logAction(String action, String performedBy, String performerRole, String targetResource, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy != null ? performedBy : "SYSTEM")
                .performerRole(performerRole != null ? performerRole : "ADMIN")
                .targetResource(targetResource)
                .details(details)
                .timestamp(LocalDateTime.now().format(TS))
                .build();
        return EntityResponseMapper.toDto(auditLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getRecentLogs() {
        return EntityResponseMapper.toDtoList(auditLogRepository.findTop100ByOrderByTimestampDesc());
    }
}
