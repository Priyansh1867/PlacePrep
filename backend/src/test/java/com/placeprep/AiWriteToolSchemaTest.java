package com.placeprep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.tools.*;
import org.junit.jupiter.api.Test;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AiWriteToolSchemaTest {
    @Autowired ObjectMapper mapper;
    @Autowired CompanyWriteTool company;
    @Autowired DriveWriteTool drive;
    @Autowired QuestionWriteTool question;
    @Autowired ExperienceWriteTool experience;
    @Autowired OpportunityWriteTool opportunity;
    @Autowired ApplicationWriteTool application;
    @Autowired MockSessionWriteTool mockSession;
    @Autowired FeedbackWriteTool feedback;
    @Autowired AttendanceWriteTool attendance;
    @Autowired NotificationWriteTool notification;
    @Autowired UserWriteTool user;
    @Autowired SelectionWriteTool selection;
    @Autowired CandidateWriteTool candidate;

    @Test
    void everyWriteToolExposesValidJsonSchema() throws Exception {
        Object[] tools = {company, drive, question, experience, opportunity, application,
                mockSession, feedback, attendance, notification, user, selection, candidate};
        int count = 0;
        for (Object tool : tools) {
            var callbacks = ToolCallbacks.from(tool);
            assertTrue(callbacks.length > 0, tool.getClass().getSimpleName());
            for (var callback : callbacks) {
                var schema = mapper.readTree(callback.getToolDefinition().inputSchema());
                assertEquals("object", schema.path("type").asText(), callback.getToolDefinition().name());
                count++;
            }
        }
        assertTrue(count >= 30);
    }
}
