// PlacePrep - Timetable Grid Pure Utilities & Render Model
// Pure functional module turning timetable slots into week and day grid models
// Handles parallel lab lanes, spans, break periods, color tokens, and clash display detection.

export const DAYS = [
  { dayOfWeek: 1, name: 'Monday', shortName: 'MON' },
  { dayOfWeek: 2, name: 'Tuesday', shortName: 'TUE' },
  { dayOfWeek: 3, name: 'Wednesday', shortName: 'WED' },
  { dayOfWeek: 4, name: 'Thursday', shortName: 'THU' },
  { dayOfWeek: 5, name: 'Friday', shortName: 'FRI' },
  { dayOfWeek: 6, name: 'Saturday', shortName: 'SAT' }
];

export const DEFAULT_PERIODS = [
  { periodIndex: 1, startTime: '08:30', endTime: '09:30', isBreak: false, label: 'P1 (08:30-09:30)' },
  { periodIndex: 2, startTime: '09:30', endTime: '10:30', isBreak: false, label: 'P2 (09:30-10:30)' },
  { periodIndex: 3, startTime: '10:30', endTime: '11:30', isBreak: false, label: 'P3 (10:30-11:30)' },
  { periodIndex: 4, startTime: '11:30', endTime: '12:30', isBreak: false, label: 'P4 (11:30-12:30)' },
  { periodIndex: 5, startTime: '12:30', endTime: '13:30', isBreak: true, label: 'Lunch Break' },
  { periodIndex: 6, startTime: '13:30', endTime: '14:30', isBreak: false, label: 'P5 (13:30-14:30)' },
  { periodIndex: 7, startTime: '14:30', endTime: '15:30', isBreak: false, label: 'P6 (14:30-15:30)' },
  { periodIndex: 8, startTime: '15:30', endTime: '16:30', isBreak: false, label: 'P7 (15:30-16:30)' }
];

export const SLOT_KINDS = {
  THEORY: {
    label: 'Theory Lecture',
    shortLabel: 'Theory',
    bgClass: 'bg-sky-50 hover:bg-sky-100/80',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-950',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    dotClass: 'bg-sky-500',
    iconName: 'BookOpen'
  },
  LAB: {
    label: 'Laboratory / Practical',
    shortLabel: 'Lab',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-950',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotClass: 'bg-emerald-500',
    iconName: 'FlaskConical'
  },
  MENTOR_MEETING: {
    label: 'Mentor-Mentee Meeting',
    shortLabel: 'Mentor',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-950',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
    iconName: 'Users'
  },
  FOUNDATION: {
    label: 'Foundation Course',
    shortLabel: 'Foundation',
    bgClass: 'bg-indigo-50 hover:bg-indigo-100/80',
    borderClass: 'border-indigo-300',
    textClass: 'text-indigo-950',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    dotClass: 'bg-indigo-500',
    iconName: 'Compass'
  },
  SEMINAR: {
    label: 'Seminar / Workshop',
    shortLabel: 'Seminar',
    bgClass: 'bg-purple-50 hover:bg-purple-100/80',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-950',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    dotClass: 'bg-purple-500',
    iconName: 'Presentation'
  },
  TRAINING: {
    label: 'Placement & CRT Training',
    shortLabel: 'Training',
    bgClass: 'bg-rose-50 hover:bg-rose-100/80',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-950',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
    iconName: 'Briefcase'
  },
  OTHER: {
    label: 'Other Academic Event',
    shortLabel: 'Other',
    bgClass: 'bg-slate-50 hover:bg-slate-100/80',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-900',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    dotClass: 'bg-slate-500',
    iconName: 'Calendar'
  }
};

/**
 * Returns color tokens and accessibility labels for a slot kind.
 */
export function getSlotKindMeta(kind) {
  if (!kind) return SLOT_KINDS.THEORY;
  const key = String(kind).toUpperCase();
  return SLOT_KINDS[key] || SLOT_KINDS.OTHER;
}

/**
 * Formats time string '08:30:00' or '08:30' into friendly readable 12-hour format '8:30 AM'.
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0');
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function formatTimeRange(start, end) {
  if (!start && !end) return '';
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/**
 * Checks whether two period intervals overlap.
 */
export function doPeriodsOverlap(s1Start, s1Span, s2Start, s2Span) {
  const s1End = s1Start + (s1Span || 1) - 1;
  const s2End = s2Start + (s2Span || 1) - 1;
  return s1Start <= s2End && s2Start <= s1End;
}

/**
 * Inspects day slots to determine if parallel lab group lanes are required.
 * Returns true if two slots run at overlapping periods on the same day for different lab groups.
 */
export function detectParallelLanes(daySlots = []) {
  if (!daySlots || daySlots.length <= 1) return false;
  for (let i = 0; i < daySlots.length; i++) {
    const a = daySlots[i];
    const gA = (a.labGroupCode || '').trim();
    if (!gA) continue; // Whole-section class

    for (let j = i + 1; j < daySlots.length; j++) {
      const b = daySlots[j];
      const gB = (b.labGroupCode || '').trim();
      if (!gB || gA.toLowerCase() === gB.toLowerCase()) continue;

      const pAStart = a.startPeriod || 1;
      const pASpan = a.span || 1;
      const pBStart = b.startPeriod || 1;
      const pBSpan = b.span || 1;

      if (doPeriodsOverlap(pAStart, pASpan, pBStart, pBSpan)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Pure function to build the render model for a single day.
 * When parallel groups exist, produces 2 lanes:
 *   - Lane 0: Group 1 slots, or Whole-section slots (with laneSpan: 2)
 *   - Lane 1: Group 2 slots
 * When no parallel groups exist, produces 1 lane:
 *   - Lane 0: All slots (laneSpan: 1)
 */
export function buildDayGridModel({
  dayOfWeek = 1,
  periods = DEFAULT_PERIODS,
  slots = [],
  viewMode = 'section',
  filterGroup = null
}) {
  const dayMeta = DAYS.find(d => d.dayOfWeek === dayOfWeek) || { dayOfWeek, name: 'Day ' + dayOfWeek, shortName: 'D' + dayOfWeek };

  // 1. Filter slots for this day
  let daySlots = slots.filter(s => Number(s.dayOfWeek) === Number(dayOfWeek));

  // If filtered by group (e.g. student view for Group A1)
  if (filterGroup) {
    const fg = String(filterGroup).toLowerCase().trim();
    daySlots = daySlots.filter(s => {
      const g = (s.labGroupCode || '').toLowerCase().trim();
      return !g || g === fg;
    });
  }

  // 2. Detect parallel lanes (only for section/group view modes)
  const hasParallelLanes = (viewMode === 'faculty' || viewMode === 'room') ? false : detectParallelLanes(daySlots);
  const laneCount = hasParallelLanes ? 2 : 1;

  // 3. Sort periods
  const sortedPeriods = [...periods].sort((a, b) => (a.periodIndex || 0) - (b.periodIndex || 0));

  // Map each period index to period object
  const periodMap = new Map();
  sortedPeriods.forEach(p => periodMap.set(p.periodIndex, p));

  // 4. Construct lanes
  // Each lane is an array of cells: { periodIndex, slot, isOccupiedBySpan, isBreak, laneSpan, colSpan }
  const lanes = [];

  for (let laneIdx = 0; laneIdx < laneCount; laneIdx++) {
    const laneCells = [];
    const skipUntilPeriod = new Map(); // tracks multi-period spans

    for (const p of sortedPeriods) {
      const pIdx = p.periodIndex;

      if (skipUntilPeriod.has(pIdx)) {
        // Handled by previous spanning slot
        continue;
      }

      if (p.isBreak) {
        laneCells.push({
          type: 'BREAK',
          periodIndex: pIdx,
          label: p.label || 'Break',
          colSpan: 1,
          laneSpan: 1,
          isBreak: true
        });
        continue;
      }

      // Find slot for this lane and period
      let matchingSlot = null;

      if (!hasParallelLanes) {
        matchingSlot = daySlots.find(s => s.startPeriod === pIdx);
      } else {
        // Parallel mode:
        // Lane 0: Whole section class OR Group 1 (code ends with '1' or alphabetically first)
        // Lane 1: Group 2 (code ends with '2')
        if (laneIdx === 0) {
          // Whole section or Group 1
          matchingSlot = daySlots.find(s => {
            if (s.startPeriod !== pIdx) return false;
            const g = (s.labGroupCode || '').trim();
            if (!g) return true; // Whole section
            return g.endsWith('1') || (!g.endsWith('2') && !g.endsWith('B'));
          });
        } else {
          // Group 2
          matchingSlot = daySlots.find(s => {
            if (s.startPeriod !== pIdx) return false;
            const g = (s.labGroupCode || '').trim();
            if (!g) return false; // Whole section was placed in Lane 0
            return g.endsWith('2') || g.endsWith('B');
          });
        }
      }

      if (matchingSlot) {
        const span = Math.max(1, matchingSlot.span || 1);
        const isWholeSection = !matchingSlot.labGroupCode;
        const laneSpan = (hasParallelLanes && isWholeSection) ? 2 : 1;

        // Mark future periods covered by this span
        for (let sp = 1; sp < span; sp++) {
          skipUntilPeriod.set(pIdx + sp, true);
        }

        // Check if another slot overlaps with this slot in the same cell (clash detection for display)
        const overlaps = daySlots.filter(s => s !== matchingSlot && doPeriodsOverlap(s.startPeriod, s.span, matchingSlot.startPeriod, matchingSlot.span));
        const hasOverlap = overlaps.length > 0;

        laneCells.push({
          type: 'SLOT',
          periodIndex: pIdx,
          slot: matchingSlot,
          colSpan: span,
          laneSpan,
          hasOverlap,
          overlappingSlots: overlaps
        });
      } else {
        // Empty slot cell
        laneCells.push({
          type: 'EMPTY',
          periodIndex: pIdx,
          colSpan: 1,
          laneSpan: 1,
          dayOfWeek,
          period: p
        });
      }
    }

    lanes.push({
      laneIndex: laneIdx,
      label: hasParallelLanes ? (laneIdx === 0 ? 'Batch 1' : 'Batch 2') : null,
      cells: laneCells
    });
  }

  return {
    dayOfWeek,
    dayMeta,
    hasParallelLanes,
    laneCount,
    lanes,
    totalSlots: daySlots.length
  };
}

/**
 * Builds full week grid model for Monday to Saturday.
 */
export function buildWeekGridModel({
  periods = DEFAULT_PERIODS,
  slots = [],
  viewMode = 'section',
  filterGroup = null,
  includeSaturday = true
}) {
  const activeDays = DAYS.filter(d => includeSaturday || d.dayOfWeek <= 5);

  const dayModels = activeDays.map(d =>
    buildDayGridModel({
      dayOfWeek: d.dayOfWeek,
      periods,
      slots,
      viewMode,
      filterGroup
    })
  );

  return {
    periods: [...periods].sort((a, b) => (a.periodIndex || 0) - (b.periodIndex || 0)),
    days: dayModels,
    totalSlotsCount: slots.length
  };
}

/**
 * Finds next upcoming class for student or faculty view from slots and current time.
 */
export function findNextClass(slots = [], referenceDate = new Date()) {
  if (!slots || slots.length === 0) return null;

  // JS Date: 0 is Sunday, 1 is Monday ... 6 is Saturday
  const jsDay = referenceDate.getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const currentHours = referenceDate.getHours();
  const currentMinutes = referenceDate.getMinutes();
  const currentTotalMins = currentHours * 60 + currentMinutes;

  // 1. Check classes today that haven't ended yet
  const todaySlots = slots
    .filter(s => Number(s.dayOfWeek) === currentDayOfWeek && !s.isCancelled)
    .sort((a, b) => (a.startPeriod || 0) - (b.startPeriod || 0));

  for (const s of todaySlots) {
    if (s.customStart) {
      const parts = s.customStart.split(':');
      const startMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
      if (startMins >= currentTotalMins) {
        return { slot: s, isToday: true, startsInMins: startMins - currentTotalMins };
      }
    } else {
      // Period approximation (period 1 starts at 8:30)
      const periodStartMins = (8 * 60 + 30) + ((s.startPeriod - 1) * 60);
      if (periodStartMins >= currentTotalMins) {
        return { slot: s, isToday: true, startsInMins: periodStartMins - currentTotalMins };
      }
    }
  }

  // 2. Fallback to next upcoming day in week
  for (let offset = 1; offset <= 6; offset++) {
    const nextDay = ((currentDayOfWeek - 1 + offset) % 6) + 1;
    const nextDaySlots = slots
      .filter(s => Number(s.dayOfWeek) === nextDay && !s.isCancelled)
      .sort((a, b) => (a.startPeriod || 0) - (b.startPeriod || 0));

    if (nextDaySlots.length > 0) {
      return { slot: nextDaySlots[0], isToday: false, dayOfWeek: nextDay };
    }
  }

  return todaySlots.length > 0 ? { slot: todaySlots[0], isToday: true } : null;
}
