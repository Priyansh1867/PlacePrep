package com.placeprep.timetable;

import com.placeprep.model.timetable.Timetable;
import com.placeprep.model.timetable.TimetableSourceType;
import com.placeprep.model.timetable.TimetableStatus;
import com.placeprep.model.timetable.TimetableVersion;
import com.placeprep.repository.timetable.TimetableRepository;
import com.placeprep.repository.timetable.TimetableVersionRepository;
import com.placeprep.service.timetable.LegacyTimetableMigrationRunner;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.lang.reflect.Proxy;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class LegacyTimetableMigrationRunnerTest {

    static class StubJdbcTemplate extends JdbcTemplate {
        boolean throwOnExecute = false;
        List<Map<String, Object>> queryResults = new ArrayList<>();

        @Override
        public void execute(String sql) throws DataAccessException {
            if (throwOnExecute) {
                throw new RuntimeException("Table does not exist");
            }
        }

        @Override
        public List<Map<String, Object>> queryForList(String sql) throws DataAccessException {
            return queryResults;
        }
    }

    @Test
    @DisplayName("When master_timetables table does not exist, runner logs and skips gracefully")
    void testLegacyTableDoesNotExist() {
        StubJdbcTemplate stubJdbc = new StubJdbcTemplate();
        stubJdbc.throwOnExecute = true;

        AtomicInteger ttSaveCount = new AtomicInteger();
        TimetableRepository ttRepo = (TimetableRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableRepository.class},
                (proxy, method, args) -> {
                    if ("save".equals(method.getName())) {
                        ttSaveCount.incrementAndGet();
                        return args[0];
                    }
                    return null;
                }
        );

        TimetableVersionRepository verRepo = (TimetableVersionRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableVersionRepository.class},
                (proxy, method, args) -> null
        );

        LegacyTimetableMigrationRunner runner = new LegacyTimetableMigrationRunner(stubJdbc, ttRepo, verRepo);
        runner.run(new DefaultApplicationArguments(new String[0]));

        assertEquals(0, ttSaveCount.get(), "No timetables should be saved if table does not exist");
    }

    @Test
    @DisplayName("When master_timetables has records, migrate to ARCHIVED and LEGACY and tt_version")
    void testLegacyTableMigration() {
        StubJdbcTemplate stubJdbc = new StubJdbcTemplate();
        Map<String, Object> row = new HashMap<>();
        row.put("id", 101L);
        row.put("title", "Legacy CSE Sem 5 Schedule");
        row.put("academic_session", "2025-26");
        row.put("department", "Computer Science & Engineering");
        row.put("branch", "CSE");
        row.put("semester", "Semester 5");
        row.put("academic_year", "3rd Year");
        row.put("section", "Section A");
        row.put("effective_start_date", Date.valueOf(LocalDate.of(2025, 8, 1)));
        row.put("effective_end_date", Date.valueOf(LocalDate.of(2025, 12, 15)));
        row.put("file_name", "timetable_sem5.pdf");
        row.put("file_path", "uploads/timetables/timetable_sem5.pdf");
        row.put("version", 1);
        row.put("uploaded_by", "admin@placeprep.com");
        row.put("uploaded_at", Timestamp.valueOf("2025-08-01 10:00:00"));
        stubJdbc.queryResults.add(row);

        List<Timetable> savedTtList = new ArrayList<>();
        List<TimetableVersion> savedVerList = new ArrayList<>();

        TimetableRepository ttRepo = (TimetableRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableRepository.class},
                (proxy, method, args) -> {
                    if ("existsByTitleAndSourceType".equals(method.getName())) {
                        return false;
                    }
                    if ("save".equals(method.getName())) {
                        Timetable t = (Timetable) args[0];
                        t.setId(999L);
                        savedTtList.add(t);
                        return t;
                    }
                    return null;
                }
        );

        TimetableVersionRepository verRepo = (TimetableVersionRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableVersionRepository.class},
                (proxy, method, args) -> {
                    if ("save".equals(method.getName())) {
                        savedVerList.add((TimetableVersion) args[0]);
                        return args[0];
                    }
                    return null;
                }
        );

        LegacyTimetableMigrationRunner runner = new LegacyTimetableMigrationRunner(stubJdbc, ttRepo, verRepo);
        runner.run(new DefaultApplicationArguments(new String[0]));

        assertEquals(1, savedTtList.size());
        Timetable tt = savedTtList.get(0);
        assertEquals("Legacy CSE Sem 5 Schedule", tt.getTitle());
        assertEquals("2025-26", tt.getAcademicSession());
        assertEquals("CSE", tt.getDepartmentCode());
        assertEquals(5, tt.getSemester());
        assertEquals(3, tt.getYearOfStudy());
        assertEquals(TimetableStatus.ARCHIVED, tt.getStatus());
        assertEquals(TimetableSourceType.LEGACY, tt.getSourceType());

        assertEquals(1, savedVerList.size());
        TimetableVersion ver = savedVerList.get(0);
        assertEquals("timetable_sem5.pdf", ver.getSourceFileName());
        assertEquals("uploads/timetables/timetable_sem5.pdf", ver.getSourceFilePath());
        assertEquals("{}", ver.getSnapshotJson());
    }

    @Test
    @DisplayName("Idempotency: Running runner twice does not re-migrate existing records")
    void testIdempotency() {
        StubJdbcTemplate stubJdbc = new StubJdbcTemplate();
        Map<String, Object> row = new HashMap<>();
        row.put("id", 101L);
        row.put("title", "Existing Schedule");
        stubJdbc.queryResults.add(row);

        AtomicInteger ttSaveCount = new AtomicInteger();
        TimetableRepository ttRepo = (TimetableRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableRepository.class},
                (proxy, method, args) -> {
                    if ("existsByTitleAndSourceType".equals(method.getName())) {
                        return true; // Already exists!
                    }
                    if ("save".equals(method.getName())) {
                        ttSaveCount.incrementAndGet();
                        return args[0];
                    }
                    return null;
                }
        );

        TimetableVersionRepository verRepo = (TimetableVersionRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{TimetableVersionRepository.class},
                (proxy, method, args) -> null
        );

        LegacyTimetableMigrationRunner runner = new LegacyTimetableMigrationRunner(stubJdbc, ttRepo, verRepo);
        runner.run(new DefaultApplicationArguments(new String[0]));

        assertEquals(0, ttSaveCount.get(), "Should not save any duplicate records when already migrated");
    }
}
