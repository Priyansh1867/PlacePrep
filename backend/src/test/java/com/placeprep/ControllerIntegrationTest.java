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
public class ControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Test
    void testPublicEndpointsAccessibleWithoutAuthentication() throws Exception {
        // Companies list is public
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Drives list is public
        mockMvc.perform(get("/api/drives"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Workflow candidates list is public
        mockMvc.perform(get("/api/workflow/candidates"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testAdminEndpointsDenyAnonymousRequests() throws Exception {
        // Creating a company without auth should be rejected (401 or 403)
        mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"companyId\":\"unauth-corp\",\"name\":\"Unauthorized Corp\"}"))
                .andExpect(status().isForbidden());

        // Creating a drive without auth should be rejected
        mockMvc.perform(post("/api/drives")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driveId\":\"unauth-drive\",\"companyId\":\"hcltech\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpointsDenyStudentRole() throws Exception {
        // Student token cannot create drives
        String studentToken = tokenService.generateToken(2L, "student@placeprep.com", "STUDENT");

        mockMvc.perform(post("/api/drives")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driveId\":\"student-drive\",\"companyId\":\"hcltech\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpointsAllowAdminRole() throws Exception {
        // Admin token can create drives
        String adminToken = tokenService.generateToken(1L, "admin@placeprep.com", "ADMIN");

        String drivePayload = """
                {
                    "companyId": "hcltech",
                    "companyName": "HCLTech",
                    "role": "Cloud Infrastructure Engineer",
                    "ctc": "₹7.5 LPA",
                    "driveDate": "December 28, 2026",
                    "deadline": "December 18, 2026",
                    "status": "UPCOMING"
                }
                """;

        mockMvc.perform(post("/api/drives")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(drivePayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("Cloud Infrastructure Engineer")));
    }

    @Test
    void testWorkflowCandidateAdvancementWithAuth() throws Exception {
        String studentToken = tokenService.generateToken(2L, "student@placeprep.com", "STUDENT");

        // Advance seeded candidate cand-001 to HR Round
        mockMvc.perform(post("/api/workflow/candidates/cand-001/advance")
                        .param("nextRound", "HR Interview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentRound", is("HR Interview")))
                .andExpect(jsonPath("$.status", is("ADVANCED")));
    }

    @Test
    void testWorkflowEvaluationSubmission() throws Exception {
        String studentToken = tokenService.generateToken(2L, "student@placeprep.com", "STUDENT");

        String evalPayload = """
                {
                    "evaluatorName": "Senior Lead",
                    "problemSolving": 9,
                    "technicalDepth": 8,
                    "communication": 9,
                    "culturalFit": 9,
                    "recommendation": "Advance to Next Round",
                    "feedbackNotes": "Outstanding core CS fundamentals"
                }
                """;

        mockMvc.perform(post("/api/workflow/candidates/cand-002/evaluate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(evalPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ADVANCED")))
                .andExpect(jsonPath("$.problemSolving", is(9)));
    }

    @Test
    void testMockSessionEndpointsRequireAuthentication() throws Exception {
        // Without auth, /api/mock-sessions/my should be rejected with 403 Forbidden by Spring Security
        mockMvc.perform(get("/api/mock-sessions/my"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testMockSessionCreationAndRetrievalWithAuth() throws Exception {
        String studentToken = tokenService.generateToken(2L, "student@placeprep.com", "STUDENT");

        String sessionPayload = """
                {
                    "companyId": "hcltech",
                    "companyName": "HCLTech",
                    "round": "TECHNICAL Interview",
                    "date": "2026-10-21",
                    "score": 88,
                    "correctness": 85,
                    "clarity": 90,
                    "structure": 88,
                    "questionsAnswered": 3,
                    "feedbackSummary": "Candidate demonstrated strong recursion and graph fundamentals."
                }
                """;

        mockMvc.perform(post("/api/mock-sessions")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessionPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.score", is(88)))
                .andExpect(jsonPath("$.companyName", is("HCLTech")));

        // Verify it can be retrieved via /my
        mockMvc.perform(get("/api/mock-sessions/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }
}

