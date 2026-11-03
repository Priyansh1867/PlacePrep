package com.placeprep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.model.PlacementDrive;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.tools.DriveTool;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class DriveCalendarToolSerializationTest {
    @Autowired PlacementDriveRepository drives;
    @Autowired DriveTool driveTool;
    @Autowired ObjectMapper mapper;

    @Test
    void calendarToolReturnsSerializableEligibleBatchesAndRounds() throws Exception {
        PlacementDrive drive = new PlacementDrive();
        drive.setDriveId("calendar-" + UUID.randomUUID());
        drive.setCompanyId("calendar-company");
        drive.setCompanyName("Calendar Test Company");
        drive.setRole("Engineer");
        drive.setEligibleBatches(List.of("2026", "2027"));
        drive.setRounds(List.of("Aptitude", "Interview"));
        drives.saveAndFlush(drive);

        String json = mapper.writeValueAsString(driveTool.getDriveCalendar());

        assertTrue(json.contains("\"eligibleBatches\":[\"2026\",\"2027\"]"));
        assertTrue(json.contains("\"rounds\":[\"Aptitude\",\"Interview\"]"));
    }
}
