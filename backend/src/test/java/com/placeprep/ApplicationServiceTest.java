package com.placeprep;

import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import com.placeprep.service.ApplicationService;
import com.placeprep.service.EligibilityService;
import com.placeprep.service.ScheduleConflictService;
import com.placeprep.service.StudentAcademicRecordService;
import com.placeprep.service.SelectionWorkflowService;
import org.springframework.test.util.ReflectionTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ApplicationServiceTest {

    private StudentApplicationRepository applicationRepository;
    private PlacementDriveRepository driveRepository;
    private EligibilityService eligibilityService;
    private ScheduleConflictService conflictService;
    private StudentAcademicRecordService academicRecordService;
    private SelectionWorkflowService selectionWorkflowService;
    private ApplicationService applicationService;

    @BeforeEach
    void setUp() {
        applicationRepository = mock(StudentApplicationRepository.class);
        driveRepository = mock(PlacementDriveRepository.class);
        eligibilityService = mock(EligibilityService.class);
        conflictService = mock(ScheduleConflictService.class);
        academicRecordService = mock(StudentAcademicRecordService.class);
        selectionWorkflowService = mock(SelectionWorkflowService.class);
        applicationService = new ApplicationService(applicationRepository, driveRepository, eligibilityService, conflictService);
        ReflectionTestUtils.setField(applicationService, "academicRecordService", academicRecordService);
        ReflectionTestUtils.setField(applicationService, "selectionWorkflowService", selectionWorkflowService);
    }

    @Test
    void testRegisterNewApplicationSetsDefaults() {
        StudentApplication app = new StudentApplication();
        app.setDriveId("drive-001");
        app.setCompanyName("HCLTech");
        app.setRole("GET");
        app.setStudentId("DTU-01");

        when(applicationRepository.save(any(StudentApplication.class))).thenAnswer(i -> i.getArgument(0));

        StudentApplication saved = applicationService.registerApplication(app);

        assertNotNull(saved);
        assertNotNull(saved.getApplicationId());
        assertTrue(saved.getApplicationId().startsWith("APP-"));
        assertNotNull(saved.getAppliedAt());
        verify(applicationRepository, times(1)).save(app);
    }

    @Test
    void testGetByStudentReturnsList() {
        StudentApplication app = new StudentApplication();
        app.setApplicationId("APP-1234");
        app.setStudentId("student-01");

        when(applicationRepository.findByStudentId("student-01")).thenReturn(Collections.singletonList(app));

        List<StudentApplication> apps = applicationService.getStudentApplications("student-01");

        assertEquals(1, apps.size());
        assertEquals("APP-1234", apps.get(0).getApplicationId());
    }
}
