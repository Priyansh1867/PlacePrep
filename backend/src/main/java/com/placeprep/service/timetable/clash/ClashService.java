package com.placeprep.service.timetable.clash;

import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.TimetableAssignmentRepository;
import com.placeprep.repository.timetable.TimetablePeriodRepository;
import com.placeprep.repository.timetable.TimetableRepository;
import com.placeprep.repository.timetable.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClashService {

    public static final int MAX_CONSECUTIVE_PERIODS = 4;
    public static final int MAX_DAILY_PERIODS = 6;
    public static final int MIN_LONG_GAP_PERIODS = 2;

    private final TimetableRepository timetableRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableAssignmentRepository assignmentRepository;

    /**
     * Validates a candidate slot against existing slots in the timetable
     * and active slots in other timetables for the same academic session and term.
     */
    @Transactional(readOnly = true)
    public List<TimetableConflict> validateSlot(Long timetableId, TimetableSlot candidate) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        List<TimetablePeriod> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(timetableId);
        List<TimetableSlot> currentSlots = slotRepository.findByTimetableId(timetableId);
        List<TimetableSlot> crossSlots = getCrossTimetableSlots(timetable);
        List<TimetableAssignment> assignments = assignmentRepository.findByTimetableId(timetableId);

        return evaluateCandidateSlot(candidate, currentSlots, crossSlots, periods, assignments, Collections.emptyMap());
    }

    /**
     * Validates the entire timetable against itself and cross-timetable active slots.
     */
    @Transactional(readOnly = true)
    public List<TimetableConflict> validateTimetable(Long timetableId) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        List<TimetablePeriod> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(timetableId);
        List<TimetableSlot> currentSlots = slotRepository.findByTimetableId(timetableId);
        List<TimetableSlot> crossSlots = getCrossTimetableSlots(timetable);
        List<TimetableAssignment> assignments = assignmentRepository.findByTimetableId(timetableId);

        return evaluateTimetable(currentSlots, crossSlots, periods, assignments, Collections.emptyMap());
    }

    private List<TimetableSlot> getCrossTimetableSlots(Timetable timetable) {
        List<TimetableSlot> allActive = slotRepository.findActiveSlotsForSessionAndTerm(
                timetable.getAcademicSession(), timetable.getTerm()
        );
        if (allActive == null) {
            return Collections.emptyList();
        }
        return allActive.stream()
                .filter(s -> s.getTimetable() != null && !s.getTimetable().getId().equals(timetable.getId()))
                .filter(s -> {
                    Timetable other = s.getTimetable();
                    boolean sameScope = Objects.equals(other.getDepartmentCode(), timetable.getDepartmentCode())
                            && Objects.equals(other.getSemester(), timetable.getSemester());
                    return !sameScope;
                })
                .collect(Collectors.toList());
    }

    /**
     * Pure logic: evaluate candidate slot against existing timetable slots and cross-timetable slots.
     */
    public List<TimetableConflict> evaluateCandidateSlot(
            TimetableSlot candidate,
            List<TimetableSlot> existingCurrentSlots,
            List<TimetableSlot> crossSlots,
            List<TimetablePeriod> periods,
            List<TimetableAssignment> assignments,
            Map<Long, Integer> groupSizes
    ) {
        List<TimetableConflict> conflicts = new ArrayList<>();
        // Exclude the slot itself if it was already in the list (e.g. update)
        List<TimetableSlot> filteredCurrent = existingCurrentSlots.stream()
                .filter(s -> candidate.getId() == null || !s.getId().equals(candidate.getId()))
                .collect(Collectors.toList());

        // 1. Single slot intrinsic rules (OUT_OF_GRID, ON_BREAK, GROUP_NOT_IN_SECTION, MISSING_SUBJECT, MISSING_FACULTY, LAB_SPAN_TOO_SHORT)
        checkIntrinsicSlotRules(candidate, periods, conflicts);

        // 2. Clashes against current timetable slots
        for (TimetableSlot other : filteredCurrent) {
            checkPairwiseClashes(candidate, other, periods, periods, conflicts, false);
        }

        // 3. Clashes against cross-timetable slots (FACULTY_CLASH, ROOM_CLASH)
        for (TimetableSlot cross : crossSlots) {
            checkPairwiseClashes(candidate, cross, periods, periods, conflicts, true);
        }

        // 4. Soft rules: assignment check
        checkAssignmentRow(candidate, assignments, conflicts);

        // 5. Soft rules: room capacity
        checkRoomCapacity(candidate, groupSizes, conflicts);

        // 6. Section duplicate check
        checkSubjectDailyDuplicate(candidate, filteredCurrent, conflicts);

        // 7. Faculty daily & consecutive limits with candidate included
        List<TimetableSlot> combined = new ArrayList<>(filteredCurrent);
        combined.add(candidate);
        combined.addAll(crossSlots);
        checkFacultyLimitsForCandidate(candidate, combined, periods, conflicts);

        return conflicts;
    }

    /**
     * Pure logic: evaluate an entire timetable of slots against itself and cross-timetable slots.
     */
    public List<TimetableConflict> evaluateTimetable(
            List<TimetableSlot> currentSlots,
            List<TimetableSlot> crossSlots,
            List<TimetablePeriod> periods,
            List<TimetableAssignment> assignments,
            Map<Long, Integer> groupSizes
    ) {
        List<TimetableConflict> conflicts = new ArrayList<>();

        // 1. Check intrinsic rules for each slot
        for (TimetableSlot s : currentSlots) {
            checkIntrinsicSlotRules(s, periods, conflicts);
            checkAssignmentRow(s, assignments, conflicts);
            checkRoomCapacity(s, groupSizes, conflicts);
        }

        // 2. Check internal pairwise clashes (FACULTY, ROOM, SECTION)
        for (int i = 0; i < currentSlots.size(); i++) {
            for (int j = i + 1; j < currentSlots.size(); j++) {
                checkPairwiseClashes(currentSlots.get(i), currentSlots.get(j), periods, periods, conflicts, false);
            }
        }

        // 3. Check cross-timetable clashes (FACULTY, ROOM)
        for (TimetableSlot current : currentSlots) {
            for (TimetableSlot cross : crossSlots) {
                checkPairwiseClashes(current, cross, periods, periods, conflicts, true);
            }
        }

        // 4. Soft rule: Subject duplicate in a day for same section
        checkAllSubjectDailyDuplicates(currentSlots, conflicts);

        // 5. Soft rule: Faculty daily & consecutive limits across combined slots
        List<TimetableSlot> combined = new ArrayList<>(currentSlots);
        combined.addAll(crossSlots);
        checkAllFacultyLimits(combined, currentSlots, periods, conflicts);

        // 6. Soft rule: Long free gaps for sections and faculty in currentSlots
        checkLongFreeGaps(currentSlots, periods, conflicts);

        return conflicts;
    }

    private void checkIntrinsicSlotRules(TimetableSlot s, List<TimetablePeriod> periods, List<TimetableConflict> conflicts) {
        // OUT_OF_GRID
        int maxPeriod = periods.stream().mapToInt(TimetablePeriod::getPeriodIndex).max().orElse(10);
        if (s.getStartPeriod() == null || s.getStartPeriod() < 1 || s.getSpan() == null || s.getSpan() < 1
                || (s.getStartPeriod() + s.getSpan() - 1) > maxPeriod) {
            conflicts.add(TimetableConflict.builder()
                    .severity(ConflictSeverity.HARD)
                    .code(ConflictCode.OUT_OF_GRID)
                    .message("Slot is outside period grid (Start: " + s.getStartPeriod() + ", Span: " + s.getSpan() + ", Max Period: " + maxPeriod + ")")
                    .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                    .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                    .build());
        }

        // ON_BREAK
        int startP = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
        int endP = startP + (s.getSpan() != null ? s.getSpan() : 1) - 1;
        boolean onBreak = false;
        for (TimetablePeriod p : periods) {
            if (Boolean.TRUE.equals(p.getIsBreak()) && p.getPeriodIndex() != null) {
                if (p.getPeriodIndex() >= startP && p.getPeriodIndex() <= endP) {
                    onBreak = true;
                    break;
                }
            }
        }
        if (onBreak) {
            conflicts.add(TimetableConflict.builder()
                    .severity(ConflictSeverity.HARD)
                    .code(ConflictCode.ON_BREAK)
                    .message("Slot overlaps scheduled break period")
                    .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                    .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                    .build());
        }

        // GROUP_NOT_IN_SECTION
        if (s.getLabGroup() != null && s.getSection() != null) {
            if (s.getLabGroup().getSection() != null && s.getLabGroup().getSection().getId() != null
                    && s.getSection().getId() != null && !s.getLabGroup().getSection().getId().equals(s.getSection().getId())) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.HARD)
                        .code(ConflictCode.GROUP_NOT_IN_SECTION)
                        .message("Lab group '" + s.getLabGroup().getCode() + "' does not belong to section '" + s.getSection().getName() + "'")
                        .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                        .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                        .build());
            }
        }

        // MISSING_SUBJECT for non-OTHER kinds
        if (s.getSlotKind() != SlotKind.OTHER && s.getSubject() == null) {
            conflicts.add(TimetableConflict.builder()
                    .severity(ConflictSeverity.HARD)
                    .code(ConflictCode.MISSING_SUBJECT)
                    .message("Missing subject for " + s.getSlotKind() + " slot")
                    .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                    .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                    .build());
        }

        // MISSING_FACULTY for non-OTHER kinds
        if (s.getSlotKind() != SlotKind.OTHER && (s.getFaculty() == null || s.getFaculty().isEmpty())) {
            conflicts.add(TimetableConflict.builder()
                    .severity(ConflictSeverity.HARD)
                    .code(ConflictCode.MISSING_FACULTY)
                    .message("Missing faculty for " + s.getSlotKind() + " slot")
                    .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                    .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                    .build());
        }

        // LAB_SPAN_TOO_SHORT (SOFT)
        if (s.getSlotKind() == SlotKind.LAB && (s.getSpan() == null || s.getSpan() < 2)) {
            conflicts.add(TimetableConflict.builder()
                    .severity(ConflictSeverity.SOFT)
                    .code(ConflictCode.LAB_SPAN_TOO_SHORT)
                    .message("Lab slot span is less than 2 periods")
                    .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                    .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                    .build());
        }
    }

    private void checkPairwiseClashes(
            TimetableSlot s1,
            TimetableSlot s2,
            List<TimetablePeriod> p1Periods,
            List<TimetablePeriod> p2Periods,
            List<TimetableConflict> conflicts,
            boolean isCrossTimetable
    ) {
        if (!slotsTimeOverlap(s1, p1Periods, s2, p2Periods)) {
            return;
        }

        List<Long> slotIds = new ArrayList<>();
        if (s1.getId() != null) slotIds.add(s1.getId());
        if (s2.getId() != null) slotIds.add(s2.getId());

        List<String> cellRefs = new ArrayList<>();
        if (s1.getSourceRef() != null) cellRefs.add(s1.getSourceRef());
        if (s2.getSourceRef() != null) cellRefs.add(s2.getSourceRef());

        // 1. FACULTY_CLASH
        if (s1.getFaculty() != null && s2.getFaculty() != null) {
            for (FacultyProfile f1 : s1.getFaculty()) {
                for (FacultyProfile f2 : s2.getFaculty()) {
                    boolean sameFaculty = (f1.getId() != null && f1.getId().equals(f2.getId()))
                            || (f1.getShortCode() != null && f1.getShortCode().equalsIgnoreCase(f2.getShortCode()));
                    if (sameFaculty) {
                        String name = f1.getFullName() != null ? f1.getFullName() : f1.getShortCode();
                        conflicts.add(TimetableConflict.builder()
                                .severity(ConflictSeverity.HARD)
                                .code(ConflictCode.FACULTY_CLASH)
                                .message("Faculty " + name + " is scheduled in overlapping slots on Day " + s1.getDayOfWeek())
                                .slotIds(slotIds)
                                .cellRefs(cellRefs)
                                .build());
                    }
                }
            }
        }

        // 2. ROOM_CLASH
        if (s1.getRoom() != null && s2.getRoom() != null) {
            boolean sameRoom = (s1.getRoom().getId() != null && s1.getRoom().getId().equals(s2.getRoom().getId()))
                    || (s1.getRoom().getCode() != null && s1.getRoom().getCode().equalsIgnoreCase(s2.getRoom().getCode()));
            if (sameRoom) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.HARD)
                        .code(ConflictCode.ROOM_CLASH)
                        .message("Room " + s1.getRoom().getCode() + " is double-booked on Day " + s1.getDayOfWeek())
                        .slotIds(slotIds)
                        .cellRefs(cellRefs)
                        .build());
            }
        }

        // 3. SECTION_CLASH (only relevant within same timetable or same section)
        if (!isCrossTimetable && s1.getSection() != null && s2.getSection() != null) {
            boolean sameSection = (s1.getSection().getId() != null && s1.getSection().getId().equals(s2.getSection().getId()))
                    || (s1.getSection().getName() != null && s1.getSection().getName().equalsIgnoreCase(s2.getSection().getName()));
            if (sameSection) {
                // If either is whole-section (labGroup == null) -> clash!
                if (s1.getLabGroup() == null || s2.getLabGroup() == null) {
                    conflicts.add(TimetableConflict.builder()
                            .severity(ConflictSeverity.HARD)
                            .code(ConflictCode.SECTION_CLASH)
                            .message("Section " + s1.getSection().getName() + " has conflicting whole-section and group/whole-section slots on Day " + s1.getDayOfWeek())
                            .slotIds(slotIds)
                            .cellRefs(cellRefs)
                            .build());
                } else {
                    // Both have lab groups. Parallel groups (e.g. A1 and A2) are ALLOWED!
                    // Conflict only if they are the SAME group.
                    boolean sameGroup = (s1.getLabGroup().getId() != null && s1.getLabGroup().getId().equals(s2.getLabGroup().getId()))
                            || (s1.getLabGroup().getCode() != null && s1.getLabGroup().getCode().equalsIgnoreCase(s2.getLabGroup().getCode()));
                    if (sameGroup) {
                        conflicts.add(TimetableConflict.builder()
                                .severity(ConflictSeverity.HARD)
                                .code(ConflictCode.SECTION_CLASH)
                                .message("Lab group " + s1.getLabGroup().getCode() + " of Section " + s1.getSection().getName() + " is double-booked on Day " + s1.getDayOfWeek())
                                .slotIds(slotIds)
                                .cellRefs(cellRefs)
                                .build());
                    }
                }
            }
        }
    }

    public static boolean slotsTimeOverlap(
            TimetableSlot s1, List<TimetablePeriod> p1Periods,
            TimetableSlot s2, List<TimetablePeriod> p2Periods
    ) {
        if (s1.getDayOfWeek() == null || s2.getDayOfWeek() == null || !s1.getDayOfWeek().equals(s2.getDayOfWeek())) {
            return false;
        }

        LocalTime s1Start = getSlotStartTime(s1, p1Periods);
        LocalTime s1End = getSlotEndTime(s1, p1Periods);
        LocalTime s2Start = getSlotStartTime(s2, p2Periods);
        LocalTime s2End = getSlotEndTime(s2, p2Periods);

        if (s1Start != null && s1End != null && s2Start != null && s2End != null) {
            return s1Start.isBefore(s2End) && s2Start.isBefore(s1End);
        }

        // Fallback to period index overlap
        int s1StartP = s1.getStartPeriod() != null ? s1.getStartPeriod() : 0;
        int s1EndP = s1StartP + (s1.getSpan() != null ? s1.getSpan() : 1) - 1;
        int s2StartP = s2.getStartPeriod() != null ? s2.getStartPeriod() : 0;
        int s2EndP = s2StartP + (s2.getSpan() != null ? s2.getSpan() : 1) - 1;
        return s1StartP <= s2EndP && s2StartP <= s1EndP;
    }

    public static LocalTime getSlotStartTime(TimetableSlot s, List<TimetablePeriod> periods) {
        if (s.getCustomStart() != null) {
            return s.getCustomStart();
        }
        if (s.getStartPeriod() != null && periods != null) {
            for (TimetablePeriod p : periods) {
                if (s.getStartPeriod().equals(p.getPeriodIndex())) {
                    return p.getStartTime();
                }
            }
        }
        return null;
    }

    public static LocalTime getSlotEndTime(TimetableSlot s, List<TimetablePeriod> periods) {
        if (s.getCustomEnd() != null) {
            return s.getCustomEnd();
        }
        if (s.getStartPeriod() != null && periods != null) {
            int endP = s.getStartPeriod() + (s.getSpan() != null ? s.getSpan() : 1) - 1;
            for (TimetablePeriod p : periods) {
                if (Integer.valueOf(endP).equals(p.getPeriodIndex())) {
                    return p.getEndTime();
                }
            }
        }
        return null;
    }

    private void checkAssignmentRow(TimetableSlot s, List<TimetableAssignment> assignments, List<TimetableConflict> conflicts) {
        if (assignments == null || s.getSubject() == null || s.getSection() == null
                || s.getFaculty() == null || s.getFaculty().isEmpty() || s.getSlotKind() == SlotKind.OTHER) {
            return;
        }

        for (FacultyProfile f : s.getFaculty()) {
            boolean found = assignments.stream().anyMatch(a -> {
                boolean subMatch = a.getSubject() != null && (
                        (a.getSubject().getId() != null && a.getSubject().getId().equals(s.getSubject().getId()))
                                || (a.getSubject().getShortCode() != null && a.getSubject().getShortCode().equalsIgnoreCase(s.getSubject().getShortCode()))
                );
                boolean secMatch = a.getSection() != null && (
                        (a.getSection().getId() != null && a.getSection().getId().equals(s.getSection().getId()))
                                || (a.getSection().getName() != null && a.getSection().getName().equalsIgnoreCase(s.getSection().getName()))
                );
                boolean facMatch = a.getFaculty() != null && a.getFaculty().stream().anyMatch(af ->
                        (af.getId() != null && af.getId().equals(f.getId()))
                                || (af.getShortCode() != null && af.getShortCode().equalsIgnoreCase(f.getShortCode()))
                );
                return subMatch && secMatch && facMatch;
            });

            if (!found) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.SOFT)
                        .code(ConflictCode.NO_ASSIGNMENT_ROW)
                        .message("No assignment row found for Subject '" + s.getSubject().getName()
                                + "', Section '" + s.getSection().getName()
                                + "', Faculty '" + (f.getFullName() != null ? f.getFullName() : f.getShortCode()) + "'")
                        .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                        .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                        .build());
            }
        }
    }

    private void checkRoomCapacity(TimetableSlot s, Map<Long, Integer> groupSizes, List<TimetableConflict> conflicts) {
        if (s.getRoom() == null || s.getRoom().getCapacity() == null || groupSizes == null) {
            return;
        }
        Long targetId = s.getLabGroup() != null ? s.getLabGroup().getId() : (s.getSection() != null ? s.getSection().getId() : null);
        if (targetId != null && groupSizes.containsKey(targetId)) {
            int studentCount = groupSizes.get(targetId);
            if (studentCount > s.getRoom().getCapacity()) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.SOFT)
                        .code(ConflictCode.ROOM_CAPACITY_EXCEEDED)
                        .message("Room " + s.getRoom().getCode() + " capacity (" + s.getRoom().getCapacity()
                                + ") is smaller than student group size (" + studentCount + ")")
                        .slotIds(s.getId() != null ? List.of(s.getId()) : Collections.emptyList())
                        .cellRefs(s.getSourceRef() != null ? List.of(s.getSourceRef()) : Collections.emptyList())
                        .build());
            }
        }
    }

    private void checkSubjectDailyDuplicate(TimetableSlot candidate, List<TimetableSlot> existingCurrent, List<TimetableConflict> conflicts) {
        if (candidate.getSubject() == null || candidate.getSection() == null || candidate.getSlotKind() == SlotKind.OTHER) {
            return;
        }
        for (TimetableSlot other : existingCurrent) {
            if (other.getDayOfWeek() != null && other.getDayOfWeek().equals(candidate.getDayOfWeek())
                    && other.getSection() != null && candidate.getSection() != null) {
                boolean sameSection = (other.getSection().getId() != null && other.getSection().getId().equals(candidate.getSection().getId()))
                        || (other.getSection().getName() != null && other.getSection().getName().equalsIgnoreCase(candidate.getSection().getName()));
                if (sameSection && other.getSubject() != null) {
                    boolean sameSubject = (other.getSubject().getId() != null && other.getSubject().getId().equals(candidate.getSubject().getId()))
                            || (other.getSubject().getShortCode() != null && other.getSubject().getShortCode().equalsIgnoreCase(candidate.getSubject().getShortCode()));
                    if (sameSubject) {
                        conflicts.add(TimetableConflict.builder()
                                .severity(ConflictSeverity.SOFT)
                                .code(ConflictCode.SUBJECT_DAILY_DUPLICATE)
                                .message("Subject '" + candidate.getSubject().getName() + "' is scheduled multiple times on Day " + candidate.getDayOfWeek() + " for Section " + candidate.getSection().getName())
                                .slotIds(candidate.getId() != null ? List.of(candidate.getId()) : Collections.emptyList())
                                .cellRefs(candidate.getSourceRef() != null ? List.of(candidate.getSourceRef()) : Collections.emptyList())
                                .build());
                        break;
                    }
                }
            }
        }
    }

    private void checkAllSubjectDailyDuplicates(List<TimetableSlot> slots, List<TimetableConflict> conflicts) {
        Map<String, List<TimetableSlot>> byDayAndSection = new HashMap<>();
        for (TimetableSlot s : slots) {
            if (s.getSubject() == null || s.getSection() == null || s.getSlotKind() == SlotKind.OTHER || s.getDayOfWeek() == null) {
                continue;
            }
            String key = s.getDayOfWeek() + ":" + (s.getSection().getId() != null ? s.getSection().getId() : s.getSection().getName());
            byDayAndSection.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        for (List<TimetableSlot> sectionSlots : byDayAndSection.values()) {
            Map<String, List<TimetableSlot>> bySubject = new HashMap<>();
            for (TimetableSlot s : sectionSlots) {
                String subKey = s.getSubject().getId() != null ? String.valueOf(s.getSubject().getId()) : s.getSubject().getShortCode();
                bySubject.computeIfAbsent(subKey, k -> new ArrayList<>()).add(s);
            }
            for (List<TimetableSlot> duplicateList : bySubject.values()) {
                if (duplicateList.size() > 1) {
                    TimetableSlot s0 = duplicateList.get(0);
                    List<Long> ids = duplicateList.stream().map(TimetableSlot::getId).filter(Objects::nonNull).collect(Collectors.toList());
                    List<String> refs = duplicateList.stream().map(TimetableSlot::getSourceRef).filter(Objects::nonNull).collect(Collectors.toList());
                    conflicts.add(TimetableConflict.builder()
                            .severity(ConflictSeverity.SOFT)
                            .code(ConflictCode.SUBJECT_DAILY_DUPLICATE)
                            .message("Subject '" + s0.getSubject().getName() + "' is scheduled multiple times on Day " + s0.getDayOfWeek() + " for Section " + s0.getSection().getName())
                            .slotIds(ids)
                            .cellRefs(refs)
                            .build());
                }
            }
        }
    }

    private void checkFacultyLimitsForCandidate(
            TimetableSlot candidate,
            List<TimetableSlot> allSlots,
            List<TimetablePeriod> periods,
            List<TimetableConflict> conflicts
    ) {
        if (candidate.getFaculty() == null || candidate.getDayOfWeek() == null) {
            return;
        }

        for (FacultyProfile f : candidate.getFaculty()) {
            List<TimetableSlot> facSlots = allSlots.stream()
                    .filter(s -> candidate.getDayOfWeek().equals(s.getDayOfWeek()))
                    .filter(s -> s.getFaculty() != null && s.getFaculty().stream().anyMatch(otherF ->
                            (otherF.getId() != null && otherF.getId().equals(f.getId()))
                                    || (otherF.getShortCode() != null && otherF.getShortCode().equalsIgnoreCase(f.getShortCode()))))
                    .sorted(Comparator.comparingInt(s -> s.getStartPeriod() != null ? s.getStartPeriod() : 0))
                    .collect(Collectors.toList());

            int dailyPeriods = facSlots.stream().mapToInt(s -> s.getSpan() != null ? s.getSpan() : 1).sum();
            if (dailyPeriods > MAX_DAILY_PERIODS) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.SOFT)
                        .code(ConflictCode.FACULTY_DAILY_LIMIT)
                        .message("Faculty " + (f.getFullName() != null ? f.getFullName() : f.getShortCode())
                                + " exceeds daily limit of " + MAX_DAILY_PERIODS + " periods (" + dailyPeriods + " scheduled) on Day " + candidate.getDayOfWeek())
                        .slotIds(candidate.getId() != null ? List.of(candidate.getId()) : Collections.emptyList())
                        .build());
            }

            int consecutive = calculateMaxConsecutive(facSlots);
            if (consecutive > MAX_CONSECUTIVE_PERIODS) {
                conflicts.add(TimetableConflict.builder()
                        .severity(ConflictSeverity.SOFT)
                        .code(ConflictCode.FACULTY_CONSECUTIVE_LIMIT)
                        .message("Faculty " + (f.getFullName() != null ? f.getFullName() : f.getShortCode())
                                + " has " + consecutive + " consecutive periods on Day " + candidate.getDayOfWeek() + " (max allowed is " + MAX_CONSECUTIVE_PERIODS + ")")
                        .slotIds(candidate.getId() != null ? List.of(candidate.getId()) : Collections.emptyList())
                        .build());
            }
        }
    }

    private void checkAllFacultyLimits(
            List<TimetableSlot> allSlots,
            List<TimetableSlot> currentSlots,
            List<TimetablePeriod> periods,
            List<TimetableConflict> conflicts
    ) {
        Map<String, Set<FacultyProfile>> facultyMap = new HashMap<>();
        for (TimetableSlot s : currentSlots) {
            if (s.getFaculty() != null) {
                for (FacultyProfile f : s.getFaculty()) {
                    String key = f.getId() != null ? String.valueOf(f.getId()) : f.getShortCode();
                    facultyMap.computeIfAbsent(key, k -> new HashSet<>()).add(f);
                }
            }
        }

        for (Set<FacultyProfile> facultySet : facultyMap.values()) {
            FacultyProfile f = facultySet.iterator().next();
            for (int day = 1; day <= 6; day++) {
                final int currentDay = day;
                List<TimetableSlot> facSlots = allSlots.stream()
                        .filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == currentDay)
                        .filter(s -> s.getFaculty() != null && s.getFaculty().stream().anyMatch(otherF ->
                                (otherF.getId() != null && otherF.getId().equals(f.getId()))
                                        || (otherF.getShortCode() != null && otherF.getShortCode().equalsIgnoreCase(f.getShortCode()))))
                        .sorted(Comparator.comparingInt(s -> s.getStartPeriod() != null ? s.getStartPeriod() : 0))
                        .collect(Collectors.toList());

                if (facSlots.isEmpty()) continue;

                int dailyPeriods = facSlots.stream().mapToInt(s -> s.getSpan() != null ? s.getSpan() : 1).sum();
                if (dailyPeriods > MAX_DAILY_PERIODS) {
                    List<Long> ids = facSlots.stream().map(TimetableSlot::getId).filter(Objects::nonNull).collect(Collectors.toList());
                    conflicts.add(TimetableConflict.builder()
                            .severity(ConflictSeverity.SOFT)
                            .code(ConflictCode.FACULTY_DAILY_LIMIT)
                            .message("Faculty " + (f.getFullName() != null ? f.getFullName() : f.getShortCode())
                                    + " exceeds daily limit of " + MAX_DAILY_PERIODS + " periods (" + dailyPeriods + " scheduled) on Day " + currentDay)
                            .slotIds(ids)
                            .build());
                }

                int consecutive = calculateMaxConsecutive(facSlots);
                if (consecutive > MAX_CONSECUTIVE_PERIODS) {
                    List<Long> ids = facSlots.stream().map(TimetableSlot::getId).filter(Objects::nonNull).collect(Collectors.toList());
                    conflicts.add(TimetableConflict.builder()
                            .severity(ConflictSeverity.SOFT)
                            .code(ConflictCode.FACULTY_CONSECUTIVE_LIMIT)
                            .message("Faculty " + (f.getFullName() != null ? f.getFullName() : f.getShortCode())
                                    + " has " + consecutive + " consecutive periods on Day " + currentDay + " (max allowed is " + MAX_CONSECUTIVE_PERIODS + ")")
                            .slotIds(ids)
                            .build());
                }
            }
        }
    }

    private int calculateMaxConsecutive(List<TimetableSlot> sortedSlots) {
        if (sortedSlots.isEmpty()) return 0;
        int maxConsecutive = 0;
        int currentConsecutive = 0;
        int lastPeriodCovered = -1;

        for (TimetableSlot s : sortedSlots) {
            int start = s.getStartPeriod() != null ? s.getStartPeriod() : 0;
            int span = s.getSpan() != null ? s.getSpan() : 1;
            int end = start + span - 1;

            if (lastPeriodCovered == -1) {
                currentConsecutive = span;
            } else if (start == lastPeriodCovered + 1) {
                currentConsecutive += span;
            } else if (start <= lastPeriodCovered) {
                // Overlapping or parallel (already counted)
                int extra = end - lastPeriodCovered;
                if (extra > 0) currentConsecutive += extra;
            } else {
                // Gap
                if (currentConsecutive > maxConsecutive) {
                    maxConsecutive = currentConsecutive;
                }
                currentConsecutive = span;
            }
            if (end > lastPeriodCovered) {
                lastPeriodCovered = end;
            }
        }
        return Math.max(maxConsecutive, currentConsecutive);
    }

    private void checkLongFreeGaps(List<TimetableSlot> slots, List<TimetablePeriod> periods, List<TimetableConflict> conflicts) {
        // Find break period indices
        Set<Integer> breakIndices = periods.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsBreak()) && p.getPeriodIndex() != null)
                .map(TimetablePeriod::getPeriodIndex)
                .collect(Collectors.toSet());

        // Group by Section & Day
        Map<String, List<TimetableSlot>> bySecDay = new HashMap<>();
        for (TimetableSlot s : slots) {
            if (s.getSection() != null && s.getDayOfWeek() != null && s.getStartPeriod() != null) {
                String key = s.getDayOfWeek() + ":" + (s.getSection().getId() != null ? s.getSection().getId() : s.getSection().getName());
                bySecDay.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
            }
        }

        for (Map.Entry<String, List<TimetableSlot>> entry : bySecDay.entrySet()) {
            List<TimetableSlot> secSlots = entry.getValue();
            secSlots.sort(Comparator.comparingInt(s -> s.getStartPeriod() != null ? s.getStartPeriod() : 0));

            int minPeriod = secSlots.get(0).getStartPeriod();
            int maxPeriod = secSlots.stream()
                    .mapToInt(s -> (s.getStartPeriod() != null ? s.getStartPeriod() : 0) + (s.getSpan() != null ? s.getSpan() : 1) - 1)
                    .max().orElse(minPeriod);

            // Mark covered periods
            boolean[] occupied = new boolean[maxPeriod + 2];
            for (TimetableSlot s : secSlots) {
                int start = s.getStartPeriod() != null ? s.getStartPeriod() : 0;
                int span = s.getSpan() != null ? s.getSpan() : 1;
                for (int p = start; p < start + span && p < occupied.length; p++) {
                    occupied[p] = true;
                }
            }

            int currentGap = 0;
            for (int p = minPeriod; p <= maxPeriod; p++) {
                if (!occupied[p] && !breakIndices.contains(p)) {
                    currentGap++;
                    if (currentGap >= MIN_LONG_GAP_PERIODS) {
                        TimetableSlot s0 = secSlots.get(0);
                        conflicts.add(TimetableConflict.builder()
                                .severity(ConflictSeverity.SOFT)
                                .code(ConflictCode.LONG_FREE_GAPS)
                                .message("Section " + s0.getSection().getName() + " has a long free gap of " + currentGap + "+ periods on Day " + s0.getDayOfWeek())
                                .slotIds(secSlots.stream().map(TimetableSlot::getId).filter(Objects::nonNull).collect(Collectors.toList()))
                                .build());
                        break;
                    }
                } else {
                    currentGap = 0;
                }
            }
        }
    }
}
