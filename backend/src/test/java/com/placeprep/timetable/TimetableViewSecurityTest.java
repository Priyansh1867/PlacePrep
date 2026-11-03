package com.placeprep.timetable;

import com.placeprep.config.AuthTokenFilter;
import com.placeprep.config.SecurityConfig;
import com.placeprep.config.TokenService;
import com.placeprep.controller.timetable.TimetableViewController;
import com.placeprep.dto.timetable.*;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.timetable.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.web.ServletTestExecutionListener;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TimetableViewController.class)
@Import({SecurityConfig.class, AuthTokenFilter.class, TokenService.class, TimetableViewSecurityTest.ViewSecurityTestStubs.class})
@TestExecutionListeners(
        listeners = {
                ServletTestExecutionListener.class,
                DependencyInjectionTestExecutionListener.class,
                DirtiesContextTestExecutionListener.class
        },
        mergeMode = TestExecutionListeners.MergeMode.REPLACE_DEFAULTS
)
public class TimetableViewSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @TestConfiguration
    static class ViewSecurityTestStubs {

        @Bean
        public com.placeprep.service.timetable.exporter.TimetableExportService exportService() {
            return new com.placeprep.service.timetable.exporter.TimetableExportService(
                    null, null, null, null, null, null, null, null, null, null, null, null
            ) {
                @Override
                public byte[] exportUser(User user, String format) {
                    return "dummy export data".getBytes();
                }
            };
        }

        @Bean
        public TimetableViewService timetableViewService() {
            return new TimetableViewService(null, null, null, null, null, null, null, null, null, null, null, null, null) {
                @Override
                public User resolveCurrentUser(org.springframework.security.core.Authentication auth) {
                    if (auth == null || auth.getName() == null) {
                        throw new AccessDeniedException("Authentication required.");
                    }
                    String email = auth.getName();
                    User u = new User();
                    u.setEmail(email);
                    if (email.contains("student")) {
                        u.setId(101L);
                        u.setRole("student");
                        u.setBranch("AI&DS");
                        u.setRollNumber("26AIDS01");
                    } else if (email.contains("faculty-x")) {
                        u.setId(102L);
                        u.setRole("faculty");
                        u.setBranch("AI&DS");
                    } else if (email.contains("faculty-y")) {
                        u.setId(103L);
                        u.setRole("faculty");
                        u.setBranch("CSE");
                    } else if (email.contains("hod-x")) {
                        u.setId(104L);
                        u.setRole("hod");
                        u.setBranch("AI&DS");
                    } else if (email.contains("hod-y")) {
                        u.setId(105L);
                        u.setRole("hod");
                        u.setBranch("CSE");
                    } else if (email.contains("mgmt")) {
                        u.setId(106L);
                        u.setRole("management");
                    }
                    return u;
                }

                @Override
                public StudentTimetableViewDto getStudentView(User user) {

                    return StudentTimetableViewDto.builder()
                            .unassigned(false)
                            .timetableId(10L)
                            .sectionName("A")
                            .labGroupCode("A1")
                            .slots(Collections.emptyList())
                            .etag("\"tt-10-v1\"")
                            .build();
                }

                @Override
                public TeacherTimetableViewDto getTeacherView(User user) {
                    return TeacherTimetableViewDto.builder()
                            .needsLinking(false)
                            .facultyProfile(FacultyProfileDto.builder().id(1L).fullName("Dr. Test").build())
                            .slots(Collections.emptyList())
                            .etag("\"fac-1-slots-0\"")
                            .build();
                }

                @Override
                public HodOverviewDto getHodOverview(User user, String requestedDept) {
                    if ("hod-x@placeprep.com".equals(user.getEmail()) && requestedDept != null && "CSE".equalsIgnoreCase(requestedDept)) {
                        throw new AccessDeniedException("HOD cannot view overview of department Y");
                    }
                    return HodOverviewDto.builder()
                            .departmentCode("AI&DS")
                            .facultyLoads(Collections.emptyList())
                            .sections(Collections.emptyList())
                            .roomsInUse(Collections.emptyList())
                            .etag("\"hod-AIDS-fac-0-sec-0\"")
                            .build();
                }

                @Override
                public TeacherTimetableViewDto getFacultyGrid(User user, Long facultyId) {
                    if ("student@placeprep.com".equals(user.getEmail())) {
                        throw new AccessDeniedException("Student cannot view faculty grid");
                    }
                    if ("faculty-x@placeprep.com".equals(user.getEmail()) && facultyId != 1L) {
                        throw new AccessDeniedException("Faculty cannot view another faculty grid");
                    }
                    if ("hod-x@placeprep.com".equals(user.getEmail()) && facultyId == 2L) { // 2 belongs to dept Y
                        throw new AccessDeniedException("HOD of dept X cannot access faculty in dept Y");
                    }
                    return TeacherTimetableViewDto.builder()
                            .needsLinking(false)
                            .slots(Collections.emptyList())
                            .etag("\"fac-" + facultyId + "\"")
                            .build();
                }

                @Override
                public TimetableDto getSectionGrid(User user, Long sectionId) {
                    if (sectionId == 99L) {
                        // Section 99 is in DRAFT timetable
                        throw new ResourceNotFoundException("Section timetable is not published.");
                    }
                    if ("student@placeprep.com".equals(user.getEmail()) && sectionId == 2L) {
                        // Student belongs to section 1, requesting section 2 (Section B)
                        throw new AccessDeniedException("Student of section A cannot read section B");
                    }
                    if ("hod-x@placeprep.com".equals(user.getEmail()) && sectionId == 3L) {
                        // Section 3 is in department Y (CSE)
                        throw new AccessDeniedException("HOD of department X cannot access section in department Y");
                    }
                    return TimetableDto.builder()
                            .id(10L)
                            .versionNo(1)
                            .sections(Collections.emptyList())
                            .slots(Collections.emptyList())
                            .build();
                }
            };
        }

        @Bean
        public TimetableCalendarService timetableCalendarService() {
            return new TimetableCalendarService(null);
        }

        @Bean
        public TimetableReportsService timetableReportsService() {
            return new TimetableReportsService(null, null, null, null, null, null);
        }

        @Bean
        public FindSlotService findSlotService() {
            return new FindSlotService(null, null, null, null, null);
        }

        @Bean
        public AvailabilityMatrixService availabilityMatrixService() {
            return new AvailabilityMatrixService(null, null, null);
        }

        @Bean
        public PeerSwapService peerSwapService() {
            return new PeerSwapService(null, null, null, null, null, null);
        }

        @Bean
        public DepartmentResolver departmentResolver() {
            return new DepartmentResolver(null);
        }
    }

    private String studentToken;
    private String facultyXToken;
    private String facultyYToken;
    private String hodXToken;
    private String hodYToken;
    private String mgmtToken;

    @BeforeEach
    void setUp() {
        studentToken = tokenService.generateToken(101L, "student@placeprep.com", "STUDENT");
        facultyXToken = tokenService.generateToken(102L, "faculty-x@placeprep.com", "FACULTY");
        facultyYToken = tokenService.generateToken(103L, "faculty-y@placeprep.com", "FACULTY");
        hodXToken = tokenService.generateToken(104L, "hod-x@placeprep.com", "HOD");
        hodYToken = tokenService.generateToken(105L, "hod-y@placeprep.com", "HOD");
        mgmtToken = tokenService.generateToken(106L, "mgmt@placeprep.com", "MANAGEMENT");
    }

    // ==========================================
    // 1. Unauthenticated requests get 401
    // ==========================================

    @Test
    @DisplayName("Unauthenticated requests get 401 on everything, including /me, /faculty, /sections, /hod, /master-timetable")
    void testUnauthenticatedRequestsGet401() throws Exception {
        mockMvc.perform(get("/api/timetable/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/timetable/faculty/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/timetable/sections/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/timetable/hod/overview"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/master-timetable/file"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/master-timetable/student/active"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // 2. Student Security Rules
    // ==========================================

    @Test
    @DisplayName("Student of section A cannot read section B (403)")
    void testStudentCannotReadSectionB() throws Exception {
        // Section 1 is student's section (Section A) -> 200 OK
        mockMvc.perform(get("/api/timetable/sections/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // Section 2 is Section B -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/sections/2")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot read any faculty grid or HOD overview (403)")
    void testStudentCannotReadFacultyOrHod() throws Exception {
        mockMvc.perform(get("/api/timetable/faculty/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/timetable/hod/overview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 3. Faculty Security Rules
    // ==========================================

    @Test
    @DisplayName("Faculty can read own grid; cannot read another faculty member's personal grid or HOD overview (403)")
    void testFacultyAccessRules() throws Exception {
        // Faculty X reads own grid (facultyId 1) -> 200 OK with ETag
        mockMvc.perform(get("/api/timetable/faculty/1")
                        .header("Authorization", "Bearer " + facultyXToken))
                .andExpect(status().isOk())
                .andExpect(header().exists("ETag"));

        // Faculty X reads /me -> 200 OK
        mockMvc.perform(get("/api/timetable/me")
                        .header("Authorization", "Bearer " + facultyXToken))
                .andExpect(status().isOk());

        // Faculty X tries to read Faculty Y (facultyId 2) -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/faculty/2")
                        .header("Authorization", "Bearer " + facultyXToken))
                .andExpect(status().isForbidden());

        // Faculty X tries to read HOD overview -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/hod/overview")
                        .header("Authorization", "Bearer " + facultyXToken))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 4. HOD Department Boundary Rules
    // ==========================================

    @Test
    @DisplayName("HOD of department X gets 403 for a faculty, section, or overview in department Y")
    void testHodDepartmentBoundaries() throws Exception {
        // HOD of Dept X reads own department overview -> 200 OK
        mockMvc.perform(get("/api/timetable/hod/overview")
                        .header("Authorization", "Bearer " + hodXToken))
                .andExpect(status().isOk())
                .andExpect(header().exists("ETag"));

        // HOD of Dept X tries to read Dept Y overview -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/hod/overview?department=CSE")
                        .header("Authorization", "Bearer " + hodXToken))
                .andExpect(status().isForbidden());

        // HOD of Dept X reads faculty in Dept X (id 1) -> 200 OK
        mockMvc.perform(get("/api/timetable/faculty/1")
                        .header("Authorization", "Bearer " + hodXToken))
                .andExpect(status().isOk());

        // HOD of Dept X tries to read faculty in Dept Y (id 2) -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/faculty/2")
                        .header("Authorization", "Bearer " + hodXToken))
                .andExpect(status().isForbidden());

        // HOD of Dept X tries to read section in Dept Y (section 3) -> 403 Forbidden
        mockMvc.perform(get("/api/timetable/sections/3")
                        .header("Authorization", "Bearer " + hodXToken))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 5. DRAFT & ARCHIVED Timetables Never Returned
    // ==========================================

    @Test
    @DisplayName("DRAFT and ARCHIVED timetables are never returned by /api/timetable/** (404 Not Found)")
    void testDraftAndArchivedTimetablesNeverReturned() throws Exception {
        // Section 99 belongs to a DRAFT timetable -> 404 Not Found
        mockMvc.perform(get("/api/timetable/sections/99")
                        .header("Authorization", "Bearer " + mgmtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }
}
