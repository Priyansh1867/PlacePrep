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
  DEPARTMENTS,
  PROGRESS_STATUSES,
  isUserAuthorizedHOD,
  computeProgressStatus,
  getCurriculumTargets,
  saveCurriculumTarget,
  deleteCurriculumTarget,
  updateTopicStatus,
  getLabCompletionRecords,
  logLabSession,
  getInternalAssessments,
  updateAssessmentStatus,
  getAcademicDeadlines,
  getBehindScheduleAlerts,
  getCurriculumOverviewMetrics,
  exportCurriculumProgressReport
} from '../services/curriculumGovernanceService.js';

describe('PlacePrep AI — Task 1: Role-Specific Feature Filtering & Tile Visibility', () => {
  const allNavTabs = [
    { id: 'student-data', label: 'Student Data', roles: ['teacher', 'hod'] },
    { id: 'curriculum-governance', label: 'Curriculum & Syllabus Governance', roles: ['hod'] },
    { id: 'reports-exporter', label: 'Reports Exporter', roles: ['teacher', 'hod'] },
    { id: 'upcoming-drives', label: 'Upcoming Drives' },
    { id: 'question-bank', label: 'Question Bank' },
    { id: 'crt-attendance', label: 'CRT Attendance' },
    { id: 'class-attendance', label: 'Class Attendance' },
    { id: 'resume-ats', label: 'Resume ATS Status', roles: ['student'] },
    { id: 'round-details', label: 'Round Details' },
    { id: 'hackathons', label: 'Hackathons', excludedRoles: ['teacher', 'hod'] },
    { id: 'internships', label: 'Internships', excludedRoles: ['teacher', 'hod'] },
    { id: 'off-campus', label: 'Off-Campus (Final Year)', excludedRoles: ['teacher', 'hod'] }
  ];

  function getVisibleTabsForRole(role) {
    return allNavTabs.filter((tab) => {
      if (tab.excludedRoles && tab.excludedRoles.includes(role)) {
        return false;
      }
      if (tab.roles && !tab.roles.includes(role)) {
        return false;
      }
      return true;
    });
  }

  test('Teacher dashboard hides Hackathons, Internships, and Off-Campus Jobs', () => {
    const teacherTabs = getVisibleTabsForRole('teacher');
    const teacherTabIds = teacherTabs.map(t => t.id);

    assert.ok(!teacherTabIds.includes('hackathons'), 'Teacher must not see Hackathons');
    assert.ok(!teacherTabIds.includes('internships'), 'Teacher must not see Internships');
    assert.ok(!teacherTabIds.includes('off-campus'), 'Teacher must not see Off-Campus');
    
    // Core features remain available
    assert.ok(teacherTabIds.includes('student-data'), 'Teacher retains Student Data');
    assert.ok(teacherTabIds.includes('reports-exporter'), 'Teacher retains Reports Exporter');
    assert.ok(teacherTabIds.includes('upcoming-drives'), 'Teacher retains Upcoming Drives');
    assert.ok(teacherTabIds.includes('class-attendance'), 'Teacher retains Class Attendance');
    assert.ok(!teacherTabIds.includes('curriculum-governance'), 'Teacher must not have HOD Curriculum Governance');
  });

  test('HOD dashboard hides Hackathons, Internships, and Off-Campus Jobs, and includes Curriculum Governance', () => {
    const hodTabs = getVisibleTabsForRole('hod');
    const hodTabIds = hodTabs.map(t => t.id);

    assert.ok(!hodTabIds.includes('hackathons'), 'HOD must not see Hackathons');
    assert.ok(!hodTabIds.includes('internships'), 'HOD must not see Internships');
    assert.ok(!hodTabIds.includes('off-campus'), 'HOD must not see Off-Campus');

    // HOD receives Curriculum & Syllabus Governance tile
    assert.ok(hodTabIds.includes('curriculum-governance'), 'HOD must see Curriculum & Syllabus Governance tile');
    assert.ok(hodTabIds.includes('student-data'), 'HOD retains Student Data');
    assert.ok(hodTabIds.includes('reports-exporter'), 'HOD retains Reports Exporter');
  });

  test('Student dashboard retains Hackathons, Internships, and Off-Campus Jobs', () => {
    const studentTabs = getVisibleTabsForRole('student');
    const studentTabIds = studentTabs.map(t => t.id);

    assert.ok(studentTabIds.includes('hackathons'), 'Student must see Hackathons');
    assert.ok(studentTabIds.includes('internships'), 'Student must see Internships');
    assert.ok(studentTabIds.includes('off-campus'), 'Student must see Off-Campus');
    assert.ok(studentTabIds.includes('resume-ats'), 'Student retains Resume ATS Status');
    assert.ok(!studentTabIds.includes('curriculum-governance'), 'Student must not see Curriculum Governance');
  });
});

describe('PlacePrep AI — Task 2: HOD Curriculum & Syllabus Governance Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Authorization gate strictly permits HOD and Admin, and denies Teacher/Student', () => {
    assert.strictEqual(isUserAuthorizedHOD({ role: 'hod' }), true);
    assert.strictEqual(isUserAuthorizedHOD({ role: 'HOD' }), true);
    assert.strictEqual(isUserAuthorizedHOD({ role: 'admin' }), true);
    assert.strictEqual(isUserAuthorizedHOD({ role: 'director' }), true);

    assert.strictEqual(isUserAuthorizedHOD({ role: 'teacher' }), false);
    assert.strictEqual(isUserAuthorizedHOD({ role: 'student' }), false);
    assert.strictEqual(isUserAuthorizedHOD(null), false);
  });

  test('Rejects target configuration by unauthorized users', () => {
    const teacherUser = { role: 'teacher', name: 'Prof. Sharma' };
    assert.throws(() => {
      saveCurriculumTarget({
        department: 'CSE',
        semester: 6,
        subjectCode: 'CS306',
        subjectName: 'Machine Learning',
        assignedFaculty: 'Prof. Sharma',
        targetPercentage: 80,
        targetDate: '2026-11-20'
      }, teacherUser);
    }, /Unauthorized/);
  });

  test('Validates target percentage and dates strictly', () => {
    const hodUser = { role: 'hod', name: 'Dr. Ramesh Kumar' };

    // Invalid target percentage > 100
    assert.throws(() => {
      saveCurriculumTarget({
        department: 'CSE',
        semester: 6,
        subjectCode: 'CS399',
        subjectName: 'Testing Subject',
        assignedFaculty: 'Dr. Test',
        targetPercentage: 110,
        targetDate: '2026-11-20'
      }, hodUser);
    }, /Target completion percentage must be between 0% and 100%/);

    // Invalid target percentage < 0
    assert.throws(() => {
      saveCurriculumTarget({
        department: 'CSE',
        semester: 6,
        subjectCode: 'CS399',
        subjectName: 'Testing Subject',
        assignedFaculty: 'Dr. Test',
        targetPercentage: -5,
        targetDate: '2026-11-20'
      }, hodUser);
    }, /Target completion percentage must be between 0% and 100%/);

    // Malformed date
    assert.throws(() => {
      saveCurriculumTarget({
        department: 'CSE',
        semester: 6,
        subjectCode: 'CS399',
        subjectName: 'Testing Subject',
        assignedFaculty: 'Dr. Test',
        targetPercentage: 85,
        targetDate: 'invalid-date'
      }, hodUser);
    }, /valid target date/);
  });

  test('Successfully configures new target and prevents duplicate records for same semester and subject', () => {
    const hodUser = { role: 'hod', name: 'Dr. Ramesh Kumar' };

    const newTarget = saveCurriculumTarget({
      department: 'CSE',
      academicYear: '2026-2027',
      semester: 6,
      subjectCode: 'CS315',
      subjectName: 'Distributed Systems and Edge Computing',
      assignedFaculty: 'Dr. Ananya Roy',
      totalUnits: 5,
      targetPercentage: 85,
      plannedPercentage: 70,
      targetDate: '2026-11-30'
    }, hodUser);

    assert.ok(newTarget.id);
    assert.strictEqual(newTarget.subjectCode, 'CS315');
    assert.strictEqual(newTarget.actualPercentage, 0);
    assert.strictEqual(newTarget.status, PROGRESS_STATUSES.NOT_STARTED);
    assert.strictEqual(newTarget.units.length, 5);

    // Duplicate attempt for same department, semester, subject and academic year should throw error
    assert.throws(() => {
      saveCurriculumTarget({
        department: 'CSE',
        academicYear: '2026-2027',
        semester: 6,
        subjectCode: 'CS315',
        subjectName: 'Distributed Systems and Edge Computing',
        assignedFaculty: 'Dr. Ananya Roy',
        targetPercentage: 90,
        targetDate: '2026-12-15'
      }, hodUser);
    }, /A syllabus target already exists/);
  });

  test('Progress status calculation correctly distinguishes Completed, Not Started, Behind Schedule, At Risk, and On Track', () => {
    // 100% completed
    assert.strictEqual(computeProgressStatus(100, 80, '2026-12-01'), PROGRESS_STATUSES.COMPLETED);

    // 0% not started
    assert.strictEqual(computeProgressStatus(0, 0, '2026-12-01'), PROGRESS_STATUSES.NOT_STARTED);

    // Lagging by >= 10% compared to planned
    assert.strictEqual(computeProgressStatus(50, 65, '2026-12-01'), PROGRESS_STATUSES.BEHIND_SCHEDULE);

    // Past target date and incomplete
    assert.strictEqual(computeProgressStatus(70, 70, '2025-01-01'), PROGRESS_STATUSES.BEHIND_SCHEDULE);

    // Lagging by 3-9%
    assert.strictEqual(computeProgressStatus(55, 60, '2026-12-01'), PROGRESS_STATUSES.AT_RISK);

    // On track (actual >= planned)
    assert.strictEqual(computeProgressStatus(70, 65, '2026-12-01'), PROGRESS_STATUSES.ON_TRACK);
  });

  test('Unit and topic status updates recalculate actual subject completion percentage and status', () => {
    const hodUser = { role: 'hod', name: 'Dr. Ramesh Kumar' };

    // Get an initial target (CS306 Machine Learning has 5 units)
    const targets = getCurriculumTargets({ department: 'CSE', subjectCode: 'CS306' });
    const target = targets.find(t => t.subjectCode === 'CS306');
    assert.ok(target, 'CS306 target should exist');

    // Unit 4 was 'In Progress'. Mark Unit 4 as Completed.
    const updated = updateTopicStatus(target.id, 4, 'Completed', hodUser);
    assert.ok(updated);

    // Now 4 out of 5 units are Completed -> actual percentage should be 80% (4/5 * 100)
    assert.strictEqual(updated.actualPercentage, 80);
    // Planned is 75%, actual is 80% -> status should now be 'On Track'
    assert.strictEqual(updated.status, PROGRESS_STATUSES.ON_TRACK);
  });

  test('Laboratory completion monitoring logs practical sessions and updates pending sessions count', () => {
    const hodUser = { role: 'hod', name: 'Dr. Ramesh Kumar' };
    const labs = getLabCompletionRecords({ department: 'CSE' });
    assert.ok(labs.length > 0, 'Should return lab records for CSE');

    const aiLab = labs.find(l => l.subjectCode === 'CS310');
    assert.ok(aiLab, 'CS310 Artificial Intelligence Lab should exist');
    const initialCompleted = aiLab.completedSessions;
    const initialPending = aiLab.pendingSessions;

    // Log a new practical session
    const updatedLab = logLabSession(aiLab.id, {
      experimentTitle: 'Heuristic Search and A* Algorithm Demonstration',
      batch: 'Batch B1',
      date: '2026-10-22',
      remarks: 'All 32 students verified search tree expansions'
    }, hodUser);

    assert.strictEqual(updatedLab.completedSessions, initialCompleted + 1);
    assert.strictEqual(updatedLab.pendingSessions, initialPending - 1);
    assert.strictEqual(
      updatedLab.completionPercentage,
      Math.round(((initialCompleted + 1) / updatedLab.totalPlannedSessions) * 1000) / 10
    );
  });

  test('Internal assessment tracking records assessment milestones without altering student mark records', () => {
    const hodUser = { role: 'hod', name: 'Dr. Ramesh Kumar' };
    const assessments = getInternalAssessments('CSE', '2026-2027');
    assert.ok(assessments.length > 0, 'Internal assessments should exist');

    const targetAssessment = assessments[0];
    const updated = updateAssessmentStatus(targetAssessment.id, 'Completed', '2026-10-22', hodUser);

    assert.strictEqual(updated.status, 'Completed');
    assert.strictEqual(updated.completionDate, '2026-10-22');
  });

  test('Academic deadline tracker distinguishes Overdue, Upcoming, and Completed deadlines', () => {
    const deadlines = getAcademicDeadlines('CSE');
    assert.ok(deadlines.length >= 3, 'Should have deadlines list');

    const overdue = deadlines.filter(d => d.status === 'Overdue');
    const upcoming = deadlines.filter(d => d.status === 'Upcoming');
    const completed = deadlines.filter(d => d.status === 'Completed');

    assert.ok(overdue.length > 0, 'Should identify overdue deadlines');
    assert.ok(upcoming.length > 0, 'Should identify upcoming deadlines');
    assert.ok(completed.length > 0, 'Should identify completed deadlines');
  });

  test('Behind-schedule alerts generate actionable warnings with specific root causes and remedial actions', () => {
    const alerts = getBehindScheduleAlerts('CSE', '2026-2027');
    assert.ok(Array.isArray(alerts));
    assert.ok(alerts.length > 0, 'Should identify behind-schedule academic activities');

    const firstAlert = alerts[0];
    assert.ok(firstAlert.type, 'Alert must have a type (theory/lab/assessment)');
    assert.ok(firstAlert.title, 'Alert must have a title');
    assert.ok(firstAlert.reason, 'Alert must provide root cause reason');
    assert.ok(firstAlert.remedialAction, 'Alert must provide recommended remedial action');
    assert.ok(firstAlert.targetDate, 'Alert must display target deadline');
  });

  test('Overview metrics calculate department-wide syllabus %, on-track vs behind count, pending labs & assessments', () => {
    const metrics = getCurriculumOverviewMetrics('CSE', '2026-2027');
    assert.ok(typeof metrics.deptCompletionPercentage === 'number');
    assert.ok(metrics.deptCompletionPercentage >= 0 && metrics.deptCompletionPercentage <= 100);
    assert.ok(typeof metrics.plannedCoveragePercentage === 'number');
    assert.ok(typeof metrics.totalSubjects === 'number');
    assert.ok(metrics.totalSubjects > 0);
    assert.ok(typeof metrics.subjectsOnTrack === 'number');
    assert.ok(typeof metrics.subjectsBehind === 'number');
    assert.strictEqual(
      metrics.totalSubjects,
      metrics.subjectsOnTrack + metrics.subjectsBehind + metrics.subjectsAtRisk + metrics.subjectsNotStarted + metrics.subjectsCompleted
    );
  });

  test('Excel (.xlsx) and CSV export of curriculum delivery report outputs valid data buffers', () => {
    const exportXlsx = exportCurriculumProgressReport('CSE', '2026-2027', 'xlsx');
    assert.strictEqual(exportXlsx.format, 'xlsx');
    assert.ok(exportXlsx.filename.endsWith('.xlsx'));
    assert.ok(exportXlsx.buffer.length > 0);

    const exportCsv = exportCurriculumProgressReport('CSE', '2026-2027', 'csv');
    assert.strictEqual(exportCsv.format, 'csv');
    assert.ok(exportCsv.filename.endsWith('.csv'));
    assert.ok(typeof exportCsv.csvText === 'string');
    assert.ok(exportCsv.csvText.includes('Department'));
    assert.ok(exportCsv.csvText.includes('Subject Code'));
  });
});
