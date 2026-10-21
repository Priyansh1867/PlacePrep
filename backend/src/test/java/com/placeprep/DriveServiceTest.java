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
    void testCreateAutoGeneratesDriveId() {
        PlacementDrive newDrive = new PlacementDrive();
        newDrive.setCompanyName("Infosys");
        newDrive.setRole("Specialist Programmer");

        when(driveRepository.save(any(PlacementDrive.class))).thenAnswer(i -> i.getArgument(0));

        PlacementDrive created = driveService.create(newDrive);
        assertNotNull(created.getDriveId());
        assertTrue(created.getDriveId().startsWith("drive-"));
        verify(driveRepository, times(1)).save(newDrive);
    }

    @Test
    void testUpdateDriveProperties() {
        PlacementDrive existing = new PlacementDrive();
        existing.setDriveId("drv-02");
        existing.setRole("Old Role");
        existing.setCtc("₹4.5 LPA");

        PlacementDrive updated = new PlacementDrive();
        updated.setRole("Senior GET");
        updated.setCtc("₹8.0 LPA");

        when(driveRepository.findByDriveId("drv-02")).thenReturn(Optional.of(existing));
        when(driveRepository.save(any(PlacementDrive.class))).thenAnswer(i -> i.getArgument(0));

        PlacementDrive result = driveService.update("drv-02", updated);

        assertEquals("Senior GET", result.getRole());
        assertEquals("₹8.0 LPA", result.getCtc());
        verify(driveRepository, times(1)).save(existing);
    }

    @Test
    void testDeleteDriveRemovesRecord() {
        PlacementDrive existing = new PlacementDrive();
        existing.setDriveId("drv-03");

        when(driveRepository.findByDriveId("drv-03")).thenReturn(Optional.of(existing));

        driveService.delete("drv-03");

        verify(driveRepository, times(1)).delete(existing);
    }
}
