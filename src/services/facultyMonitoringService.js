// PlacePrep AI - Faculty Operations Monitoring Service (HOD Exclusive)
// Provides real-time tracking of faculty activities: Class Attendance, CRT Training, and Curriculum updates.
// Supports hybrid persistence (Spring Boot Backend API + LocalStorage fallback).

import { HodMonitoringApi } from './api.js';

// Local storage keys used across PlacePrep modules
const ATTENDANCE_SESSIONS_KEY = 'placeprep_attendance_sessions_v2';
const ATTENDANCE_RECORDS_KEY = 'placeprep_attendance_records_v2';
const CRT_SESSIONS_KEY = 'placeprep_crt_sessions_v1';
const CRT_RECORDS_KEY = 'placeprep_crt_records_v1';
const CURRICULUM_TARGETS_KEY = 'placeprep_curriculum_targets_v1';

export function isAuthorizedHod(user) {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  return role === 'hod' || role === 'admin' || role === 'super_admin';
}

function safeGetJson(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

/**
 * Fetch faculty operations records.
 * Queries the Spring Boot HOD API with local storage fallback when backend is offline.
 * Strictly verifies HOD authorization.
 */
export async function fetchFacultyOperations(params = {}, currentUser) {
  if (!isAuthorizedHod(currentUser)) {
    throw new Error('Access Denied: Only authenticated Head of Department (HOD) or Admin may access Faculty Operations Monitoring.');
  }

  // 1. Attempt Spring Boot Backend
  try {
    const backendData = await HodMonitoringApi.getFacultyOperations(params);
    if (backendData && Array.isArray(backendData)) {
      return backendData;
    }
  } catch (err) {
    // Backend offline / network fallback
    console.warn('Backend /api/hod/faculty-operations fallback to local store:', err?.message || err);
  }

  // 2. Local Fallback - Aggregate genuine persistent records across faculty modules
  const activities = [];

  // A. Class Attendance Sessions
  const classSessions = safeGetJson(ATTENDANCE_SESSIONS_KEY, []);
  const classRecords = safeGetJson(ATTENDANCE_RECORDS_KEY, []);

  classSessions.forEach((s) => {
    const fName = s.facultyName && s.facultyName.trim() ? s.facultyName.trim() : 'Dr. Neha Sharma';
    const fId = s.facultyId && s.facultyId.trim() ? s.facultyId.trim() : 'FAC-CSE-042';
    const sessionRecs = classRecords.filter((r) => String(r.sessionId) === String(s.id));
    const recordsCount = sessionRecs.length;
    const presentCount = sessionRecs.filter(
      (r) => (r.status || '').toUpperCase() === 'PRESENT' || (r.status || '').toUpperCase() === 'LATE'
    ).length;

    const status = recordsCount > 0 ? 'COMPLETED' : (s.status || 'SCHEDULED');

    activities.push({
      id: `class-${s.id}`,
      rawId: s.id,
      facultyName: fName,
      facultyId: fId,
      operationType: 'CLASS_ATTENDANCE',
      operationLabel: 'Class Attendance Marked',
      module: 'Daily Class Attendance',
      subjectCode: s.subjectCode || 'CS306',
      subjectName: s.subjectName || 'Course Lecture',
      title: `${s.subjectCode || 'CS306'} • ${s.subjectName || 'Course Lecture'}`,
      department: s.department || 'CSE',
      semester: String(s.semester || '6'),
      section: s.section || 'A',
      periodNumber: s.periodNumber || 1,
      sessionDate: s.sessionDate || '2026-10-22',
      timestamp: s.createdAt || s.sessionDate || '2026-10-22',
      status,
      recordsCount,
      presentCount,
      details: `Period ${s.periodNumber || 1}${s.section ? ` (Sec ${s.section})` : ''} • ${
        recordsCount > 0
          ? `${recordsCount} students evaluated (${presentCount} present)`
          : 'Attendance session registered'
      }`
    });
  });

  // B. CRT Training Sessions
  const crtSessions = safeGetJson(CRT_SESSIONS_KEY, []);
  const crtRecords = safeGetJson(CRT_RECORDS_KEY, []);

  crtSessions.forEach((c) => {
    const trainer = c.trainerName && c.trainerName.trim()
      ? c.trainerName.trim()
      : (c.createdBy && c.createdBy.trim() ? c.createdBy.trim() : 'Faculty Trainer');
    const fId = c.createdBy || 'faculty.trainer@dtu.ac.in';
    const sessionRecs = crtRecords.filter((r) => String(r.sessionId) === String(c.id));
    const recordsCount = sessionRecs.length;
    const presentCount = sessionRecs.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;

    activities.push({
      id: `crt-${c.id}`,
      rawId: c.id,
      facultyName: trainer,
      facultyId: fId,
      operationType: 'CRT_TRAINING',
      operationLabel: 'CRT Training Session',
      module: 'Campus Recruitment Training',
      subjectCode: c.category || 'CRT',
      subjectName: c.topic || 'Training Session',
      title: `${c.topic || 'CRT Session'} [${c.category || 'General'}]`,
      department: c.department || 'CSE',
      semester: String(c.semester || '6'),
      section: 'N/A',
      periodNumber: null,
      sessionDate: c.sessionDate || '2026-10-22',
      timestamp: c.createdAt || c.sessionDate || '2026-10-22',
      status: c.status || 'SCHEDULED',
      recordsCount,
      presentCount,
      details: `${c.venue || 'Campus Lab'} • ${c.time || '10:00 AM'}${
        recordsCount > 0 ? ` • ${recordsCount} candidates evaluated` : ''
      }`
    });
  });

  // C. Curriculum & Syllabus Governance Targets
  const curriculumTargets = safeGetJson(CURRICULUM_TARGETS_KEY, []);
  curriculumTargets.forEach((t) => {
    if (t.assignedFaculty) {
      activities.push({
        id: `curriculum-${t.id || t.subjectCode}`,
        rawId: t.id || t.subjectCode,
        facultyName: t.assignedFaculty,
        facultyId: t.facultyDesignation || 'Faculty Member',
        operationType: 'CURRICULUM_GOVERNANCE',
        operationLabel: 'Syllabus Delivery Updated',
        module: 'Curriculum Governance',
        subjectCode: t.subjectCode,
        subjectName: t.subjectName,
        title: `${t.subjectCode} - ${t.subjectName}`,
        department: t.department || 'CSE',
        semester: String(t.semester || '6'),
        section: 'N/A',
        periodNumber: null,
        sessionDate: t.updatedAt ? t.updatedAt.split('T')[0] : '2026-10-22',
        timestamp: t.updatedAt || '2026-10-22',
        status: t.progressStatus || 'ON_TRACK',
        recordsCount: t.actualCompletedPercentage || 0,
        presentCount: 0,
        details: `Syllabus Completion: ${t.actualCompletedPercentage || 0}% • Status: ${t.progressStatus || 'On Track'}`
      });
    }
  });

  // Filter
  let filtered = activities;
  if (params.facultyName && params.facultyName.trim()) {
    const q = params.facultyName.trim().toLowerCase();
    filtered = filtered.filter((a) => a.facultyName && a.facultyName.toLowerCase().includes(q));
  }
  if (params.operationType && params.operationType.trim() && params.operationType !== 'ALL') {
    filtered = filtered.filter((a) => a.operationType === params.operationType);
  }
  if (params.department && params.department.trim() && params.department !== 'ALL') {
    filtered = filtered.filter((a) => a.department === params.department || a.department === 'ALL');
  }
  if (params.status && params.status.trim() && params.status !== 'ALL') {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  // Sort descending by timestamp / sessionDate
  filtered.sort((a, b) => {
    const tsA = a.timestamp || a.sessionDate || '';
    const tsB = b.timestamp || b.sessionDate || '';
    return tsB.localeCompare(tsA);
  });

  return filtered;
}

/**
 * Fetch summary metrics for faculty operations.
 */
export async function fetchFacultyMonitoringMetrics(currentUser) {
  if (!isAuthorizedHod(currentUser)) {
    throw new Error('Access Denied');
  }

  try {
    const backendMetrics = await HodMonitoringApi.getMetrics();
    if (backendMetrics && typeof backendMetrics === 'object') {
      return backendMetrics;
    }
  } catch (err) {
    // fallback
  }

  const operations = await fetchFacultyOperations({}, currentUser);
  const facultySet = new Set();
  let totalClass = 0;
  let totalCrt = 0;
  let totalEvals = 0;

  operations.forEach((op) => {
    if (op.facultyName) facultySet.add(op.facultyName.trim());
    if (op.operationType === 'CLASS_ATTENDANCE') {
      totalClass++;
      totalEvals += op.recordsCount || 0;
    } else if (op.operationType === 'CRT_TRAINING') {
      totalCrt++;
      totalEvals += op.recordsCount || 0;
    }
  });

  return {
    totalActiveFaculty: facultySet.size,
    totalClassSessions: totalClass,
    totalCrtSessions: totalCrt,
    totalAttendanceEvaluations: totalEvals,
    facultyList: Array.from(facultySet)
  };
}
