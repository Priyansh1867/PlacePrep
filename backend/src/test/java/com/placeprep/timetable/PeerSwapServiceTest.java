package com.placeprep.timetable;

import com.placeprep.dto.timetable.OverrideDto;
import com.placeprep.dto.timetable.ProposePeerSwapRequestDto;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import com.placeprep.repository.timetable.TimetableAssignmentRepository;
import com.placeprep.repository.timetable.TimetableOverrideRepository;
import com.placeprep.repository.timetable.TimetablePeriodRepository;
import com.placeprep.repository.timetable.TimetableRepository;
import com.placeprep.repository.timetable.TimetableSlotRepository;
import com.placeprep.service.NotificationService;
import com.placeprep.service.timetable.DepartmentResolver;
import com.placeprep.service.timetable.PeerSwapService;
import com.placeprep.service.timetable.clash.ClashService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class PeerSwapServiceTest {

    private TimetableSlotRepository slotRepository;
    private TimetableOverrideRepository overrideRepository;
    private FacultyProfileRepository facultyProfileRepository;
    private ClashService clashService;
    private NotificationService notificationService;
    private DepartmentResolver departmentResolver;
    private PeerSwapService peerSwapService;

    private Timetable timetable;
    private TimetableSlot slotA;
    private TimetableSlot slotB;
    private FacultyProfile facA;
    private FacultyProfile facB;
    private User userA;
    private User userB;
    private User hodUser;
    private Map<Long, TimetableOverride> overrideDb;
    private long overrideIdSeq = 100L;

    @BeforeEach
    void setUp() {
        overrideDb = new HashMap<>();

        timetable = new Timetable();
        timetable.setId(1L);
        timetable.setAcademicSession("2026-27");
        timetable.setTerm(Term.ODD);

        facA = new FacultyProfile();
        facA.setId(10L);
        facA.setFullName("Prof. Alice");
        facA.setEmail("alice@placeprep.com");

        facB = new FacultyProfile();
        facB.setId(20L);
        facB.setFullName("Prof. Bob");
        facB.setEmail("bob@placeprep.com");

        userA = new User();
        userA.setId(1001L);
        userA.setEmail("alice@placeprep.com");
        userA.setName("Prof. Alice");
        userA.setRole("FACULTY");

        userB = new User();
        userB.setId(1002L);
        userB.setEmail("bob@placeprep.com");
        userB.setName("Prof. Bob");
        userB.setRole("FACULTY");

        hodUser = new User();
        hodUser.setId(1003L);
        hodUser.setEmail("hod@placeprep.com");
        hodUser.setName("Dr. HOD");
        hodUser.setRole("HOD");
        hodUser.setBranch("AI&DS");

        TimetableSubject subj = new TimetableSubject();
        subj.setId(10L);
        subj.setRtuCode("CS101");
        subj.setShortCode("CS");
        subj.setName("Computer Science");
        subj.setKind(SubjectKind.THEORY);
        subj.setSemester(5);
        subj.setDepartmentCode("AIDS");

        slotA = new TimetableSlot();
        slotA.setId(1L);
        slotA.setTimetable(timetable);
        slotA.setDayOfWeek(1);
        slotA.setStartPeriod(2);
        slotA.setSpan(1);
        slotA.setFaculty(Set.of(facA));
        slotA.setSubject(subj);

        slotB = new TimetableSlot();
        slotB.setId(2L);
        slotB.setTimetable(timetable);
        slotB.setDayOfWeek(2);
        slotB.setStartPeriod(3);
        slotB.setSpan(1);
        slotB.setFaculty(Set.of(facB));
        slotB.setSubject(subj);

        slotRepository = (TimetableSlotRepository) Proxy.newProxyInstance(
                TimetableSlotRepository.class.getClassLoader(),
                new Class<?>[]{TimetableSlotRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        if (id.equals(1L)) return Optional.of(slotA);
                        if (id.equals(2L)) return Optional.of(slotB);
                        return Optional.empty();
                    } else if ("findByAcademicSessionAndTermNonArchived".equals(name) || "findActiveSlotsForSessionAndTerm".equals(name) || "findByTimetableId".equals(name)) {
                        return List.of(slotA, slotB);
                    }
                    return Collections.emptyList();
                }
        );

        overrideRepository = (TimetableOverrideRepository) Proxy.newProxyInstance(
                TimetableOverrideRepository.class.getClassLoader(),
                new Class<?>[]{TimetableOverrideRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        TimetableOverride o = (TimetableOverride) args[0];
                        if (o.getId() == null) o.setId(overrideIdSeq++);
                        overrideDb.put(o.getId(), o);
                        return o;
                    } else if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(overrideDb.get(id));
                    }
                    return null;
                }
        );

        facultyProfileRepository = (FacultyProfileRepository) Proxy.newProxyInstance(
                FacultyProfileRepository.class.getClassLoader(),
                new Class<?>[]{FacultyProfileRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );

        TimetableRepository timetableRepository = (TimetableRepository) Proxy.newProxyInstance(
                TimetableRepository.class.getClassLoader(),
                new Class<?>[]{TimetableRepository.class},
                (proxy, method, args) -> Optional.of(timetable)
        );
        TimetablePeriodRepository periodRepository = (TimetablePeriodRepository) Proxy.newProxyInstance(
                TimetablePeriodRepository.class.getClassLoader(),
                new Class<?>[]{TimetablePeriodRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );
        TimetableAssignmentRepository assignmentRepository = (TimetableAssignmentRepository) Proxy.newProxyInstance(
                TimetableAssignmentRepository.class.getClassLoader(),
                new Class<?>[]{TimetableAssignmentRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );
        clashService = new ClashService(timetableRepository, slotRepository, periodRepository, assignmentRepository);
        notificationService = new NotificationService();
        departmentResolver = new DepartmentResolver(facultyProfileRepository);

        peerSwapService = new PeerSwapService(
                slotRepository,
                overrideRepository,
                facultyProfileRepository,
                clashService,
                notificationService,
                departmentResolver
        );
    }

    @Test
    @DisplayName("Complete Peer Swap Lifecycle: Propose -> Peer Accept -> HOD Approve Atomically")
    void testPeerSwapLifecycle() {
        // Step 1: Alice proposes swap with Bob
        ProposePeerSwapRequestDto req = ProposePeerSwapRequestDto.builder()
                .mySlotId(1L)
                .peerSlotId(2L)
                .onDate(LocalDate.now().plusDays(2))
                .reason("Attending conference")
                .build();

        List<OverrideDto> proposed = peerSwapService.proposePeerSwap(userA, req);
        assertEquals(2, proposed.size());
        OverrideDto ovA = proposed.get(0);
        OverrideDto ovB = proposed.get(1);

        assertEquals(OverrideStatus.WAITING_PEER_ACCEPTANCE, ovA.getStatus());
        assertEquals(OverrideStatus.WAITING_PEER_ACCEPTANCE, ovB.getStatus());
        assertEquals(ovB.getId(), ovA.getPeerOverrideId());
        assertEquals(ovA.getId(), ovB.getPeerOverrideId());

        // Step 2: Bob accepts proposal -> both become PENDING for HOD approval
        List<OverrideDto> accepted = peerSwapService.acceptPeerSwap(userB, ovA.getId());
        assertEquals(2, accepted.size());
        assertEquals(OverrideStatus.PENDING, accepted.get(0).getStatus());
        assertEquals(OverrideStatus.PENDING, accepted.get(1).getStatus());

        // Step 3: HOD approves atomically -> both become APPROVED
        List<OverrideDto> approved = peerSwapService.approvePeerSwapAtomically(hodUser, ovA.getId());
        assertEquals(2, approved.size());
        assertEquals(OverrideStatus.APPROVED, approved.get(0).getStatus());
        assertEquals(OverrideStatus.APPROVED, approved.get(1).getStatus());
        assertEquals("Dr. HOD", approved.get(0).getDecidedBy());
        assertEquals("Dr. HOD", approved.get(1).getDecidedBy());
    }

    @Test
    @DisplayName("Peer rejects swap proposal -> both overrides marked REJECTED")
    void testPeerSwapRejection() {
        ProposePeerSwapRequestDto req = ProposePeerSwapRequestDto.builder()
                .mySlotId(1L)
                .peerSlotId(2L)
                .onDate(LocalDate.now().plusDays(3))
                .reason("Medical appointment")
                .build();

        List<OverrideDto> proposed = peerSwapService.proposePeerSwap(userA, req);
        OverrideDto ovA = proposed.get(0);

        List<OverrideDto> rejected = peerSwapService.rejectPeerSwap(userB, ovA.getId(), "Busy with lab prep");
        assertNotNull(rejected);
        assertEquals(OverrideStatus.REJECTED, rejected.get(0).getStatus());
        assertTrue(rejected.get(0).getReason().contains("Rejected: Busy with lab prep"));
    }
}
