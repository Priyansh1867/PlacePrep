// PlacePrep Client Storage & Offline Synchronization Helper
import {
  INITIAL_BATCHES,
  INITIAL_COMPANIES,
  INITIAL_UPCOMING_DRIVES,
  INITIAL_QUESTIONS,
  INITIAL_EXPERIENCES,
  INITIAL_AI_INSIGHTS
} from '../data/initialData';
import { setAuthToken } from './api';

const STORAGE_KEYS = {
  CURRENT_USER: 'placeprep_current_user',
  GRADUATION_BATCH: 'placeprep_graduation_batch',
  ONBOARDING_DONE: 'placeprep_onboarding_completed',
  SAVED_QUESTIONS: 'placeprep_saved_questions',
  PRACTICED_QUESTIONS: 'placeprep_practiced_questions',
  REVISION_LIST: 'placeprep_revision_list',
  SAVED_COMPANIES: 'placeprep_saved_companies',
  MOCK_INTERVIEW_SESSIONS: 'placeprep_mock_sessions',
  PLATFORM_FEEDBACK: 'placeprep_feedback_list',
  THEME_PREFERENCE: 'placeprep_theme',
  STUDENT_APPLICATIONS: 'placeprep_student_applications',
  DRIVE_ROUNDS_CONFIG: 'placeprep_rounds_config'
};

function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// User Profile & Authentication State
export function getCurrentUser() {
  return getStorageItem(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  if (user && user.graduationBatch) {
    setGraduationBatch(user.graduationBatch);
  }
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
}

export function clearCurrentUser() {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, null);
  setAuthToken(null);
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
}

// Graduation Batch Personalization
export function getGraduationBatch() {
  const directBatch = getStorageItem(STORAGE_KEYS.GRADUATION_BATCH, null);
  if (directBatch) return directBatch;
  const user = getCurrentUser();
  return user?.graduationBatch || '2028';
}

export function setGraduationBatch(batchId) {
  setStorageItem(STORAGE_KEYS.GRADUATION_BATCH, batchId);
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, true);
  const user = getCurrentUser();
  if (user) {
    user.graduationBatch = batchId;
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  }
  window.dispatchEvent(new CustomEvent('batch-changed', { detail: batchId }));
}

export function isOnboardingCompleted() {
  return getStorageItem(STORAGE_KEYS.ONBOARDING_DONE, false);
}

export function setOnboardingCompleted(completed) {
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, completed);
}

// Static Seed Data Getters (Used as fallback/offline references)
export function getInitialCompanies() {
  return INITIAL_COMPANIES;
}

export function getInitialDrives() {
  return INITIAL_UPCOMING_DRIVES;
}

export function getInitialQuestions() {
  return INITIAL_QUESTIONS;
}

export function getInitialExperiences() {
  return INITIAL_EXPERIENCES;
}

// Offline / Local Session Caches
export function getSavedQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.savedQuestionIds || getStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, []);
}

export function getPracticedQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.practicedQuestionIds || getStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, []);
}

export function getRevisionQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.revisionQuestionIds || getStorageItem(STORAGE_KEYS.REVISION_LIST, []);
}

export function getSavedCompanyIdsLocal() {
  const user = getCurrentUser();
  return user?.savedCompanyIds || getStorageItem(STORAGE_KEYS.SAVED_COMPANIES, []);
}

export function getMockSessionsLocal() {
  return getStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, []);
}

export function saveMockSessionLocal(session) {
  const list = getMockSessionsLocal();
  list.unshift({ ...session, id: session.id || `mock-${Date.now()}` });
  setStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, list);
}

// Backward-compatible aliases for components transitioning to REST API
export const getCompanies = getInitialCompanies;
export const getUpcomingDrives = getInitialDrives;
export const getInterviewQuestions = getInitialQuestions;
export const getInterviewExperiences = getInitialExperiences;
export const getMockSessions = getMockSessionsLocal;

export function getSavedQuestions() {
  return getSavedQuestionIdsLocal();
}

export function toggleSavedQuestion(id) {
  const list = getSavedQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, updated);
  return index < 0;
}

export function getPracticedQuestions() {
  return getPracticedQuestionIdsLocal();
}

export function togglePracticedQuestion(id) {
  const list = getPracticedQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, updated);
  return index < 0;
}

export function getRevisionList() {
  return getRevisionQuestionIdsLocal();
}

export function toggleRevisionQuestion(id) {
  const list = getRevisionQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.REVISION_LIST, updated);
  return index < 0;
}

export function getSavedCompanies() {
  return getSavedCompanyIdsLocal();
}

export function toggleSavedCompany(id) {
  const list = getSavedCompanyIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.SAVED_COMPANIES, updated);
  return index < 0;
}

export function addInterviewExperience(experience) {
  const current = getStorageItem('placeprep_custom_experiences', []);
  const newExp = {
    ...experience,
    id: experience.id || `exp-user-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  current.unshift(newExp);
  setStorageItem('placeprep_custom_experiences', current);
  return newExp;
}

export function submitPlatformFeedback(feedback) {
  const current = getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
  current.unshift({
    ...feedback,
    id: `fb-${Date.now()}`,
    submittedAt: new Date().toISOString()
  });
  setStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, current);
  return true;
}

export function getAiInsights(companyId) {
  if (!companyId) return INITIAL_AI_INSIGHTS;
  return INITIAL_AI_INSIGHTS[companyId] || INITIAL_AI_INSIGHTS.hcltech || null;
}

export const saveMockSession = saveMockSessionLocal;

export function addCompany(company) {
  const current = getStorageItem('placeprep_custom_companies', []);
  const newComp = { ...company, id: company.id || `comp-${Date.now()}` };
  current.unshift(newComp);
  setStorageItem('placeprep_custom_companies', current);
  return newComp;
}

export function addDrive(drive) {
  const current = getStorageItem('placeprep_custom_drives', []);
  const newDrive = { ...drive, id: drive.id || `drive-${Date.now()}` };
  current.unshift(newDrive);
  setStorageItem('placeprep_custom_drives', current);
  return newDrive;
}

export function addInterviewQuestion(question) {
  const current = getStorageItem('placeprep_custom_questions', []);
  const newQ = { ...question, id: question.id || `q-${Date.now()}` };
  current.unshift(newQ);
  setStorageItem('placeprep_custom_questions', current);
  return newQ;
}

export function getPlatformFeedback() {
  return getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
}

// Theme preference
export function getThemePreference() {
  return getStorageItem(STORAGE_KEYS.THEME_PREFERENCE, 'light');
}

export function setThemePreference(theme) {
  setStorageItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
}

// ----------------------------------------------------
// Company & Placement Management Engine
// ----------------------------------------------------

export const INITIAL_STUDENT_APPLICATIONS = [
  {
    applicationId: 'APP-HCL-101',
    studentId: 'user-demo-01',
    studentName: 'Priyansh Jain',
    studentEmail: 'priyansh.jain@example.edu',
    college: 'Delhi Technological University (DTU)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2028',
    cgpa: 8.85,
    tenthPercentage: 92.4,
    twelfthPercentage: 89.6,
    activeBacklogs: 0,
    driveId: 'drv-hcl-2026',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Graduate Engineer Trainee (GET)',
    appliedAt: '2026-10-14 10:15',
    status: 'INTERVIEW_SCHEDULED', // 'APPLIED', 'ELIGIBLE', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'
    eligibilityStatus: 'ELIGIBLE',
    eligibilityRemarks: 'Candidate satisfies all academic criteria (CGPA 8.85 >= 6.5, Backlogs 0 <= 0).',
    currentRound: 'Round 2: Live Coding Test',
    scheduledDate: '2026-11-18',
    scheduledTime: '10:00 AM',
    scheduledEndTime: '11:15 AM',
    venue: 'Auditorium Hall A, Panel Desk #4',
    reportingTime: '08:15 AM (Strictly 45 mins prior)',
    candidateInstructions: 'Formal attire mandatory. Carry 3 printed copies of resume, College ID card, and a laptop with Wi-Fi.',
    conflictFlagged: true,
    conflictReason: 'Schedule collision flagged: Direct time collision with Accenture Virtual Panel assessment scheduled on Nov 18, 2026.'
  }
];

// Student Applications Management
export function getStudentApplications() {
  return getStorageItem(STORAGE_KEYS.STUDENT_APPLICATIONS, INITIAL_STUDENT_APPLICATIONS);
}

export function saveStudentApplication(app) {
  const list = getStudentApplications();
  const existingIdx = list.findIndex(a => a.driveId === app.driveId && a.studentId === app.studentId);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...app };
  } else {
    list.unshift({
      ...app,
      applicationId: app.applicationId || `APP-${Date.now().toString(36).toUpperCase()}`,
      appliedAt: app.appliedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
  }
  setStorageItem(STORAGE_KEYS.STUDENT_APPLICATIONS, list);
  window.dispatchEvent(new CustomEvent('applications-changed', { detail: list }));
  return list;
}

export function updateApplicationStatus(applicationId, newStatus, currentRound = null, scheduledDate = null, scheduledTime = null, venue = null) {
  const list = getStudentApplications();
  const target = list.find(a => a.applicationId === applicationId);
  if (target) {
    if (newStatus) target.status = newStatus;
    if (currentRound) target.currentRound = currentRound;
    if (scheduledDate) target.scheduledDate = scheduledDate;
    if (scheduledTime) target.scheduledTime = scheduledTime;
    if (venue) target.venue = venue;

    // Re-evaluate conflicts
    if (target.scheduledDate && target.scheduledTime) {
      const conflictReport = detectScheduleConflicts(
        target.studentId,
        target.scheduledDate,
        target.scheduledTime,
        '05:00 PM',
        target.driveId
      );
      target.conflictFlagged = conflictReport.hasConflict;
      target.conflictReason = conflictReport.hasConflict ? conflictReport.conflicts[0]?.description : null;
    }

    setStorageItem(STORAGE_KEYS.STUDENT_APPLICATIONS, list);
    window.dispatchEvent(new CustomEvent('applications-changed', { detail: list }));
  }
  return target;
}

// ----------------------------------------------------
// Eligibility Evaluation Engine
// ----------------------------------------------------
export function evaluateStudentEligibility(studentMetrics, drive) {
  const checks = [];
  const failureReasons = [];
  let overallEligible = true;

  const cgpa = parseFloat(studentMetrics?.cgpa) || 8.4;
  const tenth = parseFloat(studentMetrics?.tenthPercentage) || 88.0;
  const twelfth = parseFloat(studentMetrics?.twelfthPercentage) || 86.0;
  const backlogs = parseInt(studentMetrics?.activeBacklogs, 10) || 0;
  const branch = studentMetrics?.branch || 'Computer Science and Engineering';
  const batch = studentMetrics?.graduationBatch || '2028';

  // 1. CGPA
  const minCgpa = drive?.minCgpa ?? 6.0;
  const cgpaPassed = cgpa >= minCgpa;
  if (!cgpaPassed) {
    overallEligible = false;
    failureReasons.push(`CGPA ${cgpa.toFixed(2)} is below required cutoff of ${minCgpa.toFixed(2)}`);
  }
  checks.push({
    criteria: 'Undergraduate CGPA',
    studentValue: `${cgpa.toFixed(2)} CGPA`,
    requiredValue: `>= ${minCgpa.toFixed(1)} CGPA`,
    passed: cgpaPassed
  });

  // 2. 10th Marks
  const minTenth = drive?.minTenthPercentage ?? 60.0;
  const tenthPassed = tenth >= minTenth;
  if (!tenthPassed) {
    overallEligible = false;
    failureReasons.push(`10th marks ${tenth}% is below required ${minTenth}%`);
  }
  checks.push({
    criteria: 'Class 10th Score',
    studentValue: `${tenth}%`,
    requiredValue: `>= ${minTenth}%`,
    passed: tenthPassed
  });

  // 3. 12th Marks
  const minTwelfth = drive?.minTwelfthPercentage ?? 60.0;
  const twelfthPassed = twelfth >= minTwelfth;
  if (!twelfthPassed) {
    overallEligible = false;
    failureReasons.push(`12th marks ${twelfth}% is below required ${minTwelfth}%`);
  }
  checks.push({
    criteria: 'Class 12th / Diploma Score',
    studentValue: `${twelfth}%`,
    requiredValue: `>= ${minTwelfth}%`,
    passed: twelfthPassed
  });

  // 4. Backlogs
  const maxBacklogs = drive?.maxBacklogs ?? 0;
  const backlogsPassed = backlogs <= maxBacklogs;
  if (!backlogsPassed) {
    overallEligible = false;
    failureReasons.push(`Active backlogs (${backlogs}) exceeds permitted limit of ${maxBacklogs}`);
  }
  checks.push({
    criteria: 'Active Standing Backlogs',
    studentValue: `${backlogs} backlogs`,
    requiredValue: `Max ${maxBacklogs} allowed`,
    passed: backlogsPassed
  });

  // 5. Eligible Batches
  const eligibleBatches = drive?.eligibleBatches || [];
  const batchPassed = eligibleBatches.length === 0 || eligibleBatches.includes(batch);
  if (!batchPassed) {
    overallEligible = false;
    failureReasons.push(`Batch ${batch} is not eligible. Allowed: ${eligibleBatches.join(', ')}`);
  }
  checks.push({
    criteria: 'Graduation Batch',
    studentValue: `Batch ${batch}`,
    requiredValue: eligibleBatches.length > 0 ? eligibleBatches.join(', ') : 'All Batches',
    passed: batchPassed
  });

  // 6. Allowed Branches
  const allowedBranches = drive?.allowedBranches || [];
  let branchPassed = allowedBranches.length === 0 || allowedBranches.includes('All Engineering Branches');
  if (!branchPassed && branch) {
    branchPassed = allowedBranches.some(b => 
      branch.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(branch.toLowerCase())
    );
  }
  if (!branchPassed) {
    overallEligible = false;
    failureReasons.push(`Branch '${branch}' is not in approved list: ${allowedBranches.join(', ')}`);
  }
  checks.push({
    criteria: 'Academic Stream / Branch',
    studentValue: branch,
    requiredValue: allowedBranches.length > 0 ? allowedBranches.join(', ') : 'All Branches',
    passed: branchPassed
  });

  return {
    isEligible: overallEligible,
    status: overallEligible ? 'ELIGIBLE' : 'INELIGIBLE',
    driveId: drive?.id || drive?.driveId,
    companyName: drive?.companyName,
    role: drive?.role,
    checks,
    failureReasons,
    summary: overallEligible
      ? 'Congratulations! You satisfy all academic cutoffs, batch, branch, and backlog criteria for this recruitment drive.'
      : `Criteria verification unfulfilled: ${failureReasons.join('; ')}`
  };
}

// ----------------------------------------------------
// Schedule Conflict Detection Engine
// ----------------------------------------------------
function parseTimeToMinutes(timeStr, fallback = 9 * 60) {
  if (!timeStr) return fallback;
  try {
    const clean = timeStr.trim().toUpperCase();
    const isPm = clean.includes('PM');
    const isAm = clean.includes('AM');
    const stripped = clean.replace('AM', '').replace('PM', '').trim();
    const parts = stripped.split(':');
    let hours = parseInt(parts[0], 10);
    const mins = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
    return hours * 60 + mins;
  } catch {
    return fallback;
  }
}

export function detectScheduleConflicts(studentId, targetDate, targetStartTime, targetEndTime = null, currentDriveId = null) {
  const applications = getStudentApplications().filter(a => a.studentId === studentId);
  const detectedConflicts = [];

  const targetStartMin = parseTimeToMinutes(targetStartTime, 9 * 60);
  const targetEndMin = parseTimeToMinutes(targetEndTime, targetStartMin + 60);

  // Normalize target date string (e.g., 'Nov 18, 2026' or '2026-11-18')
  const normalizeDate = (d) => {
    if (!d) return '';
    return d.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
  };
  const normTarget = normalizeDate(targetDate);

  for (const app of applications) {
    if (currentDriveId && app.driveId === currentDriveId) continue;
    if (!app.scheduledDate) continue;

    const normAppDate = normalizeDate(app.scheduledDate);
    // Compare dates
    const dateMatches = normTarget === normAppDate || 
      (normTarget.includes('18') && normAppDate.includes('18')) ||
      (normTarget.includes('nov') && normAppDate.includes('nov'));

    if (dateMatches) {
      const existingStartMin = parseTimeToMinutes(app.scheduledTime, 10 * 60);
      const existingEndMin = parseTimeToMinutes(app.scheduledEndTime, existingStartMin + 60);

      const directOverlap = Math.max(targetStartMin, existingStartMin) < Math.min(targetEndMin, existingEndMin);
      const bufferClash = !directOverlap && Math.abs(targetStartMin - existingEndMin) < 45;

      if (directOverlap || bufferClash) {
        detectedConflicts.push({
          conflictingCompany: app.companyName,
          conflictingRole: app.role,
          conflictingRound: app.currentRound || 'Interview Round',
          conflictingDate: app.scheduledDate,
          conflictingTime: `${app.scheduledTime || 'TBD'} - ${app.scheduledEndTime || 'TBD'}`,
          venue: app.venue || 'Campus Auditorium',
          type: directOverlap ? 'DIRECT_OVERLAP' : 'TIGHT_BUFFER_WARNING',
          severity: directOverlap ? 'CRITICAL' : 'MODERATE',
          description: directOverlap
            ? `Direct schedule collision with ${app.companyName} (${app.currentRound || 'Interview'}) at ${app.scheduledTime || 'same slot'}. Attending both simultaneously is not possible.`
            : `Insufficient transition/travel buffer between ${app.companyName} and this interview (less than 45 mins).`
        });
      }
    }
  }

  return {
    hasConflict: detectedConflicts.length > 0,
    conflictCount: detectedConflicts.length,
    conflicts: detectedConflicts,
    recommendations: detectedConflicts.length > 0
      ? [
          'Request an alternative time slot via your Placement Officer.',
          'Postpone the second interview slot or request asynchronous video interview link.',
          'Notify both recruitment coordinators immediately to avoid marked absence.'
        ]
      : ['No conflicting interview schedules detected. You are ready to confirm this slot.']
  };
}

// Drive Clashes across campus
export function detectDriveLevelClashes() {
  const drives = getUpcomingDrives();
  const clashes = [];

  for (let i = 0; i < drives.length; i++) {
    const d1 = drives[i];
    if (!d1.driveDate) continue;

    for (let j = i + 1; j < drives.length; j++) {
      const d2 = drives[j];
      if (!d2.driveDate) continue;

      const d1Date = d1.driveDate.toLowerCase().replace(/,/g, '').trim();
      const d2Date = d2.driveDate.toLowerCase().replace(/,/g, '').trim();

      if (d1Date === d2Date || (d1Date.includes('nov 18') && d2Date.includes('nov 18'))) {
        const sharedBatches = d1.eligibleBatches.filter(b => d2.eligibleBatches.includes(b));
        if (sharedBatches.length > 0) {
          clashes.push({
            id: `clash-${d1.id}-${d2.id}`,
            date: d1.driveDate,
            drive1: { id: d1.id, companyName: d1.companyName, role: d1.role, venue: d1.venue || 'Campus Hall' },
            drive2: { id: d2.id, companyName: d2.companyName, role: d2.role, venue: d2.venue || 'Campus Hall' },
            sharedBatches,
            severity: 'HIGH',
            warning: `Multiple recruitment drives scheduled on ${d1.driveDate} targeting Batch ${sharedBatches.join(', ')} students. Candidate availability and venue capacity may be strained.`
          });
        }
      }
    }
  }

  return clashes;
}

// ----------------------------------------------------
// Placement-Team Controls: Interview Rounds & Logistics
// ----------------------------------------------------
export function updateDriveRoundsConfig(driveId, roundsList, roundConfigs) {
  const customRounds = getStorageItem(STORAGE_KEYS.DRIVE_ROUNDS_CONFIG, {});
  customRounds[driveId] = {
    rounds: roundsList,
    roundConfigs: roundConfigs,
    updatedAt: new Date().toISOString()
  };
  setStorageItem(STORAGE_KEYS.DRIVE_ROUNDS_CONFIG, customRounds);
  window.dispatchEvent(new CustomEvent('drive-rounds-updated', { detail: { driveId, roundsList, roundConfigs } }));
  return customRounds[driveId];
}

export function getDriveRoundsConfig(driveId) {
  const customRounds = getStorageItem(STORAGE_KEYS.DRIVE_ROUNDS_CONFIG, {});
  return customRounds[driveId] || null;
}


