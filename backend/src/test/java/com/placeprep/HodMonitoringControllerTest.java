package com.placeprep;

import com.placeprep.config.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class HodMonitoringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Test
    void testHodEndpointsDenyAnonymousUser() throws Exception {
        mockMvc.perform(get("/api/hod/faculty-operations"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/hod/faculty-operations/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testHodEndpointsDenyTeacherRole() throws Exception {
        String teacherToken = tokenService.generateToken(10L, "teacher@dtu.ac.in", "TEACHER");

        mockMvc.perform(get("/api/hod/faculty-operations")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/hod/faculty-operations/metrics")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testHodEndpointsDenyStudentRole() throws Exception {
        String studentToken = tokenService.generateToken(11L, "student@dtu.ac.in", "STUDENT");

        mockMvc.perform(get("/api/hod/faculty-operations")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testHodEndpointsAllowHodRole() throws Exception {
        String hodToken = tokenService.generateToken(12L, "hod.cse@dtu.ac.in", "HOD");

        mockMvc.perform(get("/api/hod/faculty-operations")
                        .header("Authorization", "Bearer " + hodToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        mockMvc.perform(get("/api/hod/faculty-operations/metrics")
                        .header("Authorization", "Bearer " + hodToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalActiveFaculty", notNullValue()))
                .andExpect(jsonPath("$.totalClassSessions", notNullValue()));
    }

    @Test
    void testHodEndpointsAllowAdminRole() throws Exception {
        String adminToken = tokenService.generateToken(1L, "admin@placeprep.com", "ADMIN");

        mockMvc.perform(get("/api/hod/faculty-operations")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
