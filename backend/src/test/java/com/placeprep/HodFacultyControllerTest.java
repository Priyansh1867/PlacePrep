package com.placeprep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.config.TokenService;
import com.placeprep.dto.hod.FacultyRegistrationDto;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class HodFacultyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User cseHodUser;
    private User aidsHodUser;
    private String cseHodToken;
    private String aidsHodToken;
    private String studentToken;
    private String teacherToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // Ensure CSE HOD exists
        cseHodUser = userRepository.findByEmail("hod.cse.test@placeprep.com").orElseGet(() -> {
            User u = new User();
            u.setName("Dr. CSE HOD");
            u.setEmail("hod.cse.test@placeprep.com");
            u.setRole("HOD");
            u.setBranch("CSE");
            u.setCollege("College of Engineering");
            u.setPassword(passwordEncoder.encode("Password123!"));
            u.setOnboardingCompleted(true);
            return userRepository.save(u);
        });

        // Ensure AI&DS HOD exists
        aidsHodUser = userRepository.findByEmail("hod.aids.test@placeprep.com").orElseGet(() -> {
            User u = new User();
            u.setName("Dr. AI&DS HOD");
            u.setEmail("hod.aids.test@placeprep.com");
            u.setRole("HOD");
            u.setBranch("AI&DS");
            u.setCollege("College of Engineering");
            u.setPassword(passwordEncoder.encode("Password123!"));
            u.setOnboardingCompleted(true);
            return userRepository.save(u);
        });

        cseHodToken = tokenService.generateToken(cseHodUser.getId(), cseHodUser.getEmail(), "HOD");
        aidsHodToken = tokenService.generateToken(aidsHodUser.getId(), aidsHodUser.getEmail(), "HOD");
        studentToken = tokenService.generateToken(999L, "student.test@placeprep.com", "STUDENT");
        teacherToken = tokenService.generateToken(888L, "teacher.test@placeprep.com", "TEACHER");
        adminToken = tokenService.generateToken(1L, "admin.test@placeprep.com", "ADMIN");
    }

    @Test
    @DisplayName("Scenario 1: CSE HOD registers CSE faculty successfully")
    void testCseHodRegistersCseFacultySuccessfully() throws Exception {
        FacultyRegistrationDto dto = FacultyRegistrationDto.builder()
                .name("Dr. Rajesh Kumar")
                .email("rajesh.kumar.cse@placeprep.com")
                .facultyId("FAC-CSE-101")
                .phone("9876543210")
                .department("CSE")
                .designation("Associate Professor")
                .specialization("Cloud & Distributed Computing")
                .qualification("Ph.D. in Computer Science")
                .joiningDate("2024-01-15")
                .status("ACTIVE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Dr. Rajesh Kumar")))
                .andExpect(jsonPath("$.email", is("rajesh.kumar.cse@placeprep.com")))
                .andExpect(jsonPath("$.facultyId", is("FAC-CSE-101")))
                .andExpect(jsonPath("$.department", is("CSE")))
                .andExpect(jsonPath("$.designation", is("Associate Professor")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        // Verify stored in DB with CSE branch
        User savedUser = userRepository.findByEmail("rajesh.kumar.cse@placeprep.com").orElse(null);
        assertNotNull(savedUser);
        assertEquals("CSE", savedUser.getBranch());
        assertEquals("faculty", savedUser.getRole());
    }

    @Test
    @DisplayName("Scenario 2: CSE HOD cannot register AI & DS faculty (Department restriction violation)")
    void testCseHodCannotRegisterAidsFaculty() throws Exception {
        FacultyRegistrationDto dto = FacultyRegistrationDto.builder()
                .name("Dr. Sneha Verma")
                .email("sneha.verma.aids@placeprep.com")
                .facultyId("FAC-AIDS-999")
                .phone("9876543211")
                .department("AI&DS") // Trying to register in different department
                .designation("Assistant Professor")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Department restriction violation")));
    }

    @Test
    @DisplayName("Scenario 3: AI & DS HOD can register AI & DS faculty")
    void testAidsHodRegistersAidsFacultySuccessfully() throws Exception {
        FacultyRegistrationDto dto = FacultyRegistrationDto.builder()
                .name("Dr. Sneha Verma")
                .email("sneha.verma.aids.success@placeprep.com")
                .facultyId("FAC-AIDS-202")
                .phone("9876543212")
                .department("AI&DS")
                .designation("Associate Professor")
                .specialization("Machine Learning & Deep Neural Networks")
                .qualification("Ph.D. AI")
                .joiningDate("2024-02-01")
                .status("ACTIVE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + aidsHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.department", is("AI&DS")))
                .andExpect(jsonPath("$.facultyId", is("FAC-AIDS-202")));
    }

    @Test
    @DisplayName("Scenario 4: Duplicate faculty email is rejected")
    void testDuplicateFacultyEmailIsRejected() throws Exception {
        FacultyRegistrationDto dto1 = FacultyRegistrationDto.builder()
                .name("Prof. Alok Gupta")
                .email("alok.gupta.dup@placeprep.com")
                .facultyId("FAC-CSE-301")
                .department("CSE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto1)))
                .andExpect(status().isCreated());

        // Attempt to register same email again
        FacultyRegistrationDto dto2 = FacultyRegistrationDto.builder()
                .name("Prof. Another Person")
                .email("alok.gupta.dup@placeprep.com")
                .facultyId("FAC-CSE-302")
                .department("CSE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Email address is already registered")));
    }

    @Test
    @DisplayName("Scenario 5: Duplicate Faculty ID is rejected")
    void testDuplicateFacultyIdIsRejected() throws Exception {
        FacultyRegistrationDto dto1 = FacultyRegistrationDto.builder()
                .name("Dr. Vikram Singh")
                .email("vikram.singh.id1@placeprep.com")
                .facultyId("FAC-CSE-401")
                .department("CSE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto1)))
                .andExpect(status().isCreated());

        // Attempt to register same faculty ID with different email
        FacultyRegistrationDto dto2 = FacultyRegistrationDto.builder()
                .name("Dr. New Faculty")
                .email("new.faculty.id2@placeprep.com")
                .facultyId("FAC-CSE-401")
                .department("CSE")
                .build();

        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Faculty ID / Employee ID already exists")));
    }

    @Test
    @DisplayName("Scenario 6: Unauthorized roles cannot access faculty registration APIs")
    void testUnauthorizedRolesDenied() throws Exception {
        FacultyRegistrationDto dto = FacultyRegistrationDto.builder()
                .name("Unauthorized Attempt")
                .email("unauth@placeprep.com")
                .facultyId("FAC-UNAUTH-01")
                .build();

        // Anonymous user -> Forbidden
        mockMvc.perform(post("/api/hod/faculty/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());

        // Student role -> Forbidden
        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());

        // Teacher role -> Forbidden (only HOD / Admin authorized)
        mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 7: HOD cannot access another department's faculty records")
    void testHodCannotAccessOtherDepartmentFaculty() throws Exception {
        // Register faculty in AI&DS
        FacultyRegistrationDto aidsDto = FacultyRegistrationDto.builder()
                .name("Dr. AI Specialist")
                .email("ai.specialist@placeprep.com")
                .facultyId("FAC-AIDS-701")
                .department("AI&DS")
                .build();

        String res = mockMvc.perform(post("/api/hod/faculty/register")
                        .header("Authorization", "Bearer " + aidsHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aidsDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        FacultyRegistrationDto created = objectMapper.readValue(res, FacultyRegistrationDto.class);
        Long aidsFacultyId = created.getId();

        // CSE HOD attempts to access AI&DS faculty by ID -> Forbidden
        mockMvc.perform(get("/api/hod/faculty/" + aidsFacultyId)
                        .header("Authorization", "Bearer " + cseHodToken))
                .andExpect(status().isForbidden());

        // CSE HOD attempts to update AI&DS faculty -> Forbidden
        FacultyRegistrationDto updateDto = FacultyRegistrationDto.builder()
                .name("Hacked Name")
                .build();
        mockMvc.perform(put("/api/hod/faculty/" + aidsFacultyId)
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 8: Bulk import supports batch ingestion and reports failures")
    void testBulkImportFacultyWithSuccessAndFailures() throws Exception {
        List<FacultyRegistrationDto> batch = List.of(
                FacultyRegistrationDto.builder()
                        .name("Bulk Prof 1")
                        .email("bulk1.cse@placeprep.com")
                        .facultyId("FAC-CSE-B1")
                        .designation("Assistant Professor")
                        .build(),
                FacultyRegistrationDto.builder()
                        .name("Bulk Prof 2")
                        .email("bulk2.cse@placeprep.com")
                        .facultyId("FAC-CSE-B2")
                        .designation("Associate Professor")
                        .build(),
                FacultyRegistrationDto.builder() // Missing facultyId -> will fail
                        .name("Bulk Prof Invalid")
                        .email("invalid.cse@placeprep.com")
                        .facultyId("")
                        .build()
        );

        mockMvc.perform(post("/api/hod/faculty/bulk-import")
                        .header("Authorization", "Bearer " + cseHodToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProcessed", is(3)))
                .andExpect(jsonPath("$.successCount", is(2)))
                .andExpect(jsonPath("$.failureCount", is(1)))
                .andExpect(jsonPath("$.successful", hasSize(2)))
                .andExpect(jsonPath("$.failed", hasSize(1)));
    }
}
