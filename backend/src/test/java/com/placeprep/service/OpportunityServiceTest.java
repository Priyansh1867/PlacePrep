package com.placeprep.service;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.User;
import com.placeprep.dto.opportunity.OffCampusOpportunityDto;
import com.placeprep.repository.HackathonRepository;
import com.placeprep.repository.InternshipRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OpportunityServiceTest {

    @Mock
    private HackathonRepository hackathonRepository;

    @Mock
    private InternshipRepository internshipRepository;

    @Mock
    private PlacementDriveRepository driveRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OpportunityService opportunityService;

    private User finalYearStudent;
    private User preFinalStudent;
    private PlacementDrive onCampusDrive;
    private PlacementDrive offCampusDrive;

    @BeforeEach
    void setUp() {
        finalYearStudent = new User();
        finalYearStudent.setId(1L);
        finalYearStudent.setName("Aarav Sharma");
        finalYearStudent.setEmail("finalyear.student@placeprep.edu");
        finalYearStudent.setGraduationBatch("2026");

        preFinalStudent = new User();
        preFinalStudent.setId(2L);
        preFinalStudent.setName("Priyansh Jain");
        preFinalStudent.setEmail("priyansh.jain@example.edu");
        preFinalStudent.setGraduationBatch("2028");

        onCampusDrive = new PlacementDrive();
        onCampusDrive.setDriveId("drv-hcl-2026");
        onCampusDrive.setCompanyName("HCLTech");
        onCampusDrive.setDriveType("ON_CAMPUS");
        onCampusDrive.setOffCampus(false);

        offCampusDrive = new PlacementDrive();
        offCampusDrive.setDriveId("off-amzn-sde-2026");
        offCampusDrive.setCompanyName("Amazon AWS");
        offCampusDrive.setDriveType("OFF_CAMPUS");
        offCampusDrive.setOffCampus(true);
    }

    @Test
    @DisplayName("getAllHackathons should return all hackathons from repository")
    void testGetAllHackathons() {
        Hackathon h1 = Hackathon.builder().title("SIH 2026").eventDate("2026-12-15").build();
        Hackathon h2 = Hackathon.builder().title("Google Solution Challenge").eventDate("2027-01-10").build();

        when(hackathonRepository.findAllByOrderByEventDateAsc()).thenReturn(Arrays.asList(h1, h2));

        List<Hackathon> result = opportunityService.getAllHackathons();
        assertEquals(2, result.size());
        assertEquals("SIH 2026", result.get(0).getTitle());
        verify(hackathonRepository, times(1)).findAllByOrderByEventDateAsc();
    }

    @Test
    @DisplayName("getAllInternships should return all internships when batch is null or empty")
    void testGetAllInternshipsNoBatchFilter() {
        Internship i1 = Internship.builder().companyName("Amazon").eligibleBatches("2026, 2027").build();
        Internship i2 = Internship.builder().companyName("Adobe").eligibleBatches("2027, 2028").build();

        when(internshipRepository.findAllByOrderByDeadlineAsc()).thenReturn(Arrays.asList(i1, i2));

        List<Internship> resultAll = opportunityService.getAllInternships(null);
        assertEquals(2, resultAll.size());

        List<Internship> resultEmpty = opportunityService.getAllInternships("   ");
        assertEquals(2, resultEmpty.size());
    }

    @Test
    @DisplayName("getAllInternships should filter internships by eligible batch")
    void testGetAllInternshipsWithBatchFilter() {
        Internship i1 = Internship.builder().companyName("Amazon").eligibleBatches("2026, 2027").build();
        Internship i2 = Internship.builder().companyName("Adobe").eligibleBatches("2027, 2028").build();

        when(internshipRepository.findAllByOrderByDeadlineAsc()).thenReturn(Arrays.asList(i1, i2));

        List<Internship> batch2026 = opportunityService.getAllInternships("2026");
        assertEquals(1, batch2026.size());
        assertEquals("Amazon", batch2026.get(0).getCompanyName());

        List<Internship> batch2028 = opportunityService.getAllInternships("2028");
        assertEquals(1, batch2028.size());
        assertEquals("Adobe", batch2028.get(0).getCompanyName());
    }

    @Test
    @DisplayName("getOffCampusOpportunitiesForStudent should grant access to 2026 final-year student")
    void testGetOffCampusOpportunitiesEligibleStudent() {
        when(userRepository.findByEmail("finalyear.student@placeprep.edu")).thenReturn(Optional.of(finalYearStudent));
        when(driveRepository.findAll()).thenReturn(Arrays.asList(onCampusDrive, offCampusDrive));

        Map<String, Object> response = opportunityService.getOffCampusOpportunitiesForStudent("finalyear.student@placeprep.edu");

        assertEquals("ACCESS_GRANTED", response.get("status"));
        assertEquals(true, response.get("isFinalYearEligible"));
        assertEquals("2026", response.get("detectedBatch"));

        @SuppressWarnings("unchecked")
        List<OffCampusOpportunityDto> opportunities = (List<OffCampusOpportunityDto>) response.get("opportunities");
        assertNotNull(opportunities);
        assertEquals(1, opportunities.size());
        assertEquals("off-amzn-sde-2026", opportunities.get(0).driveId());
        assertEquals("Amazon AWS", opportunities.get(0).companyName());
        assertTrue(opportunities.get(0).locations().isEmpty());
    }

    @Test
    @DisplayName("getOffCampusOpportunitiesForStudent should restrict access for ineligible 2028 student")
    void testGetOffCampusOpportunitiesIneligibleStudent() {
        when(userRepository.findByEmail("priyansh.jain@example.edu")).thenReturn(Optional.of(preFinalStudent));

        Map<String, Object> response = opportunityService.getOffCampusOpportunitiesForStudent("priyansh.jain@example.edu");

        assertEquals("ACCESS_RESTRICTED", response.get("status"));
        assertEquals(false, response.get("isFinalYearEligible"));
        assertEquals("2028", response.get("detectedBatch"));

        List<?> opportunities = (List<?>) response.get("opportunities");
        assertNotNull(opportunities);
        assertTrue(opportunities.isEmpty());
        verify(driveRepository, never()).findAll();
    }

    @Test
    @DisplayName("getOffCampusOpportunitiesForStudent should restrict access when student is unknown or non-existent")
    void testGetOffCampusOpportunitiesUnknownStudent() {
        when(userRepository.findByEmail("unknown.attacker@example.com")).thenReturn(Optional.empty());

        Map<String, Object> response = opportunityService.getOffCampusOpportunitiesForStudent("unknown.attacker@example.com");

        assertEquals("ACCESS_RESTRICTED", response.get("status"));
        assertEquals(false, response.get("isFinalYearEligible"));
        assertNull(response.get("detectedBatch"));

        List<?> opportunities = (List<?>) response.get("opportunities");
        assertNotNull(opportunities);
        assertTrue(opportunities.isEmpty());
    }
}
