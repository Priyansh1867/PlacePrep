package com.placeprep.service.timetable;

import com.placeprep.exception.BadRequestException;
import com.placeprep.model.timetable.SlotKind;
import com.placeprep.model.timetable.TimetableLabGroup;
import com.placeprep.model.timetable.TimetablePeriod;
import com.placeprep.model.timetable.TimetableSection;
import com.placeprep.model.timetable.TimetableSlot;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Shared timetable validation invariants.
 */
public final class TimetableInvariants {

    private TimetableInvariants() {
    }

    /**
     * Invariant: Span must be >= 1.
     */
    public static void validateSpan(int span) {
        if (span < 1) {
            throw new BadRequestException("Slot period span must be >= 1, but received: " + span);
        }
    }

    /**
     * Invariant: A slot must fit inside the period grid and must not start or end on a break period
     * unless the timetable explicitly allows it.
     */
    public static void validateSlotFitsInGrid(int startPeriod, int span, List<TimetablePeriod> periods, boolean allowBreakOverlaps) {
        validateSpan(span);

        if (periods == null || periods.isEmpty()) {
            throw new BadRequestException("Period grid is empty or not configured.");
        }

        Map<Integer, TimetablePeriod> periodMap = periods.stream()
                .collect(Collectors.toMap(TimetablePeriod::getPeriodIndex, Function.identity(), (p1, p2) -> p1));

        int minPeriod = periods.stream().mapToInt(TimetablePeriod::getPeriodIndex).min().orElse(1);
        int maxPeriod = periods.stream().mapToInt(TimetablePeriod::getPeriodIndex).max().orElse(periods.size());
        int endPeriod = startPeriod + span - 1;

        if (startPeriod < minPeriod || endPeriod > maxPeriod) {
            throw new BadRequestException(String.format(
                    "Slot span [%d..%d] exceeds timetable period boundaries [%d..%d].",
                    startPeriod, endPeriod, minPeriod, maxPeriod
            ));
        }

        if (!allowBreakOverlaps) {
            TimetablePeriod startP = periodMap.get(startPeriod);
            if (startP != null && Boolean.TRUE.equals(startP.getIsBreak())) {
                throw new BadRequestException("Slot cannot start on a designated break period (period " + startPeriod + ").");
            }

            TimetablePeriod endP = periodMap.get(endPeriod);
            if (endP != null && Boolean.TRUE.equals(endP.getIsBreak())) {
                throw new BadRequestException("Slot cannot end on a designated break period (period " + endPeriod + ").");
            }
        }
    }

    /**
     * Invariant: lab_group must belong to the slot's section.
     */
    public static void validateLabGroupBelongsToSection(TimetableLabGroup labGroup, TimetableSection section) {
        if (labGroup == null) {
            return; // Whole section
        }

        if (section == null) {
            throw new BadRequestException("Section must be specified for lab group assignment.");
        }

        if (labGroup.getSection() == null || labGroup.getSection().getId() == null ||
                !labGroup.getSection().getId().equals(section.getId())) {
            throw new BadRequestException(String.format(
                    "Lab group '%s' does not belong to section '%s'.",
                    labGroup.getCode(), section.getName()
            ));
        }
    }

    /**
     * Invariant: A slot_kind LAB must have span >= 1 and a lab_group or an explicit whole-section flag.
     */
    public static void validateLabSlot(SlotKind slotKind, int span, TimetableLabGroup labGroup, boolean isWholeSection) {
        if (slotKind == SlotKind.LAB) {
            validateSpan(span);
            if (labGroup == null && !isWholeSection) {
                throw new BadRequestException("A LAB slot must have an assigned lab group or an explicit whole-section flag.");
            }
        }
    }

    /**
     * Full slot validation combining all domain invariants.
     */
    public static void validateSlot(TimetableSlot slot, List<TimetablePeriod> periods, boolean allowBreakOverlaps, boolean isWholeSection) {
        if (slot == null) {
            throw new BadRequestException("Timetable slot cannot be null.");
        }
        validateSpan(slot.getSpan());
        validateSlotFitsInGrid(slot.getStartPeriod(), slot.getSpan(), periods, allowBreakOverlaps);
        validateLabGroupBelongsToSection(slot.getLabGroup(), slot.getSection());
        validateLabSlot(slot.getSlotKind(), slot.getSpan(), slot.getLabGroup(), isWholeSection);
    }

    /**
     * Helper to collect violation messages without throwing an immediate exception (useful for bulk import preview).
     */
    public static List<String> checkViolations(TimetableSlot slot, List<TimetablePeriod> periods, boolean allowBreakOverlaps, boolean isWholeSection) {
        List<String> violations = new ArrayList<>();
        try {
            validateSlot(slot, periods, allowBreakOverlaps, isWholeSection);
        } catch (BadRequestException ex) {
            violations.add(ex.getMessage());
        }
        return violations;
    }
}

