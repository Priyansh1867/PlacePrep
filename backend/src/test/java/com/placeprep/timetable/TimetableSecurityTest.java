package com.placeprep.timetable;

import com.placeprep.config.AuthTokenFilter;
import com.placeprep.config.SecurityConfig;
import com.placeprep.config.TokenService;
import com.placeprep.controller.timetable.TimetableManagementController;
import com.placeprep.dto.timetable.TimetableStatsDto;
import com.placeprep.model.timetable.Term;
import com.placeprep.model.timetable.TimetableStatus;
import com.placeprep.service.timetable.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.web.ServletTestExecutionListener;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TimetableManagementController.class)
@Import({SecurityConfig.class, AuthTokenFilter.class, TokenService.class, TimetableSecurityTest.SecurityTestStubs.class})
@TestExecutionListeners(
        listeners = {
                ServletTestExecutionListener.class,
                DependencyInjectionTestExecutionListener.class,
                DirtiesContextTestExecutionListener.class
        },
        mergeMode = TestExecutionListeners.MergeMode.REPLACE_DEFAULTS
)
public class TimetableSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @TestConfiguration
    static class SecurityTestStubs {

        @Bean
        public TimetableManagementService timetableManagementService() {
            return new TimetableManagementService(null, null, null, null, null, null, null, null, null, null, null, null, null, null) {
                @Override
                public Page<com.placeprep.dto.timetable.TimetableDto> listTimetables(
                        String session, Term term, String department, Integer year, Integer semester,
                        TimetableStatus status, String search, Pageable pageable) {
                    return new PageImpl<>(Collections.emptyList());
                }

                @Override
                public TimetableStatsDto getDashboardStats() {
                    return new TimetableStatsDto();
                }
            };
        }

        @Bean
        public TimetableSlotService timetableSlotService() {
            return new TimetableSlotService(null, null, null, null, null, null, null, null, null, null);
        }

        @Bean
        public TimetableMetadataService timetableMetadataService() {
            return new TimetableMetadataService(null, null, null, null, null, null, null, null);
        }

        @Bean
        public TimetableImportService timetableImportService() {
            return new TimetableImportService(null, null, null, null, null, null, null, null, null, null, null);
        }

        @Bean
        public TimetableMappingService timetableMappingService() {
            return new TimetableMappingService(null, null, null, null, null, null);
        }

        @Bean
        public com.placeprep.service.timetable.exporter.TimetableExportService timetableExportService() {
            return new com.placeprep.service.timetable.exporter.TimetableExportService(
                    null, null, null, null, null, null, null, null, null, null, null, null
            );
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
        public TimetableAuditService timetableAuditService() {
            return new TimetableAuditService(null);
        }
    }

    private String studentToken;
    private String facultyToken;
    private String teacherToken;
    private String hodToken;
    private String managementToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        studentToken = tokenService.generateToken(101L, "student@placeprep.com", "STUDENT");
        facultyToken = tokenService.generateToken(102L, "faculty@placeprep.com", "FACULTY");
        teacherToken = tokenService.generateToken(103L, "teacher@placeprep.com", "TEACHER");
        hodToken = tokenService.generateToken(104L, "hod@placeprep.com", "HOD");
        managementToken = tokenService.generateToken(105L, "management@placeprep.com", "MANAGEMENT");
        adminToken = tokenService.generateToken(106L, "admin@placeprep.com", "ADMIN");
    }

    // ==========================================
    // 1. Unauthenticated Requests -> 401 Unauthorized
    // ==========================================

    @Test
    @DisplayName("Unauthenticated requests to management timetables must receive 401 Unauthorized")
    void testUnauthenticatedRequestsGet401() throws Exception {
        mockMvc.perform(get("/api/management/timetables"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/management/timetables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/management/timetables/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/management/timetables/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/management/timetables/1/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/management/timetables/1/publish"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // 2. STUDENT Role -> 403 Forbidden on writes
    // ==========================================

    @Test
    @DisplayName("STUDENT role receives 403 Forbidden on all timetable write endpoints")
    void testStudentRoleForbiddenOnWrites() throws Exception {
        String authHeader = "Bearer " + studentToken;

        mockMvc.perform(post("/api/management/timetables")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/management/timetables/1")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/management/timetables/1")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/management/timetables/1/slots")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/management/timetables/1/slots/10")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/management/timetables/1/slots/10")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/management/timetables/1/publish")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/management/timetables/1/revise")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 3. FACULTY & TEACHER Role -> 403 Forbidden on writes
    // ==========================================

    @Test
    @DisplayName("FACULTY and TEACHER roles receive 403 Forbidden on all timetable write endpoints")
    void testFacultyRoleForbiddenOnWrites() throws Exception {
        for (String token : List.of(facultyToken, teacherToken)) {
            String authHeader = "Bearer " + token;

            mockMvc.perform(post("/api/management/timetables")
                            .header("Authorization", authHeader)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());

            mockMvc.perform(put("/api/management/timetables/1")
                            .header("Authorization", authHeader)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());

            mockMvc.perform(delete("/api/management/timetables/1")
                            .header("Authorization", authHeader))
                    .andExpect(status().isForbidden());

            mockMvc.perform(post("/api/management/timetables/1/slots")
                            .header("Authorization", authHeader)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());

            mockMvc.perform(post("/api/management/timetables/1/publish")
                            .header("Authorization", authHeader))
                    .andExpect(status().isForbidden());
        }
    }

    // ==========================================
    // 4. HOD Role -> 403 Forbidden on writes
    // ==========================================

    @Test
    @DisplayName("HOD role receives 403 Forbidden on management timetable write endpoints")
    void testHodRoleForbiddenOnWrites() throws Exception {
        String authHeader = "Bearer " + hodToken;

        mockMvc.perform(post("/api/management/timetables")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/management/timetables/1")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/management/timetables/1")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/management/timetables/1/slots")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/management/timetables/1/publish")
                        .header("Authorization", authHeader))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 5. MANAGEMENT & ADMIN Roles -> Authorized (Not 401, Not 403)
    // ==========================================

    @Test
    @DisplayName("MANAGEMENT and ADMIN roles are authorized (do not get 401 or 403)")
    void testManagementAndAdminAuthorized() throws Exception {
        for (String token : List.of(managementToken, adminToken)) {
            String authHeader = "Bearer " + token;

            // GET list should return 200 OK
            mockMvc.perform(get("/api/management/timetables")
                            .header("Authorization", authHeader))
                    .andExpect(status().isOk());

            // GET stats should return 200 OK
            mockMvc.perform(get("/api/management/timetables/stats")
                            .header("Authorization", authHeader))
                    .andExpect(status().isOk());
        }
    }
}
