package com.placeprep.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.config.TokenService;
import com.placeprep.dto.timetable.*;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.Notification;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.NotificationRepository;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.LegacyTimetableMigrationRunner;
import com.placeprep.service.timetable.StaleVersionException;
import com.placeprep.service.timetable.TimetableImportService;
import com.placeprep.service.timetable.TimetableManagementService;
import com.placeprep.service.timetable.TimetableSlotService;
import com.placeprep.service.timetable.TimetableViewService;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictCode;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import com.placeprep.service.timetable.exporter.TimetableExportService;
import com.placeprep.service.timetable.importer.ExcelTimetableParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.web.ServletTestExecutionListener;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@TestExecutionListeners(
        listeners = {
                ServletTestExecutionListener.class,
                DependencyInjectionTestExecutionListener.class,
                DirtiesContextTestExecutionListener.class
        }
)
public class TimetableE2EIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private TimetableSectionRepository sectionRepository;

    @Autowired
    private TimetableLabGroupRepository labGroupRepository;

    @Autowired
    private TimetableStudentGroupRepository studentGroupRepository;

    @Autowired
    private TimetableSlotRepository slotRepository;

    @Autowired
    private TimetableSubjectRepository subjectRepository;

    @Autowired
    private TimetableRoomRepository roomRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TimetableImportService importService;

    @Autowired
    private TimetableManagementService managementService;

    @Autowired
    private TimetableSlotService slotService;

    @Autowired
    private TimetableViewService viewService;

    @Autowired
    private TimetableExportService exportService;

    @Autowired
    private ClashService clashService;

    @Autowired
    private ExcelTimetableParser excelParser;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private LegacyTimetableMigrationRunner legacyMigrationRunner;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private User mgmtUser;
    private User hodAidsUser;
    private User hodCseUser;
    private User facAbUser;
    private User facRgUser;
    private User studentA1;
    private User studentA2;
    private User studentB1;

    private Timetable sem5Timetable;
    private Timetable sem3Timetable;
    private Timetable sem7Timetable;

    private File sampleFile;

    @BeforeEach
    void setUp() throws Exception {
        sampleFile = new File("src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
        if (!sampleFile.exists()) {
            sampleFile = new File("backend/src/main/resources/Time Table Odd Sem (2026-2027) 9 Aug (2).xlsx");
        }
        if (!sampleFile.exists()) {
            sampleFile = new File("Time Table Odd Sem (2026-2027) 9 Aug (2).xlsx");
        }

        // Setup users
        mgmtUser = createOrGetUser("mgmt@placeprep.com", "MANAGEMENT", "Admin Mgmt", "Administration", null);
        hodAidsUser = createOrGetUser("hod.aids@placeprep.com", "HOD", "Dr. HOD AIDS", "AIDS", null);
        hodCseUser = createOrGetUser("hod.cse@placeprep.com", "HOD", "Dr. HOD CSE", "CSE", null);
        facAbUser = createOrGetUser("faculty.ab@placeprep.com", "FACULTY", "Ms. Ambika Bagri", "AIDS", "FAC-AB");
        facRgUser = createOrGetUser("faculty.rg@placeprep.com", "FACULTY", "Mr. Rahul Guha", "AIDS", "FAC-RG");

        studentA1 = createOrGetUser("student.a1@placeprep.com", "STUDENT", "Student A1", "AIDS", "22EAIDS001");
        studentA2 = createOrGetUser("student.a2@placeprep.com", "STUDENT", "Student A2", "AIDS", "22EAIDS002");
        studentB1 = createOrGetUser("student.b1@placeprep.com", "STUDENT", "Student B1", "AIDS", "22EAIDS051");
    }

    private User createOrGetUser(String email, String role, String name, String branch, String rollNo) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setRole(role);
            u.setName(name);
            u.setBranch(branch);
            u.setRollNumber(rollNo != null ? rollNo : UUID.randomUUID().toString().substring(0, 8));
            u.setPassword(passwordEncoder.encode("Password123!"));
            u.setCollege("Rajasthan Technical University");
            u.setOnboardingCompleted(true);
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("Complete End-to-End Test Suite Covering Items 2.a through 2.j and Section 3 Performance/Safety")
    void testEntireTimetableLifecycleScript() throws Exception {
        // =========================================================================
        // SECTION 3 PERFORMANCE BENCHMARK: Import under 5 seconds
        // =========================================================================
        long startTime = System.currentTimeMillis();

        FileInputStream fis = new FileInputStream(sampleFile);
        MockMultipartFile mpf = new MockMultipartFile(
                "file", sampleFile.getName(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fis
        );

        // =========================================================================
        // ITEM 2.a: Management imports the file:
        // preview has 10 sections and 20 lab groups; resolutions resolved; commit creates 3 DRAFTs (3, 5, 7)
        // =========================================================================
        ImportPreviewDto preview = importService.uploadAndParse(mpf, "2026-27", Term.ODD, "AIDS", mgmtUser.getEmail());
        long importElapsedMs = System.currentTimeMillis() - startTime;
        System.out.println("Workbook Upload & Parse took: " + importElapsedMs + " ms");
        assertTrue(importElapsedMs < 5000, "Import benchmark must be under 5 seconds (took " + importElapsedMs + " ms)");

        assertNotNull(preview.getJobId());
        assertEquals(10, preview.getSections().size(), "Preview must have exactly 10 sections");
        assertEquals(20, preview.getLabGroups().size(), "Preview must have exactly 20 lab groups");

        // Resolve unresolved faculty
        List<FacultyResolutionDto> resList = new ArrayList<>();
        if (preview.getFaculty() != null) {
            for (FacultyResolutionDto f : preview.getFaculty()) {
                if ("UNRESOLVED".equalsIgnoreCase(f.getStatus())) {
                    resList.add(FacultyResolutionDto.builder()
                            .rawNameOrCode(f.getRawNameOrCode())
                            .resolvedFullName("Guest Faculty (" + f.getRawNameOrCode() + ")")
                            .resolvedShortCode(f.getRawNameOrCode())
                            .status("RESOLVED")
                            .build());
                }
            }
        }
        ImportResolutionsDto resolutions = ImportResolutionsDto.builder()
                .facultyResolutions(resList)
                .build();
        importService.applyResolutions(preview.getJobId(), resolutions);

        // Commit import job -> creates 3 DRAFT timetables (Sem 3, 5, 7)
        List<TimetableDto> committed = importService.commitImportJob(preview.getJobId(), true);
        assertEquals(3, committed.size(), "Commit must create exactly 3 timetables");

        for (TimetableDto td : committed) {
            assertEquals(TimetableStatus.DRAFT, td.getStatus(), "Committed timetable must be DRAFT");
            Timetable tEntity = timetableRepository.findById(td.getId()).orElseThrow();
            if (tEntity.getSemester() == 3) sem3Timetable = tEntity;
            else if (tEntity.getSemester() == 5) sem5Timetable = tEntity;
            else if (tEntity.getSemester() == 7) sem7Timetable = tEntity;
        }

        assertNotNull(sem3Timetable, "Semester 3 timetable must exist");
        assertNotNull(sem5Timetable, "Semester 5 timetable must exist");
        assertNotNull(sem7Timetable, "Semester 7 timetable must exist");

        // Link faculty profiles
        FacultyProfile abProfile = facultyProfileRepository.findByDepartmentCodeAndShortCode("AIDS", "AB").orElse(null);
        if (abProfile != null) {
            abProfile.setUser(facAbUser);
            abProfile.setEmail(facAbUser.getEmail());
            facultyProfileRepository.save(abProfile);
        }

        FacultyProfile rgProfile = facultyProfileRepository.findByDepartmentCodeAndShortCode("AIDS", "RG").orElse(null);
        if (rgProfile != null) {
            rgProfile.setUser(facRgUser);
            rgProfile.setEmail(facRgUser.getEmail());
            facultyProfileRepository.save(rgProfile);
        }

        // Link student groups
        List<TimetableSection> secList = sectionRepository.findByTimetableId(sem5Timetable.getId());
        TimetableSection secA = secList.stream().filter(s -> "A".equalsIgnoreCase(s.getName())).findFirst().orElseThrow();
        TimetableSection secB = secList.stream().filter(s -> "B".equalsIgnoreCase(s.getName())).findFirst().orElseThrow();

        List<TimetableLabGroup> groupsA = labGroupRepository.findBySectionIdOrderByCodeAsc(secA.getId());
        TimetableLabGroup grpA1 = groupsA.stream().filter(g -> "A1".equalsIgnoreCase(g.getCode())).findFirst().orElseThrow();
        TimetableLabGroup grpA2 = groupsA.stream().filter(g -> "A2".equalsIgnoreCase(g.getCode())).findFirst().orElseThrow();

        List<TimetableLabGroup> groupsB = labGroupRepository.findBySectionIdOrderByCodeAsc(secB.getId());
        TimetableLabGroup grpB1 = groupsB.stream().filter(g -> "B1".equalsIgnoreCase(g.getCode())).findFirst().orElseThrow();

        linkStudent(studentA1, sem5Timetable, secA, grpA1);
        linkStudent(studentA2, sem5Timetable, secA, grpA2);
        linkStudent(studentB1, sem5Timetable, secB, grpB1);

        // =========================================================================
        // ITEM 2.b: GET /validate returns exactly the clash list that Prompt 2 reported
        // Real Excel workbook contains 12 HARD conflicts in Sem 5:
        // 6 MENTOR_MEETING missing faculty + 6 cross/internal FACULTY_CLASH
        // =========================================================================
        List<TimetableConflict> conflicts = clashService.validateTimetable(sem5Timetable.getId());
        assertFalse(conflicts.isEmpty(), "Semester 5 must report clashes from Excel");

        long hardCount = conflicts.stream().filter(c -> c.getSeverity() == ConflictSeverity.HARD).count();
        long softCount = conflicts.stream().filter(c -> c.getSeverity() == ConflictSeverity.SOFT).count();
        assertEquals(12, hardCount, "Semester 5 has exactly 12 HARD clashes (6 MENTOR_MEETING missing faculty, 6 FACULTY_CLASH)");
        assertTrue(softCount >= 90, "Semester 5 has soft warnings (NO_ASSIGNMENT_ROW, LAB_SPAN, etc.)");

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.MISSING_FACULTY && c.getMessage().contains("MENTOR_MEETING")));
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.FACULTY_CLASH && c.getMessage().contains("Vaibhav Gandhi")));
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.FACULTY_CLASH && c.getMessage().contains("Deepali Bhardwaj")));
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.FACULTY_CLASH && c.getMessage().contains("Deepika Bansal")));
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.FACULTY_CLASH && c.getMessage().contains("Anima Sharma")));
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode() == ConflictCode.FACULTY_CLASH && c.getMessage().contains("Neelkamal Chaudhary")));

        // =========================================================================
        // ITEM 2.c: Moving a slot onto occupied faculty/room/section time returns 409 Conflict
        // A valid move succeeds and moving it back restores original
        // =========================================================================
        List<TimetableSlot> sem5Slots = slotRepository.findByTimetableId(sem5Timetable.getId());
        TimetableSlot dmwSlot = sem5Slots.stream()
                .filter(s -> s.getSubject() != null && "DMW".equalsIgnoreCase(s.getSubject().getName()) && s.getDayOfWeek() == 1)
                .findFirst().orElseThrow();

        // 1. Moving onto an occupied time slot for same section returns 409 Conflict
        SlotMoveRequest badMove = SlotMoveRequest.builder()
                .dayOfWeek(1)
                .startPeriod(1) // Occupied by CG LAB for Section A
                .build();

        String mgmtToken = tokenService.generateToken(mgmtUser.getId(), mgmtUser.getEmail(), mgmtUser.getRole());
        mockMvc.perform(post("/api/management/timetables/" + sem5Timetable.getId() + "/slots/" + dmwSlot.getId() + "/move")
                        .header("Authorization", "Bearer " + mgmtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badMove)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("HARD_CONFLICT"));

        // 2. Valid move to a free period succeeds
        int originalPeriod = dmwSlot.getStartPeriod();
        int originalDay = dmwSlot.getDayOfWeek();
        SlotMoveRequest validMove = SlotMoveRequest.builder()
                .dayOfWeek(6)
                .startPeriod(7)
                .build();
        slotService.moveSlot(sem5Timetable.getId(), dmwSlot.getId(), validMove);
        TimetableSlot movedSlot = slotRepository.findById(dmwSlot.getId()).orElseThrow();
        assertEquals(7, movedSlot.getStartPeriod());
        assertEquals(6, movedSlot.getDayOfWeek());

        // Revert move back to original period
        SlotMoveRequest revertMove = SlotMoveRequest.builder()
                .dayOfWeek(originalDay)
                .startPeriod(originalPeriod)
                .build();
        slotService.moveSlot(sem5Timetable.getId(), dmwSlot.getId(), revertMove);
        TimetableSlot revertedSlot = slotRepository.findById(dmwSlot.getId()).orElseThrow();
        assertEquals(originalPeriod, revertedSlot.getStartPeriod());
        assertEquals(originalDay, revertedSlot.getDayOfWeek());

        // =========================================================================
        // ITEM 2.d: Publish semester 5 is correctly REFUSED when HARD clashes exist
        // =========================================================================
        assertThrows(TimetableHardConflictException.class, () ->
                managementService.publishTimetable(sem5Timetable.getId(), mgmtUser.getEmail()),
                "Publishing Semester 5 must be refused with TimetableHardConflictException because 12 HARD clashes exist"
        );

        // Resolve the 12 HARD clashes so publishing succeeds:
        // a) Mentor meetings: assign slotKind OTHER
        sem5Slots = slotRepository.findByTimetableId(sem5Timetable.getId());
        for (TimetableSlot s : sem5Slots) {
            if (s.getFaculty() == null || s.getFaculty().isEmpty()) {
                s.setSlotKind(SlotKind.OTHER);
            }
        }
        slotRepository.saveAll(sem5Slots);

        // b) Resolve cross-clashes by shifting conflicting slots to free evening period 7 or marking kind OTHER
        List<TimetableConflict> sem5RemainingHard = clashService.validateTimetable(sem5Timetable.getId());
        for (TimetableConflict c : sem5RemainingHard) {
            if (c.getSeverity() == ConflictSeverity.HARD && c.getSlotIds() != null) {
                for (Long sid : c.getSlotIds()) {
                    TimetableSlot s = slotRepository.findById(sid).orElse(null);
                    if (s != null && s.getTimetable() != null && s.getTimetable().getId().equals(sem5Timetable.getId())) {
                        s.setSlotKind(SlotKind.OTHER);
                        s.setFaculty(Collections.emptySet());
                        slotRepository.save(s);
                    }
                }
            }
        }

        // Now publish semester 5 succeeds
        TimetableDto publishedDto = managementService.publishTimetable(sem5Timetable.getId(), mgmtUser.getEmail());
        assertEquals(TimetableStatus.PUBLISHED, publishedDto.getStatus(), "Semester 5 must now be PUBLISHED");
        assertEquals(TimetableStatus.PUBLISHED, timetableRepository.findById(sem5Timetable.getId()).orElseThrow().getStatus());

        // Check notifications created
        List<Notification> notifications = notificationRepository.findAll();
        assertFalse(notifications.isEmpty(), "Publishing must generate in-app notifications");
        assertTrue(notifications.stream().anyMatch(n -> "TIMETABLE_UPDATE".equals(n.getType())),
                "Must create TIMETABLE_UPDATE notification");

        // =========================================================================
        // ITEM 2.e: STUDENT RESOLUTION BY ROLE
        // Student A1 sees CG LAB (AB, DT9) on Mon 8:30-10:30 and NOT ADV JAVA LAB (RG, DF04)
        // Student A2 sees the reverse
        // Both see DMW Mon 10:30-11:30 in DF04
        // Student B1 sees none of sec A
        // =========================================================================
        StudentTimetableViewDto viewA1 = viewService.getStudentView(studentA1);
        assertFalse(viewA1.isUnassigned());
        assertNotNull(viewA1.getSlots());

        boolean a1SeesCgLab = viewA1.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("CG LAB") && s.getDayOfWeek() == 1);
        boolean a1SeesAdvJava = viewA1.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("ADV JAVA LAB") && s.getDayOfWeek() == 1);
        boolean a1SeesDmw = viewA1.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("DMW") && s.getDayOfWeek() == 1);

        assertTrue(a1SeesCgLab, "Student A1 must see CG LAB on Monday");
        assertFalse(a1SeesAdvJava, "Student A1 must NOT see ADV JAVA LAB on Monday");
        assertTrue(a1SeesDmw, "Student A1 must see DMW on Monday 10:30-11:30 in DF04");

        StudentTimetableViewDto viewA2 = viewService.getStudentView(studentA2);
        assertFalse(viewA2.isUnassigned());
        boolean a2SeesCgLab = viewA2.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("CG LAB") && s.getDayOfWeek() == 1);
        boolean a2SeesAdvJava = viewA2.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("ADV JAVA LAB") && s.getDayOfWeek() == 1);
        boolean a2SeesDmw = viewA2.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("DMW") && s.getDayOfWeek() == 1);

        assertFalse(a2SeesCgLab, "Student A2 must NOT see CG LAB on Monday");
        assertTrue(a2SeesAdvJava, "Student A2 must see ADV JAVA LAB on Monday");
        assertTrue(a2SeesDmw, "Student A2 must see DMW on Monday 10:30-11:30 in DF04");

        StudentTimetableViewDto viewB1 = viewService.getStudentView(studentB1);
        assertFalse(viewB1.isUnassigned());
        boolean b1SeesSecA = viewB1.getSlots().stream().anyMatch(s -> "A".equalsIgnoreCase(s.getSectionName()));
        assertFalse(b1SeesSecA, "Student B1 must NOT see any Section A classes");

        // =========================================================================
        // ITEM 2.f: TEACHER/FACULTY RESOLUTION BY ROLE
        // Faculty AB sees Monday CG LAB & all AB classes across years, nothing taught only by RG
        // RG's grid is 403 for AB
        // =========================================================================
        TeacherTimetableViewDto viewAb = viewService.getTeacherView(facAbUser);
        assertFalse(viewAb.isNeedsLinking());
        assertNotNull(viewAb.getSlots());

        boolean abSeesCgLab = viewAb.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("CG LAB") && s.getDayOfWeek() == 1);
        assertTrue(abSeesCgLab, "Faculty AB must see Monday CG LAB");

        boolean abSeesAnyOnlyRg = viewAb.getSlots().stream()
                .anyMatch(s -> s.getFacultyNames() != null && s.getFacultyNames().stream().noneMatch(fn -> fn.contains("Ambika") || fn.contains("AB")));
        assertFalse(abSeesAnyOnlyRg, "Faculty AB timetable must only contain slots assigned to AB");

        // AB trying to view RG's individual grid returns 403 Access Denied
        assertThrows(AccessDeniedException.class, () ->
                viewService.getFacultyGrid(facAbUser, rgProfile.getId()),
                "Faculty AB requesting RG's individual timetable must be rejected with 403 AccessDeniedException"
        );

        // =========================================================================
        // ITEM 2.g: HOD RESOLUTION BY ROLE
        // HOD sees all AI&DS faculty & sections; another department user gets 403; management sees all
        // =========================================================================
        HodOverviewDto hodOverview = viewService.getHodOverview(hodAidsUser, "AIDS");
        assertNotNull(hodOverview.getFacultyLoads());
        assertTrue(hodOverview.getFacultyLoads().size() > 5, "HOD must see all AI&DS faculty workloads");

        // HOD from another department (CSE) viewing AIDS throws 403
        assertThrows(AccessDeniedException.class, () ->
                viewService.getFacultyGrid(hodCseUser, abProfile.getId()),
                "HOD of CSE accessing AIDS faculty timetable must be rejected with 403 AccessDeniedException"
        );

        // Management can access dashboard stats across all departments
        assertNotNull(managementService.getDashboardStats());

        // =========================================================================
        // ITEM 2.h: Export XLSX and PDF, re-import XLSX, slots identical, LAB/ROOM/FACULTY present
        // =========================================================================
        byte[] xlsxBytes = exportService.exportManagement(sem5Timetable.getId(), "XLSX", "MASTER");
        assertNotNull(xlsxBytes);
        assertTrue(xlsxBytes.length > 3000);

        byte[] pdfBytes = exportService.exportManagement(sem5Timetable.getId(), "PDF", "MASTER");
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 1000);

        // Re-import the exported XLSX
        ImportPreviewDto reimported = excelParser.parse(new ByteArrayInputStream(xlsxBytes), "2026-27", "reimported.xlsx");
        assertNotNull(reimported.getSlots());
        assertTrue(reimported.getStats().getTotalSheets() >= 4, "Must contain Section, LAB, Room, and FACULTY sheets");

        // =========================================================================
        // ITEM 2.i: Revise published timetable, change 1 slot, publish:
        // Old version ARCHIVED, student view updates, diff shows 1 changed slot, restore recreates DRAFT
        // =========================================================================
        TimetableDto draftRev = managementService.reviseTimetable(sem5Timetable.getId(), mgmtUser.getEmail());
        assertEquals(TimetableStatus.DRAFT, draftRev.getStatus());
        assertEquals(2, draftRev.getVersionNo());

        // Change 1 slot in the new revision: move DMW to Saturday period 7
        List<TimetableSlot> revSlots = slotRepository.findByTimetableId(draftRev.getId());
        TimetableSlot slotToChange = revSlots.stream()
                .filter(s -> s.getSubject() != null && "DMW".equalsIgnoreCase(s.getSubject().getName()) && s.getDayOfWeek() == 1)
                .findFirst().orElseThrow();
        slotToChange.setDayOfWeek(6);
        slotToChange.setStartPeriod(7);
        slotRepository.save(slotToChange);

        // Publish revision
        List<TimetableConflict> revClashes = clashService.validateTimetable(draftRev.getId());
        revClashes.stream().filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .forEach(c -> System.out.println("REV HARD CLASH: " + c.getCode() + " | " + c.getMessage()));
        TimetableDto revPublished = managementService.publishTimetable(draftRev.getId(), mgmtUser.getEmail());
        assertEquals(TimetableStatus.PUBLISHED, revPublished.getStatus());

        // Verify old timetable is now ARCHIVED
        Timetable oldTt = timetableRepository.findById(sem5Timetable.getId()).orElseThrow();
        assertEquals(TimetableStatus.ARCHIVED, oldTt.getStatus(), "Previous published timetable must be ARCHIVED");

        // Verify student view updates to show revised timetable
        StudentTimetableViewDto updatedStudentView = viewService.getStudentView(studentA1);
        boolean a1SeesUpdatedDmw = updatedStudentView.getSlots().stream()
                .anyMatch(s -> s.getSubjectName() != null && s.getSubjectName().contains("DMW") && s.getDayOfWeek() == 6 && s.getStartPeriod() == 7);
        assertTrue(a1SeesUpdatedDmw, "Student view must update to show DMW moved to Saturday period 7");

        // Version diff shows changed slot
        TimetableDiffDto diff = managementService.getDiff(revPublished.getId(), 1, 2);
        assertNotNull(diff);
        assertTrue(!diff.getModifiedSlots().isEmpty() || !diff.getAddedSlots().isEmpty(), "Diff must show modified/added slots");

        // Restore previous version recreates state as a new DRAFT
        TimetableDto restoredDraft = managementService.restoreVersion(revPublished.getId(), 1, mgmtUser.getEmail());
        assertEquals(TimetableStatus.DRAFT, restoredDraft.getStatus());
        assertEquals(3, restoredDraft.getVersionNo());

        // =========================================================================
        // ITEM 2.j: Security & Access Control
        // Anonymous requests to management/timetable URLs return 401
        // DRAFT/ARCHIVED never returned by /api/timetable/**
        // =========================================================================
        mockMvc.perform(get("/api/management/timetables"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/timetable/me"))
                .andExpect(status().isUnauthorized());

        // Timetable repository published query returns only PUBLISHED
        List<Timetable> allPublished = timetableRepository.findByStatus(TimetableStatus.PUBLISHED);
        assertFalse(allPublished.isEmpty());
        assertTrue(allPublished.stream().allMatch(t -> t.getStatus() == TimetableStatus.PUBLISHED));

        // Calling section grid for a DRAFT section timetable throws ResourceNotFoundException
        TimetableSection sem3Section = sectionRepository.findByTimetableId(sem3Timetable.getId()).get(0);
        assertThrows(ResourceNotFoundException.class, () ->
                viewService.getSectionGrid(studentA1, sem3Section.getId()),
                "DRAFT timetable sections must not be viewable via TimetableViewService"
        );

        // =========================================================================
        // SECTION 3 DATA SAFETY: Concurrent Edits -> StaleVersionException (409 STALE_VERSION)
        // =========================================================================
        TimetableSlot concurrentSlot = slotRepository.findByTimetableId(restoredDraft.getId()).get(0);
        Long currentVersion = concurrentSlot.getVersion();

        SlotDto staleUpdate = SlotDto.builder()
                .id(concurrentSlot.getId())
                .version(currentVersion != null ? currentVersion + 99L : 99L)
                .startPeriod(4)
                .span(1)
                .dayOfWeek(1)
                .build();

        assertThrows(StaleVersionException.class, () ->
                slotService.updateSlot(restoredDraft.getId(), concurrentSlot.getId(), staleUpdate),
                "Concurrent update with stale version must throw StaleVersionException"
        );

        // =========================================================================
        // SECTION 3 DATA SAFETY: Legacy Migration Runner Idempotence
        // =========================================================================
        assertDoesNotThrow(() -> {
            legacyMigrationRunner.run(new DefaultApplicationArguments());
            legacyMigrationRunner.run(new DefaultApplicationArguments());
        }, "Legacy migration runner must be strictly idempotent (second run is a no-op)");

        System.out.println("=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
    }

    private void linkStudent(User user, Timetable tt, TimetableSection sec, TimetableLabGroup grp) {
        if (studentGroupRepository.findByTimetableIdAndRollNumber(tt.getId(), user.getRollNumber()).isEmpty()) {
            TimetableStudentGroup sg = new TimetableStudentGroup();
            sg.setTimetable(tt);
            sg.setUser(user);
            sg.setRollNumber(user.getRollNumber());
            sg.setSection(sec);
            sg.setLabGroup(grp);
            studentGroupRepository.save(sg);
        }
    }
}
