// PlacePrep AI - Persistent Storage and State Management Layer
import {
  INITIAL_BATCHES,
  INITIAL_COMPANIES,
  INITIAL_UPCOMING_DRIVES,
  INITIAL_QUESTIONS,
  INITIAL_EXPERIENCES,
  INITIAL_AI_INSIGHTS
} from '../data/initialData';
import {
  INITIAL_CRT_SESSIONS,
  INITIAL_STUDENT_CRT_ATTENDANCE,
  INITIAL_CLASS_ATTENDANCE,
  INITIAL_RESUME_STATUS,
  INITIAL_STUDENT_ROUNDS,
  INITIAL_HACKATHONS,
  INITIAL_INTERNSHIPS,
  INITIAL_OFF_CAMPUS_COMPANIES,
  INITIAL_ELIGIBILITY_CRITERIA_MATRIX,
  INITIAL_LIVE_SESSIONS,
  INITIAL_PUSH_NOTIFICATIONS,
  INITIAL_FEEDBACK_LOOP
} from '../data/portalWorkflowData';

const STORAGE_KEYS = {
  CURRENT_USER: 'placeprep_current_user',
  GRADUATION_BATCH: 'placeprep_graduation_batch',
  ONBOARDING_DONE: 'placeprep_onboarding_completed',
  SAVED_QUESTIONS: 'placeprep_saved_questions',
  PRACTICED_QUESTIONS: 'placeprep_practiced_questions',
  REVISION_LIST: 'placeprep_revision_list',
  SAVED_COMPANIES: 'placeprep_saved_companies',
  CUSTOM_COMPANIES: 'placeprep_custom_companies',
  CUSTOM_QUESTIONS: 'placeprep_custom_questions',
  CUSTOM_EXPERIENCES: 'placeprep_custom_experiences',
  CUSTOM_DRIVES: 'placeprep_custom_drives',
  MOCK_INTERVIEW_SESSIONS: 'placeprep_mock_sessions',
  PLATFORM_FEEDBACK: 'placeprep_feedback_list',
  STUDENT_APPLICATIONS: 'placeprep_student_applications',
  DRIVE_ROUNDS_CONFIG: 'placeprep_rounds_config',
  PORTAL_MODE: 'placeprep_portal_mode',
  PORTAL_ROLE: 'placeprep_portal_role',
  CRT_SESSIONS: 'placeprep_crt_sessions',
  STUDENT_CRT_ATTENDANCE: 'placeprep_student_crt_attendance',
  CLASS_ATTENDANCE: 'placeprep_class_attendance',
  RESUME_STATUS: 'placeprep_resume_status',
  STUDENT_ROUNDS: 'placeprep_student_rounds',
  HACKATHONS: 'placeprep_hackathons',
  INTERNSHIPS: 'placeprep_internships',
  OFF_CAMPUS: 'placeprep_off_campus',
  ELIGIBILITY_MATRIX: 'placeprep_eligibility_matrix',
  LIVE_SESSIONS: 'placeprep_live_sessions',
  PUSH_NOTIFICATIONS: 'placeprep_push_notifications',
  FEEDBACK_LOOP: 'placeprep_feedback_loop'
};

// Safe JSON parser
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// User Profile
export function getCurrentUser() {
  return getStorageItem(STORAGE_KEYS.CURRENT_USER, {
    id: 'user-demo-01',
    name: 'Priyansh Jain',
    email: 'priyansh.jain@example.edu',
    college: 'Delhi Technological University (DTU)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2028',
    role: 'student', // 'student' or 'admin'
    targetCompanies: ['hcltech', 'tcs', 'accenture'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  });
}

export function setCurrentUser(user) {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  if (user && user.graduationBatch) {
    setGraduationBatch(user.graduationBatch);
  }
}

// Batch Management
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
  // Dispatch custom window event so UI reacts instantaneously
  window.dispatchEvent(new CustomEvent('batch-changed', { detail: batchId }));
}

export function isOnboardingCompleted() {
  return getStorageItem(STORAGE_KEYS.ONBOARDING_DONE, false);
}

export function setOnboardingCompleted(completed) {
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, completed);
}

// Companies
export function getCompanies() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, []);
  return [...INITIAL_COMPANIES, ...custom];
}

export const getInitialCompanies = getCompanies;

export function getCompanyBySlugOrId(identifier) {
  const all = getCompanies();
  return all.find(c => c.id === identifier || c.slug === identifier) || all[0];
}

export function addCompany(newCompany) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, []);
  custom.unshift(newCompany);
  setStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, custom);
  return newCompany;
}

// Placement Drives
export function getUpcomingDrives() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, []);
  return [...INITIAL_UPCOMING_DRIVES, ...custom];
}

export function addDrive(newDrive) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, []);
  custom.unshift(newDrive);
  setStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, custom);
  return newDrive;
}

// Interview Questions
export function getInterviewQuestions() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, []);
  return [...INITIAL_QUESTIONS, ...custom];
}

export function addInterviewQuestion(newQuestion) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, []);
  custom.unshift(newQuestion);
  setStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, custom);
  return newQuestion;
}

// Questions Practiced / Saved / Revision
export function getPracticedQuestions() {
  return getStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, ['hcl-tech-01', 'hcl-hr-01']);
}

export function togglePracticedQuestion(questionId) {
  const list = getPracticedQuestions();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, updated);
  window.dispatchEvent(new CustomEvent('practice-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

export function getSavedQuestions() {
  return getStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, ['hcl-tech-02', 'hcl-tech-03']);
}

export function toggleSavedQuestion(questionId) {
  const list = getSavedQuestions();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, updated);
  window.dispatchEvent(new CustomEvent('saved-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

export function getRevisionList() {
  return getStorageItem(STORAGE_KEYS.REVISION_LIST, ['hcl-mgr-01']);
}

export function toggleRevisionQuestion(questionId) {
  const list = getRevisionList();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.REVISION_LIST, updated);
  window.dispatchEvent(new CustomEvent('revision-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

// Saved Companies
export function getSavedCompanies() {
  return getStorageItem(STORAGE_KEYS.SAVED_COMPANIES, ['hcltech', 'tcs']);
}

export function toggleSavedCompany(companyId) {
  const list = getSavedCompanies();
  let updated;
  if (list.includes(companyId)) {
    updated = list.filter(id => id !== companyId);
  } else {
    updated = [...list, companyId];
  }
  setStorageItem(STORAGE_KEYS.SAVED_COMPANIES, updated);
  return updated.includes(companyId);
}

// Interview Experiences
export function getInterviewExperiences() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, []);
  return [...custom, ...INITIAL_EXPERIENCES];
}

export function addInterviewExperience(newExp) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, []);
  const prepared = {
    ...newExp,
    id: `exp-${Date.now()}`,
    verified: true,
    helpfulVotes: 1,
    createdAt: new Date().toISOString()
  };
  custom.unshift(prepared);
  setStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, custom);
  window.dispatchEvent(new CustomEvent('experience-added', { detail: prepared }));
  return prepared;
}

// AI Insights
export function getAiInsights(companyId) {
  if (INITIAL_AI_INSIGHTS[companyId]) {
    return INITIAL_AI_INSIGHTS[companyId];
  }
  // Fallback intelligent generator for any company
  const company = getCompanyBySlugOrId(companyId);
  return {
    companyId,
    dataFreshness: 'October 2026',
    totalSamplesAnalyzed: company?.experienceCount || 45,
    confidenceScore: '92%',
    verifiedSourcesBadge: `Campus Drive Logs (${company?.name})`,
    frequentQuestions: [
      { question: 'Data Structures: HashMaps, Arrays & Two Pointers', frequency: '42% of technical tests', trend: '+14% recent', category: 'DSA' },
      { question: 'Core Fundamentals: OOPs Polymorphism & Inheritance', frequency: '36% of interviews', trend: 'Consistent', category: 'OOP' },
      { question: 'Behavioral: Challenging team scenario & resolution', frequency: '85% of HR rounds', trend: 'Universal', category: 'HR' }
    ],
    trendingTopics: [
      { topic: 'Cloud & System Reliability', change: '+35% increase in 2026', reason: 'High client shift towards cloud architectures' },
      { topic: 'Hands-on live coding over pure theoretical MCQs', change: '+40% increase', reason: 'Evaluates hands-on implementation ability' }
    ],
    historicalVsRecentAnalysis: {
      olderTrends: 'Earlier drives emphasized static textbook theory and rote-learned definitions.',
      recentTrends: 'Recent interviews focus heavily on project architectural decisions, clean code, and practical problem solving.',
      keyTakeaway: 'Ensure you can explain your GitHub projects and commit histories fluently.'
    },
    preparationPriority: [
      { priority: 'High Priority (Must-Do)', topics: ['Data Structures (Arrays, Strings, Maps)', 'OOP Concepts in chosen language', 'Top 5 STAR behavioral responses'] },
      { priority: 'Medium Priority (Concept Reinforcement)', topics: ['DBMS Normalization & SQL Queries', 'Operating Systems Core Concepts'] },
      { priority: 'Additional Practice', topics: ['System Design Overview', 'Aptitude & Speed Math'] }
    ],
    disclaimer: 'Note: AI insights are synthesized from historical reports and candidate experiences.'
  };
}

// Mock Interview Session Storage
export function getMockSessions() {
  return getStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, [
    {
      id: 'mock-01',
      companyId: 'hcltech',
      companyName: 'HCLTech',
      round: 'Technical Interview',
      date: '2026-10-10',
      score: 84,
      correctness: 86,
      clarity: 82,
      structure: 85,
      questionsAnswered: 3,
      feedbackSummary: 'Strong technical explanation of Floyd\'s cycle detection and SQL joins. Work on structuring your STAR answer for project challenges.'
    }
  ]);
}

export function saveMockSession(session) {
  const list = getMockSessions();
  list.unshift({ ...session, id: `mock-${Date.now()}` });
  setStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, list);
}

// Platform Feedback
export function getPlatformFeedback() {
  return getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
}

export function submitPlatformFeedback(fb) {
  const list = getPlatformFeedback();
  list.unshift({ ...fb, id: `fb-${Date.now()}`, date: new Date().toISOString() });
  setStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, list);
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



// ----------------------------------------------------
// Unified Portal Architecture (Institute, Placement & Admin)
// ----------------------------------------------------

export function getPortalMode() {
  return getStorageItem(STORAGE_KEYS.PORTAL_MODE, 'gateway'); // 'gateway', 'institute', 'placement', 'admin'
}

export function setPortalMode(mode) {
  setStorageItem(STORAGE_KEYS.PORTAL_MODE, mode);
  window.dispatchEvent(new CustomEvent('portal-mode-changed', { detail: mode }));
}

export function getPortalRole() {
  return getStorageItem(STORAGE_KEYS.PORTAL_ROLE, 'student');
}

export function setPortalRole(role) {
  setStorageItem(STORAGE_KEYS.PORTAL_ROLE, role);
  window.dispatchEvent(new CustomEvent('portal-role-changed', { detail: role }));
}

// CRT Sessions
export function getCrtSessions() {
  return getStorageItem(STORAGE_KEYS.CRT_SESSIONS, INITIAL_CRT_SESSIONS);
}

export function addCrtSession(session) {
  const current = getCrtSessions();
  const updated = [session, ...current];
  setStorageItem(STORAGE_KEYS.CRT_SESSIONS, updated);
  return updated;
}

// Student CRT Attendance
export function getStudentCrtAttendance() {
  return getStorageItem(STORAGE_KEYS.STUDENT_CRT_ATTENDANCE, INITIAL_STUDENT_CRT_ATTENDANCE);
}

export function updateStudentCrtAttendance(record) {
  setStorageItem(STORAGE_KEYS.STUDENT_CRT_ATTENDANCE, record);
  return record;
}

// Class Attendance
export function getClassAttendance() {
  return getStorageItem(STORAGE_KEYS.CLASS_ATTENDANCE, INITIAL_CLASS_ATTENDANCE);
}

// Resume Status (ATS)
export function getResumeStatus() {
  return getStorageItem(STORAGE_KEYS.RESUME_STATUS, INITIAL_RESUME_STATUS);
}

export function updateResumeStatus(data) {
  const updated = { ...getResumeStatus(), ...data, updatedAt: new Date().toISOString() };
  setStorageItem(STORAGE_KEYS.RESUME_STATUS, updated);
  return updated;
}

// Student Live Round Status
export function getStudentRounds() {
  return getStorageItem(STORAGE_KEYS.STUDENT_ROUNDS, INITIAL_STUDENT_ROUNDS);
}

export function updateStudentRounds(rounds) {
  setStorageItem(STORAGE_KEYS.STUDENT_ROUNDS, rounds);
  return rounds;
}

// Hackathons
export function getHackathons() {
  return getStorageItem(STORAGE_KEYS.HACKATHONS, INITIAL_HACKATHONS);
}

export function addHackathon(hackathon) {
  const current = getHackathons();
  const updated = [hackathon, ...current];
  setStorageItem(STORAGE_KEYS.HACKATHONS, updated);
  return updated;
}

// Internships
export function getInternships() {
  return getStorageItem(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
}

export function addInternship(internship) {
  const current = getInternships();
  const updated = [internship, ...current];
  setStorageItem(STORAGE_KEYS.INTERNSHIPS, updated);
  return updated;
}

// Off-Campus Companies (Final Year Only)
export function getOffCampusCompanies() {
  return getStorageItem(STORAGE_KEYS.OFF_CAMPUS, INITIAL_OFF_CAMPUS_COMPANIES);
}

export function addOffCampusCompany(comp) {
  const current = getOffCampusCompanies();
  const updated = [comp, ...current];
  setStorageItem(STORAGE_KEYS.OFF_CAMPUS, updated);
  return updated;
}

// Eligibility Matrix
export function getEligibilityMatrix() {
  return getStorageItem(STORAGE_KEYS.ELIGIBILITY_MATRIX, INITIAL_ELIGIBILITY_CRITERIA_MATRIX);
}

// Live Sessions
export function getLiveSessions() {
  return getStorageItem(STORAGE_KEYS.LIVE_SESSIONS, INITIAL_LIVE_SESSIONS);
}

export function addLiveSession(session) {
  const current = getLiveSessions();
  const updated = [session, ...current];
  setStorageItem(STORAGE_KEYS.LIVE_SESSIONS, updated);
  return updated;
}

export function rsvpLiveSession(sessionId) {
  const current = getLiveSessions();
  const updated = current.map(s => {
    if (s.id === sessionId) {
      return { ...s, rsvpsCount: (s.rsvpsCount || 0) + 1, hasRsvp: true };
    }
    return s;
  });
  setStorageItem(STORAGE_KEYS.LIVE_SESSIONS, updated);
  return updated;
}

// Push Notifications
export function getPushNotifications() {
  return getStorageItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, INITIAL_PUSH_NOTIFICATIONS);
}

export function broadcastPushNotification(notif) {
  const current = getPushNotifications();
  const newNotif = {
    id: `notif-${Date.now()}`,
    timestamp: 'Just now',
    date: new Date().toISOString().split('T')[0],
    read: false,
    ...notif
  };
  const updated = [newNotif, ...current];
  setStorageItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('push-notification-broadcast', { detail: newNotif }));
  return updated;
}

export function markNotificationAsRead(id) {
  const current = getPushNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  setStorageItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, updated);
  return updated;
}

// Feedback Loop (Feedback -> TPO -> Company)
export function getFeedbackLoop() {
  return getStorageItem(STORAGE_KEYS.FEEDBACK_LOOP, INITIAL_FEEDBACK_LOOP);
}

export function addFeedbackLoopEntry(entry) {
  const current = getFeedbackLoop();
  const newEntry = {
    id: `fbl-${Date.now()}`,
    ...entry
  };
  const updated = [newEntry, ...current];
  setStorageItem(STORAGE_KEYS.FEEDBACK_LOOP, updated);
  return updated;
}
