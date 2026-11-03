package com.placeprep;

import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.tools.DriveWriteTool;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AiDrivePersistenceTest {
    @Autowired DriveWriteTool tool;
    @Autowired PlacementDriveRepository repository;

    @Test
    @Transactional
    void adminCanCreateAndUpdateDriveThroughJsonCallbacks() {
        String driveId = "ai-drive-" + java.util.UUID.randomUUID();
        ToolContext admin = new ToolContext(Map.of("role", "ADMIN", "userId", 1L));
        var callbacks = ToolCallbacks.from(tool);
        var create = Arrays.stream(callbacks).filter(c -> c.getToolDefinition().name().equals("createDrive")).findFirst().orElseThrow();
        var rounds = Arrays.stream(callbacks).filter(c -> c.getToolDefinition().name().equals("updateDriveRounds")).findFirst().orElseThrow();
        var instructions = Arrays.stream(callbacks).filter(c -> c.getToolDefinition().name().equals("updateDriveInstructions")).findFirst().orElseThrow();

        create.call("{\"drive\":{\"driveId\":\"" + driveId + "\",\"companyId\":\"acme\",\"companyName\":\"Acme\",\"role\":\"Engineer\"}}", admin);
        rounds.call("{\"driveId\":\"" + driveId + "\",\"rounds\":[\"Aptitude\",\"Interview\"],\"roundConfigsJson\":[{\"name\":\"Aptitude\"}]}", admin);
        instructions.call("{\"driveId\":\"" + driveId + "\",\"venue\":\"Hall A\",\"reportingTime\":\"09:00\",\"instructions\":\"Bring ID\"}", admin);

        var saved = repository.findAll().stream().filter(d -> driveId.equals(d.getDriveId())).findFirst().orElseThrow();
        assertEquals("[{\"name\":\"Aptitude\"}]", saved.getRoundConfigsJson());
        assertEquals("Hall A", saved.getVenue());
        assertEquals("09:00", saved.getReportingTime());
        assertEquals("Bring ID", saved.getInstructions());
        assertEquals(java.util.List.of("Aptitude", "Interview"), saved.getRounds());
    }
}
