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
const SEED_ROSTERS = {
  CSE: [
    { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', email: 'priyansh.jain@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'ananya.sharma@example.edu', rollNumber: '22CS0102', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22CS0103', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'siddharth.nair@example.edu', rollNumber: '22CS0104', name: 'Siddharth Nair', email: 'siddharth.nair@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'meera.venkat@example.edu', rollNumber: '22CS0105', name: 'Meera Venkat', email: 'meera.venkat@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'kabir.mehta@example.edu', rollNumber: '22CS0106', name: 'Kabir Mehta', email: 'kabir.mehta@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'divya.reddy@example.edu', rollNumber: '22CS0107', name: 'Divya Reddy', email: 'divya.reddy@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'aarav.gupta@example.edu', rollNumber: '22CS0108', name: 'Aarav Gupta', email: 'aarav.gupta@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'ishita.verma@example.edu', rollNumber: '22CS0109', name: 'Ishita Verma', email: 'ishita.verma@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'tanmay.deshmukh@example.edu', rollNumber: '22CS0110', name: 'Tanmay Deshmukh', email: 'tanmay.deshmukh@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'sneha.iyer@example.edu', rollNumber: '22CS0111', name: 'Sneha Iyer', email: 'sneha.iyer@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'aditya.rawat@example.edu', rollNumber: '22CS0112', name: 'Aditya Rawat', email: 'aditya.rawat@example.edu', department: 'CSE', semester: '6' }
  ],
  IT: [
    { studentId: 'ananya.sharma@example.edu', rollNumber: '22IT0101', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'IT', semester: '6' },
    { studentId: 'rohit.gupta@example.edu', rollNumber: '22IT0102', name: 'Rohit Gupta', email: 'rohit.gupta@example.edu', department: 'IT', semester: '6' },
    { studentId: 'kavita.sen@example.edu', rollNumber: '22IT0103', name: 'Kavita Sen', email: 'kavita.sen@example.edu', department: 'IT', semester: '6' },
    { studentId: 'deepak.joshi@example.edu', rollNumber: '22IT0104', name: 'Deepak Joshi', email: 'deepak.joshi@example.edu', department: 'IT', semester: '6' },
    { studentId: 'pooja.verma@example.edu', rollNumber: '22IT0105', name: 'Pooja Verma', email: 'pooja.verma@example.edu', department: 'IT', semester: '6' },
    { studentId: 'manish.kumar@example.edu', rollNumber: '22IT0106', name: 'Manish Kumar', email: 'manish.kumar@example.edu', department: 'IT', semester: '6' }
  ],
  ECE: [
    { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22EC0101', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'neha.patil@example.edu', rollNumber: '22EC0102', name: 'Neha Patil', email: 'neha.patil@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'vikram.singh@example.edu', rollNumber: '22EC0103', name: 'Vikram Singh', email: 'vikram.singh@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'sonali.nair@example.edu', rollNumber: '22EC0104', name: 'Sonali Nair', email: 'sonali.nair@example.edu', department: 'ECE', semester: '6' }
  ]
};

// Initial Seed Sessions & Records so reports have rich instant data
function getInitialSeedSessions() {
  return [
    {
      id: 101,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-15',
      periodNumber: 2,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-15 09:00'
    },
    {
      id: 102,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-17',
      periodNumber: 3,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-17 11:15'
    },
    {
      id: 103,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-19',
      periodNumber: 1,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-19 09:00'
    },
    {
      id: 104,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-21',
      periodNumber: 4,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-21 12:15'
    }
  ];
}

function getInitialSeedRecords() {
  // Attendance records across 4 sessions (IDs 101, 102, 103, 104)
  // Demonstrating:
  // Priyansh: 4/4 = 100%
  // Ananya: 3/4 = 75.0% (EXACTLY 75% -> NO shortage warning)
  // Rohan: 2/4 = 50.0% (Below 75% -> SHORTAGE ALERT)
  // Siddharth: 4/4 = 100%
  // Meera: 1/4 = 25.0% (Below 75% -> SHORTAGE ALERT)
  // Kabir: 3/4 = 75.0% (EXACTLY 75% -> NO shortage warning)
  // Divya: 4/4 = 100%
  // Aarav: 2/4 = 50.0% (Below 75% -> SHORTAGE ALERT)
  const pattern = [
    { email: 'priyansh.jain@example.edu', roll: '22CS0101', name: 'Priyansh Jain', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'ananya.sharma@example.edu', roll: '22CS0102', name: 'Ananya Sharma', s1: 'PRESENT', s2: 'ABSENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'rohan.kulkarni@example.edu', roll: '22CS0103', name: 'Rohan Kulkarni', s1: 'ABSENT', s2: 'PRESENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'siddharth.nair@example.edu', roll: '22CS0104', name: 'Siddharth Nair', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'LATE' },
    { email: 'meera.venkat@example.edu', roll: '22CS0105', name: 'Meera Venkat', s1: 'ABSENT', s2: 'ABSENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'kabir.mehta@example.edu', roll: '22CS0106', name: 'Kabir Mehta', s1: 'PRESENT', s2: 'LATE', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'divya.reddy@example.edu', roll: '22CS0107', name: 'Divya Reddy', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'aarav.gupta@example.edu', roll: '22CS0108', name: 'Aarav Gupta', s1: 'PRESENT', s2: 'ABSENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'ishita.verma@example.edu', roll: '22CS0109', name: 'Ishita Verma', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'tanmay.deshmukh@example.edu', roll: '22CS0110', name: 'Tanmay Deshmukh', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'ABSENT' },
    { email: 'sneha.iyer@example.edu', roll: '22CS0111', name: 'Sneha Iyer', s1: 'LATE', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'aditya.rawat@example.edu', roll: '22CS0112', name: 'Aditya Rawat', s1: 'ABSENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'ABSENT' }
  ];

  const records = [];
  const sessionIds = [101, 102, 103, 104];
  const dates = ['2026-10-15', '2026-10-17', '2026-10-19', '2026-10-21'];

  pattern.forEach(p => {
    const statuses = [p.s1, p.s2, p.s3, p.s4];
    sessionIds.forEach((sId, idx) => {
      records.push({
        id: `rec-${sId}-${p.roll}`,
        sessionId: sId,
        studentId: p.email,
        studentRollNumber: p.roll,
        studentName: p.name,
        status: statuses[idx],
        remarks: statuses[idx] === 'LATE' ? 'Late arrival (10 mins)' : '',
        recordedAt: `${dates[idx]} 09:15`
      });
    });
  });

  return records;
}

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
  const fullName = deptObj ? deptObj.name : 'Computer Science and Engineering';

  const semNum = parseInt(semesterNumber, 10) || 6;
  const deptSubjectsMap = BRANCH_SEMESTER_SUBJECTS[fullName];

  if (deptSubjectsMap && deptSubjectsMap[semNum] && deptSubjectsMap[semNum].length > 0) {
    return deptSubjectsMap[semNum];
  }

  // Fallback subjects if not mapped in dictionary
  return [
    { code: `${departmentCode}${semNum}01`, name: `${deptObj?.short || 'Core'} Advanced Theory`, credits: 4 },
    { code: `${departmentCode}${semNum}02`, name: `${deptObj?.short || 'Core'} Systems Architecture`, credits: 4 },
    { code: `${departmentCode}${semNum}03`, name: `${deptObj?.short || 'Core'} Laboratory Workshop`, credits: 2 },
    { code: `${departmentCode}${semNum}06`, name: `${deptObj?.short || 'Core'} Domain Elective`, credits: 3 }
  ];
}

// Get student roster for selected department and semester
export function getRosterForClass(departmentCode = 'CSE', semesterNumber = '6') {
  const normDept = (departmentCode || 'CSE').toUpperCase();
  if (SEED_ROSTERS[normDept]) {
    return SEED_ROSTERS[normDept].map(s => ({ ...s, semester: String(semesterNumber) }));
  }
  // Generic fallback if department is unfamiliar
  return SEED_ROSTERS.CSE.map(s => ({
    ...s,
    department: departmentCode,
    rollNumber: s.rollNumber.replace('CS', normDept.slice(0, 2)),
    semester: String(semesterNumber)
  }));
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
