// PlacePrep AI - Team 2: Institute Support
// Academic Records Service: Local Persistence, CRUD, Marksheet & Backlog Logic

import {
  INITIAL_STUDENT_RECORDS,
  INITIAL_BACKLOG_RECORDS,
  INITIAL_BRANCHES,
  INITIAL_COURSES,
  BRANCH_SEMESTER_SUBJECTS,
  calculateGradeAndPoints,
  calculateAgeFromDOB
} from '../data/initialAcademicRecords.js';

const STORAGE_KEYS = {
  STUDENTS: 'placeprep_student_academic_records',
  BACKLOGS: 'placeprep_backlog_records',
  CONFIG: 'placeprep_academic_config'
};

// Safe JSON parser and writer
function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * Initialize storage with seed data if empty
 */
export function initializeAcademicRecords() {
  const existingStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!existingStudents) {
    setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENT_RECORDS);
  }
  const existingBacklogs = localStorage.getItem(STORAGE_KEYS.BACKLOGS);
  if (!existingBacklogs) {
    setStorage(STORAGE_KEYS.BACKLOGS, INITIAL_BACKLOG_RECORDS);
  }
}

/**
 * Reset to seed data (useful for demonstration or testing)
 */
export function resetAcademicRecordsToDefault() {
  setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENT_RECORDS);
  setStorage(STORAGE_KEYS.BACKLOGS, INITIAL_BACKLOG_RECORDS);
  return { students: INITIAL_STUDENT_RECORDS, backlogs: INITIAL_BACKLOG_RECORDS };
}

/**
 * Fetch all students
 */
export function getAllStudents() {
  initializeAcademicRecords();
  return getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENT_RECORDS);
}

/**
 * Fetch single student by ID
 */
export function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => s.id === id) || null;
}

/**
 * Fetch all backlogs with optional filter
 */
export function getAllBacklogs(filter = {}) {
  initializeAcademicRecords();
  let backlogs = getStorage(STORAGE_KEYS.BACKLOGS, INITIAL_BACKLOG_RECORDS);
  
  if (filter.status && filter.status !== 'All') {
    backlogs = backlogs.filter(b => b.status === filter.status);
  }
  if (filter.studentId) {
    backlogs = backlogs.filter(b => b.studentId === filter.studentId);
  }
  if (filter.branch && filter.branch !== 'All') {
    backlogs = backlogs.filter(b => b.branch === filter.branch);
  }
  return backlogs;
}

/**
 * Calculate SGPA for a list of subjects
 */
export function calculateSemesterSGPA(subjects) {
  if (!subjects || subjects.length === 0) return null;
  
  let totalCredits = 0;
  let weightedPoints = 0;
  let hasPending = false;
  let hasBacklog = false;

  for (const sub of subjects) {
    if (sub.result === 'Pending' || sub.obtainedMarks === null || sub.obtainedMarks === undefined) {
      hasPending = true;
      continue;
    }
    const credits = Number(sub.credits) || 0;
    const gradePoints = sub.gradePoints !== null && sub.gradePoints !== undefined ? Number(sub.gradePoints) : 0;
    
    totalCredits += credits;
    weightedPoints += credits * gradePoints;
    if (sub.result === 'Fail') {
      hasBacklog = true;
    }
  }

  if (totalCredits === 0) return null;
  const sgpa = Number((weightedPoints / totalCredits).toFixed(2));
  return {
    sgpa,
    totalCredits,
    hasPending,
    hasBacklog,
    resultStatus: hasBacklog ? 'Backlog / Re-appear' : (hasPending ? 'Provisional' : 'Pass')
  };
}

/**
 * Recalculate CGPA across all completed/passed semesters for a student
 */
export function recalculateStudentCGPA(student) {
  if (!student || !student.semesters) return null;
  
  let cumulativeCredits = 0;
  let cumulativeWeightedPoints = 0;
  let completedSemestersCount = 0;

  for (const sem of student.semesters) {
    if (sem.status === 'Completed' && sem.subjects && sem.subjects.length > 0) {
      for (const sub of sem.subjects) {
        if (sub.obtainedMarks !== null && sub.gradePoints !== null && sub.result !== 'Pending') {
          const credits = Number(sub.credits) || 0;
          cumulativeCredits += credits;
          cumulativeWeightedPoints += credits * Number(sub.gradePoints);
        }
      }
      completedSemestersCount++;
    }
  }

  if (cumulativeCredits === 0) return null;
  return Number((cumulativeWeightedPoints / cumulativeCredits).toFixed(2));
}

/**
 * Generate 8 blank or branch-populated semesters for a student
 */
export function generateDefaultSemestersForBranch(branch, currentSemester = 1, admissionYear = '2024') {
  const branchSubjectMap = BRANCH_SEMESTER_SUBJECTS[branch] || BRANCH_SEMESTER_SUBJECTS['Computer Science and Engineering'];
  const startYr = parseInt(admissionYear, 10) || new Date().getFullYear();
  
  const semesters = [];
  for (let s = 1; s <= 8; s++) {
    const yrOffset = Math.floor((s - 1) / 2);
    const semYear = `${startYr + yrOffset}-${startYr + yrOffset + 1}`;
    const standardSubjects = branchSubjectMap[s] || [
      { code: `GEN${s}01`, name: `Core Engineering Subject ${s}.1`, credits: 4, maxMarks: 100 },
      { code: `GEN${s}02`, name: `Core Engineering Subject ${s}.2`, credits: 4, maxMarks: 100 },
      { code: `GEN${s}03`, name: `Specialized Elective ${s}.3`, credits: 3, maxMarks: 100 },
      { code: `GEN${s}04`, name: `Practical Laboratory ${s}.4`, credits: 2, maxMarks: 100 }
    ];

    const isPast = s < currentSemester;
    const isCurrent = s === currentSemester;

    semesters.push({
      semester: s,
      academicYear: semYear,
      status: isPast ? 'Completed' : (isCurrent ? 'In Progress' : 'Pending'),
      sgpa: null,
      cgpa: null,
      maxMarks: standardSubjects.reduce((acc, sub) => acc + (sub.maxMarks || 100), 0),
      obtainedMarks: null,
      resultStatus: isPast ? 'Pass' : 'Pending',
      publicationDate: isPast ? `Semester ${s} Regular Examination` : null,
      subjects: standardSubjects.map(sub => ({
        code: sub.code,
        name: sub.name,
        credits: sub.credits,
        maxMarks: sub.maxMarks || 100,
        obtainedMarks: null,
        grade: '-',
        gradePoints: null,
        result: 'Pending',
        isBacklog: false
      }))
    });
  }
  return semesters;
}

/**
 * Validation function for a student record
 */
export function validateStudentRecord(data, existingStudents = [], isUpdate = false) {
  const errors = {};

  // Student Full Name
  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'Full Name is required';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Full Name must be at least 3 characters';
  }

  // Roll Number
  if (!data.rollNumber || !data.rollNumber.trim()) {
    errors.rollNumber = 'Roll Number is required';
  } else {
    const duplicateRoll = existingStudents.find(
      s => (!isUpdate || s.id !== data.id) && 
      s.rollNumber && 
      s.rollNumber.trim().toLowerCase() === data.rollNumber.trim().toLowerCase()
    );
    if (duplicateRoll) {
      errors.rollNumber = `Roll Number "${data.rollNumber}" already exists for ${duplicateRoll.fullName}`;
    }
  }

  // Registration Number
  if (!data.registrationNumber || !data.registrationNumber.trim()) {
    errors.registrationNumber = 'University Registration Number is required';
  } else {
    const duplicateReg = existingStudents.find(
      s => (!isUpdate || s.id !== data.id) && 
      s.registrationNumber && 
      s.registrationNumber.trim().toLowerCase() === data.registrationNumber.trim().toLowerCase()
    );
    if (duplicateReg) {
      errors.registrationNumber = `Registration Number "${data.registrationNumber}" already exists for ${duplicateReg.fullName}`;
    }
  }

  // College Name
  if (!data.collegeName || !data.collegeName.trim()) {
    errors.collegeName = 'College / Institute Name is required';
  }

  // Course & Branch
  if (!data.course) {
    errors.course = 'Course is required';
  }
  if (!data.branch) {
    errors.branch = 'Branch / Specialization is required';
  }

  // Batch & Year
  if (!data.graduationBatch) {
    errors.graduationBatch = 'Graduation Batch is required';
  }
  if (!data.admissionYear) {
    errors.admissionYear = 'Admission Year is required';
  } else {
    const adm = parseInt(data.admissionYear, 10);
    const grad = parseInt(data.graduationBatch, 10);
    if (grad && adm && grad <= adm) {
      errors.graduationBatch = 'Graduation Year must be after Admission Year';
    }
  }

  // Current Semester
  if (!data.currentSemester || data.currentSemester < 1 || data.currentSemester > 8) {
    errors.currentSemester = 'Current Semester must be between 1 and 8';
  }

  // Admission Type
  if (!data.admissionType) {
    errors.admissionType = 'Admission Type is required';
  }

  // Date of Birth & Age
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of Birth is required';
  } else {
    const age = calculateAgeFromDOB(data.dateOfBirth);
    if (age === '' || age < 14 || age > 65) {
      errors.dateOfBirth = 'Please enter a valid Date of Birth (age between 14 and 65)';
    }
  }

  // Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email Address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  // Phone / Mobile Number
  if (!data.mobileNumber || !data.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile Number is required';
  } else if (!/^(\+?\d{1,4}[ -]?)?\d{10}$/.test(data.mobileNumber.replace(/[\s-]/g, ''))) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number';
  }

  // Current Address
  if (!data.currentAddress || !data.currentAddress.trim()) {
    errors.currentAddress = 'Current Address is required';
  }

  // Class 10 Details
  if (!data.class10Percentage && data.class10Percentage !== 0) {
    errors.class10Percentage = 'Class 10 Percentage is required';
  } else {
    const p10 = Number(data.class10Percentage);
    if (isNaN(p10) || p10 < 30 || p10 > 100) {
      errors.class10Percentage = 'Class 10 Percentage must be between 30% and 100%';
    }
  }

  // Conditional Class 12 / Diploma Validation
  const isLateralOrDiploma = 
    data.admissionType === 'Diploma / Lateral Entry' || 
    (data.course && data.course.toLowerCase().includes('diploma'));

  if (isLateralOrDiploma) {
    // Diploma is required
    if (!data.diplomaPercentage && data.diplomaPercentage !== 0) {
      errors.diplomaPercentage = 'Diploma Percentage/CGPA is required for Lateral Entry students';
    } else {
      const pDip = Number(data.diplomaPercentage);
      if (isNaN(pDip) || pDip < 30 || pDip > 100) {
        errors.diplomaPercentage = 'Diploma Percentage must be between 30% and 100%';
      }
    }
    if (!data.diplomaCollege || !data.diplomaCollege.trim()) {
      errors.diplomaCollege = 'Diploma Institute Name is required';
    }
    if (!data.diplomaSpecialization || !data.diplomaSpecialization.trim()) {
      errors.diplomaSpecialization = 'Diploma Specialization is required';
    }
  } else {
    // Class 12 is required for regular entry
    if (!data.class12Percentage && data.class12Percentage !== 0) {
      errors.class12Percentage = 'Class 12 Percentage is required';
    } else {
      const p12 = Number(data.class12Percentage);
      if (isNaN(p12) || p12 < 30 || p12 > 100) {
        errors.class12Percentage = 'Class 12 Percentage must be between 30% and 100%';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Save (Create or Update) Student Record
 */
export function saveStudent(studentData) {
  const students = getAllStudents();
  const isUpdate = Boolean(studentData.id);

  // Auto-generate ID if new
  let studentId = studentData.id;
  if (!studentId) {
    const yr = studentData.graduationBatch || new Date().getFullYear();
    const count = students.length + 1;
    studentId = `STU-${yr}-${String(count).padStart(3, '0')}`;
  }

  // Auto calculate age
  const calculatedAge = calculateAgeFromDOB(studentData.dateOfBirth);

  const normalized = {
    ...studentData,
    id: studentId,
    age: calculatedAge,
    updatedAt: new Date().toISOString()
  };

  // If semesters not present, generate defaults
  if (!normalized.semesters || normalized.semesters.length === 0) {
    normalized.semesters = generateDefaultSemestersForBranch(
      normalized.branch,
      Number(normalized.currentSemester) || 1,
      normalized.admissionYear
    );
  }

  // Recalculate CGPA
  const cgpa = recalculateStudentCGPA(normalized);
  if (cgpa !== null) {
    normalized.cgpa = cgpa;
  }

  // Validate
  const validation = validateStudentRecord(normalized, students, isUpdate);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  let updatedList;
  if (isUpdate) {
    updatedList = students.map(s => s.id === studentId ? { ...s, ...normalized } : s);
  } else {
    normalized.createdAt = new Date().toISOString();
    updatedList = [normalized, ...students];
  }

  setStorage(STORAGE_KEYS.STUDENTS, updatedList);
  return { success: true, student: normalized };
}

/**
 * Delete a Student and their associated backlogs
 */
export function deleteStudent(studentId) {
  const students = getAllStudents();
  const updatedStudents = students.filter(s => s.id !== studentId);
  setStorage(STORAGE_KEYS.STUDENTS, updatedStudents);

  // Clean backlogs
  const backlogs = getAllBacklogs();
  const updatedBacklogs = backlogs.filter(b => b.studentId !== studentId);
  setStorage(STORAGE_KEYS.BACKLOGS, updatedBacklogs);

  return { success: true };
}

/**
 * Get marksheet for a student and semester
 */
export function getStudentMarksheet(studentId, semesterNumber) {
  const student = getStudentById(studentId);
  if (!student || !student.semesters) return null;
  const sem = student.semesters.find(s => Number(s.semester) === Number(semesterNumber));
  return sem || null;
}

/**
 * Update marks of a subject in a semester, recalculating SGPA and CGPA
 */
export function updateSubjectMarks(studentId, semesterNumber, subjectCode, obtainedMarks) {
  const students = getAllStudents();
  const studentIndex = students.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return { success: false, message: 'Student not found' };

  const student = { ...students[studentIndex] };
  const semIndex = student.semesters.findIndex(s => Number(s.semester) === Number(semesterNumber));
  if (semIndex === -1) return { success: false, message: 'Semester not found' };

  const semester = { ...student.semesters[semIndex] };
  const subjects = [...semester.subjects];
  const subIndex = subjects.findIndex(s => s.code === subjectCode);
  if (subIndex === -1) return { success: false, message: 'Subject not found in this semester' };

  const targetSubject = { ...subjects[subIndex] };
  const numMarks = obtainedMarks === '' || obtainedMarks === null ? null : Number(obtainedMarks);

  if (numMarks !== null && (numMarks < 0 || numMarks > (targetSubject.maxMarks || 100))) {
    return { success: false, message: `Marks must be between 0 and ${targetSubject.maxMarks || 100}` };
  }

  targetSubject.obtainedMarks = numMarks;
  const gradeInfo = calculateGradeAndPoints(numMarks, targetSubject.maxMarks || 100);
  targetSubject.grade = gradeInfo.grade;
  targetSubject.gradePoints = gradeInfo.points;
  targetSubject.result = gradeInfo.result;
  targetSubject.isBacklog = gradeInfo.isBacklog;

  subjects[subIndex] = targetSubject;
  semester.subjects = subjects;

  // Recalculate Semester SGPA
  const sgpaCalc = calculateSemesterSGPA(subjects);
  if (sgpaCalc) {
    semester.sgpa = sgpaCalc.sgpa;
    semester.resultStatus = sgpaCalc.resultStatus;
    semester.obtainedMarks = subjects.reduce((sum, s) => sum + (s.obtainedMarks || 0), 0);
  }

  student.semesters[semIndex] = semester;

  // Recalculate Student Overall CGPA
  const updatedCGPA = recalculateStudentCGPA(student);
  if (updatedCGPA !== null) {
    student.cgpa = updatedCGPA;
  }

  // Synchronize with Backlog Records if grade is F or if it was cleared
  const backlogs = getAllBacklogs();
  let updatedBacklogs = [...backlogs];

  if (gradeInfo.isBacklog) {
    // Ensure active backlog exists
    const existing = updatedBacklogs.find(
      b => b.studentId === studentId && b.subjectCode === subjectCode && b.status === 'Active'
    );
    if (!existing) {
      updatedBacklogs.unshift({
        id: `BKL-${Date.now().toString().slice(-4)}`,
        studentId: student.id,
        studentName: student.fullName,
        rollNumber: student.rollNumber,
        branch: student.branch,
        course: student.course,
        subjectCode: targetSubject.code,
        subjectName: targetSubject.name,
        originalSemester: Number(semesterNumber),
        attemptNumber: 1,
        status: 'Active',
        attemptDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        clearedSemester: null,
        latestResult: `Fail (Marks: ${numMarks}/${targetSubject.maxMarks}, Grade F)`,
        reExamDate: 'Next Examination Session',
        remarks: 'Recorded from Marksheet Entry'
      });
    }
  } else if (gradeInfo.result === 'Pass') {
    // If there was an active backlog for this subject, mark it cleared
    updatedBacklogs = updatedBacklogs.map(b => {
      if (b.studentId === studentId && b.subjectCode === subjectCode && b.status === 'Active') {
        return {
          ...b,
          status: 'Cleared',
          clearedSemester: Number(semesterNumber),
          latestResult: `Pass (Marks: ${numMarks}/${targetSubject.maxMarks}, Grade ${gradeInfo.grade})`,
          remarks: `Cleared on marksheet update (${new Date().toLocaleDateString()})`
        };
      }
      return b;
    });
  }

  // Update active backlogs count on student
  const studentActiveBacklogs = updatedBacklogs.filter(b => b.studentId === studentId && b.status === 'Active');
  student.activeBacklogsCount = studentActiveBacklogs.length;
  student.backlogHistory = updatedBacklogs.filter(b => b.studentId === studentId);

  students[studentIndex] = student;
  setStorage(STORAGE_KEYS.STUDENTS, students);
  setStorage(STORAGE_KEYS.BACKLOGS, updatedBacklogs);

  return { success: true, student, semester };
}

/**
 * Clear a Backlog with re-exam details and sync to semester marksheet
 */
export function clearBacklog(backlogId, resolutionData) {
  const backlogs = getAllBacklogs();
  const backlogIndex = backlogs.findIndex(b => b.id === backlogId);
  if (backlogIndex === -1) return { success: false, message: 'Backlog record not found' };

  const backlog = { ...backlogs[backlogIndex] };
  const obtainedMarks = Number(resolutionData.obtainedMarks);

  if (isNaN(obtainedMarks) || obtainedMarks < 40 || obtainedMarks > 100) {
    return { success: false, message: 'Cleared marks must be a passing score between 40 and 100' };
  }

  const gradeInfo = calculateGradeAndPoints(obtainedMarks, 100);

  backlog.status = 'Cleared';
  backlog.attemptNumber = (backlog.attemptNumber || 1) + 1;
  backlog.clearedSemester = resolutionData.clearedSemester || backlog.originalSemester;
  backlog.reExamDate = resolutionData.reExamDate || new Date().toISOString().slice(0, 10);
  backlog.latestResult = `Pass (Marks: ${obtainedMarks}/100, Grade ${gradeInfo.grade})`;
  backlog.remarks = resolutionData.remarks || `Cleared in Re-examination (${backlog.reExamDate})`;

  backlogs[backlogIndex] = backlog;
  setStorage(STORAGE_KEYS.BACKLOGS, backlogs);

  // Sync to student marksheet
  const updateRes = updateSubjectMarks(
    backlog.studentId,
    backlog.originalSemester,
    backlog.subjectCode,
    obtainedMarks
  );

  return { success: true, backlog, studentUpdate: updateRes };
}

/**
 * Update an existing backlog record
 */
export function updateBacklogRecord(backlogId, patchData) {
  const backlogs = getAllBacklogs();
  const backlogIndex = backlogs.findIndex(b => b.id === backlogId);
  if (backlogIndex === -1) return { success: false, message: 'Backlog record not found' };

  backlogs[backlogIndex] = { ...backlogs[backlogIndex], ...patchData, updatedAt: new Date().toISOString() };
  setStorage(STORAGE_KEYS.BACKLOGS, backlogs);
  return { success: true, backlog: backlogs[backlogIndex] };
}

/**
 * Create a new manual backlog record
 */
export function createBacklogRecord(data) {
  const backlogs = getAllBacklogs();
  const newId = `BKL-${Date.now().toString().slice(-4)}`;
  const record = {
    ...data,
    id: newId,
    status: data.status || 'Active',
    attemptNumber: data.attemptNumber || 1,
    createdAt: new Date().toISOString()
  };
  backlogs.unshift(record);
  setStorage(STORAGE_KEYS.BACKLOGS, backlogs);
  return { success: true, backlog: record };
}

/**
 * Delete a backlog record
 */
export function deleteBacklogRecord(backlogId) {
  const backlogs = getAllBacklogs();
  const filtered = backlogs.filter(b => b.id !== backlogId);
  setStorage(STORAGE_KEYS.BACKLOGS, filtered);
  return { success: true };
}

/**
 * Generate comprehensive dashboard metrics
 */
export function getAcademicDashboardMetrics() {
  const students = getAllStudents();
  const backlogs = getAllBacklogs();

  const totalStudents = students.length;
  const activeBacklogs = backlogs.filter(b => b.status === 'Active');
  const clearedBacklogs = backlogs.filter(b => b.status === 'Cleared');

  // Students with active backlogs
  const studentsWithActiveBacklogs = new Set(activeBacklogs.map(b => b.studentId)).size;
  const backlogFreeStudents = totalStudents - studentsWithActiveBacklogs;

  // Group by Course
  const courseCount = {};
  INITIAL_COURSES.forEach(c => { courseCount[c] = 0; });
  students.forEach(s => {
    courseCount[s.course] = (courseCount[s.course] || 0) + 1;
  });

  // Group by Branch
  const branchCount = {};
  INITIAL_BRANCHES.forEach(b => { branchCount[b] = 0; });
  students.forEach(s => {
    branchCount[s.branch] = (branchCount[s.branch] || 0) + 1;
  });

  // Group by Batch
  const batchCount = {};
  ['2025', '2026', '2027', '2028'].forEach(b => { batchCount[b] = 0; });
  students.forEach(s => {
    batchCount[s.graduationBatch] = (batchCount[s.graduationBatch] || 0) + 1;
  });

  // Semester distribution
  const semesterCount = {};
  for (let sem = 1; sem <= 8; sem++) semesterCount[sem] = 0;
  students.forEach(s => {
    semesterCount[s.currentSemester] = (semesterCount[s.currentSemester] || 0) + 1;
  });

  // Average CGPA
  const studentsWithCGPA = students.filter(s => s.cgpa && !isNaN(s.cgpa));
  const avgCGPA = studentsWithCGPA.length > 0
    ? (studentsWithCGPA.reduce((sum, s) => sum + Number(s.cgpa), 0) / studentsWithCGPA.length).toFixed(2)
    : '0.00';

  // Recent activity (sorted by updatedAt or createdAt)
  const recentStudents = [...students].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || '2025-01-01');
    const dateB = new Date(b.updatedAt || b.createdAt || '2025-01-01');
    return dateB - dateA;
  }).slice(0, 5);

  return {
    totalStudents,
    activeBacklogsCount: activeBacklogs.length,
    clearedBacklogsCount: clearedBacklogs.length,
    studentsWithActiveBacklogs,
    backlogFreeStudents,
    avgCGPA,
    courseCount,
    branchCount,
    batchCount,
    semesterCount,
    recentStudents
  };
}
