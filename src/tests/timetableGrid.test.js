import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAYS,
  DEFAULT_PERIODS,
  SLOT_KINDS,
  getSlotKindMeta,
  formatTime,
  formatTimeRange,
  doPeriodsOverlap,
  detectParallelLanes,
  buildDayGridModel,
  buildWeekGridModel,
  findNextClass
} from '../utils/timetableGrid.js';

describe('Timetable Grid Pure Utilities', () => {

  test('Days and Periods constants are well-formed', () => {
    assert.equal(DAYS.length, 6, 'Should have 6 days (Mon-Sat)');
    assert.equal(DAYS[0].name, 'Monday');
    assert.equal(DAYS[5].name, 'Saturday');

    assert.equal(DEFAULT_PERIODS.length, 8);
    const breakP = DEFAULT_PERIODS.find(p => p.isBreak);
    assert.ok(breakP, 'Should have a break period defined');
    assert.equal(breakP.periodIndex, 5);
  });

  test('getSlotKindMeta returns color styles and text labels for every kind', () => {
    const theory = getSlotKindMeta('THEORY');
    assert.equal(theory.shortLabel, 'Theory');
    assert.ok(theory.bgClass.includes('sky'));
    assert.ok(theory.iconName);

    const lab = getSlotKindMeta('LAB');
    assert.equal(lab.shortLabel, 'Lab');
    assert.ok(lab.bgClass.includes('emerald'));

    const mentor = getSlotKindMeta('MENTOR_MEETING');
    assert.equal(mentor.shortLabel, 'Mentor');
    assert.ok(mentor.bgClass.includes('amber'));

    // Unknown falls back to OTHER
    const unknown = getSlotKindMeta('CUSTOM_OTHER');
    assert.equal(unknown.shortLabel, 'Other');
  });

  test('formatTime and formatTimeRange format 24h into 12h readable time', () => {
    assert.equal(formatTime('08:30'), '8:30 AM');
    assert.equal(formatTime('13:30'), '1:30 PM');
    assert.equal(formatTime('00:00'), '12:00 AM');
    assert.equal(formatTimeRange('08:30', '09:30'), '8:30 AM – 9:30 AM');
  });

  test('doPeriodsOverlap checks period ranges correctly', () => {
    assert.equal(doPeriodsOverlap(1, 1, 1, 1), true);
    assert.equal(doPeriodsOverlap(1, 2, 2, 1), true);
    assert.equal(doPeriodsOverlap(1, 2, 3, 1), false);
    assert.equal(doPeriodsOverlap(2, 2, 1, 2), true);
  });

  test('detectParallelLanes detects parallel groups', () => {
    const singleLaneSlots = [
      { startPeriod: 1, span: 1, labGroupCode: null },
      { startPeriod: 2, span: 1, labGroupCode: null }
    ];
    assert.equal(detectParallelLanes(singleLaneSlots), false);

    const parallelSlots = [
      { startPeriod: 1, span: 2, labGroupCode: 'A1' },
      { startPeriod: 1, span: 2, labGroupCode: 'A2' }
    ];
    assert.equal(detectParallelLanes(parallelSlots), true);
  });

  test('buildDayGridModel builds 1 lane for non-parallel day and 2 lanes for parallel groups', () => {
    // 1. Single lane day
    const nonParallelSlots = [
      { id: 1, dayOfWeek: 1, startPeriod: 1, span: 1, subjectCode: 'CD', labGroupCode: null },
      { id: 2, dayOfWeek: 1, startPeriod: 2, span: 2, subjectCode: 'WT', labGroupCode: null }
    ];
    const singleModel = buildDayGridModel({
      dayOfWeek: 1,
      periods: DEFAULT_PERIODS,
      slots: nonParallelSlots
    });
    assert.equal(singleModel.hasParallelLanes, false);
    assert.equal(singleModel.laneCount, 1);
    assert.equal(singleModel.lanes.length, 1);

    // 2. Parallel lab day
    const parallelSlots = [
      { id: 10, dayOfWeek: 2, startPeriod: 1, span: 2, subjectCode: 'CD LAB', labGroupCode: 'A1' },
      { id: 11, dayOfWeek: 2, startPeriod: 1, span: 2, subjectCode: 'WT LAB', labGroupCode: 'A2' },
      { id: 12, dayOfWeek: 2, startPeriod: 3, span: 1, subjectCode: 'OS', labGroupCode: null }
    ];
    const parallelModel = buildDayGridModel({
      dayOfWeek: 2,
      periods: DEFAULT_PERIODS,
      slots: parallelSlots
    });
    assert.equal(parallelModel.hasParallelLanes, true);
    assert.equal(parallelModel.laneCount, 2);
    assert.equal(parallelModel.lanes.length, 2);

    // Whole section slot OS in Lane 0 should have laneSpan 2
    const osCell = parallelModel.lanes[0].cells.find(c => c.slot && c.slot.id === 12);
    assert.ok(osCell);
    assert.equal(osCell.laneSpan, 2);
  });

  test('buildWeekGridModel includes all 6 days Mon-Sat', () => {
    const week = buildWeekGridModel({
      periods: DEFAULT_PERIODS,
      slots: [
        { id: 1, dayOfWeek: 1, startPeriod: 1, span: 1, subjectCode: 'MATH' },
        { id: 2, dayOfWeek: 6, startPeriod: 2, span: 1, subjectCode: 'SAT_CLASS' }
      ]
    });
    assert.equal(week.days.length, 6);
    assert.equal(week.days[0].dayOfWeek, 1);
    assert.equal(week.days[5].dayOfWeek, 6);
    assert.equal(week.totalSlotsCount, 2);
  });

  test('findNextClass finds upcoming class accurately', () => {
    const slots = [
      { id: 1, dayOfWeek: 1, startPeriod: 1, subjectCode: 'MATH', customStart: '08:30' },
      { id: 2, dayOfWeek: 1, startPeriod: 2, subjectCode: 'PHY', customStart: '10:00' }
    ];
    // Reference date: Monday 09:00 AM (between slot 1 and slot 2)
    const refDate = new Date('2026-11-02T09:00:00'); // 2026-11-02 was a Monday
    const next = findNextClass(slots, refDate);
    assert.ok(next);
    assert.equal(next.slot.subjectCode, 'PHY');
    assert.equal(next.isToday, true);
  });

});
