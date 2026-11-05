package com.placeprep.timetable;

import com.placeprep.exception.BadRequestException;
import com.placeprep.model.timetable.*;
import com.placeprep.service.timetable.TimetableInvariants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TimetableInvariantsTest {

    private List<TimetablePeriod> periods;
    private TimetableSection sectionA;
    private TimetableSection sectionB;
    private TimetableLabGroup groupA1;

    @BeforeEach
    void setUp() {
        periods = new ArrayList<>();
        // Periods 1..6, period 3 is lunch break
        for (int i = 1; i <= 6; i++) {
            TimetablePeriod p = new TimetablePeriod();
            p.setPeriodIndex(i);
            p.setStartTime(LocalTime.of(8 + i, 0));
            p.setEndTime(LocalTime.of(9 + i, 0));
            p.setIsBreak(i == 3);
            p.setLabel(i == 3 ? "Lunch Break" : "Period " + i);
            periods.add(p);
        }

        sectionA = new TimetableSection();
        sectionA.setId(101L);
        sectionA.setName("A");

        sectionB = new TimetableSection();
        sectionB.setId(102L);
        sectionB.setName("B");

        groupA1 = new TimetableLabGroup();
        groupA1.setId(201L);
        groupA1.setCode("A1");
        groupA1.setSection(sectionA);
    }

    @Test
    @DisplayName("Span >= 1 should pass; span < 1 must throw BadRequestException")
    void testSpanValidation() {
        assertDoesNotThrow(() -> TimetableInvariants.validateSpan(1));
        assertDoesNotThrow(() -> TimetableInvariants.validateSpan(3));

        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSpan(0));
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSpan(-2));
    }

    @Test
    @DisplayName("Slot must fit inside period grid boundaries [1..6]")
    void testSlotFitsInGrid() {
        // Fits within 1..6
        assertDoesNotThrow(() -> TimetableInvariants.validateSlotFitsInGrid(1, 2, periods, false));
        assertDoesNotThrow(() -> TimetableInvariants.validateSlotFitsInGrid(4, 2, periods, false));

        // Starts before min period
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSlotFitsInGrid(0, 2, periods, false));

        // Exceeds max period (starts at 5 with span 3 ends at 7)
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSlotFitsInGrid(5, 3, periods, false));
    }

    @Test
    @DisplayName("Slot must not start or end on a break period unless explicitly allowed")
    void testBreakPeriodValidation() {
        // Period 3 is a break
        // Starting on period 3
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSlotFitsInGrid(3, 1, periods, false));
        // Ending on period 3 (start 2, span 2 -> ends on 3)
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSlotFitsInGrid(2, 2, periods, false));

        // If allowBreakOverlaps is true, starting on 3 is allowed
        assertDoesNotThrow(() -> TimetableInvariants.validateSlotFitsInGrid(3, 1, periods, true));
    }

    @Test
    @DisplayName("Lab group must belong to slot section")
    void testLabGroupBelongsToSection() {
        // groupA1 belongs to sectionA
        assertDoesNotThrow(() -> TimetableInvariants.validateLabGroupBelongsToSection(groupA1, sectionA));

        // Null lab group represents whole-section, allowed
        assertDoesNotThrow(() -> TimetableInvariants.validateLabGroupBelongsToSection(null, sectionA));

        // Mismatched section
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateLabGroupBelongsToSection(groupA1, sectionB));
    }

    @Test
    @DisplayName("Slot kind LAB must have span >= 1 and an assigned lab group or explicit whole-section flag")
    void testLabSlotValidation() {
        // LAB with group
        assertDoesNotThrow(() -> TimetableInvariants.validateLabSlot(SlotKind.LAB, 2, groupA1, false));

        // LAB whole section
        assertDoesNotThrow(() -> TimetableInvariants.validateLabSlot(SlotKind.LAB, 2, null, true));

        // LAB without group and without whole section flag should fail
        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateLabSlot(SlotKind.LAB, 2, null, false));

        // THEORY does not require lab group
        assertDoesNotThrow(() -> TimetableInvariants.validateLabSlot(SlotKind.THEORY, 1, null, false));
    }

    @Test
    @DisplayName("Full validateSlot and checkViolations")
    void testFullSlotValidation() {
        TimetableSlot validSlot = new TimetableSlot();
        validSlot.setStartPeriod(1);
        validSlot.setSpan(2);
        validSlot.setSection(sectionA);
        validSlot.setLabGroup(null);
        validSlot.setSlotKind(SlotKind.THEORY);

        assertDoesNotThrow(() -> TimetableInvariants.validateSlot(validSlot, periods, false, false));
        assertTrue(TimetableInvariants.checkViolations(validSlot, periods, false, false).isEmpty());

        TimetableSlot invalidSlot = new TimetableSlot();
        invalidSlot.setStartPeriod(3); // break!
        invalidSlot.setSpan(1);
        invalidSlot.setSection(sectionA);
        invalidSlot.setSlotKind(SlotKind.THEORY);

        assertThrows(BadRequestException.class, () -> TimetableInvariants.validateSlot(invalidSlot, periods, false, false));
        assertFalse(TimetableInvariants.checkViolations(invalidSlot, periods, false, false).isEmpty());
    }
}

