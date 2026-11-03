import { getAllStudents } from './academicRecordsService.js';
// PlacePrep AI - Daily Class Attendance State & Persistence Service
// Handles cascading selectors, attendance calculations, shortage thresholds,
// and hybrid persistence (Spring Boot Backend API + LocalStorage fallback).

import { AttendanceApi } from './api.js';
import { BRANCH_SEMESTER_SUBJECTS, INITIAL_BRANCHES } from '../data/initialAcademicRecords.js';

// Configurable attendance shortage threshold (per requirement: strictly < 75% triggers alert, exactly 75% does not)
export const SHORTAGE_THRESHOLD_PERCENT = 75.0;

// Academic Year mapping to semesters
export const ACADEMIC_YEARS = [
  { id: '1', label: '1st Year (Fresher)', semesters: [1, 2] },
  { id: '2', label: '2nd Year (Sophomore)', semesters: [3, 4] },
  { id: '3', label: '3rd Year (Pre-Final)', semesters: [5, 6] },
  { id: '4', label: '4th Year (Final Year)', semesters: [7, 8] }
];

// College Departments
export const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science and Engineering', short: 'CSE' },
  { code: 'IT', name: 'Information Technology', short: 'IT' },
  { code: 'ECE', name: 'Electronics and Communication Engineering', short: 'ECE' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering', short: 'EEE' },
  { code: 'MECH', name: 'Mechanical Engineering', short: 'MECH' },
  { code: 'CIVIL', name: 'Civil Engineering', short: 'CIVIL' }
];

// Standard Class Periods
export const CLASS_PERIODS = [
  { period: 1, time: '09:00 AM - 10:00 AM', label: 'Period 1 (09:00 - 10:00 AM)' },
  { period: 2, time: '10:00 AM - 11:00 AM', label: 'Period 2 (10:00 - 11:00 AM)' },
  { period: 3, time: '11:15 AM - 12:15 PM', label: 'Period 3 (11:15 - 12:15 PM)' },
  { period: 4, time: '12:15 PM - 01:15 PM', label: 'Period 4 (12:15 - 01:15 PM)' },
  { period: 5, time: '02:00 PM - 03:00 PM', label: 'Period 5 (02:00 - 03:00 PM)' },
  { period: 6, time: '03:00 PM - 04:00 PM', label: 'Period 6 (03:00 - 04:00 PM)' }
];

// Sections
export const CLASS_SECTIONS = ['A', 'B', 'C', 'D'];

// LocalStorage Keys
const STORAGE_KEYS = {
  SESSIONS: 'placeprep_attendance_sessions_v2',
  RECORDS: 'placeprep_attendance_records_v2'
};

// Seed student rosters for departments
const SEED_ROSTERS = {};

// Initial Seed Sessions & Records so reports have rich instant data
function getInitialSeedSessions() { return []; }

function getInitialSeedRecords() { return []; }

// LocalStorage Helpers
export function getLocalSessions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) {
      const seeds = getInitialSeedSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(stored);
  } catch {
    return getInitialSeedSessions();
  }
}

export function saveLocalSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

export function getLocalRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!stored) {
      const seeds = getInitialSeedRecords();
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(stored);
  } catch {
    return getInitialSeedRecords();
  }
}

export function saveLocalRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records:', e);
  }
}

// Helper to look up cascading subjects for a department and semester
export function getSubjectsForDeptAndSemester(departmentCode, semesterNumber) {
  const deptObj = DEPARTMENTS.find(d => d.code === departmentCode || d.short === departmentCode);
  const fullName = deptObj?.name;

  const semNum = parseInt(semesterNumber, 10) || 6;
  const deptSubjectsMap = BRANCH_SEMESTER_SUBJECTS[fullName];

  if (deptSubjectsMap && deptSubjectsMap[semNum] && deptSubjectsMap[semNum].length > 0) {
    return deptSubjectsMap[semNum];
  }

  return [];
}

// Get student roster for selected department and semester
export function getRosterForClass(departmentCode = 'CSE', semesterNumber = '6') {
  const department = DEPARTMENTS.find(item => item.code === departmentCode || item.name === departmentCode);
  return getAllStudents().filter(student => {
    const branch = String(student.branchCode || student.department || student.branch || '').toUpperCase();
    const matchesDepartment = branch === String(departmentCode).toUpperCase() || branch === department?.name.toUpperCase();
    return matchesDepartment && String(student.semester || student.currentSemester || '') === String(semesterNumber);
  }).map(student => ({ ...student, studentId: student.email || student.id, name: student.fullName || student.name, rollNumber: student.rollNumber, department: departmentCode, semester: String(semesterNumber) }));
}

// Hybrid API / Storage Operations:
// 1. Fetch Roster
export async function fetchClassRoster(department, semester) {
  try {
    const backendRoster = await AttendanceApi.getClassRoster({ department, semester });
    if (backendRoster && Array.isArray(backendRoster) && backendRoster.length > 0) {
      return backendRoster;
    }
  } catch (e) {
    // Backend offline / falling back to local
  }
  return getRosterForClass(department, semester);
}

// 2. Find or Create Class Attendance Session
export async function findOrCreateSession(sessionData) {
  try {
    const res = await AttendanceApi.findOrCreateClassSession(sessionData);
    if (res && res.id) {
      // Also cache locally
      const local = getLocalSessions();
      const existingIdx = local.findIndex(s => s.id === res.id);
      if (existingIdx >= 0) {
        local[existingIdx] = res;
      } else {
        local.push(res);
      }
      saveLocalSessions(local);
      return res;
    }
  } catch (e) {
    // Fall back to local
  }

  // Local fallback: search by department, semester, subjectCode, sessionDate
  const sessions = getLocalSessions();
  const existing = sessions.find(s => 
    s.department === sessionData.department &&
    String(s.semester) === String(sessionData.semester) &&
    s.subjectCode === sessionData.subjectCode &&
    s.sessionDate === sessionData.sessionDate
  );

  if (existing) {
    return existing;
  }

  const newSession = {
    ...sessionData,
    id: Date.now(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  sessions.push(newSession);
  saveLocalSessions(sessions);
  return newSession;
}

// 3. Save / Mark Class Attendance Records
export async function saveClassAttendance(sessionId, records) {
  let backendSaved = null;
  try {
    backendSaved = await AttendanceApi.markClassAttendance(sessionId, records);
  } catch (e) {
    // If backend 403 or network error, proceed with local fallback
    console.warn('Backend markClassAttendance skipped/fallback:', e?.message || e);
  }

  // Always update local storage for smooth offline & caching support
  const allRecords = getLocalRecords();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  records.forEach(rec => {
    const existingIdx = allRecords.findIndex(r => 
      String(r.sessionId) === String(sessionId) && 
      (r.studentId === rec.studentId || r.studentRollNumber === rec.studentRollNumber)
    );

    const recordToSave = {
      ...rec,
      sessionId,
      recordedAt: now
    };

    if (existingIdx >= 0) {
      allRecords[existingIdx] = { ...allRecords[existingIdx], ...recordToSave };
    } else {
      allRecords.push({
        id: `rec-${sessionId}-${rec.studentRollNumber || Date.now()}`,
        ...recordToSave
      });
    }
  });

  saveLocalRecords(allRecords);
  return backendSaved || records;
}

// 4. Fetch Session Attendance Records
export async function fetchSessionRecords(sessionId) {
  try {
    const backendRecords = await AttendanceApi.getSessionRecords(sessionId);
    if (backendRecords && Array.isArray(backendRecords)) {
      return backendRecords;
    }
  } catch (e) {
    // Fallback
  }

  const allRecords = getLocalRecords();
  return allRecords.filter(r => String(r.sessionId) === String(sessionId));
}

// 5. Generate Attendance Roster Report with Strict 75% Cutoff Logic
export async function fetchAttendanceReport({ department = 'CSE', semester = '6', subjectCode = 'CS306', targetDate = '' }) {
  try {
    const backendReport = await AttendanceApi.getClassAttendanceReport({ department, semester, subjectCode, targetDate });
    if (backendReport && backendReport.roster) {
      return backendReport;
    }
  } catch (e) {
    // Fall back to local calculation
  }

  // Local calculation:
  const sessions = getLocalSessions().filter(s => 
    s.department === department &&
    String(s.semester) === String(semester) &&
    s.subjectCode === subjectCode
  );

  const classesHeld = sessions.length;
  const roster = getRosterForClass(department, semester);
  const allRecords = getLocalRecords();

  // Find target session if targetDate is given
  const targetSession = targetDate ? sessions.find(s => s.sessionDate === targetDate) : sessions[0];
  const targetRecords = targetSession ? allRecords.filter(r => String(r.sessionId) === String(targetSession.id)) : [];
  const targetStatusMap = {};
  targetRecords.forEach(r => {
    targetStatusMap[r.studentId] = r.status;
    if (r.studentRollNumber) targetStatusMap[r.studentRollNumber] = r.status;
  });

  // Calculate attended count across all held sessions of this subject
  // PRESENT and LATE both count as attended!
  // ABSENT and UNMARKED do NOT count as attended!
  const attendedMap = {};
  sessions.forEach(sess => {
    const sessRecs = allRecords.filter(r => String(r.sessionId) === String(sess.id));
    sessRecs.forEach(r => {
      const isAttended = r.status === 'PRESENT' || r.status === 'LATE';
      if (isAttended) {
        if (r.studentId) {
          attendedMap[r.studentId] = (attendedMap[r.studentId] || 0) + 1;
        }
        if (r.studentRollNumber && r.studentRollNumber !== r.studentId) {
          attendedMap[r.studentRollNumber] = (attendedMap[r.studentRollNumber] || 0) + 1;
        }
      }
    });
  });

  let shortageCount = 0;
  let totalPctSum = 0;

  const reportRows = roster.map(student => {
    let attended = 0;
    if (student.studentId && attendedMap[student.studentId] !== undefined) {
      attended = attendedMap[student.studentId];
    } else if (student.rollNumber && attendedMap[student.rollNumber] !== undefined) {
      attended = attendedMap[student.rollNumber];
    }
    
    // Handle zero classes held without dividing by zero
    let percentage = 100.0;
    if (classesHeld > 0) {
      percentage = Math.round((attended * 100.0 / classesHeld) * 10.0) / 10.0;
    }

    // STRICT SHORTAGE CHECK: Strictly below 75% triggers alert. Exactly 75.0% does not!
    const shortageWarning = (percentage < SHORTAGE_THRESHOLD_PERCENT) && (classesHeld > 0);
    if (shortageWarning) {
      shortageCount++;
    }
    totalPctSum += percentage;

    const currentStatus = targetStatusMap[student.studentId] || targetStatusMap[student.rollNumber] || 'UNMARKED';

    return {
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department,
      semester,
      classesAttended: attended,
      classesHeld,
      attendancePercentage: percentage,
      currentStatus,
      shortageWarning
    };
  });

  const avgAttendance = roster.length > 0 ? Math.round((totalPctSum / roster.length) * 10.0) / 10.0 : 100.0;

  return {
    department,
    semester,
    subjectCode,
    targetDate,
    classesHeld,
    totalStudents: roster.length,
    shortageCount,
    shortageThreshold: SHORTAGE_THRESHOLD_PERCENT,
    averageAttendance: avgAttendance,
    roster: reportRows
  };
}

// 6. CSV Exporter for Class Attendance Reports
export function exportAttendanceReportToCSV(report, subjectName = '') {
  if (!report || !report.roster || report.roster.length === 0) {
    alert('No report data available to export.');
    return;
  }

  const headers = [
    'Roll Number',
    'Student Name',
    'Department',
    'Semester',
    'Subject Code',
    'Subject Name',
    'Classes Attended',
    'Classes Held',
    'Attendance %',
    'Shortage Alert (<75%)',
    'Current Session Status'
  ];

  const rows = report.roster.map(r => [
    `"${r.rollNumber || ''}"`,
    `"${r.name || ''}"`,
    `"${report.department || ''}"`,
    `"Sem ${report.semester || ''}"`,
    `"${report.subjectCode || ''}"`,
    `"${subjectName || ''}"`,
    r.classesAttended,
    r.classesHeld,
    `${r.attendancePercentage}%`,
    r.shortageWarning ? 'YES (SHORTAGE)' : 'NO (ELIGIBLE)',
    `"${r.currentStatus || 'UNMARKED'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanSub = (report.subjectCode || 'attendance').replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `PlacePrep_Attendance_${cleanSub}_${report.targetDate || 'report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
