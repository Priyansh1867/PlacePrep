package com.placeprep.config;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.TimetableImportService;
import com.placeprep.service.timetable.TimetableManagementService;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.util.*;

@Slf4j
@Component
@Order(50)
@ConditionalOnProperty(name = "placeprep.timetable.demo-seed", havingValue = "true")
@RequiredArgsConstructor
public class TimetableDemoSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableRepository timetableRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableStudentGroupRepository studentGroupRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableImportService importService;
    private final TimetableManagementService managementService;
    private final ClashService clashService;
    private final PasswordEncoder passwordEncoder;

    @Value("${placeprep.timetable.demo-seed-password:${placeprep.demo.password:DemoPassword123!}}")
    private String seedPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("[TimetableDemoSeeder] Initializing demo timetable dataset...");

        String encodedPassword = passwordEncoder.encode(seedPassword);

        // 1. Create MANAGEMENT user
        User mgmtUser = userRepository.findByEmail("mgmt.timetable@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Timetable Management Admin");
                    u.setEmail("mgmt.timetable@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("MANAGEMENT");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("Administration");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 2. Create HOD of AI&DS
        User hodUser = userRepository.findByEmail("hod.aids@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Dr. HOD AI&DS");
                    u.setEmail("hod.aids@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("HOD");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 3. Create FACULTY linked to AB
        User facAbUser = userRepository.findByEmail("faculty.ab@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Ms. Ambika Bagri");
                    u.setEmail("faculty.ab@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("FACULTY");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setRollNumber("FAC-AB-001");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 4. Create FACULTY linked to RG
        User facRgUser = userRepository.findByEmail("faculty.rg@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Mr. Rahul Guha");
                    u.setEmail("faculty.rg@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("FACULTY");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setRollNumber("FAC-RG-002");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 5. Create STUDENT in Section A Group A1
        User studentA1 = userRepository.findByEmail("student.a1@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Student Sec A Grp A1");
                    u.setEmail("student.a1@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("STUDENT");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setGraduationBatch("2026");
                    u.setRollNumber("22EAIDS001");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 6. Create STUDENT in Section A Group A2
        User studentA2 = userRepository.findByEmail("student.a2@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Student Sec A Grp A2");
                    u.setEmail("student.a2@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("STUDENT");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setGraduationBatch("2026");
                    u.setRollNumber("22EAIDS002");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // 7. Create STUDENT in Section B Group B1
        User studentB1 = userRepository.findByEmail("student.b1@placeprep.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setName("Student Sec B Grp B1");
                    u.setEmail("student.b1@placeprep.com");
                    u.setPassword(encodedPassword);
                    u.setRole("STUDENT");
                    u.setCollege("Rajasthan Technical University");
                    u.setBranch("AIDS");
                    u.setGraduationBatch("2026");
                    u.setRollNumber("22EAIDS051");
                    u.setOnboardingCompleted(true);
                    return userRepository.save(u);
                });

        // Check if timetables for 2026-27 ODD already exist
        List<Timetable> existing = timetableRepository.findByAcademicSessionAndTermAndDepartmentCode(
                "2026-27", Term.ODD, "AIDS"
        );

        Timetable sem5Tt = null;

        if (existing.isEmpty()) {
            File file = new File("backend/src/main/resources/Time Table Odd Sem (2026-2027) 9 Aug (2).xlsx");
            if (!file.exists()) {
                file = new File("src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
            }
            if (!file.exists()) {
                file = new File("Time Table Odd Sem (2026-2027) 9 Aug (2).xlsx");
            }

            if (!file.exists()) {
                log.warn("[TimetableDemoSeeder] Timetable sample Excel file not found at {}. Skipping workbook import.", file.getAbsolutePath());
                return;
            }

            try (FileInputStream fis = new FileInputStream(file)) {
                MultipartFile mpf = new SimpleMultipartFile(
                        "file", file.getName(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fis.readAllBytes()
                );

                ImportPreviewDto preview = importService.uploadAndParse(mpf, "2026-27", Term.ODD, "AIDS", mgmtUser.getEmail());

                // Resolve unresolved faculty
                List<FacultyResolutionDto> resList = new ArrayList<>();
                if (preview.getFaculty() != null) {
                    for (FacultyResolutionDto f : preview.getFaculty()) {
                        if ("UNRESOLVED".equalsIgnoreCase(f.getStatus())) {
                            resList.add(FacultyResolutionDto.builder()
                                    .rawNameOrCode(f.getRawNameOrCode())
                                    .resolvedFullName("Guest Faculty (" + f.getRawNameOrCode() + ")")
                                    .resolvedShortCode(f.getRawNameOrCode())
                                    .status("RESOLVED")
                                    .build());
                        }
                    }
                }

                ImportResolutionsDto resolutions = ImportResolutionsDto.builder()
                        .facultyResolutions(resList)
                        .build();

                importService.applyResolutions(preview.getJobId(), resolutions);
                List<TimetableDto> committed = importService.commitImportJob(preview.getJobId(), true);
                log.info("[TimetableDemoSeeder] Committed {} timetables from sample workbook", committed.size());

                for (TimetableDto t : committed) {
                    if (Integer.valueOf(5).equals(t.getSemester())) {
                        sem5Tt = timetableRepository.findById(t.getId()).orElse(null);
                    }
                }
            }
        } else {
            for (Timetable t : existing) {
                if (Integer.valueOf(5).equals(t.getSemester())) {
                    sem5Tt = t;
                }
            }
        }

        // Link Faculty Profiles
        FacultyProfile abProfile = facultyProfileRepository.findByDepartmentCodeAndShortCode("AIDS", "AB")
                .orElse(null);
        if (abProfile != null) {
            abProfile.setUser(facAbUser);
            abProfile.setEmail(facAbUser.getEmail());
            facultyProfileRepository.save(abProfile);
            log.info("[TimetableDemoSeeder] Linked FacultyProfile AB to user {}", facAbUser.getEmail());
        }

        FacultyProfile rgProfile = facultyProfileRepository.findByDepartmentCodeAndShortCode("AIDS", "RG")
                .orElse(null);
        if (rgProfile != null) {
            rgProfile.setUser(facRgUser);
            rgProfile.setEmail(facRgUser.getEmail());
            facultyProfileRepository.save(rgProfile);
            log.info("[TimetableDemoSeeder] Linked FacultyProfile RG to user {}", facRgUser.getEmail());
        }

        if (sem5Tt != null) {
            // Link Students to Section & Lab Group in tt_student_group
            List<TimetableSection> sections = sectionRepository.findByTimetableId(sem5Tt.getId());
            TimetableSection secA = sections.stream().filter(s -> "A".equalsIgnoreCase(s.getName())).findFirst().orElse(null);
            TimetableSection secB = sections.stream().filter(s -> "B".equalsIgnoreCase(s.getName())).findFirst().orElse(null);

            if (secA != null) {
                List<TimetableLabGroup> groupsA = labGroupRepository.findBySectionIdOrderByCodeAsc(secA.getId());
                TimetableLabGroup grpA1 = groupsA.stream().filter(g -> "A1".equalsIgnoreCase(g.getCode())).findFirst().orElse(null);
                TimetableLabGroup grpA2 = groupsA.stream().filter(g -> "A2".equalsIgnoreCase(g.getCode())).findFirst().orElse(null);

                if (grpA1 != null && studentGroupRepository.findByTimetableIdAndRollNumber(sem5Tt.getId(), studentA1.getRollNumber()).isEmpty()) {
                    TimetableStudentGroup sg1 = new TimetableStudentGroup();
                    sg1.setTimetable(sem5Tt);
                    sg1.setUser(studentA1);
                    sg1.setRollNumber(studentA1.getRollNumber());
                    sg1.setSection(secA);
                    sg1.setLabGroup(grpA1);
                    studentGroupRepository.save(sg1);
                }

                if (grpA2 != null && studentGroupRepository.findByTimetableIdAndRollNumber(sem5Tt.getId(), studentA2.getRollNumber()).isEmpty()) {
                    TimetableStudentGroup sg2 = new TimetableStudentGroup();
                    sg2.setTimetable(sem5Tt);
                    sg2.setUser(studentA2);
                    sg2.setRollNumber(studentA2.getRollNumber());
                    sg2.setSection(secA);
                    sg2.setLabGroup(grpA2);
                    studentGroupRepository.save(sg2);
                }
            }

            if (secB != null) {
                List<TimetableLabGroup> groupsB = labGroupRepository.findBySectionIdOrderByCodeAsc(secB.getId());
                TimetableLabGroup grpB1 = groupsB.stream().filter(g -> "B1".equalsIgnoreCase(g.getCode())).findFirst().orElse(null);

                if (grpB1 != null && studentGroupRepository.findByTimetableIdAndRollNumber(sem5Tt.getId(), studentB1.getRollNumber()).isEmpty()) {
                    TimetableStudentGroup sgB = new TimetableStudentGroup();
                    sgB.setTimetable(sem5Tt);
                    sgB.setUser(studentB1);
                    sgB.setRollNumber(studentB1.getRollNumber());
                    sgB.setSection(secB);
                    sgB.setLabGroup(grpB1);
                    studentGroupRepository.save(sgB);
                }
            }

            // Publish V Sem if in DRAFT
            if (sem5Tt.getStatus() == TimetableStatus.DRAFT) {
                // Ensure no HARD conflicts in Sem 5 so publish succeeds cleanly
                List<TimetableSlot> sem5Slots = slotRepository.findByTimetableId(sem5Tt.getId());
                for (TimetableSlot slot : sem5Slots) {
                    if (slot.getFaculty() == null || slot.getFaculty().isEmpty()) {
                        // Mentor meetings without faculty
                        slot.setSlotKind(SlotKind.OTHER);
                    }
                }
                slotRepository.saveAll(sem5Slots);

                // Check remaining conflicts; if any cross-clashes exist, clear them on sem 5
                List<TimetableConflict> conflicts = clashService.validateTimetable(sem5Tt.getId());
                for (TimetableConflict c : conflicts) {
                    if (c.getSeverity() == ConflictSeverity.HARD && c.getSlotIds() != null) {
                        for (Long sid : c.getSlotIds()) {
                            TimetableSlot s = slotRepository.findById(sid).orElse(null);
                            if (s != null && s.getTimetable() != null && s.getTimetable().getId().equals(sem5Tt.getId())) {
                                s.setSlotKind(SlotKind.OTHER);
                                s.setFaculty(Collections.emptySet());
                                slotRepository.save(s);
                            }
                        }
                    }
                }

                try {
                    managementService.publishTimetable(sem5Tt.getId(), mgmtUser.getEmail());
                    log.info("[TimetableDemoSeeder] Successfully published Semester 5 timetable (ID: {})", sem5Tt.getId());
                } catch (Exception ex) {
                    log.error("[TimetableDemoSeeder] Failed to publish Semester 5 timetable: {}", ex.getMessage());
                }
            }
        }

        log.info("[TimetableDemoSeeder] Demo seeding complete.");
    }

    private static class SimpleMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        public SimpleMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content != null ? content : new byte[0];
        }

        @Override public String getName() { return name; }
        @Override public String getOriginalFilename() { return originalFilename; }
        @Override public String getContentType() { return contentType; }
        @Override public boolean isEmpty() { return content.length == 0; }
        @Override public long getSize() { return content.length; }
        @Override public byte[] getBytes() { return content; }
        @Override public InputStream getInputStream() { return new ByteArrayInputStream(content); }
        @Override public void transferTo(File dest) throws IOException { Files.write(dest.toPath(), content); }
    }
}
