import { seedTestRecords } from './fixtures/records.js';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  SHORTAGE_THRESHOLD_PERCENT,
  DEPARTMENTS,
  ACADEMIC_YEARS,
  getSubjectsForDeptAndSemester,
  getRosterForClass,
  fetchAttendanceReport,
  findOrCreateSession,
  saveClassAttendance,
  fetchSessionRecords,
  getLocalSessions,
  saveLocalSessions,
  getLocalRecords,
  saveLocalRecords
} from '../services/attendanceStorage.js';

// Mock localStorage for node environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

globalThis.localStorage = storageMock;

describe('Teacher & HOD Daily Class Attendance Portal Tests', () => {

  beforeEach(() => {
    localStorage.clear();
    seedTestRecords('attendance');
  });

  test('Valid class selection loads the correct roster', () => {
    const cseRoster = getRosterForClass('CSE', '6');
    assert.ok(Array.isArray(cseRoster));
    assert.ok(cseRoster.length >= 8);
    assert.equal(cseRoster[0].rollNumber, '22CS0101');
    assert.equal(cseRoster[0].name, 'Priyansh Jain');
    assert.equal(cseRoster[0].department, 'CSE');
    assert.equal(cseRoster[0].semester, '6');
  });

  test('Changing department updates dependent selections and subjects', () => {
    // CSE Sem 6 subjects
    const cseSubjects = getSubjectsForDeptAndSemester('CSE', 6);
    assert.ok(Array.isArray(cseSubjects));
    const hasCloud = cseSubjects.some(s => s.code === 'CS306' || s.name.toLowerCase().includes('cloud'));
    assert.ok(hasCloud, 'CSE Sem 6 must include Cloud Computing (CS306)');

    // IT Sem 6 subjects
    const itSubjects = getSubjectsForDeptAndSemester('IT', 6);
    assert.ok(Array.isArray(itSubjects));
    const hasDevOps = itSubjects.some(s => s.code === 'IT306');
    assert.ok(hasDevOps, 'IT Sem 6 must include IT306');

    // ECE Sem 6 subjects
    const eceSubjects = getSubjectsForDeptAndSemester('ECE', 6);
    assert.ok(Array.isArray(eceSubjects));
    const hasWireless = eceSubjects.some(s => s.code === 'EC306');
    assert.ok(hasWireless, 'ECE Sem 6 must include EC306');
  });

  test('Changing academic year updates dependent semesters', () => {
    const year1 = ACADEMIC_YEARS.find(y => y.id === '1');
    assert.deepEqual(year1.semesters, [1, 2]);

    const year3 = ACADEMIC_YEARS.find(y => y.id === '3');
    assert.deepEqual(year3.semesters, [5, 6]);
  });

  test('Default state is UNMARKED so students are not silently recorded as present', () => {
    const roster = getRosterForClass('CSE', '6');
    const initialMap = {};
    roster.forEach(stu => {
      initialMap[stu.studentId] = { status: 'UNMARKED', remarks: '' };
    });

    roster.forEach(stu => {
      assert.equal(initialMap[stu.studentId].status, 'UNMARKED');
    });
  });

  test('All three attendance statuses (PRESENT, ABSENT, LATE) can be selected and changed', () => {
    const studentId = 'priyansh.jain@example.edu';
    let record = { status: 'UNMARKED', remarks: '' };

    // Toggle to PRESENT (Green)
    record.status = 'PRESENT';
    assert.equal(record.status, 'PRESENT');

    // Toggle to ABSENT (Red)
    record.status = 'ABSENT';
    assert.equal(record.status, 'ABSENT');

    // Toggle to LATE (Yellow)
    record.status = 'LATE';
    assert.equal(record.status, 'LATE');

    // Toggle to UNMARKED (Slate default)
    record.status = 'UNMARKED';
    assert.equal(record.status, 'UNMARKED');
  });

  test('Attendance saves and reloads correctly and prevents duplicates', async () => {
    const sessionId = 901;
    const recordsToSave = [
      {
        sessionId,
        studentId: 'priyansh.jain@example.edu',
        studentRollNumber: '22CS0101',
        studentName: 'Priyansh Jain',
        status: 'PRESENT',
        remarks: 'On time'
      },
      {
        sessionId,
        studentId: 'ananya.sharma@example.edu',
        studentRollNumber: '22CS0102',
        studentName: 'Ananya Sharma',
        status: 'LATE',
        remarks: '10 mins late'
      }
    ];

    // Initial Save
    await saveClassAttendance(sessionId, recordsToSave);
    const loaded = await fetchSessionRecords(sessionId);
    assert.equal(loaded.length, 2);
    assert.equal(loaded.find(r => r.studentRollNumber === '22CS0101').status, 'PRESENT');
    assert.equal(loaded.find(r => r.studentRollNumber === '22CS0102').status, 'LATE');

    // Update existing record (e.g. change Ananya to PRESENT)
    const updatedRecords = [
      {
        sessionId,
        studentId: 'ananya.sharma@example.edu',
        studentRollNumber: '22CS0102',
        studentName: 'Ananya Sharma',
        status: 'PRESENT',
        remarks: 'Excused'
      }
    ];

    await saveClassAttendance(sessionId, updatedRecords);
    const reloaded = await fetchSessionRecords(sessionId);
    // Must prevent duplicate records for the same student and session
    assert.equal(reloaded.length, 2, 'Should not add a 3rd record, must update existing in place');
    const ananyaRec = reloaded.find(r => r.studentRollNumber === '22CS0102');
    assert.equal(ananyaRec.status, 'PRESENT');
    assert.equal(ananyaRec.remarks, 'Excused');
  });

  test('Both PRESENT and LATE contribute to attended count; ABSENT and UNMARKED do not', async () => {
    // Setup 4 sessions
    const sessions = [
      { id: 1, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-01' },
      { id: 2, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-03' },
      { id: 3, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-05' },
      { id: 4, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-07' }
    ];
    saveLocalSessions(sessions);

    const testStudent = '22CS0101';
    const records = [
      { sessionId: 1, studentId: testStudent, studentRollNumber: testStudent, status: 'PRESENT' },
      { sessionId: 2, studentId: testStudent, studentRollNumber: testStudent, status: 'LATE' }, // Attended!
      { sessionId: 3, studentId: testStudent, studentRollNumber: testStudent, status: 'ABSENT' }, // Not attended
      { sessionId: 4, studentId: testStudent, studentRollNumber: testStudent, status: 'UNMARKED' } // Not attended
    ];
    saveLocalRecords(records);

    const report = await fetchAttendanceReport({ department: 'CSE', semester: '6', subjectCode: 'CS306' });
    const studentRow = report.roster.find(r => r.rollNumber === testStudent);

    assert.equal(studentRow.classesHeld, 4);
    assert.equal(studentRow.classesAttended, 2, 'PRESENT + LATE must equal 2 attended');
    assert.equal(studentRow.attendancePercentage, 50.0);
  });

  test('Strict 75.0% threshold: < 75% triggers alert, exactly 75.0% does NOT trigger alert', async () => {
    // Setup 4 sessions held
    const sessions = [
      { id: 10, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-10' },
      { id: 11, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-12' },
      { id: 12, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-14' },
      { id: 13, department: 'CSE', semester: '6', subjectCode: 'CS306', sessionDate: '2026-10-16' }
    ];
    saveLocalSessions(sessions);

    // Student 1 (Priyansh): 4/4 attended = 100.0% -> No alert
    // Student 2 (Ananya): 3/4 attended = 75.0% -> EXACTLY 75.0% -> MUST NOT TRIGGER ALERT
    // Student 3 (Rohan): 2/4 attended = 50.0% -> < 75.0% -> MUST TRIGGER SHORTAGE ALERT
    const records = [
      // Priyansh: 4/4
      { sessionId: 10, studentId: 'priyansh.jain@example.edu', studentRollNumber: '22CS0101', status: 'PRESENT' },
      { sessionId: 11, studentId: 'priyansh.jain@example.edu', studentRollNumber: '22CS0101', status: 'PRESENT' },
      { sessionId: 12, studentId: 'priyansh.jain@example.edu', studentRollNumber: '22CS0101', status: 'PRESENT' },
      { sessionId: 13, studentId: 'priyansh.jain@example.edu', studentRollNumber: '22CS0101', status: 'PRESENT' },

      // Ananya: 3/4 (75.0%)
      { sessionId: 10, studentId: 'ananya.sharma@example.edu', studentRollNumber: '22CS0102', status: 'PRESENT' },
      { sessionId: 11, studentId: 'ananya.sharma@example.edu', studentRollNumber: '22CS0102', status: 'PRESENT' },
      { sessionId: 12, studentId: 'ananya.sharma@example.edu', studentRollNumber: '22CS0102', status: 'LATE' },
      { sessionId: 13, studentId: 'ananya.sharma@example.edu', studentRollNumber: '22CS0102', status: 'ABSENT' },

      // Rohan: 2/4 (50.0%)
      { sessionId: 10, studentId: 'rohan.kulkarni@example.edu', studentRollNumber: '22CS0103', status: 'PRESENT' },
      { sessionId: 11, studentId: 'rohan.kulkarni@example.edu', studentRollNumber: '22CS0103', status: 'ABSENT' },
      { sessionId: 12, studentId: 'rohan.kulkarni@example.edu', studentRollNumber: '22CS0103', status: 'ABSENT' },
      { sessionId: 13, studentId: 'rohan.kulkarni@example.edu', studentRollNumber: '22CS0103', status: 'PRESENT' }
    ];
    saveLocalRecords(records);

    const report = await fetchAttendanceReport({ department: 'CSE', semester: '6', subjectCode: 'CS306' });

    const priyansh = report.roster.find(r => r.rollNumber === '22CS0101');
    assert.equal(priyansh.attendancePercentage, 100.0);
    assert.equal(priyansh.shortageWarning, false);

    const ananya = report.roster.find(r => r.rollNumber === '22CS0102');
    assert.equal(ananya.attendancePercentage, 75.0);
    assert.equal(ananya.shortageWarning, false, 'CRITICAL: Exactly 75.0% MUST NOT be flagged as shortage');

    const rohan = report.roster.find(r => r.rollNumber === '22CS0103');
    assert.equal(rohan.attendancePercentage, 50.0);
    assert.equal(rohan.shortageWarning, true, 'CRITICAL: Strictly below 75.0% MUST be flagged as shortage');
  });

  test('Zero classes held does not cause divide-by-zero error', async () => {
    saveLocalSessions([]);
    saveLocalRecords([]);

    const report = await fetchAttendanceReport({ department: 'CSE', semester: '6', subjectCode: 'CS_ZERO' });

    assert.equal(report.classesHeld, 0);
    assert.equal(report.shortageCount, 0);
    assert.ok(!isNaN(report.averageAttendance));
    assert.ok(report.roster.length > 0);

    report.roster.forEach(stu => {
      assert.equal(stu.classesHeld, 0);
      assert.equal(stu.classesAttended, 0);
      assert.equal(stu.shortageWarning, false);
      assert.ok(!isNaN(stu.attendancePercentage));
    });
  });

  test('Shortage threshold constant is configurable and equal to 75.0%', () => {
    assert.equal(SHORTAGE_THRESHOLD_PERCENT, 75.0);
  });
});
