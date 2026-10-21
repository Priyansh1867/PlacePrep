package com.placeprep;

import com.placeprep.model.InterviewExperience;
import com.placeprep.repository.InterviewExperienceRepository;
import com.placeprep.service.ExperienceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ExperienceServiceTest {

    private InterviewExperienceRepository experienceRepository;
    private ExperienceService experienceService;

    @BeforeEach
    void setUp() {
        experienceRepository = mock(InterviewExperienceRepository.class);
        experienceService = new ExperienceService(experienceRepository);
    }

    @Test
    void testGetAllAndFilterByCompany() {
        InterviewExperience exp1 = new InterviewExperience();
        exp1.setExperienceId("exp-hcl-01");
        exp1.setCompanyId("hcltech");

        InterviewExperience exp2 = new InterviewExperience();
        exp2.setExperienceId("exp-tcs-01");
        exp2.setCompanyId("tcs");

        when(experienceRepository.findAll()).thenReturn(Arrays.asList(exp1, exp2));
        when(experienceRepository.findByCompanyId("hcltech")).thenReturn(Collections.singletonList(exp1));

        List<InterviewExperience> all = experienceService.getAll();
        assertEquals(2, all.size());

        List<InterviewExperience> hclList = experienceService.getByCompanyId("hcltech");
        assertEquals(1, hclList.size());
        assertEquals("exp-hcl-01", hclList.get(0).getExperienceId());
    }

    @Test
    void testCreateAutoGeneratesIdAndSetsApproved() {
        InterviewExperience newExp = new InterviewExperience();
        newExp.setCompanyId("deloitte");
        newExp.setRole("Analyst");

        when(experienceRepository.save(any(InterviewExperience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterviewExperience created = experienceService.create(newExp);
        assertNotNull(created.getExperienceId());
        assertTrue(created.getExperienceId().startsWith("exp-"));
        assertEquals("APPROVED", created.getModerationStatus());
        verify(experienceRepository, times(1)).save(newExp);
    }

    @Test
    void testVoteHelpfulIncrementsCount() {
        InterviewExperience exp = new InterviewExperience();
        exp.setExperienceId("exp-001");
        exp.setHelpfulVotes(5);

        when(experienceRepository.findByExperienceId("exp-001")).thenReturn(Optional.of(exp));
        when(experienceRepository.save(any(InterviewExperience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterviewExperience voted = experienceService.voteHelpful("exp-001");
        assertEquals(6, voted.getHelpfulVotes());
        verify(experienceRepository, times(1)).save(exp);
    }

    @Test
    void testReportExperienceFlagsPost() {
        InterviewExperience exp = new InterviewExperience();
        exp.setExperienceId("exp-002");
        exp.setReported(false);

        when(experienceRepository.findByExperienceId("exp-002")).thenReturn(Optional.of(exp));
        when(experienceRepository.save(any(InterviewExperience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterviewExperience reported = experienceService.reportExperience("exp-002", "Inappropriate language");
        assertTrue(reported.isReported());
        assertEquals("Inappropriate language", reported.getReportReason());
    }

    @Test
    void testModerateExperienceUpdatesStatus() {
        InterviewExperience exp = new InterviewExperience();
        exp.setExperienceId("exp-003");
        exp.setReported(true);
        exp.setModerationStatus("PENDING");

        when(experienceRepository.findByExperienceId("exp-003")).thenReturn(Optional.of(exp));
        when(experienceRepository.save(any(InterviewExperience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterviewExperience moderated = experienceService.moderateExperience("exp-003", "APPROVED");
        assertEquals("APPROVED", moderated.getModerationStatus());
        assertFalse(reported(moderated)); // cleared report flag
        assertTrue(moderated.isVerified());
    }

    private boolean reported(InterviewExperience exp) {
        return exp.isReported();
    }
}
