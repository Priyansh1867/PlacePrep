package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.CoverageReportDto;
import com.placeprep.model.Notification;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Publish hook that creates in-app notifications for affected students and faculty,
 * grouped per user to prevent duplicate notifications, and computes coverage reports.
 */
@Slf4j
@Component
@Primary
@RequiredArgsConstructor
public class PublishNotificationListener implements TimetablePublishListener {

    private final NotificationService notificationService;
    private final TimetableStudentGroupRepository studentGroupRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableSlotRepository slotRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentResolver departmentResolver;

    @Override
    @Transactional
    public void onTimetablePublished(Timetable timetable) {
        log.info("Processing publish notifications for Timetable ID {} (v{})", timetable.getId(), timetable.getVersionNo());

        // 1. Notify affected students (grouped by user)
        List<TimetableStudentGroup> studentGroups = studentGroupRepository.findByTimetableId(timetable.getId());
        Set<Long> notifiedUserIds = new HashSet<>();

        for (TimetableStudentGroup sg : studentGroups) {
            User studentUser = sg.getUser();
            if (studentUser == null && sg.getRollNumber() != null) {
                studentUser = userRepository.findByRollNumber(sg.getRollNumber()).orElse(null);
            }

            if (studentUser != null && notifiedUserIds.add(studentUser.getId())) {
                String secName = sg.getSection() != null ? sg.getSection().getName() : "";
                Notification n = Notification.builder()
                        .title(String.format("Sem %d Section %s Timetable Updated", timetable.getSemester(), secName))
                        .message(String.format("Semester %d Section %s timetable updated (v%d). See what changed.",
                                timetable.getSemester(), secName, timetable.getVersionNo()))
                        .type("TIMETABLE_UPDATE")
                        .targetRole("STUDENT")
                        .senderName("Academic Office")
                        .linkUrl("/institute?tab=timetable")
                        .build();
                try {
                    notificationService.broadcast(n);
                } catch (Exception ex) {
                    log.error("Failed to broadcast timetable publish notification to student {}: {}", studentUser.getEmail(), ex.getMessage());
                }
            }
        }

        // If no individual users linked, broadcast one general student notification
        if (notifiedUserIds.isEmpty() && !studentGroups.isEmpty()) {
            Notification n = Notification.builder()
                    .title(String.format("Semester %d Timetable Published", timetable.getSemester()))
                    .message(String.format("Semester %d timetable (v%d) has been published.", timetable.getSemester(), timetable.getVersionNo()))
                    .type("TIMETABLE_UPDATE")
                    .targetRole("STUDENT")
                    .senderName("Academic Office")
                    .linkUrl("/institute?tab=timetable")
                    .build();
            try {
                notificationService.broadcast(n);
            } catch (Exception ex) {
                log.error("Failed to broadcast general timetable notification: {}", ex.getMessage());
            }
        }

        // 2. Notify affected faculty (grouped by user)
        List<TimetableSlot> slots = slotRepository.findByTimetableId(timetable.getId());
        Set<Long> notifiedFacultyUserIds = new HashSet<>();

        for (TimetableSlot slot : slots) {
            if (slot.getFaculty() != null) {
                for (FacultyProfile fp : slot.getFaculty()) {
                    User facultyUser = fp.getUser();
                    if (facultyUser == null && fp.getEmail() != null) {
                        facultyUser = userRepository.findByEmail(fp.getEmail()).orElse(null);
                    }

                    if (facultyUser != null && notifiedFacultyUserIds.add(facultyUser.getId())) {
                        Notification n = Notification.builder()
                                .title("Teaching Schedule Published: " + timetable.getTitle())
                                .message(String.format("Semester %d timetable updated (v%d) with your teaching classes.",
                                        timetable.getSemester(), timetable.getVersionNo()))
                                .type("TIMETABLE_UPDATE")
                                .targetRole("TEACHER")
                                .senderName("Academic Office")
                                .linkUrl("/institute?tab=timetable")
                                .build();
                        try {
                            notificationService.broadcast(n);
                        } catch (Exception ex) {
                            log.error("Failed to broadcast timetable publish notification to faculty {}: {}", facultyUser.getEmail(), ex.getMessage());
                        }
                    }
                }
            }
        }
    }

    /**
     * Computes the coverage report for a timetable:
     * - Students in the department with no section assignment
     * - Faculty profiles in the department with no linked user login
     * - Sections in the timetable with no teaching slots
     */
    @Transactional(readOnly = true)
    public CoverageReportDto computeCoverageReport(Timetable timetable) {
        String dept = timetable.getDepartmentCode();

        // 1. Sections with no slots
        List<TimetableSection> sections = sectionRepository.findByTimetableIdOrderByNameAsc(timetable.getId());
        List<String> emptySectionNames = new ArrayList<>();
        for (TimetableSection sec : sections) {
            if (!slotRepository.existsBySectionId(sec.getId())) {
                emptySectionNames.add(sec.getName());
            }
        }

        // 2. Unlinked faculty profiles in this department
        List<FacultyProfile> deptFaculty = facultyProfileRepository.findByDepartmentCode(dept);
        List<String> unlinkedFacultyNames = new ArrayList<>();
        for (FacultyProfile fp : deptFaculty) {
            if (fp.getUser() == null) {
                unlinkedFacultyNames.add(fp.getFullName() + " (" + fp.getShortCode() + ")");
            }
        }

        // 3. Students with no section assignment
        Set<String> assignedRolls = studentGroupRepository.findByTimetableId(timetable.getId()).stream()
                .map(TimetableStudentGroup::getRollNumber)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<User> students = userRepository.findAll().stream()
                .filter(u -> "student".equalsIgnoreCase(u.getRole()))
                .filter(u -> departmentResolver.matches(u.getBranch(), dept))
                .toList();

        List<String> unassignedRolls = new ArrayList<>();
        for (User st : students) {
            if (st.getRollNumber() != null && !assignedRolls.contains(st.getRollNumber())) {
                unassignedRolls.add(st.getRollNumber() + " - " + st.getName());
            }
        }

        String summary = String.format("Coverage: %d empty sections, %d unlinked faculty profiles, %d unassigned students.",
                emptySectionNames.size(), unlinkedFacultyNames.size(), unassignedRolls.size());

        return CoverageReportDto.builder()
                .emptySectionsCount(emptySectionNames.size())
                .emptySectionNames(emptySectionNames)
                .unlinkedFacultyCount(unlinkedFacultyNames.size())
                .unlinkedFacultyNames(unlinkedFacultyNames)
                .unassignedStudentsCount(unassignedRolls.size())
                .unassignedStudentRolls(unassignedRolls)
                .summary(summary)
                .build();
    }

    /**
     * Broadcasts in-app notification when an override substitution is approved.
     */
    public void notifyOverrideApproved(TimetableOverride override) {
        if (override.getSlot() == null) return;
        TimetableSlot slot = override.getSlot();

        String facultyText = override.getSubstituteFaculty() != null ?
                override.getSubstituteFaculty().getFullName() : "Substituted";
        String roomText = override.getNewRoom() != null ?
                override.getNewRoom().getCode() : (slot.getRoom() != null ? slot.getRoom().getCode() : "");

        Notification n = Notification.builder()
                .title(String.format("Class Substitution on %s (%s)", override.getOnDate(), override.getKind()))
                .message(String.format("Class for %s has an approved %s: %s in room %s.",
                        slot.getSubject() != null ? slot.getSubject().getName() : "Slot",
                        override.getKind(), facultyText, roomText))
                .type("TIMETABLE_OVERRIDE")
                .targetRole("ALL")
                .senderName("Academic Office")
                .linkUrl("/institute?tab=timetable")
                .build();

        try {
            notificationService.broadcast(n);
        } catch (Exception ex) {
            log.error("Failed to broadcast override approval notification: {}", ex.getMessage());
        }
    }
}

