package com.placeprep.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.PeriodDto;
import com.placeprep.dto.timetable.TimetableDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.AuditLogService;
import com.placeprep.service.timetable.StaleVersionException;
import com.placeprep.service.timetable.TimetableManagementService;
import com.placeprep.service.timetable.TimetablePublishListener;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictCode;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class TimetableLifecycleServiceTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    private Timetable createSampleTimetable(Long id, TimetableStatus status, int versionNo) {
        Timetable t = new Timetable();
        t.setId(id);
        t.setAcademicSession("2026-27");
        t.setTerm(Term.ODD);
        t.setDepartmentCode("AIDS");
        t.setDepartmentName("Artificial Intelligence & Data Science");
        t.setYearOfStudy(3);
        t.setSemester(5);
        t.setTitle("AIDS Sem 5");
        t.setStatus(status);
        t.setVersionNo(versionNo);
        t.setSourceType(TimetableSourceType.MANUAL);
        t.setVersion(1L);
        return t;
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> intf, Map<String, Object> methodReturns) {
        return (T) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{intf},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (methodReturns != null && methodReturns.containsKey(name)) {
                        Object val = methodReturns.get(name);
                        if (val instanceof java.util.function.Function) {
                            return ((java.util.function.Function<Object[], Object>) val).apply(args);
                        }
                        return val;
                    }
                    if ("equals".equals(name)) return proxy == args[0];
                    if ("hashCode".equals(name)) return System.identityHashCode(proxy);
                    if ("toString".equals(name)) return "Proxy[" + intf.getSimpleName() + "]";
                    return null;
                }
        );
    }

    @Test
    @DisplayName("Publish: refuses when HARD clashes exist and throws TimetableHardConflictException")
    void testPublishRefusesOnHardConflict() {
        Long timetableId = 100L;
        Timetable draft = createSampleTimetable(timetableId, TimetableStatus.DRAFT, 1);

        Map<String, Object> ttRepoMethods = new HashMap<>();
        ttRepoMethods.put("findById", (java.util.function.Function<Object[], Object>) args -> Optional.of(draft));
        TimetableRepository ttRepo = createProxy(TimetableRepository.class, ttRepoMethods);

        // ClashService stub reporting HARD conflict
        ClashService clashService = new ClashService(null, null, null, null) {
            @Override
            public List<TimetableConflict> validateTimetable(Long id) {
                return List.of(TimetableConflict.builder()
                        .severity(ConflictSeverity.HARD)
                        .code(ConflictCode.FACULTY_CLASH)
                        .message("Faculty double booked")
                        .slotIds(List.of(1L, 2L))
                        .build());
            }
        };

        AtomicBoolean listenerCalled = new AtomicBoolean(false);
        TimetablePublishListener listener = timetable -> listenerCalled.set(true);

        TimetableManagementService service = new TimetableManagementService(
                ttRepo,
                createProxy(TimetablePeriodRepository.class, Map.of("findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList())),
                createProxy(TimetableSectionRepository.class, Map.of("findByTimetableIdOrderByNameAsc", Collections.emptyList())),
                createProxy(TimetableLabGroupRepository.class, Collections.emptyMap()),
                createProxy(TimetableSubjectRepository.class, Collections.emptyMap()),
                createProxy(TimetableAssignmentRepository.class, Collections.emptyMap()),
                createProxy(TimetableRoomRepository.class, Collections.emptyMap()),
                createProxy(FacultyProfileRepository.class, Collections.emptyMap()),
                createProxy(TimetableSlotRepository.class, Map.of("findByTimetableId", Collections.emptyList())),
                createProxy(TimetableVersionRepository.class, Collections.emptyMap()),
                createProxy(TimetableStudentGroupRepository.class, Collections.emptyMap()),
                clashService,
                null,
                listener
        );

        TimetableHardConflictException ex = assertThrows(TimetableHardConflictException.class, () ->
                service.publishTimetable(timetableId, "management_user")
        );

        assertNotNull(ex.getConflicts());
        assertEquals(1, ex.getConflicts().size());
        assertEquals(ConflictCode.FACULTY_CLASH, ex.getConflicts().get(0).getCode());
        assertEquals(TimetableStatus.DRAFT, draft.getStatus(), "Status must not change on hard conflict");
        assertFalse(listenerCalled.get(), "PublishListener must not be called on conflict");
    }

    @Test
    @DisplayName("Publish: succeeds when no hard clashes, archives previous published, writes version snapshot, and calls publishListener")
    void testPublishSuccess() {
        Long timetableId = 100L;
        Long previousPublishedId = 90L;

        Timetable draft = createSampleTimetable(timetableId, TimetableStatus.DRAFT, 1);
        Timetable previous = createSampleTimetable(previousPublishedId, TimetableStatus.PUBLISHED, 1);

        List<Timetable> savedTimetables = new ArrayList<>();
        Map<String, Object> ttRepoMethods = new HashMap<>();
        ttRepoMethods.put("findById", (java.util.function.Function<Object[], Object>) args -> Optional.of(draft));
        ttRepoMethods.put("findByAcademicSessionAndTermAndDepartmentCodeAndSemesterAndStatus",
                (java.util.function.Function<Object[], Object>) args -> Optional.of(previous));
        ttRepoMethods.put("save", (java.util.function.Function<Object[], Object>) args -> {
            savedTimetables.add((Timetable) args[0]);
            return args[0];
        });
        TimetableRepository ttRepo = createProxy(TimetableRepository.class, ttRepoMethods);

        ClashService clashService = new ClashService(null, null, null, null) {
            @Override
            public List<TimetableConflict> validateTimetable(Long id) {
                return Collections.emptyList();
            }
        };

        List<TimetableVersion> savedVersions = new ArrayList<>();
        Map<String, Object> verRepoMethods = new HashMap<>();
        verRepoMethods.put("save", (java.util.function.Function<Object[], Object>) args -> {
            savedVersions.add((TimetableVersion) args[0]);
            return args[0];
        });
        TimetableVersionRepository verRepo = createProxy(TimetableVersionRepository.class, verRepoMethods);

        List<String> auditLogs = new ArrayList<>();
        AuditLogService auditLogService = new AuditLogService() {
            @Override
            public com.placeprep.model.AuditLog logAction(String action, String performedBy, String performerRole, String targetResource, String details) {
                auditLogs.add(action + ":" + performedBy);
                return null;
            }
        };

        AtomicBoolean listenerCalled = new AtomicBoolean(false);
        TimetablePublishListener listener = timetable -> listenerCalled.set(true);

        TimetableManagementService service = new TimetableManagementService(
                ttRepo,
                createProxy(TimetablePeriodRepository.class, Map.of("findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList())),
                createProxy(TimetableSectionRepository.class, Map.of("findByTimetableIdOrderByNameAsc", Collections.emptyList())),
                createProxy(TimetableLabGroupRepository.class, Collections.emptyMap()),
                createProxy(TimetableSubjectRepository.class, Collections.emptyMap()),
                createProxy(TimetableAssignmentRepository.class, Collections.emptyMap()),
                createProxy(TimetableRoomRepository.class, Collections.emptyMap()),
                createProxy(FacultyProfileRepository.class, Collections.emptyMap()),
                createProxy(TimetableSlotRepository.class, Map.of("findByTimetableId", Collections.emptyList())),
                verRepo,
                createProxy(TimetableStudentGroupRepository.class, Collections.emptyMap()),
                clashService,
                auditLogService,
                listener
        );

        TimetableDto published = service.publishTimetable(timetableId, "dean_academics");

        assertNotNull(published);
        assertEquals(TimetableStatus.PUBLISHED, draft.getStatus());
        assertNotNull(draft.getPublishedAt());
        assertEquals("dean_academics", draft.getPublishedBy());

        // Verify previous published was archived
        assertEquals(TimetableStatus.ARCHIVED, previous.getStatus());

        // Verify version snapshot was written
        assertEquals(1, savedVersions.size());
        assertEquals(1, savedVersions.get(0).getVersionNo());
        assertNotNull(savedVersions.get(0).getSnapshotJson());

        // Verify audit log
        assertTrue(auditLogs.contains("PUBLISH_TIMETABLE:dean_academics"));

        // Verify publish listener hook called
        assertTrue(listenerCalled.get());
    }

    @Test
    @DisplayName("Revise: creates new DRAFT copy with version_no + 1")
    void testReviseTimetable() {
        Long timetableId = 100L;
        Timetable published = createSampleTimetable(timetableId, TimetableStatus.PUBLISHED, 1);

        List<Timetable> savedTimetables = new ArrayList<>();
        Map<String, Object> ttRepoMethods = new HashMap<>();
        ttRepoMethods.put("findById", (java.util.function.Function<Object[], Object>) args -> Optional.of(published));
        ttRepoMethods.put("save", (java.util.function.Function<Object[], Object>) args -> {
            Timetable t = (Timetable) args[0];
            if (t.getId() == null) t.setId(101L);
            savedTimetables.add(t);
            return t;
        });
        TimetableRepository ttRepo = createProxy(TimetableRepository.class, ttRepoMethods);

        TimetableManagementService service = new TimetableManagementService(
                ttRepo,
                createProxy(TimetablePeriodRepository.class, Map.of("findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList())),
                createProxy(TimetableSectionRepository.class, Map.of("findByTimetableIdOrderByNameAsc", Collections.emptyList())),
                createProxy(TimetableLabGroupRepository.class, Collections.emptyMap()),
                createProxy(TimetableSubjectRepository.class, Collections.emptyMap()),
                createProxy(TimetableAssignmentRepository.class, Map.of("findByTimetableId", Collections.emptyList())),
                createProxy(TimetableRoomRepository.class, Collections.emptyMap()),
                createProxy(FacultyProfileRepository.class, Collections.emptyMap()),
                createProxy(TimetableSlotRepository.class, Map.of("findByTimetableId", Collections.emptyList())),
                createProxy(TimetableVersionRepository.class, Collections.emptyMap()),
                createProxy(TimetableStudentGroupRepository.class, Collections.emptyMap()),
                null, null, null
        );

        TimetableDto revised = service.reviseTimetable(timetableId, "management_user");

        assertNotNull(revised);
        assertEquals(1, savedTimetables.size());
        Timetable newDraft = savedTimetables.get(0);
        assertEquals(TimetableStatus.DRAFT, newDraft.getStatus());
        assertEquals(2, newDraft.getVersionNo(), "Version number must increment to 2");
        assertEquals("AIDS", newDraft.getDepartmentCode());
        assertEquals(5, newDraft.getSemester());
    }

    @Test
    @DisplayName("Restore: creates new DRAFT timetable from snapshot JSON")
    void testRestoreVersion() throws Exception {
        Long timetableId = 100L;
        Timetable current = createSampleTimetable(timetableId, TimetableStatus.PUBLISHED, 2);

        TimetableDto snapshotData = TimetableDto.builder()
                .academicSession("2026-27")
                .term(Term.ODD)
                .departmentCode("AIDS")
                .departmentName("Artificial Intelligence & Data Science")
                .yearOfStudy(3)
                .semester(5)
                .title("Original v1")
                .versionNo(1)
                .periods(List.of(PeriodDto.builder().periodIndex(1).isBreak(false).label("P1").build()))
                .build();

        TimetableVersion v1 = new TimetableVersion();
        v1.setTimetable(current);
        v1.setVersionNo(1);
        v1.setSnapshotJson(objectMapper.writeValueAsString(snapshotData));

        List<Timetable> savedTimetables = new ArrayList<>();
        Map<String, Object> ttRepoMethods = new HashMap<>();
        ttRepoMethods.put("findById", (java.util.function.Function<Object[], Object>) args -> Optional.of(current));
        ttRepoMethods.put("save", (java.util.function.Function<Object[], Object>) args -> {
            Timetable t = (Timetable) args[0];
            if (t.getId() == null) t.setId(105L);
            savedTimetables.add(t);
            return t;
        });
        TimetableRepository ttRepo = createProxy(TimetableRepository.class, ttRepoMethods);

        Map<String, Object> verRepoMethods = new HashMap<>();
        verRepoMethods.put("findByTimetableIdAndVersionNo", (java.util.function.Function<Object[], Object>) args -> Optional.of(v1));
        TimetableVersionRepository verRepo = createProxy(TimetableVersionRepository.class, verRepoMethods);

        TimetableManagementService service = new TimetableManagementService(
                ttRepo,
                createProxy(TimetablePeriodRepository.class, Map.of(
                        "findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList(),
                        "save", (java.util.function.Function<Object[], Object>) args -> args[0]
                )),
                createProxy(TimetableSectionRepository.class, Map.of("findByTimetableIdOrderByNameAsc", Collections.emptyList())),
                createProxy(TimetableLabGroupRepository.class, Collections.emptyMap()),
                createProxy(TimetableSubjectRepository.class, Collections.emptyMap()),
                createProxy(TimetableAssignmentRepository.class, Collections.emptyMap()),
                createProxy(TimetableRoomRepository.class, Collections.emptyMap()),
                createProxy(FacultyProfileRepository.class, Collections.emptyMap()),
                createProxy(TimetableSlotRepository.class, Map.of("findByTimetableId", Collections.emptyList())),
                verRepo,
                createProxy(TimetableStudentGroupRepository.class, Collections.emptyMap()),
                null, null, null
        );

        TimetableDto restored = service.restoreVersion(timetableId, 1, "management_user");

        assertNotNull(restored);
        assertEquals(1, savedTimetables.size());
        Timetable restoredEntity = savedTimetables.get(0);
        assertEquals(TimetableStatus.DRAFT, restoredEntity.getStatus());
        assertEquals(3, restoredEntity.getVersionNo());
        assertTrue(restoredEntity.getTitle().contains("Restored from v1"));
    }

    @Test
    @DisplayName("Optimistic Locking: stale write returns 409 STALE_VERSION")
    void testOptimisticLockingStaleWrite() {
        Long timetableId = 100L;
        Timetable current = createSampleTimetable(timetableId, TimetableStatus.DRAFT, 1);
        current.setVersion(2L); // Database has version 2

        Map<String, Object> ttRepoMethods = new HashMap<>();
        ttRepoMethods.put("findById", (java.util.function.Function<Object[], Object>) args -> Optional.of(current));
        TimetableRepository ttRepo = createProxy(TimetableRepository.class, ttRepoMethods);

        TimetableManagementService service = new TimetableManagementService(
                ttRepo, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        TimetableDto staleUpdate = new TimetableDto();
        staleUpdate.setTitle("Updated Title");
        staleUpdate.setVersion(1L); // Client sends stale version 1

        StaleVersionException ex = assertThrows(StaleVersionException.class, () ->
                service.updateTimetable(timetableId, staleUpdate, "management_user")
        );

        assertTrue(ex.getMessage().contains("STALE_VERSION"));
    }
}
