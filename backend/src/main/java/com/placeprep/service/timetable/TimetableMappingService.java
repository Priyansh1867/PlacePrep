package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.FacultyProfileDto;
import com.placeprep.dto.timetable.StudentGroupDto;
import com.placeprep.dto.timetable.StudentGroupImportCommitRequest;
import com.placeprep.dto.timetable.StudentGroupImportPreviewDto;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableMappingService {

    private final UserRepository userRepository;
    private final TimetableRepository timetableRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableStudentGroupRepository studentGroupRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    private static final Set<String> STAFF_ROLES = Set.of(
            "TEACHER", "FACULTY", "HOD", "ADMIN", "MANAGEMENT", "TPO", "STAFF"
    );

    @Transactional(readOnly = true)
    public StudentGroupImportPreviewDto previewStudentGroupsImport(Long timetableId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        Map<String, TimetableSection> sectionMap = sectionRepository.findByTimetableIdOrderByNameAsc(timetableId).stream()
                .collect(Collectors.toMap(s -> s.getName().trim().toUpperCase(), s -> s, (a, b) -> a));

        List<StudentGroupImportPreviewDto.StudentGroupRowDto> rows = new ArrayList<>();
        List<String> unmatchedRolls = new ArrayList<>();

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (filename.endsWith(".csv") || filename.endsWith(".txt")) {
            parseCsvRows(file, rows);
        } else {
            parseExcelRows(file, rows);
        }

        int matchedCount = 0;
        int unmatchedCount = 0;

        for (StudentGroupImportPreviewDto.StudentGroupRowDto row : rows) {
            String roll = row.getRollNumber() != null ? row.getRollNumber().trim() : "";
            String email = row.getEmail() != null ? row.getEmail().trim().toLowerCase() : "";

            Optional<User> userOpt = Optional.empty();
            if (!roll.isEmpty()) {
                userOpt = userRepository.findByRollNumber(roll);
            }
            if (userOpt.isEmpty() && !email.isEmpty()) {
                userOpt = userRepository.findByEmail(email);
            }

            if (userOpt.isPresent()) {
                User u = userOpt.get();
                row.setMatchedUserId(u.getId());
                row.setMatchedUserName(u.getName());
                matchedCount++;
            } else {
                unmatchedCount++;
                unmatchedRolls.add(roll);
            }

            String sec = row.getSection() != null ? row.getSection().trim().toUpperCase() : "";
            if (!sectionMap.containsKey(sec)) {
                row.setStatus("INVALID_SECTION");
            } else if (userOpt.isPresent()) {
                row.setStatus("MATCHED");
            } else {
                row.setStatus("UNMATCHED");
            }
        }

        return StudentGroupImportPreviewDto.builder()
                .totalRows(rows.size())
                .matchedUsersCount(matchedCount)
                .unmatchedUsersCount(unmatchedCount)
                .unmatchedRollNumbers(unmatchedRolls)
                .rows(rows)
                .build();
    }

    private void parseCsvRows(MultipartFile file, List<StudentGroupImportPreviewDto.StudentGroupRowDto> rows) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] parts = line.split(",");
                if (firstLine && parts[0].toLowerCase().contains("roll")) {
                    firstLine = false;
                    continue;
                }
                firstLine = false;

                String roll = parts.length > 0 ? parts[0].trim() : "";
                String section = parts.length > 1 ? parts[1].trim() : "";
                String group = parts.length > 2 ? parts[2].trim() : "";
                String email = parts.length > 3 ? parts[3].trim() : null;

                rows.add(StudentGroupImportPreviewDto.StudentGroupRowDto.builder()
                        .rollNumber(roll)
                        .section(section)
                        .labGroup(group)
                        .email(email)
                        .build());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Error reading CSV file: " + ex.getMessage(), ex);
        }
    }

    private void parseExcelRows(MultipartFile file, List<StudentGroupImportPreviewDto.StudentGroupRowDto> rows) {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            boolean firstRow = true;
            for (Row row : sheet) {
                String c0 = formatter.formatCellValue(row.getCell(0)).trim();
                if (firstRow && c0.toLowerCase().contains("roll")) {
                    firstRow = false;
                    continue;
                }
                firstRow = false;
                if (c0.isEmpty()) continue;

                String c1 = formatter.formatCellValue(row.getCell(1)).trim();
                String c2 = formatter.formatCellValue(row.getCell(2)).trim();
                String c3 = formatter.formatCellValue(row.getCell(3)).trim();

                rows.add(StudentGroupImportPreviewDto.StudentGroupRowDto.builder()
                        .rollNumber(c0)
                        .section(c1)
                        .labGroup(c2)
                        .email(c3.isEmpty() ? null : c3)
                        .build());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Error reading Excel file: " + ex.getMessage(), ex);
        }
    }

    @Transactional
    public void commitStudentGroupsImport(StudentGroupImportCommitRequest request) {
        Long timetableId = request.getTimetableId();
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        Map<String, TimetableSection> secMap = sectionRepository.findByTimetableIdOrderByNameAsc(timetableId).stream()
                .collect(Collectors.toMap(s -> s.getName().trim().toUpperCase(), s -> s, (a, b) -> a));

        Map<String, TimetableLabGroup> grpMap = new HashMap<>();
        for (TimetableSection sec : secMap.values()) {
            for (TimetableLabGroup g : labGroupRepository.findBySectionIdOrderByCodeAsc(sec.getId())) {
                grpMap.put(sec.getName().trim().toUpperCase() + ":" + g.getCode().trim().toUpperCase(), g);
            }
        }

        for (StudentGroupImportPreviewDto.StudentGroupRowDto row : request.getRows()) {
            String roll = row.getRollNumber() != null ? row.getRollNumber().trim() : "";
            if (roll.isEmpty()) continue;

            String secName = row.getSection() != null ? row.getSection().trim().toUpperCase() : "";
            TimetableSection section = secMap.get(secName);
            if (section == null) continue;

            TimetableLabGroup group = null;
            if (row.getLabGroup() != null && !row.getLabGroup().trim().isEmpty()) {
                String grpKey = secName + ":" + row.getLabGroup().trim().toUpperCase();
                group = grpMap.get(grpKey);
            }

            User user = null;
            if (row.getMatchedUserId() != null) {
                user = userRepository.findById(row.getMatchedUserId()).orElse(null);
            }

            Optional<TimetableStudentGroup> existing = studentGroupRepository.findByTimetableIdAndRollNumber(timetableId, roll);
            TimetableStudentGroup sg = existing.orElse(new TimetableStudentGroup());
            sg.setTimetable(timetable);
            sg.setRollNumber(roll);
            sg.setSection(section);
            sg.setLabGroup(group);
            if (user != null) {
                sg.setUser(user);
            }

            studentGroupRepository.save(sg);
        }
    }

    // --- Student Group Single CRUD ---

    @Transactional(readOnly = true)
    public List<StudentGroupDto> listStudentGroups(Long timetableId, Long sectionId) {
        List<TimetableStudentGroup> list = sectionId != null
                ? studentGroupRepository.findByTimetableIdAndSectionId(timetableId, sectionId)
                : studentGroupRepository.findByTimetableId(timetableId);
        return list.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public StudentGroupDto createStudentGroup(StudentGroupDto dto) {
        Timetable timetable = timetableRepository.findById(dto.getTimetableId())
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + dto.getTimetableId()));
        TimetableSection section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new IllegalArgumentException("Section not found: " + dto.getSectionId()));

        TimetableStudentGroup sg = new TimetableStudentGroup();
        sg.setTimetable(timetable);
        sg.setSection(section);
        sg.setRollNumber(dto.getRollNumber());
        if (dto.getLabGroupId() != null) {
            sg.setLabGroup(labGroupRepository.findById(dto.getLabGroupId()).orElse(null));
        }
        if (dto.getUserId() != null) {
            sg.setUser(userRepository.findById(dto.getUserId()).orElse(null));
        }

        return TimetableDtoMapper.toDto(studentGroupRepository.save(sg));
    }

    @Transactional
    public StudentGroupDto updateStudentGroup(Long id, StudentGroupDto dto) {
        TimetableStudentGroup sg = studentGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student group mapping not found: " + id));

        if (dto.getRollNumber() != null) sg.setRollNumber(dto.getRollNumber());
        if (dto.getSectionId() != null) {
            sg.setSection(sectionRepository.findById(dto.getSectionId()).orElse(sg.getSection()));
        }
        if (dto.getLabGroupId() != null) {
            sg.setLabGroup(labGroupRepository.findById(dto.getLabGroupId()).orElse(null));
        } else {
            sg.setLabGroup(null);
        }
        if (dto.getUserId() != null) {
            sg.setUser(userRepository.findById(dto.getUserId()).orElse(null));
        }

        return TimetableDtoMapper.toDto(studentGroupRepository.save(sg));
    }

    @Transactional
    public void deleteStudentGroup(Long id) {
        studentGroupRepository.deleteById(id);
    }

    // --- Faculty Profile User Linking ---

    @Transactional
    public FacultyProfileDto linkFacultyProfileToUser(Long profileId, Long userId) {
        FacultyProfile profile = facultyProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty profile not found: " + profileId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Enforce staff role constraint
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
        if (!STAFF_ROLES.contains(role)) {
            throw new IllegalArgumentException("Only users with staff roles can be linked to faculty profiles. User role is: " + role);
        }

        // Enforce 1-to-1 linking: a user can be linked to at most one profile
        Optional<FacultyProfile> existing = facultyProfileRepository.findByUserId(userId);
        if (existing.isPresent() && !existing.get().getId().equals(profileId)) {
            throw new IllegalStateException("User " + user.getEmail() + " is already linked to faculty profile: " + existing.get().getFullName());
        }

        profile.setUser(user);
        if (profile.getEmail() == null || profile.getEmail().trim().isEmpty()) {
            profile.setEmail(user.getEmail());
        }

        return TimetableDtoMapper.toDto(facultyProfileRepository.save(profile));
    }
}

