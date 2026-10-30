// PlacePrep AI - HOD Curriculum & Syllabus Governance Service
// Provides department-wide academic delivery monitoring, planned vs actual syllabus tracking,
// laboratory practical completion, internal assessment tracking, academic deadline milestones,
// and behind-schedule remedial alert calculations.

import * as XLSX from 'xlsx';
import { BRANCH_SEMESTER_SUBJECTS } from '../data/initialAcademicRecords.js';
import { getCurrentUser } from './storage.js';
import { sanitizeSpreadsheetValue } from './reportsExporterService.js';

export const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'ECE', name: 'Electronics and Communication Engineering' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' }
];

export const ACADEMIC_YEARS = ['2026-2027', '2025-2026'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const PROGRESS_STATUSES = {
  NOT_STARTED: 'Not Started',
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  BEHIND_SCHEDULE: 'Behind Schedule',
  COMPLETED: 'Completed'
};

const STORAGE_KEYS = {
  TARGETS: 'placeprep_curriculum_targets_v1',
  LABS: 'placeprep_curriculum_labs_v1',
  ASSESSMENTS: 'placeprep_curriculum_assessments_v1',
  DEADLINES: 'placeprep_curriculum_deadlines_v1'
};

// Seed Curriculum Targets for CSE (Odd & Even Semesters, current active: Semester 6 & 4)
const SEED_TARGETS = [];

// Seed Laboratory Practical Completion Records
const SEED_LABS = [];

// Seed Internal Assessment Schedules
const SEED_ASSESSMENTS = [];

// Seed Academic Deadlines & Milestones
const SEED_DEADLINES = [];

// Safe Storage Helpers
function getStorage(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage (${key}):`, e);
  }
}

/**
 * Check if the user is authorized for HOD Curriculum Governance
 */
export function isUserAuthorizedHOD(user = getCurrentUser()) {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'hod' || role === 'admin' || role === 'super_admin' || role === 'director';
}

/**
 * Calculate progress status based on planned %, actual %, target date, and current date
 */
export function computeProgressStatus(actualPercentage, plannedPercentage, targetDate) {
  if (actualPercentage >= 100) return PROGRESS_STATUSES.COMPLETED;
  if (actualPercentage === 0) return PROGRESS_STATUSES.NOT_STARTED;

  const todayStr = new Date().toISOString().slice(0, 10);
  const isPastTargetDate = targetDate && targetDate < todayStr;

  // If past target date and not completed
  if (isPastTargetDate && actualPercentage < 100) {
    return PROGRESS_STATUSES.BEHIND_SCHEDULE;
  }

  // If lagging behind planned progress by 10% or more
  if (plannedPercentage - actualPercentage >= 10) {
    return PROGRESS_STATUSES.BEHIND_SCHEDULE;
  }

  // If lagging behind planned progress by 1% to 9%
  if (plannedPercentage - actualPercentage > 2) {
    return PROGRESS_STATUSES.AT_RISK;
  }

  return PROGRESS_STATUSES.ON_TRACK;
}

// =========================================================================
// 1. CURRICULUM TARGETS (PLANNED VS ACTUAL SYLLABUS TRACKING)
// =========================================================================

export function getCurriculumTargets(filters = {}) {
  const allTargets = getStorage(STORAGE_KEYS.TARGETS, SEED_TARGETS);
  
  return allTargets.filter(item => {
    if (filters.department && filters.department !== 'ALL' && item.department !== filters.department) {
      return false;
    }
    if (filters.academicYear && item.academicYear !== filters.academicYear) {
      return false;
    }
    if (filters.semester && filters.semester !== 'ALL' && Number(item.semester) !== Number(filters.semester)) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
      return false;
    }
    if (filters.search && typeof filters.search === 'string') {
      const q = filters.search.toLowerCase();
      const codeMatch = item.subjectCode?.toLowerCase().includes(q);
      const nameMatch = item.subjectName?.toLowerCase().includes(q);
      const facultyMatch = item.assignedFaculty?.toLowerCase().includes(q);
      if (!codeMatch && !nameMatch && !facultyMatch) return false;
    }
    return true;
  });
}

export function saveCurriculumTarget(targetData, actor = getCurrentUser()) {
  if (!isUserAuthorizedHOD(actor)) {
    throw new Error('Unauthorized: Only HOD or Administrator can configure curriculum targets.');
  }

  // Validate required fields
  if (!targetData.department) throw new Error('Department is required.');
  if (!targetData.semester) throw new Error('Semester is required.');
  if (!targetData.subjectCode || !targetData.subjectName) throw new Error('Subject is required.');
  if (!targetData.assignedFaculty) throw new Error('Assigned Faculty is required.');
  
  const targetPct = Number(targetData.targetPercentage);
  if (isNaN(targetPct) || targetPct < 0 || targetPct > 100) {
    throw new Error('Target completion percentage must be between 0% and 100%.');
  }

  const plannedPct = Number(targetData.plannedPercentage !== undefined ? targetData.plannedPercentage : targetPct);
  if (isNaN(plannedPct) || plannedPct < 0 || plannedPct > 100) {
    throw new Error('Planned completion percentage must be between 0% and 100%.');
  }

  if (!targetData.targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetData.targetDate)) {
    throw new Error('Please provide a valid target date (YYYY-MM-DD).');
  }

  const allTargets = getStorage(STORAGE_KEYS.TARGETS, SEED_TARGETS);
  const isUpdate = Boolean(targetData.id);

  // Check duplicate target for same department, semester, subject, and academic year
  const existingDup = allTargets.find(t => 
    (!isUpdate || t.id !== targetData.id) &&
    t.department === targetData.department &&
    Number(t.semester) === Number(targetData.semester) &&
    t.subjectCode === targetData.subjectCode &&
    t.academicYear === (targetData.academicYear || '2026-2027')
  );

  if (existingDup) {
    throw new Error(`A syllabus target already exists for ${targetData.subjectCode} (${targetData.subjectName}) in Semester ${targetData.semester}.`);
  }

  const totalUnits = Number(targetData.totalUnits) || 5;

  // Build default units if not provided
  let units = targetData.units;
  if (!units || units.length === 0) {
    units = Array.from({ length: totalUnits }, (_, idx) => ({
      unitNumber: idx + 1,
      title: `Unit ${idx + 1} - Core Syllabus Topics`,
      status: 'Not Started',
      topicsCount: 5,
      completedTopics: 0
    }));
  }

  // Calculate actual percentage from units
  const completedUnits = units.filter(u => u.status === 'Completed').length;
  const inProgressUnits = units.filter(u => u.status === 'In Progress').length;
  const actualPct = totalUnits > 0 
    ? Math.round(((completedUnits + (inProgressUnits * 0.5)) / totalUnits) * 100) 
    : 0;

  const status = computeProgressStatus(actualPct, plannedPct, targetData.targetDate);

  const newTarget = {
    ...targetData,
    id: targetData.id || `tgt-${targetData.department.toLowerCase()}-${targetData.semester}-${targetData.subjectCode.toLowerCase()}-${Date.now()}`,
    department: targetData.department,
    academicYear: targetData.academicYear || '2026-2027',
    semester: Number(targetData.semester),
    totalUnits,
    targetPercentage: targetPct,
    plannedPercentage: plannedPct,
    actualPercentage: actualPct,
    status,
    units,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedBy: actor?.name ? `${actor.name} (${actor.role?.toUpperCase()})` : 'HOD Office'
  };

  let updatedList;
  if (isUpdate) {
    updatedList = allTargets.map(t => t.id === newTarget.id ? newTarget : t);
  } else {
    updatedList = [newTarget, ...allTargets];
  }

  setStorage(STORAGE_KEYS.TARGETS, updatedList);
  return newTarget;
}

export function updateTopicStatus(targetId, unitNumber, newStatus, actor = getCurrentUser()) {
  const allTargets = getStorage(STORAGE_KEYS.TARGETS, SEED_TARGETS);
  const target = allTargets.find(t => t.id === targetId);
  if (!target) throw new Error('Target not found.');

  const updatedUnits = target.units.map(u => {
    if (u.unitNumber === unitNumber) {
      return {
        ...u,
        status: newStatus,
        completedTopics: newStatus === 'Completed' ? u.topicsCount : (newStatus === 'In Progress' ? Math.floor(u.topicsCount / 2) : 0)
      };
    }
    return u;
  });

  const totalUnits = target.totalUnits || updatedUnits.length;
  const completedUnits = updatedUnits.filter(u => u.status === 'Completed').length;
  const inProgressUnits = updatedUnits.filter(u => u.status === 'In Progress').length;
  const actualPct = totalUnits > 0 
    ? Math.round(((completedUnits + (inProgressUnits * 0.5)) / totalUnits) * 100) 
    : 0;

  const status = computeProgressStatus(actualPct, target.plannedPercentage, target.targetDate);

  const updatedTarget = {
    ...target,
    units: updatedUnits,
    actualPercentage: actualPct,
    status,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedBy: actor?.name ? `${actor.name} (${actor.role?.toUpperCase()})` : 'HOD Office'
  };

  const updatedList = allTargets.map(t => t.id === targetId ? updatedTarget : t);
  setStorage(STORAGE_KEYS.TARGETS, updatedList);
  return updatedTarget;
}

export function deleteCurriculumTarget(targetId, actor = getCurrentUser()) {
  if (!isUserAuthorizedHOD(actor)) {
    throw new Error('Unauthorized: Only HOD can delete curriculum targets.');
  }
  const allTargets = getStorage(STORAGE_KEYS.TARGETS, SEED_TARGETS);
  const filtered = allTargets.filter(t => t.id !== targetId);
  setStorage(STORAGE_KEYS.TARGETS, filtered);
  return { success: true };
}

// =========================================================================
// 2. LABORATORY COMPLETION MONITORING
// =========================================================================

export function getLabCompletionRecords(filters = {}) {
  const allLabs = getStorage(STORAGE_KEYS.LABS, SEED_LABS);
  return allLabs.filter(item => {
    if (filters.department && filters.department !== 'ALL' && item.department !== filters.department) {
      return false;
    }
    if (filters.semester && filters.semester !== 'ALL' && Number(item.semester) !== Number(filters.semester)) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export function logLabSession(labId, sessionDetails = {}, actor = getCurrentUser()) {
  const allLabs = getStorage(STORAGE_KEYS.LABS, SEED_LABS);
  const lab = allLabs.find(l => l.id === labId);
  if (!lab) throw new Error('Laboratory record not found.');

  const completed = Math.min(lab.completedSessions + 1, lab.totalPlannedSessions);
  const pending = Math.max(0, lab.totalPlannedSessions - completed);
  const pct = Math.round((completed / lab.totalPlannedSessions) * 1000) / 10;
  
  const todayStr = new Date().toISOString().slice(0, 10);
  let status = PROGRESS_STATUSES.ON_TRACK;
  if (completed >= lab.totalPlannedSessions) {
    status = PROGRESS_STATUSES.COMPLETED;
  } else if (lab.targetDate && lab.targetDate < todayStr) {
    status = PROGRESS_STATUSES.BEHIND_SCHEDULE;
  } else if (pct < 70) {
    status = PROGRESS_STATUSES.BEHIND_SCHEDULE;
  }

  const updatedLab = {
    ...lab,
    completedSessions: completed,
    pendingSessions: pending,
    completionPercentage: pct,
    status,
    lastSessionDate: sessionDetails.date || todayStr,
    remarks: sessionDetails.remarks || `Practical session ${completed} verified by ${actor?.name || 'Faculty In-Charge'}.`
  };

  const updatedList = allLabs.map(l => l.id === labId ? updatedLab : l);
  setStorage(STORAGE_KEYS.LABS, updatedList);
  return updatedLab;
}

// =========================================================================
// 3. INTERNAL ASSESSMENT TRACKING
// =========================================================================

export function getInternalAssessments(filters = {}) {
  const allAssessments = getStorage(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
  return allAssessments.filter(item => {
    if (filters.department && filters.department !== 'ALL' && item.department !== filters.department) {
      return false;
    }
    if (filters.semester && filters.semester !== 'ALL' && Number(item.semester) !== Number(filters.semester)) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export function updateAssessmentStatus(assessmentId, newStatus, completionDate = null, actor = getCurrentUser()) {
  const allAssessments = getStorage(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
  const asm = allAssessments.find(a => a.id === assessmentId);
  if (!asm) throw new Error('Assessment not found.');

  const updatedAsm = {
    ...asm,
    status: newStatus,
    completionDate: newStatus === 'Completed' ? (completionDate || new Date().toISOString().slice(0, 10)) : asm.completionDate,
    remarks: `Status set to ${newStatus} by ${actor?.name || 'HOD Office'}`
  };

  const updatedList = allAssessments.map(a => a.id === assessmentId ? updatedAsm : a);
  setStorage(STORAGE_KEYS.ASSESSMENTS, updatedList);
  return updatedAsm;
}

// =========================================================================
// 4. ACADEMIC DEADLINES & MILESTONES
// =========================================================================

export function getAcademicDeadlines(filters = {}) {
  const allDeadlines = getStorage(STORAGE_KEYS.DEADLINES, SEED_DEADLINES);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Recalculate dynamic status if not completed
  const processed = allDeadlines.map(d => {
    if (d.status !== 'Completed') {
      const isOverdue = d.targetDate < todayStr;
      return {
        ...d,
        status: isOverdue ? 'Overdue' : 'Upcoming'
      };
    }
    return d;
  });

  return processed.filter(item => {
    if (filters.department && filters.department !== 'ALL' && item.department !== 'ALL' && item.department !== filters.department) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
      return false;
    }
    if (filters.category && filters.category !== 'ALL' && item.category !== filters.category) {
      return false;
    }
    return true;
  });
}

// =========================================================================
// 5. BEHIND-SCHEDULE ACTIONABLE ALERTS
// =========================================================================

export function getBehindScheduleAlerts(filtersOrDept = {}, maybeYear) {
  let filters = {};
  if (typeof filtersOrDept === 'string') {
    filters = { department: filtersOrDept, academicYear: maybeYear };
  } else if (filtersOrDept && typeof filtersOrDept === 'object') {
    filters = { ...filtersOrDept };
  }

  const targets = getCurriculumTargets(filters);
  const labs = getLabCompletionRecords(filters);
  const assessments = getInternalAssessments(filters);
  const todayStr = new Date().toISOString().slice(0, 10);

  const alerts = [];

  // A. Theory Subject Delays
  targets.forEach(t => {
    if (t.status === PROGRESS_STATUSES.BEHIND_SCHEDULE || t.status === PROGRESS_STATUSES.AT_RISK) {
      const gap = t.plannedPercentage - t.actualPercentage;
      alerts.push({
        id: `alert-tgt-${t.id}`,
        type: 'Theory Subject',
        severity: t.status === PROGRESS_STATUSES.BEHIND_SCHEDULE ? 'Critical' : 'Warning',
        title: `${t.subjectCode} - ${t.subjectName}`,
        semester: t.semester,
        assignedFaculty: t.assignedFaculty,
        plannedPercentage: t.plannedPercentage,
        actualPercentage: t.actualPercentage,
        gapPercentage: gap,
        targetDate: t.targetDate,
        reason: gap >= 15 
          ? `Actual coverage (${t.actualPercentage}%) lags behind planned milestone (${t.plannedPercentage}%) by ${gap}%.`
          : `Approaching deadline with ${t.targetPercentage - t.actualPercentage}% pending coverage.`,
        recommendedAction: 'Schedule 2 weekend remedial lecture sessions and issue syllabus acceleration advisory to faculty.',
        remedialAction: 'Schedule 2 weekend remedial lecture sessions and issue syllabus acceleration advisory to faculty.'
      });
    }
  });

  // B. Laboratory Delays
  labs.forEach(l => {
    if (l.status === PROGRESS_STATUSES.BEHIND_SCHEDULE) {
      alerts.push({
        id: `alert-lab-${l.id}`,
        type: 'Laboratory Course',
        severity: 'Critical',
        title: `${l.subjectCode} - ${l.labName}`,
        semester: l.semester,
        assignedFaculty: l.assignedFaculty,
        plannedPercentage: 80,
        actualPercentage: l.completionPercentage,
        gapPercentage: Math.round(80 - l.completionPercentage),
        targetDate: l.targetDate,
        reason: `${l.pendingSessions} practical sessions pending with deadline on ${l.targetDate}.`,
        recommendedAction: 'Conduct combined 3-hour practical lab slots and verify student evaluation records.',
        remedialAction: 'Conduct combined 3-hour practical lab slots and verify student evaluation records.'
      });
    }
  });

  // C. Internal Assessment Overdue
  assessments.forEach(a => {
    if (a.status === 'Overdue' || (a.deadline < todayStr && a.status !== 'Completed')) {
      alerts.push({
        id: `alert-asm-${a.id}`,
        type: 'Internal Assessment',
        severity: 'Critical',
        title: `${a.subjectCode} - ${a.assessmentName}`,
        semester: a.semester,
        assignedFaculty: a.assignedFaculty,
        plannedPercentage: 100,
        actualPercentage: 0,
        gapPercentage: 100,
        targetDate: a.deadline,
        reason: `Assessment evaluation overdue since deadline ${a.deadline}.`,
        recommendedAction: 'Convene with subject coordinator to finalize evaluation and submit consolidated marksheet.',
        remedialAction: 'Convene with subject coordinator to finalize evaluation and submit consolidated marksheet.'
      });
    }
  });

  return alerts;
}

// =========================================================================
// 6. CURRICULUM OVERVIEW METRICS
// =========================================================================

export function getCurriculumOverviewMetrics(department = 'CSE', academicYear = '2026-2027') {
  const targets = getCurriculumTargets({ department, academicYear });
  const labs = getLabCompletionRecords({ department });
  const assessments = getInternalAssessments({ department });
  const deadlines = getAcademicDeadlines({ department });

  const totalTargets = targets.length;
  
  const avgPlanned = totalTargets > 0 
    ? Math.round(targets.reduce((sum, t) => sum + (t.plannedPercentage || 0), 0) / totalTargets) 
    : 0;
    
  const avgActual = totalTargets > 0 
    ? Math.round(targets.reduce((sum, t) => sum + (t.actualPercentage || 0), 0) / totalTargets) 
    : 0;

  const onTrackCount = targets.filter(t => t.status === PROGRESS_STATUSES.ON_TRACK).length;
  const behindScheduleCount = targets.filter(t => t.status === PROGRESS_STATUSES.BEHIND_SCHEDULE).length;
  const atRiskCount = targets.filter(t => t.status === PROGRESS_STATUSES.AT_RISK).length;
  const notStartedCount = targets.filter(t => t.status === PROGRESS_STATUSES.NOT_STARTED).length;
  const completedCount = targets.filter(t => t.status === PROGRESS_STATUSES.COMPLETED).length;

  const totalPendingLabSessions = labs.reduce((sum, l) => sum + (l.pendingSessions || 0), 0);
  const pendingAssessmentsCount = assessments.filter(a => a.status === 'Planned' || a.status === 'Overdue').length;

  const upcomingDeadlinesCount = deadlines.filter(d => d.status === 'Upcoming').length;
  const overdueDeadlinesCount = deadlines.filter(d => d.status === 'Overdue').length;

  return {
    department,
    academicYear,
    departmentCompletionPercentage: avgActual,
    deptCompletionPercentage: avgActual,
    overallPlannedCoverage: avgPlanned,
    plannedCoveragePercentage: avgPlanned,
    overallCompletedCoverage: avgActual,
    totalSubjects: totalTargets,
    totalSubjectsMonitored: totalTargets,
    subjectsOnTrack: onTrackCount,
    subjectsBehind: behindScheduleCount,
    subjectsBehindSchedule: behindScheduleCount,
    subjectsAtRisk: atRiskCount,
    subjectsNotStarted: notStartedCount,
    subjectsCompleted: completedCount,
    pendingLabSessions: totalPendingLabSessions,
    pendingInternalAssessments: pendingAssessmentsCount,
    upcomingDeadlines: upcomingDeadlinesCount,
    overdueDeadlines: overdueDeadlinesCount
  };
}

// =========================================================================
// 7. EXPORT CURRICULUM REPORT (XLSX / CSV)
// =========================================================================

export function exportCurriculumProgressReport(department = 'CSE', academicYear = '2026-2027', format = 'xlsx') {
  const targets = getCurriculumTargets({ department, academicYear });

  const reportRows = targets.map(t => ({
    'Department': t.department,
    'Academic Year': t.academicYear,
    'Semester': `Semester ${t.semester}`,
    'Subject Code': sanitizeSpreadsheetValue(t.subjectCode),
    'Subject Name': sanitizeSpreadsheetValue(t.subjectName),
    'Assigned Faculty': sanitizeSpreadsheetValue(t.assignedFaculty),
    'Total Units': t.totalUnits,
    'Planned Coverage %': `${t.plannedPercentage}%`,
    'Actual Coverage %': `${t.actualPercentage}%`,
    'Target Date': t.targetDate,
    'Progress Status': t.status,
    'Last Updated': t.updatedAt,
    'Updated By': sanitizeSpreadsheetValue(t.updatedBy)
  }));

  const filename = `Curriculum_Governance_${department}_${academicYear.replace('-', '_')}_${new Date().toISOString().slice(0, 10)}.${format}`;

  const ws = XLSX.utils.json_to_sheet(reportRows);
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Curriculum_Governance');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  if (typeof window === 'undefined') {
    return {
      success: true,
      rowCount: reportRows.length,
      filename,
      format,
      buffer,
      csvText: csvContent
    };
  }

  if (format === 'csv') {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { success: true, rowCount: reportRows.length, filename, format };
}
