package com.placeprep;

import com.placeprep.model.PlacementDrive;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.service.DriveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class DriveServiceTest {

    private PlacementDriveRepository driveRepository;
    private DriveService driveService;

    @BeforeEach
    void setUp() {
        driveRepository = mock(PlacementDriveRepository.class);
        driveService = new DriveService(driveRepository);
    }

    @Test
    void testGetAllAndFilterByBatch() {
        PlacementDrive d1 = new PlacementDrive();
        d1.setDriveId("drv-01");
        d1.setEligibleBatches(Arrays.asList("2026", "2027"));

        when(driveRepository.findByEligibleBatch("2026")).thenReturn(Collections.singletonList(d1));

        List<PlacementDrive> drives = driveService.getAll("2026");
        assertEquals(1, drives.size());
        assertEquals("drv-01", drives.get(0).getDriveId());
    }

    @Test
    void testCreateDrive() {
        PlacementDrive newDrive = new PlacementDrive();
        newDrive.setDriveId("drive-inf-01");
        newDrive.setCompanyName("Infosys");
        newDrive.setRole("Specialist Programmer");

        when(driveRepository.save(any(PlacementDrive.class))).thenAnswer(i -> i.getArgument(0));

        PlacementDrive created = driveService.create(newDrive);
        assertNotNull(created.getDriveId());
        assertEquals("drive-inf-01", created.getDriveId());
        verify(driveRepository, times(1)).save(newDrive);
    }

    @Test
    void testUpdateRounds() {
        PlacementDrive existing = new PlacementDrive();
        existing.setDriveId("drv-02");
        existing.setRole("Senior GET");

        when(driveRepository.findAll()).thenReturn(Collections.singletonList(existing));
        when(driveRepository.save(any(PlacementDrive.class))).thenAnswer(i -> i.getArgument(0));

        List<String> newRounds = Arrays.asList("OA", "Technical", "HR");
        PlacementDrive result = driveService.updateRounds("drv-02", newRounds, "{}");

        assertEquals(newRounds, result.getRounds());
        verify(driveRepository, times(1)).save(existing);
    }

    @Test
    void testUpdateInstructions() {
        PlacementDrive existing = new PlacementDrive();
        existing.setDriveId("drv-03");

        when(driveRepository.findAll()).thenReturn(Collections.singletonList(existing));
        when(driveRepository.save(any(PlacementDrive.class))).thenAnswer(i -> i.getArgument(0));

        PlacementDrive result = driveService.updateInstructions("drv-03", "Main Hall", "08:30 AM", "Bring resume");

        assertEquals("Main Hall", result.getVenue());
        assertEquals("08:30 AM", result.getReportingTime());
        assertEquals("Bring resume", result.getInstructions());
        verify(driveRepository, times(1)).save(existing);
    }
}
