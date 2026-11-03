package com.placeprep;

import com.placeprep.model.Company;
import com.placeprep.model.StudentApplication;
import com.placeprep.service.ApplicationService;
import com.placeprep.service.CompanyService;
import com.placeprep.tools.ApplicationWriteTool;
import com.placeprep.tools.CompanyWriteTool;
import com.placeprep.tools.StaffApplicationTool;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ToolContext;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AiWriteToolTest {
    @Test
    void studentApplicationUsesAuthenticatedUserInsteadOfModelSuppliedStudentId() {
        ApplicationService applicationService = mock(ApplicationService.class);
        ApplicationWriteTool tool = new ApplicationWriteTool(applicationService);
        StudentApplication application = new StudentApplication();
        application.setStudentId("attacker-supplied-id");
        ToolContext context = context("STUDENT", 17L);

        tool.registerForDrive(application, context);

        verify(applicationService).registerApplication(application);
        org.junit.jupiter.api.Assertions.assertEquals("17", application.getStudentId());
    }

    @Test
    void adminCompanyWriteRejectsStudent() {
        CompanyService companyService = mock(CompanyService.class);
        CompanyWriteTool tool = new CompanyWriteTool(companyService);

        assertThrows(SecurityException.class,
                () -> tool.createCompany(new Company(), context("STUDENT", 17L)));

        verifyNoInteractions(companyService);
    }

    @Test
    void driveApplicationListingRejectsNonPlacementStaff() {
        ApplicationService applicationService = mock(ApplicationService.class);
        StaffApplicationTool tool = new StaffApplicationTool(applicationService);

        assertThrows(SecurityException.class,
                () -> tool.listDriveApplications("drive-1", context("TEACHER", 17L)));

        verifyNoInteractions(applicationService);
    }

    @Test
    void adminCompanyWriteCallsServiceForAdmin() {
        CompanyService companyService = mock(CompanyService.class);
        CompanyWriteTool tool = new CompanyWriteTool(companyService);
        Company company = new Company();

        tool.createCompany(company, context("ADMIN", 1L));

        verify(companyService).create(company);
    }

    private ToolContext context(String role, Long userId) {
        return new ToolContext(Map.of("role", role, "userId", userId));
    }
}
