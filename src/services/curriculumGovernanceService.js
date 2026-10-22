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
const SEED_TARGETS = [
  {
    id: 'tgt-cse-6-cs306',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning & Pattern Recognition',
    assignedFaculty: 'Dr. Neha Sharma',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-15',
    plannedPercentage: 75,
    actualPercentage: 60, // 3/5 units = 60% (Behind schedule vs planned 75%)
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE,
    units: [
      { unitNumber: 1, title: 'Introduction & Supervised Learning (Linear Regression, Logistic)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Classification Models & Decision Trees, Random Forests', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Unsupervised Learning (K-Means, PCA, Hierarchical Clustering)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Neural Networks & Deep Learning Foundations', status: 'In Progress', topicsCount: 6, completedTopics: 0 },
      { unitNumber: 5, title: 'Model Evaluation, Bias-Variance, Ensemble Methods', status: 'Not Started', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-21 16:30',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-6-cs307',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS307',
    subjectName: 'Information Security & Cryptography',
    assignedFaculty: 'Prof. Alok Verma',
    facultyDesignation: 'Head of Department (HOD)',
    totalUnits: 5,
    targetPercentage: 85,
    targetDate: '2026-11-20',
    plannedPercentage: 80,
    actualPercentage: 80, // 4/5 units = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Classical Encryption, Symmetric Ciphers (AES/DES)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Asymmetric Cryptography, RSA, Diffie-Hellman Key Exchange', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Cryptographic Hash Functions, SHA-256, Digital Signatures', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Network Security Protocols (IPSec, SSL/TLS, Kerberos)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'Intrusion Detection, Firewalls & Zero Trust Architecture', status: 'In Progress', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-22 11:15',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-6-cs308',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS308',
    subjectName: 'Cloud Computing & Microservices',
    assignedFaculty: 'Dr. Radhika Sen',
    facultyDesignation: 'Assistant Professor & Cloud Lead',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-18',
    plannedPercentage: 75,
    actualPercentage: 80, // 4/5 units = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Cloud Architecture Models (IaaS, PaaS, SaaS)', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 2, title: 'Virtualization & Containerization with Docker', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Microservices Design Patterns & API Gateways', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Kubernetes Orchestration & Service Mesh', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'Cloud Security, Serverless & AWS/GCP Deployment', status: 'In Progress', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-20 14:00',
    updatedBy: 'Dr. Radhika Sen'
  },
  {
    id: 'tgt-cse-6-cs309',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS309',
    subjectName: 'Professional Elective I (Big Data Analytics)',
    assignedFaculty: 'Prof. Suresh Gupta',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 75,
    targetDate: '2026-11-10',
    plannedPercentage: 70,
    actualPercentage: 60, // 3/5 = 60% (At Risk)
    status: PROGRESS_STATUSES.AT_RISK,
    units: [
      { unitNumber: 1, title: 'Big Data Ecosystem & HDFS Architecture', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 2, title: 'MapReduce Paradigm & YARN Resource Management', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 3, title: 'Apache Spark In-Memory Analytics & RDDs', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'NoSQL Databases (Cassandra, MongoDB) & Sharding', status: 'In Progress', topicsCount: 5, completedTopics: 0 },
      { unitNumber: 5, title: 'Stream Processing with Apache Kafka', status: 'Not Started', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-19 18:20',
    updatedBy: 'Prof. Suresh Gupta'
  },
  {
    id: 'tgt-cse-4-cs206',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 4,
    subjectCode: 'CS206',
    subjectName: 'Design and Analysis of Algorithms',
    assignedFaculty: 'Prof. Alok Verma',
    facultyDesignation: 'Head of Department (HOD)',
    totalUnits: 5,
    targetPercentage: 85,
    targetDate: '2026-11-22',
    plannedPercentage: 80,
    actualPercentage: 80, // 4/5 = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Asymptotic Analysis & Recurrences (Master Theorem)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Divide & Conquer, Greedy Strategies (MST, Huffman)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Dynamic Programming (Knapsack, LCS, Matrix Chain)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Graph Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'NP-Completeness, Backtracking & Branch and Bound', status: 'In Progress', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-21 09:45',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-4-cs207',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 4,
    subjectCode: 'CS207',
    subjectName: 'Database Management Systems',
    assignedFaculty: 'Dr. Neha Sharma',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-12',
    plannedPercentage: 80,
    actualPercentage: 60, // 3/5 = 60% (Behind Schedule: 20% gap)
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE,
    units: [
      { unitNumber: 1, title: 'Relational Model, Relational Algebra & Calculus', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Advanced SQL, Views, Triggers & Stored Procedures', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Schema Refinement & Normalization (1NF to BCNF, 4NF)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Transaction Management, ACID Properties & Concurrency (2PL)', status: 'In Progress', topicsCount: 5, completedTopics: 0 },
      { unitNumber: 5, title: 'Indexing, B+ Trees & Database Recovery Techniques', status: 'Not Started', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-18 15:10',
    updatedBy: 'Dr. Neha Sharma'
  }
];

// Seed Laboratory Practical Completion Records
const SEED_LABS = [
  {
    id: 'lab-cse-6-cs310',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS310',
    labName: 'AI & Machine Learning Laboratory',
    assignedFaculty: 'Dr. Neha Sharma',
    totalPlannedSessions: 14,
    completedSessions: 9,
    pendingSessions: 5,
    targetDate: '2026-11-20',
    completionPercentage: 64.3,
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE, // Behind weekly expectation of 11 sessions
    lastSessionDate: '2026-10-15',
    remarks: 'Session 10 rescheduled due to industrial visit conflict. Practical catch-up batch required.'
  },
  {
    id: 'lab-cse-6-cs305',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS305',
    labName: 'Networking and Web Tech Lab',
    assignedFaculty: 'Dr. Radhika Sen',
    totalPlannedSessions: 14,
    completedSessions: 12,
    pendingSessions: 2,
    targetDate: '2026-11-25',
    completionPercentage: 85.7,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-20',
    remarks: 'Microservices containerization exercises completed on private cloud cluster.'
  },
  {
    id: 'lab-cse-4-cs210',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS210',
    labName: 'DBMS & SQL Laboratory',
    assignedFaculty: 'Prof. Suresh Gupta',
    totalPlannedSessions: 14,
    completedSessions: 11,
    pendingSessions: 3,
    targetDate: '2026-11-22',
    completionPercentage: 78.6,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-19',
    remarks: 'PL/SQL procedures and complex join queries evaluated.'
  },
  {
    id: 'lab-cse-4-cs205',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS205',
    labName: 'Data Structures & Algorithms Lab',
    assignedFaculty: 'Prof. Alok Verma',
    totalPlannedSessions: 14,
    completedSessions: 12,
    pendingSessions: 2,
    targetDate: '2026-11-28',
    completionPercentage: 85.7,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-21',
    remarks: 'Graph traversal (Dijkstra) and Dynamic Programming programs verified in lab notebooks.'
  }
];

// Seed Internal Assessment Schedules
const SEED_ASSESSMENTS = [
  {
    id: 'asm-cse-6-mid1',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning',
    assessmentType: 'Mid-Term 1',
    assessmentName: 'Mid-Semester Theory Examination 1',
    plannedDate: '2026-10-14',
    completionDate: '2026-10-14',
    deadline: '2026-10-18',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Completed',
    remarks: 'Evaluated and marks compiled.'
  },
  {
    id: 'asm-cse-6-mid2',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning',
    assessmentType: 'Mid-Term 2',
    assessmentName: 'Mid-Semester Theory Examination 2',
    plannedDate: '2026-11-04',
    completionDate: null,
    deadline: '2026-11-08',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Planned',
    remarks: 'Question paper submitted to HOD office.'
  },
  {
    id: 'asm-cse-6-lab-int',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS310',
    subjectName: 'AI & ML Laboratory',
    assessmentType: 'Practical Internal',
    assessmentName: 'Mid-Semester Lab Viva & Practical Coding',
    plannedDate: '2026-10-17',
    completionDate: null,
    deadline: '2026-10-20',
    maxMarks: 25,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Overdue', // Passed deadline without completion
    remarks: 'Rescheduled viva pending due to faculty training.'
  },
  {
    id: 'asm-cse-4-mid1',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS206',
    subjectName: 'Design and Analysis of Algorithms',
    assessmentType: 'Mid-Term 1',
    assessmentName: 'Mid-Semester Theory Exam 1',
    plannedDate: '2026-10-12',
    completionDate: '2026-10-12',
    deadline: '2026-10-16',
    maxMarks: 30,
    assignedFaculty: 'Prof. Alok Verma',
    status: 'Completed',
    remarks: 'Graded and paper review session conducted.'
  },
  {
    id: 'asm-cse-4-mid2',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS207',
    subjectName: 'Database Management Systems',
    assessmentType: 'Mid-Term 2',
    assessmentName: 'Mid-Semester Theory Exam 2',
    plannedDate: '2026-11-06',
    completionDate: null,
    deadline: '2026-11-10',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Planned',
    remarks: 'Drafting question bank on Normalization and Transactions.'
  }
];

// Seed Academic Deadlines & Milestones
const SEED_DEADLINES = [
  {
    id: 'dl-1',
    department: 'CSE',
    title: 'Mid-Term 1 Marks Submission & Parent Intimation',
    category: 'Internal Assessment',
    targetDate: '2026-10-20',
    status: 'Overdue',
    relatedSubjectCode: 'CS310',
    priority: 'Critical',
    description: 'All faculty must upload mid-term marks to institute portal.'
  },
  {
    id: 'dl-2',
    department: 'CSE',
    title: '75% Theory Syllabus Coverage Cutoff',
    category: 'Syllabus',
    targetDate: '2026-11-15',
    status: 'Upcoming',
    relatedSubjectCode: 'CS306',
    priority: 'High',
    description: 'Mandatory completion of at least 4 units across all 4th and 6th semester theory subjects.'
  },
  {
    id: 'dl-3',
    department: 'CSE',
    title: 'Practical Lab Experiment Sign-off (12 Experiments)',
    category: 'Laboratory',
    targetDate: '2026-11-20',
    status: 'Upcoming',
    relatedSubjectCode: 'CS310',
    priority: 'High',
    description: 'Completion of 12 mandatory lab experiments with student lab records signed.'
  },
  {
    id: 'dl-4',
    department: 'CSE',
    title: 'Department Academic Council Mid-Term Review Meeting',
    category: 'Milestone',
    targetDate: '2026-10-28',
    status: 'Upcoming',
    relatedSubjectCode: 'ALL',
    priority: 'Medium',
    description: 'HOD review with subject coordinators on remedial classes and slow learner support.'
  },
  {
    id: 'dl-5',
    department: 'CSE',
    title: 'Course Outcomes (CO) Attainment Matrix Upload',
    category: 'Milestone',
    targetDate: '2026-10-10',
    status: 'Completed',
    relatedSubjectCode: 'ALL',
    priority: 'Medium',
    description: 'NBA accreditation alignment and CO-PO mapping submission.'
  }
];

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
