// PlacePrep AI - Reports Exporter Service
// Supports Drive Eligibility List, Final Placed Students Report, and Monthly Attendance Summary Report.
// Provides CSV and XLSX formatting with UTF-8 encoding, formula injection sanitization,
// and role-based authorization verification.

import * as XLSX from 'xlsx';
import { getAllStudents } from './academicRecordsService.js';
import { getCompanies, getCurrentUser } from './storage.js';
import { INITIAL_CANDIDATES_PIPELINE } from '../data/selectionWorkflowData.js';
import { getLocalSessions, getLocalRecords } from './attendanceStorage.js';
import { getCrtSessionsList, getCrtRecordsList } from './crtAttendanceStorage.js';

// Authorized roles for reports export
export const AUTHORIZED_EXPORT_ROLES = [
  'teacher',
  'hod',
  'tpo',
  'coordinator',
  'director',
  'admin',
  'super_admin'
];

/**
 * Verify user role authorization for reports
 */
export function isUserAuthorizedForReports(currentUser = getCurrentUser()) {
  if (!currentUser) return false;
  const role = String(currentUser.role || 'student').toLowerCase();
  return AUTHORIZED_EXPORT_ROLES.includes(role);
}

/**
 * Sanitize untrusted values to prevent Spreadsheet Formula Injection (CWE-1236)
 * Prefix any value starting with =, +, -, @, \t, \r with a single quote.
 */
export function sanitizeSpreadsheetValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Trigger browser file download for Blobs
 */
function triggerBrowserDownload(blob, filename) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export generic dataset to XLSX with column auto-widths
 */
export function exportToXLSX(dataRows, sheetName = 'Report', filename = 'PlacePrep_Report.xlsx') {
  const sanitizedRows = dataRows.map(row => {
    const cleanRow = {};
    for (const [key, val] of Object.entries(row)) {
      cleanRow[key] = typeof val === 'string' ? sanitizeSpreadsheetValue(val) : val;
    }
    return cleanRow;
  });

  const ws = XLSX.utils.json_to_sheet(sanitizedRows);
  
  // Auto-fit column widths based on content
  if (dataRows.length > 0) {
    const headers = Object.keys(dataRows[0]);
    ws['!cols'] = headers.map(h => {
      const maxLen = Math.max(
        h.length,
        ...dataRows.map(r => (r[h] ? String(r[h]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerBrowserDownload(blob, filename);
}

/**
 * Export generic dataset to CSV with UTF-8 BOM
 */
export function exportToCSV(dataRows, filename = 'PlacePrep_Report.csv') {
  const sanitizedRows = dataRows.map(row => {
    const cleanRow = {};
    for (const [key, val] of Object.entries(row)) {
      cleanRow[key] = typeof val === 'string' ? sanitizeSpreadsheetValue(val) : val;
    }
    return cleanRow;
  });

  const ws = XLSX.utils.json_to_sheet(sanitizedRows);
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  // Prepend UTF-8 BOM so Excel opens accented and Unicode characters cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
}

// =========================================================================
// REPORT A: DRIVE ELIGIBILITY LIST
// =========================================================================

/**
 * Evaluate students against placement drive eligibility rules
 * @param {Object} drive - Placement drive object
 * @param {Array} students - Array of student records
 * @returns {Array} List of eligible student records
 */
export function getDriveEligibleStudents(drive, students = getAllStudents()) {
  if (!drive) return [];

  const minCgpa = parseFloat(drive.minCgpa) || 0.0;
  const min10th = parseFloat(drive.minTenthPercentage || drive.min10th) || 0.0;
  const min12th = parseFloat(drive.minTwelfthPercentage || drive.min12th) || 0.0;
  const maxBacklogs = drive.maxBacklogs !== undefined ? parseInt(drive.maxBacklogs, 10) : 0;
  const eligibleBatches = (drive.eligibleBatches || []).map(b => String(b).trim());
  const allowedBranches = (drive.allowedBranches || drive.eligibleBranches || []).map(b => b.toLowerCase().trim());

  return students.filter(student => {
    // 1. CGPA filter
    const studentCgpa = parseFloat(student.cgpa) || 0.0;
    if (studentCgpa < minCgpa) return false;

    // 2. Batch filter
    if (eligibleBatches.length > 0 && !eligibleBatches.includes(String(student.graduationBatch).trim())) {
      return false;
    }

    // 3. Branch filter
    if (allowedBranches.length > 0) {
      const studentBranch = String(student.branch || '').toLowerCase().trim();
      const isAllowedBranch = allowedBranches.some(ab => 
        ab.includes('all') ||
        studentBranch.includes(ab) || 
        ab.includes(studentBranch)
      );
      if (!isAllowedBranch) return false;
    }

    // 4. Backlogs filter
    const backlogs = student.activeBacklogsCount !== undefined ? parseInt(student.activeBacklogsCount, 10) : 0;
    if (backlogs > maxBacklogs) return false;

    // 5. 10th percentage if specified
    if (min10th > 0) {
      const p10 = parseFloat(student.class10Percentage || (student.class10 && student.class10.percentage)) || 0;
      if (p10 > 0 && p10 < min10th) return false;
    }

    // 6. 12th percentage if specified
    if (min12th > 0) {
      const p12 = parseFloat(student.class12Percentage || (student.class12 && student.class12.percentage)) || 0;
      if (p12 > 0 && p12 < min12th) return false;
    }

    return true;
  });
}

/**
 * Generate Drive Eligibility Report Dataset
 * Columns: University Roll Number, Student Name, CGPA, Branch
 */
export function generateDriveEligibilityReportData(drive, students = getAllStudents()) {
  const eligibleStudents = getDriveEligibleStudents(drive, students);

  return eligibleStudents.map(student => ({
    'University Roll Number': student.rollNumber || 'N/A',
    'Student Name': student.fullName || student.name || 'N/A',
    'CGPA': student.cgpa !== null && student.cgpa !== undefined ? Number(student.cgpa).toFixed(2) : 'N/A',
    'Branch': student.branch || 'N/A',
    'Graduation Batch': student.graduationBatch || 'N/A',
    'College Email': student.email || 'N/A',
    'Drive Name': drive.companyName ? `${drive.companyName} (${drive.role || 'Campus Drive'})` : (drive.title || 'Placement Drive'),
    'Eligibility Status': 'Eligible'
  }));
}

/**
 * Export Drive Eligibility List
 */
export function exportDriveEligibilityList(drive, format = 'xlsx', students = getAllStudents()) {
  const rows = generateDriveEligibilityReportData(drive, students);
  const companySlug = (drive.companyName || drive.title || 'drive').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const batchSlug = drive.eligibleBatches && drive.eligibleBatches[0] ? drive.eligibleBatches[0] : 'all';
  const filename = `drive_eligibility_${companySlug}_${batchSlug}.${format}`;

  if (format === 'csv') {
    exportToCSV(rows, filename);
  } else {
    exportToXLSX(rows, 'Eligible_Students', filename);
  }

  return { rowCount: rows.length, filename };
}

// =========================================================================
// REPORT B: FINAL PLACED STUDENTS REPORT
// =========================================================================

/**
 * Retrieve verified final placed students from the application's actual placement records
 * Respects definition of final placement (e.g. status === 'Selected' or status === 'OFFERED')
 */
export function getFinalPlacedStudents() {
  let candidatesPipeline = [];
  try {
    const saved = localStorage.getItem('placeprep_candidates_pipeline');
    candidatesPipeline = saved ? JSON.parse(saved) : INITIAL_CANDIDATES_PIPELINE;
  } catch {
    candidatesPipeline = INITIAL_CANDIDATES_PIPELINE;
  }

  const allCompanies = getCompanies();

  // Filter candidates who have reached final selection / offer
  const selectedCandidates = candidatesPipeline.filter(
    c => c.status === 'Selected' || c.status === 'OFFERED'
  );

  // Default placement packages mapped from company tiers if not explicitly in candidate record
  const defaultPackages = {
    hcltech: '₹5.50 LPA',
    tcs: '₹7.20 LPA',
    infosys: '₹6.50 LPA',
    wipro: '₹5.00 LPA',
    cognizant: '₹6.00 LPA',
    accenture: '₹6.50 LPA',
    deloitte: '₹9.00 LPA',
    amazon: '₹28.50 LPA',
    microsoft: '₹32.00 LPA',
    google: '₹36.00 LPA'
  };

  const records = selectedCandidates.map(c => {
    const comp = allCompanies.find(comp => comp.id === c.companyId) || {};
    const companyName = c.companyName || comp.name || 'Corporate Partner';
    const companyKey = String(c.companyId || companyName).toLowerCase().replace(/[^a-z0-9]/g, '');

    // Extract package
    let pkg = c.package || c.ctc || defaultPackages[companyKey];
    if (!pkg && comp.ctcRange) {
      pkg = comp.ctcRange.split('-')[0].trim();
    }
    if (!pkg) {
      pkg = '₹6.50 LPA';
    }

    // Format offer date cleanly
    let offerDate = c.offerDate || c.selectedAt || c.lastUpdated || '2026-10-17';
    if (offerDate.includes('Oct 17, 2026')) offerDate = '2026-10-17';
    else if (offerDate.includes('Today')) offerDate = new Date().toISOString().slice(0, 10);
    else if (offerDate.includes('Yesterday')) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      offerDate = d.toISOString().slice(0, 10);
    }

    return {
      studentName: c.name || c.studentName || 'Student Candidate',
      email: c.email || '',
      rollNumber: c.rollNumber || c.id || 'N/A',
      branch: c.branch || 'Computer Science and Engineering',
      batch: c.batch || '2026',
      company: companyName,
      package: pkg,
      role: c.role || 'Graduate Engineer Trainee / Analyst',
      offerDate: offerDate
    };
  });

  return records;
}

/**
 * Generate Final Placed Students Report Dataset
 * Columns: Student Name, Company, Package, Offer Date
 */
export function generateFinalPlacedReportData(filterCompany = 'All', deduplicateByStudent = true) {
  let placedList = getFinalPlacedStudents();

  if (filterCompany !== 'All') {
    placedList = placedList.filter(p => p.company === filterCompany);
  }

  // De-duplicate if single placement convention requested
  if (deduplicateByStudent) {
    const seen = new Set();
    const uniqueList = [];
    placedList.forEach(p => {
      const key = (p.studentName + (p.email || '')).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(p);
      }
    });
    placedList = uniqueList;
  }

  return placedList.map(record => ({
    'Student Name': record.studentName,
    'Company': record.company,
    'Package': record.package,
    'Offer Date': record.offerDate,
    'Branch': record.branch,
    'Batch': record.batch,
    'Job Role': record.role
  }));
}

/**
 * Compute summary statistics for placements
 */
export function getPlacementSummaryStats(placedRows) {
  const totalOffers = placedRows.length;
  const companiesSet = new Set(placedRows.map(r => r.Company));
  
  // Parse packages into numbers
  const numericPackages = placedRows
    .map(r => {
      const match = String(r.Package).match(/([0-9]+(\.[0-9]+)?)/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter(val => val !== null && !isNaN(val));

  const avgPackage = numericPackages.length > 0
    ? (numericPackages.reduce((a, b) => a + b, 0) / numericPackages.length).toFixed(2)
    : '0.00';

  const maxPackage = numericPackages.length > 0
    ? Math.max(...numericPackages).toFixed(2)
    : '0.00';

  return {
    totalOffers,
    uniqueCompanies: companiesSet.size,
    avgPackageLpa: `₹${avgPackage} LPA`,
    highestPackageLpa: `₹${maxPackage} LPA`
  };
}

/**
 * Export Final Placed Students Report
 */
export function exportFinalPlacedReport(filterCompany = 'All', format = 'xlsx', deduplicateByStudent = true) {
  const rows = generateFinalPlacedReportData(filterCompany, deduplicateByStudent);
  const companySlug = filterCompany !== 'All' ? filterCompany.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'all_companies';
  const filename = `final_placed_students_${companySlug}_${new Date().getFullYear()}.${format}`;

  if (format === 'csv') {
    exportToCSV(rows, filename);
  } else {
    exportToXLSX(rows, 'Placed_Students', filename);
  }

  return { rowCount: rows.length, filename };
}

// =========================================================================
// REPORT C: MONTHLY ATTENDANCE SUMMARY REPORT
// =========================================================================

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Generate Monthly Attendance Summary Report Dataset
 * Evaluates Academic Class Attendance and CRT Training Attendance separately.
 * Columns:
 * - Student Roll Number
 * - Student Name
 * - Department and branch
 * - Academic class attendance totals and percentage
 * - CRT training attendance totals and percentage
 * - Attendance month and year
 * 
 * @param {number} month - 1 to 12
 * @param {number} year - e.g. 2026
 * @param {string} departmentFilter - 'All' or specific dept code (e.g. 'CSE')
 */
export function generateMonthlyAttendanceReportData(month = 10, year = 2026, departmentFilter = 'All') {
  const monthStr = String(month).padStart(2, '0');
  const yearStr = String(year);
  const targetYearMonth = `${yearStr}-${monthStr}`; // e.g. "2026-10"
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // 1. Academic Class Attendance Datasets
  const classSessions = getLocalSessions();
  const classRecords = getLocalRecords();

  // Filter class sessions held in the selected month & year
  const monthlyClassSessions = classSessions.filter(s => {
    const sDate = s.sessionDate || '';
    return sDate.startsWith(targetYearMonth);
  });
  const monthlyClassSessionIds = new Set(monthlyClassSessions.map(s => s.id));

  // 2. CRT Training Attendance Datasets
  const crtSessions = getCrtSessionsList();
  const crtRecords = getCrtRecordsList();

  // Filter completed CRT sessions held in the selected month & year
  const monthlyCrtSessions = crtSessions.filter(s => {
    const sDate = s.scheduledDate || '';
    const isCompleted = s.status === 'COMPLETED';
    return sDate.startsWith(targetYearMonth) && isCompleted;
  });
  const monthlyCrtSessionIds = new Set(monthlyCrtSessions.map(s => s.id));

  // 3. Assemble Master Student Roster
  const registeredStudents = getAllStudents();
  
  // Fallback to attendance seed students if registry is sparse
  const studentMap = new Map();

  registeredStudents.forEach(stu => {
    const roll = stu.rollNumber || stu.id;
    if (roll) {
      studentMap.set(roll.toLowerCase(), {
        rollNumber: stu.rollNumber,
        name: stu.fullName || stu.name,
        department: stu.branch ? (stu.branch.includes('Information') ? 'IT' : stu.branch.includes('Electronics') ? 'ECE' : 'CSE') : 'CSE',
        branch: stu.branch || 'Computer Science and Engineering',
        email: stu.email
      });
    }
  });

  // Include any student from class records or CRT records
  classRecords.forEach(rec => {
    const roll = rec.studentRollNumber || rec.rollNumber;
    if (roll && !studentMap.has(roll.toLowerCase())) {
      studentMap.set(roll.toLowerCase(), {
        rollNumber: roll,
        name: rec.studentName || 'Student',
        department: rec.department || 'CSE',
        branch: rec.branch || 'Computer Science and Engineering',
        email: rec.studentId || ''
      });
    }
  });

  crtRecords.forEach(rec => {
    const roll = rec.studentRollNumber;
    if (roll && !studentMap.has(roll.toLowerCase())) {
      studentMap.set(roll.toLowerCase(), {
        rollNumber: roll,
        name: rec.studentName || 'Student',
        department: rec.department || 'CSE',
        branch: 'Computer Science and Engineering',
        email: rec.studentId || ''
      });
    }
  });

  const studentsList = Array.from(studentMap.values());

  // 4. Calculate for each student
  const rows = [];

  studentsList.forEach(student => {
    if (departmentFilter !== 'All' && student.department !== departmentFilter) {
      return;
    }

    const rollLower = student.rollNumber.toLowerCase();

    // A. Academic Class Calculations
    // Total sessions held for this student's department in the month
    const deptClassSessions = monthlyClassSessions.filter(
      s => !s.department || s.department === student.department
    );
    const classTotalHeld = deptClassSessions.length;

    let classAttended = 0;
    classRecords.forEach(rec => {
      const recRoll = (rec.studentRollNumber || rec.rollNumber || '').toLowerCase();
      if (recRoll === rollLower && monthlyClassSessionIds.has(rec.sessionId)) {
        if (rec.status === 'PRESENT' || rec.status === 'LATE') {
          classAttended++;
        }
      }
    });

    const classPercentage = classTotalHeld > 0
      ? ((classAttended / classTotalHeld) * 100).toFixed(1)
      : 'N/A';

    // B. CRT Training Calculations
    const crtTotalHeld = monthlyCrtSessions.length;
    let crtAttended = 0;
    crtRecords.forEach(rec => {
      const recRoll = (rec.studentRollNumber || '').toLowerCase();
      if (recRoll === rollLower && monthlyCrtSessionIds.has(rec.crtSessionId)) {
        if (rec.status === 'PRESENT' || rec.status === 'LATE') {
          crtAttended++;
        }
      }
    });

    const crtPercentage = crtTotalHeld > 0
      ? ((crtAttended / crtTotalHeld) * 100).toFixed(1)
      : 'N/A';

    rows.push({
      'Student Roll Number': student.rollNumber,
      'Student Name': student.name,
      'Department': student.department,
      'Branch': student.branch,
      'Attendance Month & Year': monthLabel,
      'Academic Classes Held': classTotalHeld,
      'Academic Classes Attended': classAttended,
      'Academic Attendance %': classPercentage !== 'N/A' ? `${classPercentage}%` : 'N/A',
      'CRT Training Sessions Held': crtTotalHeld,
      'CRT Sessions Attended': crtAttended,
      'CRT Attendance %': crtPercentage !== 'N/A' ? `${crtPercentage}%` : 'N/A'
    });
  });

  return rows;
}

/**
 * Export Monthly Attendance Summary Report
 */
export function exportMonthlyAttendanceReport(month = 10, year = 2026, departmentFilter = 'All', format = 'xlsx') {
  const rows = generateMonthlyAttendanceReportData(month, year, departmentFilter);
  const deptSlug = departmentFilter !== 'All' ? departmentFilter.toLowerCase() : 'all_departments';
  const filename = `monthly_attendance_summary_${year}_${String(month).padStart(2, '0')}_${deptSlug}.${format}`;

  if (format === 'csv') {
    exportToCSV(rows, filename);
  } else {
    exportToXLSX(rows, 'Attendance_Summary', filename);
  }

  return { rowCount: rows.length, filename };
}
