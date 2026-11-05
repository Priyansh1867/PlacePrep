package com.placeprep.service.timetable;

import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.Timetable;
import com.placeprep.model.timetable.TimetableSourceType;
import com.placeprep.model.timetable.TimetableStatus;
import com.placeprep.model.timetable.TimetableVersion;
import com.placeprep.repository.timetable.TimetableRepository;
import com.placeprep.repository.timetable.TimetableVersionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Idempotent startup migration runner that converts legacy file-blob 'master_timetables'
 * records into the new slot-based tt_timetable (status=ARCHIVED, source_type=LEGACY)
 * and tt_version tables.
 *
 * NOTE: The legacy physical table 'master_timetables' and 'timetable_versions' remain in MySQL
 * and can be safely dropped manually by the DBA once verified.
 */
@Component
@Order(10)
@Slf4j
public class LegacyTimetableMigrationRunner implements ApplicationRunner {

    private static final Pattern DIGIT_PATTERN = Pattern.compile("(\\d+)");

    private final JdbcTemplate jdbcTemplate;
    private final TimetableRepository timetableRepository;
    private final TimetableVersionRepository versionRepository;

    public LegacyTimetableMigrationRunner(
            JdbcTemplate jdbcTemplate,
            TimetableRepository timetableRepository,
            TimetableVersionRepository versionRepository
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.timetableRepository = timetableRepository;
        this.versionRepository = versionRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!checkLegacyTableExists()) {
            log.info("[LegacyTimetableMigration] Legacy table 'master_timetables' does not exist. Skipping migration.");
            return;
        }

        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.queryForList(
                    "SELECT id, title, academic_session, department, branch, semester, " +
                    "academic_year, section, effective_start_date, effective_end_date, " +
                    "status, file_name, file_type, file_size, file_path, version, " +
                    "uploaded_by, uploaded_at FROM master_timetables"
            );
        } catch (Exception ex) {
            log.warn("[LegacyTimetableMigration] Could not query master_timetables: {}. Skipping.", ex.getMessage());
            return;
        }

        if (rows.isEmpty()) {
            log.info("[LegacyTimetableMigration] Legacy table 'master_timetables' is empty. Migrated 0 rows.");
            return;
        }

        int migratedCount = 0;
        for (Map<String, Object> row : rows) {
            Number oldIdNum = (Number) row.get("id");
            Long oldId = oldIdNum != null ? oldIdNum.longValue() : null;
            String title = (String) row.get("title");
            if (title == null || title.isBlank()) {
                title = "Legacy Timetable #" + oldId;
            }

            // Idempotency check: verify if legacy record for this title and source type already exists
            if (timetableRepository.existsByTitleAndSourceType(title, TimetableSourceType.LEGACY)) {
                continue;
            }

            String session = (String) row.get("academic_session");
            if (session == null || session.isBlank()) {
                session = "2026-27";
            }

            String dept = (String) row.get("department");
            if (dept == null || dept.isBlank()) {
                dept = "Artificial Intelligence & Data Science";
            }

            String branch = (String) row.get("branch");
            String deptCode = (branch != null && !branch.isBlank()) ? branch.toUpperCase() : "AI&DS";

            String semStr = (String) row.get("semester");
            int sem = parseFirstDigit(semStr, 5);
            Term term = (sem % 2 != 0) ? Term.ODD : Term.EVEN;

            String yearStr = (String) row.get("academic_year");
            int yearOfStudy = parseFirstDigit(yearStr, Math.max(1, (sem + 1) / 2));

            LocalDate startDate = parseDate(row.get("effective_start_date"));
            LocalDate endDate = parseDate(row.get("effective_end_date"));

            String uploadedBy = (String) row.get("uploaded_by");
            if (uploadedBy == null || uploadedBy.isBlank()) {
                uploadedBy = "system-legacy-migration";
            }

            LocalDateTime uploadedAt = parseTimestamp(row.get("uploaded_at"));

            Number versionNum = (Number) row.get("version");
            int ver = (versionNum != null) ? versionNum.intValue() : 1;

            String fileName = (String) row.get("file_name");
            String filePath = (String) row.get("file_path");

            Timetable timetable = new Timetable();
            timetable.setTitle(title);
            timetable.setAcademicSession(session);
            timetable.setTerm(term);
            timetable.setDepartmentCode(deptCode);
            timetable.setDepartmentName(dept);
            timetable.setYearOfStudy(yearOfStudy);
            timetable.setSemester(sem);
            timetable.setStatus(TimetableStatus.ARCHIVED);
            timetable.setVersionNo(ver);
            timetable.setEffectiveFrom(startDate);
            timetable.setEffectiveTo(endDate);
            timetable.setSourceType(TimetableSourceType.LEGACY);
            timetable.setCreatedBy(uploadedBy);
            timetable.setPublishedBy(uploadedBy);
            timetable.setCreatedAt(uploadedAt);
            timetable.setUpdatedAt(uploadedAt);

            Timetable saved = timetableRepository.save(timetable);

            TimetableVersion version = new TimetableVersion();
            version.setTimetable(saved);
            version.setVersionNo(ver);
            version.setSnapshotJson("{}");
            version.setSourceFileName(fileName);
            version.setSourceFilePath(filePath);
            version.setChangeSummary("Migrated from legacy master_timetables row id=" + oldId);
            version.setCreatedBy(uploadedBy);
            version.setCreatedAt(uploadedAt);

            versionRepository.save(version);
            migratedCount++;
        }

        log.info("[LegacyTimetableMigration] Completed legacy timetable migration. Migrated {} rows to ARCHIVED legacy records.", migratedCount);
    }

    private boolean checkLegacyTableExists() {
        try {
            jdbcTemplate.execute("SELECT 1 FROM master_timetables LIMIT 1");
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private int parseFirstDigit(String input, int defaultVal) {
        if (input == null || input.isBlank()) {
            return defaultVal;
        }
        Matcher matcher = DIGIT_PATTERN.matcher(input);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {
            }
        }
        return defaultVal;
    }

    private LocalDate parseDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (obj instanceof LocalDate ld) {
            return ld;
        }
        return null;
    }

    private LocalDateTime parseTimestamp(Object obj) {
        if (obj == null) return LocalDateTime.now();
        if (obj instanceof Timestamp ts) {
            return ts.toLocalDateTime();
        }
        if (obj instanceof LocalDateTime ldt) {
            return ldt;
        }
        return LocalDateTime.now();
    }
}

