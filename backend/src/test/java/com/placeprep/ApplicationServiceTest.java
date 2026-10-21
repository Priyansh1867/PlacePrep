package com.placeprep;

import com.placeprep.model.PlacementApplication;
import com.placeprep.repository.PlacementApplicationRepository;
import com.placeprep.service.ApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ApplicationServiceTest {

    private PlacementApplicationRepository applicationRepository;
    private ApplicationService applicationService;

    @BeforeEach
    void setUp() {
        applicationRepository = mock(PlacementApplicationRepository.class);
        applicationService = new ApplicationService(applicationRepository);
    }

    @Test
    void testTrackNewApplicationSetsDefaults() {
        PlacementApplication app = new PlacementApplication();
        app.setDriveId("drive-001");
        app.setCompanyName("HCLTech");
        app.setRole("GET");

        when(applicationRepository.findByUserIdAndDriveId(1L, "drive-001")).thenReturn(Optional.empty());
        when(applicationRepository.save(any(PlacementApplication.class))).thenAnswer(i -> i.getArgument(0));

        PlacementApplication saved = applicationService.trackApplication(1L, app);

        assertNotNull(saved);
        assertEquals(1L, saved.getUserId());
        assertEquals("INTERESTED", saved.getStatus());
        assertNotNull(saved.getAppliedDate());
        assertNotNull(saved.getCreatedAt());
        verify(applicationRepository, times(1)).save(app);
    }

    @Test
    void testTrackExistingApplicationUpdatesStatusAndNotes() {
        PlacementApplication existing = new PlacementApplication();
        existing.setId(10L);
        existing.setUserId(1L);
        existing.setDriveId("drive-001");
        existing.setStatus("INTERESTED");
        existing.setNotes("Old note");

        PlacementApplication updatePayload = new PlacementApplication();
        updatePayload.setDriveId("drive-001");
        updatePayload.setStatus("APPLIED");
        updatePayload.setNotes("Submitted resume and coding profile");

        when(applicationRepository.findByUserIdAndDriveId(1L, "drive-001")).thenReturn(Optional.of(existing));
        when(applicationRepository.save(any(PlacementApplication.class))).thenAnswer(i -> i.getArgument(0));

        PlacementApplication saved = applicationService.trackApplication(1L, updatePayload);

        assertEquals("APPLIED", saved.getStatus());
        assertEquals("Submitted resume and coding profile", saved.getNotes());
        verify(applicationRepository, times(1)).save(existing);
    }

    @Test
    void testUpdateStatusUnauthorizedThrowsSecurityException() {
        PlacementApplication app = new PlacementApplication();
        app.setId(10L);
        app.setUserId(2L); // Different user

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        assertThrows(SecurityException.class, () -> {
            applicationService.updateStatus(1L, 10L, "INTERVIEW", "Invited to round 2");
        });
    }

    @Test
    void testWithdrawApplicationDeletesRecord() {
        PlacementApplication app = new PlacementApplication();
        app.setId(10L);
        app.setUserId(1L);

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        applicationService.withdrawApplication(1L, 10L);

        verify(applicationRepository, times(1)).delete(app);
    }

    @Test
    void testGetStudentApplicationStatsCalculatesCorrectCounts() {
        PlacementApplication app1 = new PlacementApplication();
        app1.setStatus("APPLIED");
        PlacementApplication app2 = new PlacementApplication();
        app2.setStatus("INTERVIEW");
        PlacementApplication app3 = new PlacementApplication();
        app3.setStatus("OFFER");

        when(applicationRepository.findByUserId(1L)).thenReturn(Arrays.asList(app1, app2, app3));

        Map<String, Object> stats = applicationService.getStudentApplicationStats(1L);

        assertEquals(3, stats.get("totalTracked"));
        assertEquals(1L, stats.get("appliedCount"));
        assertEquals(1L, stats.get("interviewCount"));
        assertEquals(1L, stats.get("offerCount"));
        assertEquals(0L, stats.get("rejectedCount"));
    }
}
