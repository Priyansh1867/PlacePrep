import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node environment
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

import {
  isAuthorizedHod,
  fetchFacultyOperations,
  fetchFacultyMonitoringMetrics
} from '../services/facultyMonitoringService.js';

describe('PlacePrep AI — HOD Faculty Operations Monitoring Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Authorization gate strictly permits HOD and Admin, and denies Teacher/Faculty/Student', () => {
    assert.strictEqual(isAuthorizedHod({ role: 'hod' }), true, 'HOD must be authorized');
    assert.strictEqual(isAuthorizedHod({ role: 'admin' }), true, 'Admin must be authorized');
    assert.strictEqual(isAuthorizedHod({ role: 'super_admin' }), true, 'Super Admin must be authorized');
    assert.strictEqual(isAuthorizedHod({ role: 'teacher' }), false, 'Teacher must NOT be authorized');
    assert.strictEqual(isAuthorizedHod({ role: 'faculty' }), false, 'Faculty must NOT be authorized');
    assert.strictEqual(isAuthorizedHod({ role: 'student' }), false, 'Student must NOT be authorized');
    assert.strictEqual(isAuthorizedHod(null), false, 'Null user must NOT be authorized');
  });

  test('Unauthorized teacher or student cannot invoke fetchFacultyOperations', async () => {
    const teacherUser = { role: 'teacher', name: 'Dr. Neha Sharma' };
    const studentUser = { role: 'student', name: 'Priyansh Jain' };

    await assert.rejects(
      async () => {
        await fetchFacultyOperations({}, teacherUser);
      },
      /Access Denied/,
      'Teacher must be rejected with Access Denied'
    );

    await assert.rejects(
      async () => {
        await fetchFacultyOperations({}, studentUser);
      },
      /Access Denied/,
      'Student must be rejected with Access Denied'
    );
  });

  test('Authorized HOD receives empty list when no activity records exist without fabricating fake data', async () => {
    const hodUser = { role: 'hod', name: 'Prof. Alok Verma' };
    const operations = await fetchFacultyOperations({}, hodUser);
    assert.strictEqual(Array.isArray(operations), true);
    assert.strictEqual(operations.length, 0, 'No fake or fabricated operations should exist when storage is empty');

    const metrics = await fetchFacultyMonitoringMetrics(hodUser);
    assert.strictEqual(metrics.totalActiveFaculty, 0);
    assert.strictEqual(metrics.totalClassSessions, 0);
    assert.strictEqual(metrics.totalCrtSessions, 0);
    assert.strictEqual(metrics.totalAttendanceEvaluations, 0);
  });

  test('Aggregates real class attendance sessions and CRT training sessions with accurate counts', async () => {
    const hodUser = { role: 'hod', name: 'Prof. Alok Verma' };

    // Seed real class attendance sessions in localStorage
    const sampleClassSessions = [
      {
        id: 101,
        sessionDate: '2026-10-22',
        periodNumber: 2,
        department: 'CSE',
        semester: '6',
        section: 'A',
        subjectCode: 'CS306',
        subjectName: 'Database Management Systems',
        facultyId: 'FAC-CSE-042',
        facultyName: 'Dr. Neha Sharma',
        createdAt: '2026-10-22 10:00'
      }
    ];

    const sampleClassRecords = [
      { sessionId: 101, studentId: 'stu-1', status: 'PRESENT' },
      { sessionId: 101, studentId: 'stu-2', status: 'PRESENT' },
      { sessionId: 101, studentId: 'stu-3', status: 'ABSENT' }
    ];

    // Seed real CRT session
    const sampleCrtSessions = [
      {
        id: 201,
        topic: 'Graph Algorithms & Dynamic Programming',
        category: 'CODING_DSA',
        trainerName: 'Prof. Rajesh Raman',
        sessionDate: '2026-10-21',
        time: '02:00 PM',
        venue: 'Lab 4',
        status: 'COMPLETED',
        targetBranch: 'CSE',
        createdBy: 'rajesh.raman@placeprep.com'
      }
    ];

    const sampleCrtRecords = [
      { sessionId: 201, studentId: 'stu-1', status: 'PRESENT' },
      { sessionId: 201, studentId: 'stu-2', status: 'LATE' }
    ];

    localStorage.setItem('placeprep_attendance_sessions_v2', JSON.stringify(sampleClassSessions));
    localStorage.setItem('placeprep_attendance_records_v2', JSON.stringify(sampleClassRecords));
    localStorage.setItem('placeprep_crt_sessions_v1', JSON.stringify(sampleCrtSessions));
    localStorage.setItem('placeprep_crt_records_v1', JSON.stringify(sampleCrtRecords));

    const operations = await fetchFacultyOperations({}, hodUser);
    assert.strictEqual(operations.length, 2);

    const classOp = operations.find(o => o.operationType === 'CLASS_ATTENDANCE');
    assert.ok(classOp);
    assert.strictEqual(classOp.facultyName, 'Dr. Neha Sharma');
    assert.strictEqual(classOp.recordsCount, 3);
    assert.strictEqual(classOp.presentCount, 2);
    assert.strictEqual(classOp.status, 'COMPLETED');

    const crtOp = operations.find(o => o.operationType === 'CRT_TRAINING');
    assert.ok(crtOp);
    assert.strictEqual(crtOp.facultyName, 'Prof. Rajesh Raman');
    assert.strictEqual(crtOp.recordsCount, 2);

    // Verify metrics
    const metrics = await fetchFacultyMonitoringMetrics(hodUser);
    assert.strictEqual(metrics.totalActiveFaculty, 2);
    assert.strictEqual(metrics.totalClassSessions, 1);
    assert.strictEqual(metrics.totalCrtSessions, 1);
    assert.strictEqual(metrics.totalAttendanceEvaluations, 5);
  });

  test('Filters operations accurately by faculty name, operation type, and status', async () => {
    const hodUser = { role: 'hod', name: 'Prof. Alok Verma' };

    const sampleClassSessions = [
      {
        id: 101,
        sessionDate: '2026-10-22',
        periodNumber: 1,
        department: 'CSE',
        semester: '6',
        subjectCode: 'CS306',
        subjectName: 'Database Management Systems',
        facultyId: 'FAC-CSE-042',
        facultyName: 'Dr. Neha Sharma',
        createdAt: '2026-10-22 09:00'
      },
      {
        id: 102,
        sessionDate: '2026-10-22',
        periodNumber: 3,
        department: 'IT',
        semester: '4',
        subjectCode: 'IT204',
        subjectName: 'Computer Networks',
        facultyId: 'FAC-IT-018',
        facultyName: 'Prof. Suresh Gupta',
        createdAt: '2026-10-22 11:15'
      }
    ];

    localStorage.setItem('placeprep_attendance_sessions_v2', JSON.stringify(sampleClassSessions));

    // Filter by faculty name
    const nehaOps = await fetchFacultyOperations({ facultyName: 'Neha' }, hodUser);
    assert.strictEqual(nehaOps.length, 1);
    assert.strictEqual(nehaOps[0].facultyName, 'Dr. Neha Sharma');

    // Filter by department
    const itOps = await fetchFacultyOperations({ department: 'IT' }, hodUser);
    assert.strictEqual(itOps.length, 1);
    assert.strictEqual(itOps[0].facultyName, 'Prof. Suresh Gupta');

    // Filter by operation type
    const crtOps = await fetchFacultyOperations({ operationType: 'CRT_TRAINING' }, hodUser);
    assert.strictEqual(crtOps.length, 0);
  });
});
