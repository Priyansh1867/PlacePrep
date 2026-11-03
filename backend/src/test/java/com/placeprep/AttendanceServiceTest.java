package com.placeprep;

import com.placeprep.config.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AttendanceServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Test
    void testGetClassRosterReturnsEnrolledStudents() throws Exception {
        mockMvc.perform(get("/api/attendance/class/roster")
                        .param("department", "CSE")
                        .param("semester", "6"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].rollNumber", notNullValue()))
                .andExpect(jsonPath("$[0].name", notNullValue()));
    }

    @Test
    void testAttendanceReportAndStrict75PercentThresholdLogic() throws Exception {
        // Query report for seeded CSE Sem 6 CS306
        mockMvc.perform(get("/api/attendance/class/report")
                        .param("department", "CSE")
                        .param("semester", "6")
                        .param("subjectCode", "CS306")
                        .param("targetDate", "2026-10-21"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.classesHeld", is(4)))
                .andExpect(jsonPath("$.shortageThreshold", is(75.0)))
                .andExpect(jsonPath("$.shortageCount", greaterThanOrEqualTo(1)))
                // Verify Priyansh Jain (4/4 = 100.0%) has NO shortage warning
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0101')].attendancePercentage", contains(100.0)))
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0101')].shortageWarning", contains(false)))
                // Verify Ananya Sharma (3/4 = 75.0% - EXACTLY 75%) must NOT be flagged as shortage!
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0102')].attendancePercentage", contains(75.0)))
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0102')].shortageWarning", contains(false)))
                // Verify Rohan Kulkarni (2/4 = 50.0% - strictly < 75%) MUST be flagged as shortage!
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0103')].attendancePercentage", contains(50.0)))
                .andExpect(jsonPath("$.roster[?(@.rollNumber == '22CS0103')].shortageWarning", contains(true)));
    }

    @Test
    void testZeroClassesHeldHandledGracefullyWithoutDivideByZero() throws Exception {
        mockMvc.perform(get("/api/attendance/class/report")
                        .param("department", "CSE")
                        .param("semester", "6")
                        .param("subjectCode", "CS_EMPTY_SUB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.classesHeld", is(0)))
                .andExpect(jsonPath("$.shortageCount", is(0)))
                .andExpect(jsonPath("$.averageAttendance", is(100.0)))
                .andExpect(jsonPath("$.roster", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.roster[0].attendancePercentage", is(100.0)))
                .andExpect(jsonPath("$.roster[0].shortageWarning", is(false)));
    }

    @Test
    void testStudentRoleIsDeniedPermissionToMarkAttendance() throws Exception {
        String studentToken = tokenService.generateToken(99L, "student@placeprep.com", "STUDENT");

        String markPayload = """
                [
                    {
                        "studentId": "priyansh.jain@example.edu",
                        "status": "PRESENT"
                    }
                ]
                """;

        // POST /api/attendance/class/sessions/101/mark should be 403 Forbidden for Student
        mockMvc.perform(post("/api/attendance/class/sessions/101/mark")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(markPayload))
                .andExpect(status().isForbidden());
    }

    @Test
    void testTeacherRoleCanFindOrCreateSessionAndMarkAttendance() throws Exception {
        String teacherToken = tokenService.generateToken(42L, "teacher@placeprep.com", "TEACHER");

        // 1. Find or create session
        String sessionPayload = """
                {
                    "department": "CSE",
                    "semester": "6",
                    "subjectCode": "CS306",
                    "subjectName": "Cloud Computing & Distributed Systems",
                    "section": "A",
                    "sessionDate": "2026-10-22",
                    "periodNumber": 2,
                    "facultyName": "Dr. Neha Sharma",
                    "facultyId": "FAC-CSE-042"
                }
                """;

        String responseContent = mockMvc.perform(post("/api/attendance/class/sessions/find-or-create")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessionPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.subjectCode", is("CS306")))
                .andReturn().getResponse().getContentAsString();

        // Extract session ID
        com.fasterxml.jackson.databind.JsonNode rootNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseContent);
        long sessionId = rootNode.get("id").asLong();

        // 2. Mark attendance for students
        String markPayload = """
                [
                    {
                        "studentId": "priyansh.jain@example.edu",
                        "studentRollNumber": "22CS0101",
                        "studentName": "Priyansh Jain",
                        "status": "PRESENT"
                    },
                    {
                        "studentId": "ananya.sharma@example.edu",
                        "studentRollNumber": "22CS0102",
                        "studentName": "Ananya Sharma",
                        "status": "LATE",
                        "remarks": "Arrived 10 mins late"
                    }
                ]
                """;

        mockMvc.perform(post("/api/attendance/class/sessions/" + sessionId + "/mark")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(markPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].status", is("PRESENT")))
                .andExpect(jsonPath("$[1].status", is("LATE")))
                .andExpect(jsonPath("$[1].remarks", is("Arrived 10 mins late")));
    }
}
