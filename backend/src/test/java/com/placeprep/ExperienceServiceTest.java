package com.placeprep;

import com.placeprep.model.InterviewExperience;
import com.placeprep.repository.InterviewExperienceRepository;
import com.placeprep.service.ExperienceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
    void testCreateExperience() {
        InterviewExperience newExp = new InterviewExperience();
        newExp.setExperienceId("exp-del-01");
        newExp.setCompanyId("deloitte");
        newExp.setRole("Analyst");

        when(experienceRepository.save(any(InterviewExperience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterviewExperience created = experienceService.create(newExp);
        assertNotNull(created.getExperienceId());
        assertEquals("exp-del-01", created.getExperienceId());
        verify(experienceRepository, times(1)).save(newExp);
    }

    @Test
    void testGetByBatch() {
        InterviewExperience exp = new InterviewExperience();
        exp.setExperienceId("exp-2026-01");
        exp.setBatch("2026");

        when(experienceRepository.findByBatch("2026")).thenReturn(Collections.singletonList(exp));

        List<InterviewExperience> list = experienceService.getByBatch("2026");
        assertEquals(1, list.size());
        assertEquals("exp-2026-01", list.get(0).getExperienceId());
    }
}
