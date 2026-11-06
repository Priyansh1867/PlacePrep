package com.placeprep;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiEndpointSecurityTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void publicRegistrationCannotIssueAdminTokenAndWrongPasswordIsRejected() throws Exception {
        String email = "security-test-" + java.util.UUID.randomUUID() + "@example.edu";
        String body = mapper.writeValueAsString(java.util.Map.of(
                "name", "Student", "email", email, "password", "sample-password", "role", "admin"));
        String result = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode registered = mapper.readTree(result);
        assertEquals("student", registered.path("user").path("role").asText());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(java.util.Map.of("email", email, "password", "wrong"))))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"show placement drives\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/users").header("Authorization", "Bearer " + registered.path("token").asText()))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/live-sessions")
                        .header("Authorization", "Bearer " + registered.path("token").asText())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/drives")
                        .header("Authorization", "Bearer " + registered.path("token").asText())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }
}
