import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  CRT_SHORTAGE_THRESHOLD_PERCENT,
  CRT_CERTIFICATE_MIN_PERCENTAGE,
  CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS,
  CRT_MODULE_CATEGORIES,
  CRT_SESSION_STATUSES,
  CRT_BATCHES,
  ATTENDANCE_STATUS,
  SEED_CRT_STUDENTS,
  fetchCrtSessions,
  createCrtSession,
  updateCrtSession,
  updateCrtSessionStatus,
  fetchCrtSessionById,
  fetchCrtSessionRoster,
  saveCrtAttendance,
  fetchCrtSessionRecords,
  fetchCrtSessionReport,
  fetchCrtCumulativeReport
} from '../services/crtAttendanceStorage.js';

import {
  SHORTAGE_THRESHOLD_PERCENT as CLASS_SHORTAGE_THRESHOLD,
  getRosterForClass,
  fetchAttendanceReport as fetchClassReport
} from '../services/attendanceStorage.js';

// Mock localStorage for node test runner
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

describe('CRT Training Attendance & Eligibility Module Tests', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('CRT sessions can be created, retrieved, and filtered by category and batch', async () => {
    const newSession = await createCrtSession({
      topic: 'Dynamic Programming & Graph Algorithms Masterclass',
      moduleType: 'Coding & DSA',
      trainerName: 'Dr. Radhika Sen',
      trainerOrganization: 'Ex-Amazon Mentor',
      scheduledDate: '2026-10-30',
      timeSlot: '02:00 PM - 05:00 PM',
      targetBatch: '2026',
      targetBranch: 'CSE',
      status: 'SCHEDULED'
    });

    assert.ok(newSession.id);
    assert.equal(newSession.topic, 'Dynamic Programming & Graph Algorithms Masterclass');
    assert.equal(newSession.status, 'SCHEDULED');

    // Retrieve sessions filtered by batch
    const batch2026Sessions = await fetchCrtSessions({ targetBatch: '2026' });
    assert.ok(Array.isArray(batch2026Sessions));
    assert.ok(batch2026Sessions.some(s => s.topic.includes('Dynamic Programming')));
  });

  test('CRT training session status can be updated (e.g. CANCELLED, COMPLETED)', async () => {
    const sessions = await fetchCrtSessions();
    assert.ok(sessions.length > 0);
    const targetSession = sessions[0];

    const updated = await updateCrtSessionStatus(targetSession.id, 'CANCELLED');
    assert.equal(updated.status, 'CANCELLED');

    const fetched = await fetchCrtSessionById(targetSession.id);
    assert.equal(fetched.status, 'CANCELLED');
  });

  test('Session roster selector loads eligible students with default state UNMARKED', async () => {
    const sessions = await fetchCrtSessions();
    const session = sessions[0];
    const roster = await fetchCrtSessionRoster(session.id);

    assert.ok(Array.isArray(roster));
    assert.ok(roster.length >= 8);
    assert.ok(roster.some(s => s.rollNumber === '22CS0101' && s.name === 'Priyansh Jain'));

    // Check default state is not silently marking present
    const unmarkedSession = await createCrtSession({
      topic: 'Brand New Aptitude Diagnostic Workshop',
      moduleType: 'Quantitative Ability',
      scheduledDate: '2026-11-02',
      status: 'SCHEDULED'
    });
    const freshRoster = await fetchCrtSessionRoster(unmarkedSession.id);
    freshRoster.forEach(stu => {
      assert.equal(stu.status, ATTENDANCE_STATUS.UNMARKED, 'Default status must be UNMARKED');
    });
  });

  test('All three attendance statuses (PRESENT, ABSENT, LATE) can be marked and saved', async () => {
    const newSession = await createCrtSession({
      topic: 'STAR Technique Behavioral Coaching Lab',
      moduleType: 'Soft Skills & Behavioral',
      scheduledDate: '2026-10-28',
      status: 'SCHEDULED'
    });

    const recordsToMark = [
      { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', department: 'CSE', status: ATTENDANCE_STATUS.PRESENT, assessmentScore: 92 },
      { studentId: 'ananya.sharma@example.edu', rollNumber: '22CS0102', name: 'Ananya Sharma', department: 'CSE', status: ATTENDANCE_STATUS.LATE, remarks: 'Arrived 10 mins late' },
      { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22CS0103', name: 'Rohan Kulkarni', department: 'CSE', status: ATTENDANCE_STATUS.ABSENT, remarks: 'Medical leave' }
    ];

    await saveCrtAttendance(newSession.id, recordsToMark, 'Prof. Alok Verma');

    const reloadedRecords = await fetchCrtSessionRecords(newSession.id);
    assert.ok(reloadedRecords.length >= 3);

    const priyansh = reloadedRecords.find(r => r.studentId === 'priyansh.jain@example.edu');
    assert.equal(priyansh.status, 'PRESENT');
    assert.equal(priyansh.assessmentScore, 92);

    const ananya = reloadedRecords.find(r => r.studentId === 'ananya.sharma@example.edu');
    assert.equal(ananya.status, 'LATE');

    const rohan = reloadedRecords.find(r => r.studentId === 'rohan.kulkarni@example.edu');
    assert.equal(rohan.status, 'ABSENT');
  });

  test('Saving attendance transitions SCHEDULED session to COMPLETED and avoids duplicates', async () => {
    const newSession = await createCrtSession({
      topic: 'Full-Stack REST Architecture & Docker Deployment',
      moduleType: 'Technical Interview Preparation',
      scheduledDate: '2026-10-27',
      status: 'SCHEDULED'
    });
    assert.equal(newSession.status, 'SCHEDULED');

    // Save attendance once
    await saveCrtAttendance(newSession.id, [
      { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', department: 'CSE', status: 'PRESENT' }
    ]);

    const updatedSession = await fetchCrtSessionById(newSession.id);
    assert.equal(updatedSession.status, 'COMPLETED');

    // Save attendance again for same student (update status)
    await saveCrtAttendance(newSession.id, [
      { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', department: 'CSE', status: 'LATE' }
    ]);

    const allSessionRecords = await fetchCrtSessionRecords(newSession.id);
    const priyanshRecords = allSessionRecords.filter(r => r.studentId === 'priyansh.jain@example.edu');
    assert.equal(priyanshRecords.length, 1, 'Duplicate submissions must update the existing record, not duplicate it');
    assert.equal(priyanshRecords[0].status, 'LATE');
  });

  test('Attendance calculation: Present and Late count as attended; Absent and Unmarked do not', async () => {
    const report = await fetchCrtCumulativeReport({ targetBatch: '2026', department: 'CSE' });
    assert.ok(report.completedSessionsHeld >= 4);

    // In seed data:
    // Priyansh Jain: 4 Present out of 4 completed sessions -> 100%
    const priyansh = report.roster.find(r => r.rollNumber === '22CS0101');
    assert.ok(priyansh);
    assert.equal(priyansh.sessionsAttended, 4);
    assert.equal(priyansh.crtAttendancePercentage, 100.0);

    // Siddharth Nair: 2 Present + 1 Late + 1 Absent = 3 Attended out of 4 sessions -> 75.0%
    const siddharth = report.roster.find(r => r.rollNumber === '22CS0104');
    assert.ok(siddharth);
    assert.equal(siddharth.sessionsAttended, 3, 'Late must count toward sessionsAttended');
    assert.equal(siddharth.sessionsLate, 1);
    assert.equal(siddharth.crtAttendancePercentage, 75.0);

    // Rohan Kulkarni: 2 Present, 2 Absent = 2 Attended out of 4 sessions -> 50.0%
    const rohan = report.roster.find(r => r.rollNumber === '22CS0103');
    assert.ok(rohan);
    assert.equal(rohan.sessionsAttended, 2);
    assert.equal(rohan.crtAttendancePercentage, 50.0);
  });

  test('Cancelled sessions and future scheduled sessions are excluded from completed calculations', async () => {
    const allSessions = await fetchCrtSessions();
    const hasCancelled = allSessions.some(s => s.status === 'CANCELLED');
    const hasScheduled = allSessions.some(s => s.status === 'SCHEDULED');
    assert.ok(hasCancelled, 'Must include cancelled session in database');
    assert.ok(hasScheduled, 'Must include future scheduled session in database');

    const report = await fetchCrtCumulativeReport({ targetBatch: '2026' });
    // Completed sessions held must equal exactly 4 (excluding the 1 cancelled and 1 scheduled sessions)
    assert.equal(report.completedSessionsHeld, 4);
  });

  test('Strict 75.0% threshold: strictly < 75% triggers alert; exactly 75.0% does NOT', async () => {
    const report = await fetchCrtCumulativeReport({ targetBatch: '2026', department: 'CSE' });

    // Ananya Sharma has 3 attended out of 4 completed sessions = exactly 75.0%
    const ananya = report.roster.find(r => r.rollNumber === '22CS0102');
    assert.ok(ananya);
    assert.equal(ananya.crtAttendancePercentage, 75.0);
    assert.equal(ananya.shortageWarning, false, 'Student at exactly 75.0% must NOT be flagged with shortage alert');

    // Siddharth Nair has 3 attended out of 4 = exactly 75.0%
    const siddharth = report.roster.find(r => r.rollNumber === '22CS0104');
    assert.ok(siddharth);
    assert.equal(siddharth.crtAttendancePercentage, 75.0);
    assert.equal(siddharth.shortageWarning, false, 'Student at exactly 75.0% with late marks must NOT be flagged');

    // Rohan Kulkarni has 2 attended out of 4 = 50.0% (< 75%)
    const rohan = report.roster.find(r => r.rollNumber === '22CS0103');
    assert.ok(rohan);
    assert.equal(rohan.crtAttendancePercentage, 50.0);
    assert.equal(rohan.shortageWarning, true, 'Student with 50.0% (< 75%) MUST be flagged with shortage alert');

    // Meera Venkat has 1 attended out of 4 = 25.0% (< 75%)
    const meera = report.roster.find(r => r.rollNumber === '22CS0105');
    assert.ok(meera);
    assert.equal(meera.crtAttendancePercentage, 25.0);
    assert.equal(meera.shortageWarning, true, 'Student with 25.0% (< 75%) MUST be flagged with shortage alert');
  });

  test('Zero completed sessions held does not cause divide-by-zero error', async () => {
    // Query a department with 0 completed sessions
    const emptyReport = await fetchCrtCumulativeReport({ targetBatch: '2028', department: 'CIVIL' });
    assert.equal(emptyReport.completedSessionsHeld, 0);
    assert.equal(emptyReport.averageAttendance, 100.0);
    emptyReport.roster.forEach(stu => {
      assert.equal(stu.crtAttendancePercentage, 100.0);
      assert.equal(stu.shortageWarning, false, 'Zero classes held must not trigger shortage warning');
    });
  });

  test('Certificate eligibility policy: >= 75% AND >= 3 completed sessions', async () => {
    const report = await fetchCrtCumulativeReport({ targetBatch: '2026', department: 'CSE' });
    assert.ok(report.completedSessionsHeld >= 3);

    // Priyansh Jain (100.0% >= 75% and 4 sessions >= 3) -> ELIGIBLE
    const priyansh = report.roster.find(r => r.rollNumber === '22CS0101');
    assert.equal(priyansh.certificateStatus, 'ELIGIBLE');
    assert.equal(priyansh.certificateEligible, true);

    // Ananya Sharma (75.0% >= 75% and 4 sessions >= 3) -> ELIGIBLE
    const ananya = report.roster.find(r => r.rollNumber === '22CS0102');
    assert.equal(ananya.certificateStatus, 'ELIGIBLE');
    assert.equal(ananya.certificateEligible, true);

    // Rohan Kulkarni (50.0% < 75%) -> INELIGIBLE
    const rohan = report.roster.find(r => r.rollNumber === '22CS0103');
    assert.equal(rohan.certificateStatus, 'INELIGIBLE');
    assert.equal(rohan.certificateEligible, false);
  });

  test('Academic class attendance and CRT training attendance remain separate and decoupled', async () => {
    // Fetch class report
    const classRep = await fetchClassReport({ department: 'CSE', semester: '6', subjectCode: 'CS306' });
    assert.ok(classRep);
    assert.ok(classRep.subjectCode === 'CS306');

    // Fetch CRT report
    const crtRep = await fetchCrtCumulativeReport({ targetBatch: '2026', department: 'CSE' });
    assert.ok(crtRep);
    assert.ok(crtRep.completedSessionsHeld !== undefined);

    // Verify CRT and Class attendance thresholds match configuration
    assert.equal(CRT_SHORTAGE_THRESHOLD_PERCENT, 75.0);
    assert.equal(CLASS_SHORTAGE_THRESHOLD, 75.0);
  });
});
