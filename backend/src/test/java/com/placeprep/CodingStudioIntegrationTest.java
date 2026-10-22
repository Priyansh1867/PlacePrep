package com.placeprep;

import com.placeprep.config.TokenService;
import com.placeprep.repository.CodingSubmissionRepository;
import com.placeprep.service.Judge0Client;
import com.placeprep.service.JudgeProviderUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CodingStudioIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private CodingSubmissionRepository submissionRepository;

    @MockBean
    private Judge0Client judge0Client;

    @BeforeEach
    void resetJudge() {
        reset(judge0Client);
    }

    @Test
    void studentCanBrowseProblemsAndHiddenCasesAreNotReturned() throws Exception {
        mockMvc.perform(get("/api/coding-studio/problems")
                        .header("Authorization", bearer(9101L, "STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id", is("hcl-tech-02")))
                .andExpect(jsonPath("$[0].examples", hasSize(2)))
                .andExpect(jsonPath("$[0].hiddenTestCases").doesNotExist());

        mockMvc.perform(get("/api/questions")
                        .header("Authorization", bearer(9101L, "STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.questionId == 'hcl-tech-02')].codingStatement").doesNotExist())
                .andExpect(jsonPath("$[?(@.questionId == 'hcl-tech-02')].hiddenTestCases").doesNotExist());
    }

    @Test
    void nonStudentAndAnonymousUsersCannotAccessStudio() throws Exception {
        mockMvc.perform(get("/api/coding-studio/problems")
                        .header("Authorization", bearer(9102L, "TEACHER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/coding-studio/problems"))
                .andExpect(status().isForbidden());
    }

    @Test
    void serverCreatesAndVerifiesStudentSessionWithoutTrustingClientRole() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Studio Test Student",
                                  "email": "studio-test-student@placeprep.test",
                                  "password": "test-password",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role", is("student")))
                .andReturn().getResponse().getContentAsString();
        String token = com.jayway.jsonpath.JsonPath.parse(response).read("$.token", String.class);

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("student")));
        mockMvc.perform(get("/api/coding-studio/problems").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void runAndSubmitPersistOwnershipAndProgress() throws Exception {
        when(judge0Client.execute(anyString(), anyString())).thenAnswer(invocation -> {
            String input = invocation.getArgument(1);
            String[] values = input.trim().split("\\s+");
            int count = Integer.parseInt(values[0]);
            int position = Integer.parseInt(values[count + 1]);
            return accepted(count > 0 && position >= 0 ? "true\n" : "false\n");
        });

        mockMvc.perform(post("/api/coding-studio/run")
                        .header("Authorization", bearer(9103L, "STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request("hcl-tech-02")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict", is("ACCEPTED")))
                .andExpect(jsonPath("$.submissionType", is("RUN")))
                .andExpect(jsonPath("$.testResults", hasSize(2)));

        String response = mockMvc.perform(post("/api/coding-studio/submit")
                        .header("Authorization", bearer(9103L, "STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request("hcl-tech-02")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict", is("ACCEPTED")))
                .andExpect(jsonPath("$.submissionType", is("SUBMIT")))
                .andExpect(jsonPath("$.testResults", hasSize(2)))
                .andReturn().getResponse().getContentAsString();
        long submissionId = com.jayway.jsonpath.JsonPath.parse(response).read("$.id", Long.class);

        mockMvc.perform(get("/api/coding-studio/submissions/{id}", submissionId)
                        .header("Authorization", bearer(9104L, "STUDENT")))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/coding-studio/progress")
                        .header("Authorization", bearer(9103L, "STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solvedProblems", is(1)))
                .andExpect(jsonPath("$.attempts", is(1)))
                .andExpect(jsonPath("$.accuracyPercent", is(100)));
    }

    @Test
    void failedProviderDoesNotCreateASubmission() throws Exception {
        when(judge0Client.execute(anyString(), anyString()))
                .thenThrow(new JudgeProviderUnavailableException("Provider unavailable"));
        long before = submissionRepository.count();

        mockMvc.perform(post("/api/coding-studio/run")
                        .header("Authorization", bearer(9105L, "STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request("hcl-tech-02")))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error", is("Provider unavailable")));

        org.junit.jupiter.api.Assertions.assertEquals(before, submissionRepository.count());
    }

    @Test
    void mapsWrongAnswerCompilationRuntimeAndTimeoutVerdicts() throws Exception {
        assertVerdict(9106L, 3, "not the expected answer\n", "WRONG_ANSWER");
        assertVerdict(9107L, 6, null, "COMPILATION_ERROR");
        assertVerdict(9108L, 11, null, "RUNTIME_ERROR");
        assertVerdict(9109L, 5, null, "TIME_LIMIT_EXCEEDED");
    }

    private void assertVerdict(long userId, int statusId, String output, String expectedVerdict) throws Exception {
        when(judge0Client.execute(anyString(), anyString()))
                .thenReturn(new Judge0Client.JudgeResult(statusId, "test status", output, "error", "compiler output", 2L, 64L));

        mockMvc.perform(post("/api/coding-studio/run")
                        .header("Authorization", bearer(userId, "STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request("hcl-tech-02")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict", is(expectedVerdict)));
        reset(judge0Client);
    }

    private String request(String problemId) {
        return """
                {
                  "problemId": "%s",
                  "language": "java",
                  "sourceCode": "public class Main { public static void main(String[] args) {} }"
                }
                """.formatted(problemId);
    }

    private String bearer(Long userId, String role) {
        return "Bearer " + tokenService.generateToken(userId, "student" + userId + "@placeprep.test", role);
    }

    private Judge0Client.JudgeResult accepted(String output) {
        return new Judge0Client.JudgeResult(3, "Accepted", output, null, null, 12L, 128L);
    }
}
