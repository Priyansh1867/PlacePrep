package com.placeprep.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.NotificationService;
import com.placeprep.service.timetable.DepartmentResolver;
import com.placeprep.service.timetable.PublishNotificationListener;
import com.placeprep.service.timetable.TimetableViewService;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class TimetableViewServiceTest {

    private TimetableRepository timetableRepo;
    private TimetablePeriodRepository periodRepo;
    private TimetableSectionRepository sectionRepo;
    private TimetableLabGroupRepository labGroupRepo;
    private TimetableSlotRepository slotRepo;
    private TimetableStudentGroupRepository studentGroupRepo;
    private FacultyProfileRepository facultyProfileRepo;
    private TimetableRoomRepository roomRepo;
    private TimetableOverrideRepository overrideRepo;
    private UserRepository userRepo;
    private NotificationService notificationService;
    private DepartmentResolver departmentResolver;
    private PublishNotificationListener publishListener;

    private TimetableViewService service;

    // Test data
    private Timetable publishedTimetable;
    private TimetableSection sectionA;
    private TimetableLabGroup groupA1;
    private TimetableLabGroup groupA2;
    private FacultyProfile faculty1;
    private FacultyProfile faculty2;
    private TimetableRoom room1;
    private TimetableRoom room2;
    private User studentUser;
    private User facultyUser;

    @BeforeEach
    void setUp() {
        // Setup in-memory test fixtures
        publishedTimetable = new Timetable();
        publishedTimetable.setId(10L);
        publishedTimetable.setAcademicSession("2026-27");
        publishedTimetable.setTerm(Term.ODD);
        publishedTimetable.setDepartmentCode("AI&DS");
        publishedTimetable.setDepartmentName("Department of AI & DS");
        publishedTimetable.setSemester(5);
        publishedTimetable.setStatus(TimetableStatus.PUBLISHED);
        publishedTimetable.setVersionNo(1);

        sectionA = new TimetableSection();
        sectionA.setId(101L);
        sectionA.setName("A");
        sectionA.setTimetable(publishedTimetable);

        groupA1 = new TimetableLabGroup();
        groupA1.setId(201L);
        groupA1.setCode("A1");
        groupA1.setSection(sectionA);

        groupA2 = new TimetableLabGroup();
        groupA2.setId(202L);
        groupA2.setCode("A2");
        groupA2.setSection(sectionA);

        studentUser = new User();
        studentUser.setId(1001L);
        studentUser.setName("Priyansh Sharma");
        studentUser.setEmail("priyansh@placeprep.com");
        studentUser.setRole("student");
        studentUser.setBranch("AI&DS");
        studentUser.setRollNumber("26AIDS01");

        facultyUser = new User();
        facultyUser.setId(1002L);
        facultyUser.setName("Ambika Bagri");
        facultyUser.setEmail("ab@placeprep.com");
        facultyUser.setRole("faculty");
        facultyUser.setBranch("AI&DS");

        faculty1 = new FacultyProfile();
        faculty1.setId(301L);
        faculty1.setShortCode("AB");
        faculty1.setFullName("Ms. Ambika Bagri");
        faculty1.setDepartmentCode("AI&DS");
        faculty1.setEmail("ab@placeprep.com");
        faculty1.setUser(facultyUser);
        faculty1.setActive(true);

        faculty2 = new FacultyProfile();
        faculty2.setId(302L);
        faculty2.setShortCode("RG");
        faculty2.setFullName("Mr. Rahul Guha");
        faculty2.setDepartmentCode("AI&DS");
        faculty2.setActive(true);

        room1 = new TimetableRoom();
        room1.setId(401L);
        room1.setCode("DT9");
        room1.setRoomType(RoomType.LAB);

        room2 = new TimetableRoom();
        room2.setId(402L);
        room2.setCode("DF04");
        room2.setRoomType(RoomType.CLASSROOM);

        // Slots
        TimetableSlot slotTheory = new TimetableSlot();
        slotTheory.setId(501L);
        slotTheory.setTimetable(publishedTimetable);
        slotTheory.setSection(sectionA);
        slotTheory.setLabGroup(null); // whole section
        slotTheory.setDayOfWeek(1); // Monday
        slotTheory.setStartPeriod(3);
        slotTheory.setSpan(1);
        slotTheory.setRoom(room2);
        slotTheory.setFaculty(Set.of(faculty2));

        TimetableSlot slotLabA1 = new TimetableSlot();
        slotLabA1.setId(502L);
        slotLabA1.setTimetable(publishedTimetable);
        slotLabA1.setSection(sectionA);
        slotLabA1.setLabGroup(groupA1); // Group A1 only
        slotLabA1.setDayOfWeek(1);
        slotLabA1.setStartPeriod(1);
        slotLabA1.setSpan(2);
        slotLabA1.setRoom(room1);
        slotLabA1.setFaculty(Set.of(faculty1));

        TimetableSlot slotLabA2 = new TimetableSlot();
        slotLabA2.setId(503L);
        slotLabA2.setTimetable(publishedTimetable);
        slotLabA2.setSection(sectionA);
        slotLabA2.setLabGroup(groupA2); // Group A2 only
        slotLabA2.setDayOfWeek(1);
        slotLabA2.setStartPeriod(1);
        slotLabA2.setSpan(2);
        slotLabA2.setRoom(room2);
        slotLabA2.setFaculty(Set.of(faculty2));


        // Proxies for repositories
        timetableRepo = createProxy(TimetableRepository.class, Map.of(
                "findByStatus", List.of(publishedTimetable)
        ));

        periodRepo = createProxy(TimetablePeriodRepository.class, Map.of(
                "findByTimetableIdOrderByPeriodIndexAsc", Collections.emptyList()
        ));

        sectionRepo = createProxy(TimetableSectionRepository.class, Map.of(
                "findByTimetableIdOrderByNameAsc", List.of(sectionA)
        ));

        labGroupRepo = createProxy(TimetableLabGroupRepository.class, Map.of(
                "findBySectionIdOrderByCodeAsc", List.of(groupA1, groupA2)
        ));

        slotRepo = createProxy(TimetableSlotRepository.class, Map.of(
                "findPublishedSlotsByTimetableId", List.of(slotTheory, slotLabA1, slotLabA2),
                "findPublishedSlotsByFacultyId", List.of(slotLabA1),
                "findPublishedSlotsOccupyingPeriod", List.of(slotLabA1)
        ));

        TimetableStudentGroup studentGroup = new TimetableStudentGroup();
        studentGroup.setId(601L);
        studentGroup.setUser(studentUser);
        studentGroup.setRollNumber(studentUser.getRollNumber());
        studentGroup.setTimetable(publishedTimetable);
        studentGroup.setSection(sectionA);
        studentGroup.setLabGroup(groupA1); // Assigned to A1

        studentGroupRepo = createProxy(TimetableStudentGroupRepository.class, Map.of(
                "findPublishedByUserId", List.of(studentGroup),
                "findPublishedByRollNumber", List.of(studentGroup)
        ));

        facultyProfileRepo = createProxy(FacultyProfileRepository.class, Map.of(
                "findByUserId", Optional.of(faculty1),
                "findByDepartmentCodeAndActiveTrue", List.of(faculty1, faculty2),
                "findByDepartmentCode", List.of(faculty1, faculty2)
        ));

        roomRepo = createProxy(TimetableRoomRepository.class, Map.of(
                "findAll", List.of(room1, room2)
        ));

        overrideRepo = createProxy(TimetableOverrideRepository.class, Map.of(
                "findBySlotIdInAndOnDateBetweenAndStatus", Collections.emptyList()
        ));

        userRepo = createProxy(UserRepository.class, Map.of(
                "findByEmail", Optional.of(studentUser)
        ));

        notificationService = new NotificationService();
        departmentResolver = new DepartmentResolver(facultyProfileRepo);
        publishListener = new PublishNotificationListener(
                notificationService, studentGroupRepo, sectionRepo, slotRepo,
                facultyProfileRepo, userRepo, departmentResolver
        );

        service = new TimetableViewService(
                timetableRepo, periodRepo, sectionRepo, labGroupRepo, slotRepo,
                studentGroupRepo, facultyProfileRepo, roomRepo, overrideRepo,
                departmentResolver, notificationService, publishListener, userRepo
        );
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> intf, Map<String, Object> returns) {
        return (T) Proxy.newProxyInstance(
                intf.getClassLoader(),
                new Class<?>[]{intf},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (returns.containsKey(name)) {
                        return returns.get(name);
                    }
                    if ("toString".equals(name)) return "MockProxy@" + intf.getSimpleName();
                    if ("equals".equals(name)) return proxy == args[0];
                    if ("hashCode".equals(name)) return System.identityHashCode(proxy);
                    Class<?> ret = method.getReturnType();
                    if (ret.equals(Optional.class)) return Optional.empty();
                    if (ret.equals(List.class)) return Collections.emptyList();
                    if (ret.equals(Set.class)) return Collections.emptySet();
                    if (ret.equals(boolean.class) || ret.equals(Boolean.class)) return false;
                    return null;
                }
        );
    }

    @Test
    @DisplayName("Student view returns whole section slots and own lab group slots only (not other groups)")
    void testStudentViewSlotsFiltering() {
        StudentTimetableViewDto dto = service.getStudentView(studentUser);

        assertNotNull(dto);
        assertFalse(dto.isUnassigned());
        assertEquals("A", dto.getSectionName());
        assertEquals("A1", dto.getLabGroupCode());

        // Slots should contain Theory (whole section) and Lab A1, but NOT Lab A2
        assertEquals(2, dto.getSlots().size(), "Student should receive exactly 2 slots (theory + A1)");
        assertTrue(dto.getSlots().stream().anyMatch(s -> s.getLabGroupCode() == null), "Must contain whole-section theory slot");
        assertTrue(dto.getSlots().stream().anyMatch(s -> "A1".equals(s.getLabGroupCode())), "Must contain group A1 slot");
        assertFalse(dto.getSlots().stream().anyMatch(s -> "A2".equals(s.getLabGroupCode())), "Must NOT contain group A2 slot");
    }

    @Test
    @DisplayName("Unassigned student returns unassigned=true and polite message")
    void testUnassignedStudentReturnsProperDto() {
        // Create an unassigned student
        User unassigned = new User();
        unassigned.setId(9999L);
        unassigned.setEmail("unassigned@placeprep.com");
        unassigned.setRole("student");

        TimetableStudentGroupRepository emptyRepo = createProxy(TimetableStudentGroupRepository.class, Map.of(
                "findPublishedByUserId", Collections.emptyList(),
                "findPublishedByRollNumber", Collections.emptyList()
        ));

        TimetableViewService svc = new TimetableViewService(
                timetableRepo, periodRepo, sectionRepo, labGroupRepo, slotRepo,
                emptyRepo, facultyProfileRepo, roomRepo, overrideRepo,
                departmentResolver, notificationService, publishListener, userRepo
        );

        StudentTimetableViewDto dto = svc.getStudentView(unassigned);
        assertTrue(dto.isUnassigned());
        assertNotNull(dto.getMessage());
        assertTrue(dto.getMessage().contains("not yet assigned"));
        assertTrue(dto.getSlots().isEmpty());
    }

    @Test
    @DisplayName("Faculty view returns every published slot where faculty is assigned")
    void testFacultyViewReturnsTeachingSlots() {
        TeacherTimetableViewDto dto = service.getTeacherView(facultyUser);

        assertNotNull(dto);
        assertFalse(dto.isNeedsLinking());
        assertNotNull(dto.getFacultyProfile());
        assertEquals("Ms. Ambika Bagri", dto.getFacultyProfile().getFullName());
        assertEquals(1, dto.getSlots().size());
        assertEquals("DT9", dto.getSlots().get(0).getRoomCode());
    }

    @Test
    @DisplayName("Free rooms endpoint filters out occupied rooms for given day and period")
    void testFreeRoomsFiltering() {
        // room1 (DT9) is occupied on Day 1, Period 1 by slotLabA1
        // room2 (DF04) is free on Day 1, Period 1
        List<RoomDto> freeRooms = service.getFreeRooms(1, 1, null);

        assertNotNull(freeRooms);
        assertEquals(1, freeRooms.size(), "Only room2 should be free");
        assertEquals("DF04", freeRooms.get(0).getCode());
    }

    @Test
    @DisplayName("DepartmentResolver canonicalizes department aliases and matches accurately")
    void testDepartmentResolver() {
        assertTrue(departmentResolver.matches("AI&DS", "AIDS"));
        assertTrue(departmentResolver.matches("Artificial Intelligence & Data Science", "AI&DS"));
        assertTrue(departmentResolver.matches("Computer Science & Engineering", "CSE"));
        assertFalse(departmentResolver.matches("AI&DS", "CSE"));

        Optional<String> canonical = departmentResolver.canonicalize("AIDS");
        assertTrue(canonical.isPresent());
        assertEquals("AI&DS", canonical.get());
    }

    @Test
    @DisplayName("HOD overview aggregates loads, per-day distribution, and free periods for department faculty")
    void testHodOverviewCalculations() {
        User hodUser = new User();
        hodUser.setId(5001L);
        hodUser.setEmail("hod@placeprep.com");
        hodUser.setRole("hod");
        hodUser.setBranch("AI&DS");

        HodOverviewDto overview = service.getHodOverview(hodUser, "AI&DS");

        assertNotNull(overview);
        assertEquals("AI&DS", overview.getDepartmentCode());
        assertNotNull(overview.getFacultyLoads());
        assertEquals(2, overview.getFacultyLoads().size());

        FacultyLoadDto abLoad = overview.getFacultyLoads().stream()
                .filter(l -> "AB".equals(l.getShortCode()))
                .findFirst().orElse(null);

        assertNotNull(abLoad);
        assertEquals(2, abLoad.getTotalWeeklyPeriods()); // span 2
        assertEquals(2, abLoad.getPerDayLoad().get(1)); // 2 periods on Monday
        assertFalse(abLoad.getFreePeriodsPerDay().get(1).contains(1), "Period 1 should not be free on Monday");
        assertFalse(abLoad.getFreePeriodsPerDay().get(1).contains(2), "Period 2 should not be free on Monday");
        assertTrue(abLoad.getFreePeriodsPerDay().get(1).contains(3), "Period 3 should be free on Monday");
    }
}
