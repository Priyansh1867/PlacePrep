package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.TimetableAuditLogDto;
import com.placeprep.model.AuditLog;
import com.placeprep.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableAuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<TimetableAuditLogDto> getTimetableLogs(LocalDate startDate, LocalDate endDate, String user, Long timetableId) {
        String startStr = startDate != null ? startDate.format(DateTimeFormatter.ISO_LOCAL_DATE) + " 00:00:00" : null;
        String endStr = endDate != null ? endDate.format(DateTimeFormatter.ISO_LOCAL_DATE) + " 23:59:59" : null;
        String userStr = (user != null && !user.isBlank()) ? user.trim() : null;
        String ttStr = (timetableId != null) ? String.valueOf(timetableId) : null;

        List<AuditLog> logs = auditLogRepository.findTimetableAuditLogs(startStr, endStr, userStr, ttStr);
        return logs.stream().map(this::toDto).collect(Collectors.toList());
    }

    private TimetableAuditLogDto toDto(AuditLog l) {
        return TimetableAuditLogDto.builder()
                .id(l.getId())
                .action(l.getAction())
                .performedBy(l.getPerformedBy())
                .performerRole(l.getPerformerRole())
                .targetResource(l.getTargetResource())
                .details(l.getDetails())
                .ipAddress(l.getIpAddress())
                .timestamp(l.getTimestamp())
                .build();
    }
}

