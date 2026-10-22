// PlacePrep AI - Campus Recruitment Training (CRT) Attendance Service & State Management
// Tracks placement-preparation training sessions, student participation, and certificate eligibility.
// Hybrid persistence: Spring Boot Backend API first, with instant LocalStorage fallback.

import { AttendanceApi } from './api.js';
import { DEPARTMENTS } from './attendanceStorage.js';

// Configurable CRT thresholds
export const CRT_SHORTAGE_THRESHOLD_PERCENT = 75.0;
export const CRT_CERTIFICATE_MIN_PERCENTAGE = 75.0;
export const CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS = 3;

// CRT Module Categories
export const CRT_MODULE_CATEGORIES = [
  'Aptitude & Speed Math',
  'Quantitative Ability',
  'Logical Reasoning',
  'Verbal Ability',
  'Coding & DSA',
  'Technical Interview Preparation',
  'Soft Skills & Behavioral'
];

// Session Statuses
export const CRT_SESSION_STATUSES = [
  { id: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'amber' },
  { id: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'rose' }
];

// Eligible Batches
export const CRT_BATCHES = [
  { id: 'ALL', label: 'All Batches (Common Pool)' },
  { id: '2026', label: 'Batch 2026 (Final Year)' },
  { id: '2027', label: 'Batch 2027 (Pre-Final Year)' },
  { id: '2028', label: 'Batch 2028 (Sophomore)' }
];

// Attendance Status Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  UNMARKED: 'UNMARKED'
};

const STORAGE_KEYS = {
  CRT_SESSIONS: 'placeprep_crt_sessions_v3',
  CRT_RECORDS: 'placeprep_crt_records_v3'
};

// Seed CRT Sessions
export const INITIAL_CRT_TRAINING_SESSIONS = [
  {
    id: 1001,
    topic: 'Quantitative Aptitude & Speed Math Masterclass',
    moduleType: 'Quantitative Ability',
    trainerName: 'Prof. Alok Verma',
    trainerOrganization: 'Placement Training Cell',
    scheduledDate: '2026-10-12',
    timeSlot: '10:00 AM - 12:00 PM',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: 'Seminar Hall 1 / Online Hybrid',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Permutations, Combinations, Probability, and high-frequency company aptitude problem patterns.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-10 09:00',
    updatedAt: '2026-10-12 12:30'
  },
  {
    id: 1002,
    topic: 'Data Structures & Algorithms - Dynamic Programming & Trees',
    moduleType: 'Coding & DSA',
    trainerName: 'Dr. Radhika Sen',
    trainerOrganization: 'Ex-Amazon SDE / Placement Mentor',
    scheduledDate: '2026-10-16',
    timeSlot: '02:00 PM - 05:00 PM',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    venue: 'Computer Center Lab 4',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Memoization, Tabulation, Knapsack variations, and Binary Tree traversals with live coding.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-14 10:00',
    updatedAt: '2026-10-16 17:15'
  },
  {
    id: 1003,
    topic: 'Mock HR & STAR Method Behavioral Coaching',
    moduleType: 'Soft Skills & Behavioral',
    trainerName: 'Ms. Sunita Kapoor',
    trainerOrganization: 'Corporate HR Consultant',
    scheduledDate: '2026-10-19',
    timeSlot: '11:00 AM - 01:00 PM',
    startTime: '11:00 AM',
    endTime: '01:00 PM',
    venue: 'Auditorium 2',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Behavioral interview mastery: Situation, Task, Action, Result framing for corporate culture fit.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-17 11:00',
    updatedAt: '2026-10-19 13:10'
  },
  {
    id: 1004,
    topic: 'SQL, Indexing & ACID Transactions Deep Dive',
    moduleType: 'Technical Interview Preparation',
    trainerName: 'Prof. Tarun Gupta',
    trainerOrganization: 'Database Architect',
    scheduledDate: '2026-10-21',
    timeSlot: '03:00 PM - 05:00 PM',
    startTime: '03:00 PM',
    endTime: '05:00 PM',
    venue: 'Lab 2',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Query optimization, execution plans, B-Tree indexes, and distributed transaction isolation.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-18 14:00',
    updatedAt: '2026-10-21 17:05'
  },
  {
    id: 1005,
    topic: 'Full-Stack System Design & Microservices Architecture',
    moduleType: 'Technical Interview Preparation',
    trainerName: 'Er. Vikram Malhotra',
    trainerOrganization: 'Principal Architect @ CloudCorp',
    scheduledDate: '2026-10-25',
    timeSlot: '10:00 AM - 01:00 PM',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Central Auditorium & MS Teams Hybrid',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Load balancing, caching strategies (Redis), CDN, horizontal scaling, and CAP theorem trade-offs.',
    status: 'SCHEDULED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-20 10:00'
  },
  {
    id: 1006,
    topic: 'Campus Coding Marathon (Round 1 Rescheduled)',
    moduleType: 'Coding & DSA',
    trainerName: 'Internal TPO Team',
    trainerOrganization: 'Placement Cell',
    scheduledDate: '2026-10-14',
    timeSlot: '09:00 AM - 12:00 PM',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    venue: 'Online Assessment Lab',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Rescheduled due to college mid-term examination week collision.',
    status: 'CANCELLED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-10 12:00',
    updatedAt: '2026-10-13 18:00'
  }
];

// Seed Roster for CRT sessions
export const SEED_CRT_STUDENTS = [
  { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', email: 'priyansh.jain@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'ananya.sharma@example.edu', rollNumber: '22CS0102', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22CS0103', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'siddharth.nair@example.edu', rollNumber: '22CS0104', name: 'Siddharth Nair', email: 'siddharth.nair@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'meera.venkat@example.edu', rollNumber: '22CS0105', name: 'Meera Venkat', email: 'meera.venkat@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'kabir.mehta@example.edu', rollNumber: '22CS0106', name: 'Kabir Mehta', email: 'kabir.mehta@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'divya.reddy@example.edu', rollNumber: '22CS0107', name: 'Divya Reddy', email: 'divya.reddy@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'aarav.gupta@example.edu', rollNumber: '22CS0108', name: 'Aarav Gupta', email: 'aarav.gupta@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'ishita.verma@example.edu', rollNumber: '22CS0109', name: 'Ishita Verma', email: 'ishita.verma@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'tanmay.deshmukh@example.edu', rollNumber: '22CS0110', name: 'Tanmay Deshmukh', email: 'tanmay.deshmukh@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'sneha.iyer@example.edu', rollNumber: '22CS0111', name: 'Sneha Iyer', email: 'sneha.iyer@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'aditya.rawat@example.edu', rollNumber: '22CS0112', name: 'Aditya Rawat', email: 'aditya.rawat@example.edu', department: 'CSE', batch: '2026' }
];

// Seed attendance records for completed sessions (1001, 1002, 1003, 1004)
function getInitialSeedRecords() {
  const records = [];
  const matrix = {
    '22CS0101': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0102': ['PRESENT', 'ABSENT', 'PRESENT', 'PRESENT'],  // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0103': ['ABSENT', 'PRESENT', 'ABSENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0104': ['PRESENT', 'LATE', 'PRESENT', 'ABSENT'],     // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0105': ['ABSENT', 'ABSENT', 'ABSENT', 'PRESENT'],    // 1/4 = 25.0% (Shortage <75%)
    '22CS0106': ['PRESENT', 'PRESENT', 'LATE', 'PRESENT'],    // 4/4 = 100% (Eligible)
    '22CS0107': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0108': ['PRESENT', 'ABSENT', 'ABSENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0109': ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT'],  // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0110': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0111': ['ABSENT', 'ABSENT', 'PRESENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0112': ['PRESENT', 'LATE', 'PRESENT', 'PRESENT']     // 4/4 = 100% (Eligible)
  };

  const sessions = [1001, 1002, 1003, 1004];

  SEED_CRT_STUDENTS.forEach(stu => {
    const statuses = matrix[stu.rollNumber] || ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'];
    sessions.forEach((sessId, idx) => {
      const st = statuses[idx];
      records.push({
        id: `crt-rec-${sessId}-${stu.rollNumber}`,
        crtSessionId: sessId,
        studentId: stu.email,
        studentRollNumber: stu.rollNumber,
        studentName: stu.name,
        department: stu.department,
        status: st,
        remarks: st === 'LATE' ? 'Reported 15 mins late after lab transit' : null,
        assessmentScore: st === 'PRESENT' ? 88.0 : st === 'LATE' ? 76.0 : null,
        recordedBy: 'Dr. Neha Sharma',
        recordedAt: '2026-10-21 17:15'
      });
    });
  });

  return records;
}

// Local Storage helpers
export function getLocalCrtSessions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CRT_SESSIONS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore
  }
  const initial = INITIAL_CRT_TRAINING_SESSIONS;
  try {
    localStorage.setItem(STORAGE_KEYS.CRT_SESSIONS, JSON.stringify(initial));
  } catch (e) {
    // Ignore
  }
  return initial;
}

export function saveLocalCrtSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEYS.CRT_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save CRT sessions to localStorage:', e);
  }
}

export function getLocalCrtRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CRT_RECORDS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore
  }
  const initial = getInitialSeedRecords();
  try {
    localStorage.setItem(STORAGE_KEYS.CRT_RECORDS, JSON.stringify(initial));
  } catch (e) {
    // Ignore
  }
  return initial;
}

export function saveLocalCrtRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.CRT_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save CRT records to localStorage:', e);
  }
}

export const getCrtSessionsList = getLocalCrtSessions;
export const getCrtRecordsList = getLocalCrtRecords;

// --- PUBLIC SERVICE METHODS ---

// 1. Fetch CRT Training Sessions with filters
export async function fetchCrtSessions(filters = {}) {
  try {
    const backendSessions = await AttendanceApi.getCrtSessions(filters);
    if (backendSessions && Array.isArray(backendSessions) && backendSessions.length > 0) {
      saveLocalCrtSessions(backendSessions);
      return backendSessions;
    }
  } catch (e) {
    // Backend offline / falling back to local storage
  }

  const sessions = getLocalCrtSessions();
  return sessions.filter(s => {
    const batchMatch = !filters.targetBatch || filters.targetBatch === 'ALL' || s.targetBatch === 'ALL' || s.targetBatch === filters.targetBatch;
    const deptMatch = !filters.department || filters.department === 'ALL' || s.targetBranch === 'ALL' || (s.targetBranch && s.targetBranch.includes(filters.department));
    const statusMatch = !filters.status || filters.status === 'ALL' || (s.status && s.status.toUpperCase() === filters.status.toUpperCase());
    return batchMatch && deptMatch && statusMatch;
  });
}

// 2. Fetch Single Session by ID
export async function fetchCrtSessionById(sessionId) {
  try {
    const backendSession = await AttendanceApi.getCrtSessionById(sessionId);
    if (backendSession && backendSession.id) {
      return backendSession;
    }
  } catch (e) {
    // Fallback
  }

  const sessions = getLocalCrtSessions();
  return sessions.find(s => String(s.id) === String(sessionId)) || null;
}

// 3. Create CRT Training Session
export async function createCrtSession(sessionData) {
  let backendSession = null;
  try {
    backendSession = await AttendanceApi.createCrtSession(sessionData);
  } catch (e) {
    console.warn('Backend createCrtSession skipped/fallback:', e?.message || e);
  }

  const sessions = getLocalCrtSessions();
  const newSession = backendSession || {
    ...sessionData,
    id: Date.now(),
    status: (sessionData.status || 'SCHEDULED').toUpperCase(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  sessions.unshift(newSession);
  saveLocalCrtSessions(sessions);
  return newSession;
}

// 4. Update CRT Training Session
export async function updateCrtSession(sessionId, sessionData) {
  let backendUpdated = null;
  try {
    backendUpdated = await AttendanceApi.updateCrtSession(sessionId, sessionData);
  } catch (e) {
    console.warn('Backend updateCrtSession skipped/fallback:', e?.message || e);
  }

  const sessions = getLocalCrtSessions();
  const idx = sessions.findIndex(s => String(s.id) === String(sessionId));
  const updated = backendUpdated || {
    ...sessions[idx],
    ...sessionData,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  if (idx >= 0) {
    sessions[idx] = updated;
    saveLocalCrtSessions(sessions);
  }
  return updated;
}

// 5. Update CRT Session Status (e.g. CANCELLED, COMPLETED, IN_PROGRESS)
export async function updateCrtSessionStatus(sessionId, status) {
  const upperStatus = status.toUpperCase();
  try {
    await AttendanceApi.updateCrtSessionStatus(sessionId, upperStatus);
  } catch (e) {
    // Fallback
  }

  const sessions = getLocalCrtSessions();
  const idx = sessions.findIndex(s => String(s.id) === String(sessionId));
  if (idx >= 0) {
    sessions[idx].status = upperStatus;
    sessions[idx].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    saveLocalCrtSessions(sessions);
    return sessions[idx];
  }
  return null;
}

// 6. Fetch Eligible Student Roster for Session with Marked Statuses
export async function fetchCrtSessionRoster(sessionId) {
  try {
    const backendRoster = await AttendanceApi.getCrtSessionRoster(sessionId);
    if (backendRoster && Array.isArray(backendRoster) && backendRoster.length > 0) {
      return backendRoster;
    }
  } catch (e) {
    // Fallback
  }

  const sessions = getLocalCrtSessions();
  const session = sessions.find(s => String(s.id) === String(sessionId));
  const allRecords = getLocalCrtRecords();
  const sessionRecords = allRecords.filter(r => String(r.crtSessionId) === String(sessionId));

  const recordMap = {};
  sessionRecords.forEach(r => {
    recordMap[r.studentId] = r;
    if (r.studentRollNumber) recordMap[r.studentRollNumber] = r;
  });

  return SEED_CRT_STUDENTS.map(stu => {
    const existing = recordMap[stu.email] || recordMap[stu.rollNumber];
    return {
      crtSessionId: sessionId,
      studentId: stu.email,
      rollNumber: stu.rollNumber,
      name: stu.name,
      email: stu.email,
      department: stu.department,
      batch: stu.batch || '2026',
      status: existing ? existing.status : ATTENDANCE_STATUS.UNMARKED,
      assessmentScore: existing ? existing.assessmentScore : null,
      remarks: existing ? existing.remarks : null,
      recordedAt: existing ? existing.recordedAt : null,
      recordedBy: existing ? existing.recordedBy : null
    };
  });
}

// 7. Save / Batch Mark CRT Attendance
export async function saveCrtAttendance(sessionId, records, recordedBy = 'Faculty Coordinator') {
  let backendSaved = null;
  try {
    backendSaved = await AttendanceApi.markCrtAttendance(sessionId, records);
  } catch (e) {
    console.warn('Backend markCrtAttendance skipped/fallback:', e?.message || e);
  }

  const allRecords = getLocalCrtRecords();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  records.forEach(rec => {
    const existingIdx = allRecords.findIndex(r =>
      String(r.crtSessionId) === String(sessionId) &&
      (r.studentId === rec.studentId || r.studentRollNumber === rec.rollNumber)
    );

    const recordToSave = {
      crtSessionId: sessionId,
      studentId: rec.studentId || rec.email,
      studentRollNumber: rec.rollNumber || rec.studentRollNumber,
      studentName: rec.name || rec.studentName,
      department: rec.department || 'CSE',
      status: rec.status || ATTENDANCE_STATUS.UNMARKED,
      assessmentScore: rec.assessmentScore !== undefined ? rec.assessmentScore : null,
      remarks: rec.remarks || null,
      recordedBy: recordedBy,
      recordedAt: now
    };

    if (existingIdx >= 0) {
      allRecords[existingIdx] = { ...allRecords[existingIdx], ...recordToSave };
    } else {
      allRecords.push({
        id: `crt-rec-${sessionId}-${rec.rollNumber || Date.now()}`,
        ...recordToSave
      });
    }
  });

  saveLocalCrtRecords(allRecords);

  // Transition session status to COMPLETED if it was SCHEDULED
  const sessions = getLocalCrtSessions();
  const sIdx = sessions.findIndex(s => String(s.id) === String(sessionId));
  if (sIdx >= 0 && sessions[sIdx].status === 'SCHEDULED') {
    sessions[sIdx].status = 'COMPLETED';
    sessions[sIdx].updatedAt = now;
    saveLocalCrtSessions(sessions);
  }

  return backendSaved || records;
}

// 8. Fetch Session Attendance Records
export async function fetchCrtSessionRecords(sessionId) {
  try {
    const backendRecords = await AttendanceApi.getCrtSessionRecords(sessionId);
    if (backendRecords && Array.isArray(backendRecords)) {
      return backendRecords;
    }
  } catch (e) {
    // Fallback
  }

  const allRecords = getLocalCrtRecords();
  return allRecords.filter(r => String(r.crtSessionId) === String(sessionId));
}

// 9. Fetch Session-Wise Report
export async function fetchCrtSessionReport(sessionId) {
  try {
    const backendReport = await AttendanceApi.getCrtSessionReport(sessionId);
    if (backendReport && backendReport.roster) {
      return backendReport;
    }
  } catch (e) {
    // Fallback
  }

  const session = await fetchCrtSessionById(sessionId);
  const roster = await fetchCrtSessionRoster(sessionId);

  let present = 0;
  let late = 0;
  let absent = 0;
  let unmarked = 0;

  roster.forEach(r => {
    if (r.status === ATTENDANCE_STATUS.PRESENT) present++;
    else if (r.status === ATTENDANCE_STATUS.LATE) late++;
    else if (r.status === ATTENDANCE_STATUS.ABSENT) absent++;
    else unmarked++;
  });

  const total = roster.length;
  const attended = present + late;
  const completionPercentage = total > 0 ? Math.round((attended * 100.0 / total) * 10.0) / 10.0 : 0.0;

  return {
    sessionId: session?.id || sessionId,
    topic: session?.topic || 'CRT Training Session',
    moduleType: session?.moduleType || 'Aptitude & Speed Math',
    trainerName: session?.trainerName || 'Faculty Trainer',
    trainerOrganization: session?.trainerOrganization || 'Placement Cell',
    scheduledDate: session?.scheduledDate || '',
    timeSlot: session?.timeSlot || '',
    venue: session?.venue || 'Campus Lab / Hall',
    status: session?.status || 'COMPLETED',
    targetBatch: session?.targetBatch || 'ALL',
    targetBranch: session?.targetBranch || 'ALL',
    totalEligibleStudents: total,
    presentCount: present,
    lateCount: late,
    absentCount: absent,
    unmarkedCount: unmarked,
    qualifyingAttendedCount: attended,
    attendanceCompletionPercentage: completionPercentage,
    roster
  };
}

// 10. Fetch Cumulative Student-Wise Report with Strict 75% Cutoff & Certificate Policy
export async function fetchCrtCumulativeReport({ targetBatch = 'ALL', department = 'ALL' } = {}) {
  try {
    const backendReport = await AttendanceApi.getCrtCumulativeReport({ targetBatch, department });
    if (backendReport && backendReport.roster) {
      return backendReport;
    }
  } catch (e) {
    // Fallback
  }

  const allSessions = getLocalCrtSessions();
  // Strictly COMPLETED sessions only: exclude CANCELLED, SCHEDULED, and IN_PROGRESS per requirement
  const completedSessions = allSessions.filter(s => {
    if (s.status !== 'COMPLETED') return false;
    const batchMatch = targetBatch === 'ALL' || s.targetBatch === 'ALL' || s.targetBatch === targetBatch;
    const deptMatch = department === 'ALL' || s.targetBranch === 'ALL' || (s.targetBranch && s.targetBranch.includes(department));
    return batchMatch && deptMatch;
  });

  const completedSessionsHeld = completedSessions.length;
  const allRecords = getLocalCrtRecords();

  // Filter roster by batch & department
  const filteredStudents = SEED_CRT_STUDENTS.filter(stu => {
    const bMatch = targetBatch === 'ALL' || !stu.batch || stu.batch === targetBatch;
    const dMatch = department === 'ALL' || stu.department === department;
    return bMatch && dMatch;
  });

  // Calculate attendance per student across completed sessions
  const studentReports = [];
  let shortageCount = 0;
  let eligibleCertificateCount = 0;
  let sumPercentage = 0.0;

  filteredStudents.forEach(stu => {
    let attended = 0;
    let late = 0;
    let absent = 0;

    completedSessions.forEach(cs => {
      const rec = allRecords.find(r =>
        String(r.crtSessionId) === String(cs.id) &&
        (r.studentId === stu.email || r.studentRollNumber === stu.rollNumber)
      );

      if (rec) {
        if (rec.status === ATTENDANCE_STATUS.PRESENT) {
          attended++;
        } else if (rec.status === ATTENDANCE_STATUS.LATE) {
          attended++;
          late++;
        } else if (rec.status === ATTENDANCE_STATUS.ABSENT) {
          absent++;
        }
      }
    });

    // Safe division: 0 completed sessions returns 100.0%
    const percentage = completedSessionsHeld > 0
      ? Math.round((attended * 100.0 / completedSessionsHeld) * 10.0) / 10.0
      : 100.0;

    // Strict Shortage Rule: strictly < 75% triggers alert; exactly 75.0% does NOT
    const shortageWarning = (percentage < CRT_SHORTAGE_THRESHOLD_PERCENT) && (completedSessionsHeld > 0);
    if (shortageWarning) {
      shortageCount++;
    }
    sumPercentage += percentage;

    // Certificate Eligibility:
    // Requires minimum completed sessions held (>= 3) AND attendance >= 75.0%
    let certificateStatus;
    let certificateRemarks;
    let certificateEligible = false;

    if (completedSessionsHeld < CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS) {
      certificateStatus = 'PENDING';
      certificateRemarks = `Pending: Requires at least ${CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS} completed sessions (Held: ${completedSessionsHeld}).`;
    } else if (percentage >= CRT_CERTIFICATE_MIN_PERCENTAGE) {
      certificateStatus = 'ELIGIBLE';
      certificateEligible = true;
      eligibleCertificateCount++;
      certificateRemarks = `Eligible: Meets criteria (${percentage}% >= ${CRT_CERTIFICATE_MIN_PERCENTAGE}%, ${attended}/${completedSessionsHeld} sessions).`;
    } else {
      certificateStatus = 'INELIGIBLE';
      certificateRemarks = `Ineligible: Attendance ${percentage}% is strictly below ${CRT_CERTIFICATE_MIN_PERCENTAGE}% threshold.`;
    }

    studentReports.push({
      studentId: stu.email,
      rollNumber: stu.rollNumber,
      name: stu.name,
      department: stu.department,
      eligibleSessionsHeld: completedSessionsHeld,
      sessionsAttended: attended,
      sessionsMissed: absent,
      sessionsLate: late,
      crtAttendancePercentage: percentage,
      shortageWarning,
      certificateStatus,
      certificateEligible,
      certificateRemarks
    });
  });

  const totalStudents = filteredStudents.length;
  const averageAttendance = totalStudents > 0
    ? Math.round((sumPercentage / totalStudents) * 10.0) / 10.0
    : 100.0;

  return {
    targetBatch,
    department,
    completedSessionsHeld,
    totalStudents,
    shortageCount,
    eligibleCertificateCount,
    shortageThreshold: CRT_SHORTAGE_THRESHOLD_PERCENT,
    certificateMinPercentage: CRT_CERTIFICATE_MIN_PERCENTAGE,
    certificateMinSessions: CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS,
    averageAttendance,
    roster: studentReports
  };
}

// 11. Export Cumulative Report to CSV
export function exportCrtCumulativeReportToCSV(reportData) {
  if (!reportData || !reportData.roster || reportData.roster.length === 0) {
    return;
  }

  const headers = [
    'Roll Number',
    'Student Name',
    'Department',
    'Completed Sessions Held',
    'Sessions Attended',
    'Sessions Missed',
    'Late Marks',
    'CRT Attendance %',
    'Attendance Status (<75%)',
    'Certificate Eligibility',
    'Certificate Details'
  ];

  const rows = reportData.roster.map(r => [
    `"${r.rollNumber}"`,
    `"${r.name}"`,
    `"${r.department}"`,
    r.eligibleSessionsHeld,
    r.sessionsAttended,
    r.sessionsMissed,
    r.sessionsLate,
    `"${r.crtAttendancePercentage}%"`,
    r.shortageWarning ? '"SHORTAGE (<75%)"' : '"GOOD STANDING"',
    `"${r.certificateStatus}"`,
    `"${r.certificateRemarks}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PlacePrep_CRT_Attendance_Report_${reportData.targetBatch}_${reportData.department}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 12. Export Session-Wise Report to CSV
export function exportCrtSessionReportToCSV(sessionReport) {
  if (!sessionReport || !sessionReport.roster || sessionReport.roster.length === 0) {
    return;
  }

  const headers = [
    'Roll Number',
    'Student Name',
    'Department',
    'Status',
    'Assessment Score',
    'Remarks',
    'Recorded By',
    'Recorded At'
  ];

  const rows = sessionReport.roster.map(r => [
    `"${r.rollNumber}"`,
    `"${r.name}"`,
    `"${r.department}"`,
    `"${r.status}"`,
    r.assessmentScore !== null && r.assessmentScore !== undefined ? r.assessmentScore : '""',
    `"${r.remarks || ''}"`,
    `"${r.recordedBy || ''}"`,
    `"${r.recordedAt || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PlacePrep_CRT_Session_${sessionReport.sessionId}_${sessionReport.scheduledDate || 'Report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
