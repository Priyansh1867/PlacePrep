package com.placeprep.timetable;

import com.placeprep.model.timetable.*;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictCode;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ClashServiceTest {

    private ClashService clashService;
    private List<TimetablePeriod> periods;
    private TimetableSection sectionA;
    private TimetableSection sectionB;
    private TimetableLabGroup groupA1;
    private TimetableLabGroup groupA2;
    private TimetableLabGroup groupB1;
    private TimetableRoom room101;
    private TimetableRoom room102;
    private FacultyProfile profSmith;
    private FacultyProfile profJones;
    private TimetableSubject mathSubject;
    private TimetableSubject labSubject;
    private TimetableSubject otherSubject;

    @BeforeEach
    void setUp() {
        clashService = new ClashService(null, null, null, null);

        // Standard 8 periods (Period 5 is Lunch Break: 11:30 - 12:30)
        periods = new ArrayList<>();
        periods.add(createPeriod(1, LocalTime.of(8, 30), LocalTime.of(9, 30), false, "Period 1"));
        periods.add(createPeriod(2, LocalTime.of(9, 30), LocalTime.of(10, 30), false, "Period 2"));
        periods.add(createPeriod(3, LocalTime.of(10, 30), LocalTime.of(11, 30), false, "Period 3"));
        periods.add(createPeriod(4, LocalTime.of(11, 30), LocalTime.of(12, 0), false, "Period 4"));
        periods.add(createPeriod(5, LocalTime.of(12, 0), LocalTime.of(12, 30), true, "Break")); // BREAK
        periods.add(createPeriod(6, LocalTime.of(12, 30), LocalTime.of(1, 30), false, "Period 6"));
        periods.add(createPeriod(7, LocalTime.of(1, 30), LocalTime.of(2, 30), false, "Period 7"));
        periods.add(createPeriod(8, LocalTime.of(2, 30), LocalTime.of(3, 30), false, "Period 8"));

        sectionA = new TimetableSection();
        sectionA.setId(10L);
        sectionA.setName("A");

        sectionB = new TimetableSection();
        sectionB.setId(20L);
        sectionB.setName("B");

        groupA1 = new TimetableLabGroup();
        groupA1.setId(101L);
        groupA1.setCode("A1");
        groupA1.setSection(sectionA);

        groupA2 = new TimetableLabGroup();
        groupA2.setId(102L);
        groupA2.setCode("A2");
        groupA2.setSection(sectionA);

        groupB1 = new TimetableLabGroup();
        groupB1.setId(201L);
        groupB1.setCode("B1");
        groupB1.setSection(sectionB);

        room101 = new TimetableRoom();
        room101.setId(501L);
        room101.setCode("R101");
        room101.setCapacity(30);

        room102 = new TimetableRoom();
        room102.setId(502L);
        room102.setCode("R102");
        room102.setCapacity(60);

        profSmith = new FacultyProfile();
        profSmith.setId(901L);
        profSmith.setShortCode("PS");
        profSmith.setFullName("Prof. Smith");

        profJones = new FacultyProfile();
        profJones.setId(902L);
        profJones.setShortCode("PJ");
        profJones.setFullName("Prof. Jones");

        mathSubject = new TimetableSubject();
        mathSubject.setId(301L);
        mathSubject.setName("Mathematics");
        mathSubject.setShortCode("MATH");
        mathSubject.setKind(SubjectKind.THEORY);

        labSubject = new TimetableSubject();
        labSubject.setId(302L);
        labSubject.setName("Data Structures Lab");
        labSubject.setShortCode("DSLAB");
        labSubject.setKind(SubjectKind.LAB);

        otherSubject = new TimetableSubject();
        otherSubject.setId(303L);
        otherSubject.setName("Assembly / Club");
        otherSubject.setShortCode("CLUB");
        otherSubject.setKind(SubjectKind.OTHER);
    }

    private TimetablePeriod createPeriod(int idx, LocalTime start, LocalTime end, boolean isBreak, String label) {
        TimetablePeriod p = new TimetablePeriod();
        p.setId((long) idx);
        p.setPeriodIndex(idx);
        p.setStartTime(start);
        p.setEndTime(end);
        p.setIsBreak(isBreak);
        p.setLabel(label);
        return p;
    }

    private TimetableSlot createSlot(Long id, TimetableSection sec, TimetableLabGroup grp, int day, int startP, int span,
                                     TimetableSubject sub, TimetableRoom room, SlotKind kind, FacultyProfile... faculty) {
        TimetableSlot s = new TimetableSlot();
        s.setId(id);
        s.setSection(sec);
        s.setLabGroup(grp);
        s.setDayOfWeek(day);
        s.setStartPeriod(startP);
        s.setSpan(span);
        s.setSubject(sub);
        s.setRoom(room);
        s.setSlotKind(kind != null ? kind : SlotKind.THEORY);
        if (faculty != null && faculty.length > 0) {
            s.setFaculty(new HashSet<>(Arrays.asList(faculty)));
        }
        return s;
    }

    // ==========================================
    // HARD RULES TESTS
    // ==========================================

    @Test
    @DisplayName("HARD: FACULTY_CLASH - same faculty scheduled in overlapping slots on the same day")
    void testFacultyClashInternal() {
        TimetableSlot slot1 = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot slot2 = createSlot(2L, sectionB, null, 1, 1, 1, mathSubject, room102, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(slot1, slot2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.FACULTY_CLASH) && c.getSeverity() == ConflictSeverity.HARD),
                "Should report HARD FACULTY_CLASH for Prof. Smith double booked");
    }

    @Test
    @DisplayName("HARD: FACULTY_CLASH - cross-timetable clash across semesters")
    void testFacultyClashCrossTimetable() {
        // Timetable 1: Section A, Day 1, Period 2
        TimetableSlot currentSlot = createSlot(1L, sectionA, null, 1, 2, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        // Timetable 2 (Cross): Section B, Day 1, Period 2
        TimetableSlot crossSlot = createSlot(99L, sectionB, null, 1, 2, 1, mathSubject, room102, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(currentSlot), List.of(crossSlot), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.FACULTY_CLASH) && c.getSeverity() == ConflictSeverity.HARD),
                "Should report HARD cross-timetable FACULTY_CLASH");
    }

    @Test
    @DisplayName("HARD: ROOM_CLASH - same room used by overlapping slots")
    void testRoomClash() {
        TimetableSlot slot1 = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot slot2 = createSlot(2L, sectionB, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(slot1, slot2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.ROOM_CLASH) && c.getSeverity() == ConflictSeverity.HARD),
                "Should report HARD ROOM_CLASH for R101 double booked");
    }

    @Test
    @DisplayName("HARD: SECTION_CLASH - whole section overlaps another slot of that section")
    void testSectionClashWholeSectionOverlap() {
        TimetableSlot whole = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot group = createSlot(2L, sectionA, groupA1, 1, 1, 1, labSubject, room102, SlotKind.LAB, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(whole, group), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.SECTION_CLASH) && c.getSeverity() == ConflictSeverity.HARD),
                "Should report HARD SECTION_CLASH when whole section overlaps a group slot");
    }

    @Test
    @DisplayName("SECTION_CLASH: Parallel lab groups A1 and A2 at same time is ALLOWED (no clash)")
    void testParallelLabGroupsAllowed() {
        TimetableSlot a1 = createSlot(1L, sectionA, groupA1, 1, 1, 2, labSubject, room101, SlotKind.LAB, profSmith);
        TimetableSlot a2 = createSlot(2L, sectionA, groupA2, 1, 1, 2, labSubject, room102, SlotKind.LAB, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(a1, a2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertFalse(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.SECTION_CLASH)),
                "Parallel lab groups A1 and A2 in different rooms must NOT trigger SECTION_CLASH");
    }

    @Test
    @DisplayName("HARD: SECTION_CLASH - same group A1 double-booked at same time")
    void testSameLabGroupDoubleBooked() {
        TimetableSlot a1First = createSlot(1L, sectionA, groupA1, 1, 1, 2, labSubject, room101, SlotKind.LAB, profSmith);
        TimetableSlot a1Second = createSlot(2L, sectionA, groupA1, 1, 1, 2, labSubject, room102, SlotKind.LAB, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(a1First, a1Second), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.SECTION_CLASH) && c.getSeverity() == ConflictSeverity.HARD),
                "Same lab group A1 in two parallel slots must trigger SECTION_CLASH");
    }

    @Test
    @DisplayName("HARD: OUT_OF_GRID - slot start or span outside period grid")
    void testOutOfGrid() {
        TimetableSlot outSlot = createSlot(1L, sectionA, null, 1, 8, 2, mathSubject, room101, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(outSlot), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.OUT_OF_GRID) && c.getSeverity() == ConflictSeverity.HARD),
                "Slot starting at period 8 with span 2 (ends at 9 > 8) must trigger OUT_OF_GRID");
    }

    @Test
    @DisplayName("HARD: ON_BREAK - slot overlaps scheduled break period")
    void testOnBreak() {
        // Period 5 is break (12:00 - 12:30)
        TimetableSlot breakSlot = createSlot(1L, sectionA, null, 1, 4, 2, mathSubject, room101, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(breakSlot), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.ON_BREAK) && c.getSeverity() == ConflictSeverity.HARD),
                "Slot covering periods 4 and 5 must trigger ON_BREAK");
    }

    @Test
    @DisplayName("HARD: GROUP_NOT_IN_SECTION - lab group belongs to a different section")
    void testGroupNotInSection() {
        // Section A slot assigned Group B1 (belongs to Section B)
        TimetableSlot invalidGroup = createSlot(1L, sectionA, groupB1, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(invalidGroup), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.GROUP_NOT_IN_SECTION) && c.getSeverity() == ConflictSeverity.HARD),
                "Group B1 in Section A slot must trigger GROUP_NOT_IN_SECTION");
    }

    @Test
    @DisplayName("HARD: MISSING_SUBJECT and MISSING_FACULTY for non-OTHER kinds")
    void testMissingSubjectAndFaculty() {
        // Null subject
        TimetableSlot noSub = createSlot(1L, sectionA, null, 1, 1, 1, null, room101, SlotKind.THEORY, profSmith);
        // Null faculty
        TimetableSlot noFac = createSlot(2L, sectionA, null, 1, 2, 1, mathSubject, room101, SlotKind.THEORY);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(noSub, noFac), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.MISSING_SUBJECT) && c.getSeverity() == ConflictSeverity.HARD),
                "Must trigger MISSING_SUBJECT");
        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.MISSING_FACULTY) && c.getSeverity() == ConflictSeverity.HARD),
                "Must trigger MISSING_FACULTY");

        // SlotKind.OTHER allows null faculty / subject without HARD clash
        TimetableSlot otherSlot = createSlot(3L, sectionA, null, 1, 3, 1, otherSubject, room101, SlotKind.OTHER);
        List<TimetableConflict> otherConflicts = clashService.evaluateTimetable(
                List.of(otherSlot), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );
        assertFalse(otherConflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.MISSING_FACULTY)),
                "SlotKind.OTHER does not require faculty");
    }

    // ==========================================
    // SOFT RULES TESTS
    // ==========================================

    @Test
    @DisplayName("SOFT: LAB_SPAN_TOO_SHORT - lab slot with span < 2")
    void testLabSpanTooShort() {
        TimetableSlot shortLab = createSlot(1L, sectionA, groupA1, 1, 1, 1, labSubject, room101, SlotKind.LAB, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(shortLab), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.LAB_SPAN_TOO_SHORT) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT LAB_SPAN_TOO_SHORT");
    }

    @Test
    @DisplayName("SOFT: SUBJECT_DAILY_DUPLICATE - same subject twice in one day for a section")
    void testSubjectDailyDuplicate() {
        TimetableSlot s1 = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot s2 = createSlot(2L, sectionA, null, 1, 3, 1, mathSubject, room101, SlotKind.THEORY, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(s1, s2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.SUBJECT_DAILY_DUPLICATE) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT SUBJECT_DAILY_DUPLICATE");
    }

    @Test
    @DisplayName("SOFT: FACULTY_CONSECUTIVE_LIMIT - faculty with more than 4 consecutive periods")
    void testFacultyConsecutiveLimit() {
        // Periods 1, 2, 3, 4, 6 (5 is break) -> wait, 1 to 4 is 4. Let's make periods 1, 2, 3, 4, and let's add span 2
        // Period 1 (span 2 -> p1, p2), Period 3 (span 2 -> p3, p4), Period 4 (span 1 -> p4 is overlap)
        // Let's create slots for periods 1, 2, 3, 4, 6 without break in between:
        List<TimetablePeriod> continuousPeriods = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            continuousPeriods.add(createPeriod(i, LocalTime.of(8 + i, 0), LocalTime.of(9 + i, 0), false, "P" + i));
        }

        TimetableSlot s1 = createSlot(1L, sectionA, null, 1, 1, 2, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot s2 = createSlot(2L, sectionA, null, 1, 3, 3, mathSubject, room101, SlotKind.THEORY, profSmith); // periods 3, 4, 5 -> total 5 consecutive!

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(s1, s2), Collections.emptyList(), continuousPeriods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.FACULTY_CONSECUTIVE_LIMIT) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT FACULTY_CONSECUTIVE_LIMIT for 5 consecutive periods");
    }

    @Test
    @DisplayName("SOFT: FACULTY_DAILY_LIMIT - faculty with more than 6 periods per day")
    void testFacultyDailyLimit() {
        // 7 periods across the day
        TimetableSlot s1 = createSlot(1L, sectionA, null, 1, 1, 4, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot s2 = createSlot(2L, sectionB, null, 1, 6, 3, mathSubject, room102, SlotKind.THEORY, profSmith);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(s1, s2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.FACULTY_DAILY_LIMIT) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT FACULTY_DAILY_LIMIT for 7 daily periods");
    }

    @Test
    @DisplayName("SOFT: NO_ASSIGNMENT_ROW - no assignment row in tt_assignment for that slot")
    void testNoAssignmentRow() {
        TimetableSlot slot = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);

        // Pass empty assignments list
        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(slot), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.NO_ASSIGNMENT_ROW) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT NO_ASSIGNMENT_ROW when assignment is missing");

        // Now provide matching assignment
        TimetableAssignment assignment = new TimetableAssignment();
        assignment.setSection(sectionA);
        assignment.setSubject(mathSubject);
        assignment.setFaculty(Set.of(profSmith));

        List<TimetableConflict> withAssign = clashService.evaluateTimetable(
                List.of(slot), Collections.emptyList(), periods, List.of(assignment), Collections.emptyMap()
        );

        assertFalse(withAssign.stream().anyMatch(c -> c.getCode().equals(ConflictCode.NO_ASSIGNMENT_ROW)),
                "Must NOT trigger NO_ASSIGNMENT_ROW when valid assignment exists");
    }

    @Test
    @DisplayName("SOFT: ROOM_CAPACITY_EXCEEDED - group size exceeds room capacity")
    void testRoomCapacityExceeded() {
        // Room 101 has capacity 30. Section A has 45 students.
        TimetableSlot slot = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        Map<Long, Integer> groupSizes = Map.of(sectionA.getId(), 45);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(slot), Collections.emptyList(), periods, Collections.emptyList(), groupSizes
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.ROOM_CAPACITY_EXCEEDED) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT ROOM_CAPACITY_EXCEEDED");
    }

    @Test
    @DisplayName("SOFT: LONG_FREE_GAPS - section has >= 2 consecutive free periods")
    void testLongFreeGaps() {
        // Period 1 class, then Period 2 and 3 free, Period 4 class
        TimetableSlot s1 = createSlot(1L, sectionA, null, 1, 1, 1, mathSubject, room101, SlotKind.THEORY, profSmith);
        TimetableSlot s2 = createSlot(2L, sectionA, null, 1, 4, 1, labSubject, room102, SlotKind.LAB, profJones);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(
                List.of(s1, s2), Collections.emptyList(), periods, Collections.emptyList(), Collections.emptyMap()
        );

        assertTrue(conflicts.stream().anyMatch(c -> c.getCode().equals(ConflictCode.LONG_FREE_GAPS) && c.getSeverity() == ConflictSeverity.SOFT),
                "Must trigger SOFT LONG_FREE_GAPS for 2 consecutive free periods between class slots");
    }
}

