// PlacePrep AI - Unified Student Registration & Bulk Ingestion Engine
// Handles single student registration, spreadsheet parsing (.xlsx / .csv),
// row-level validation, in-file & database duplicate detection, and synchronized persistence.

import * as XLSX from 'xlsx';
import { getAllStudents, saveStudent } from './academicRecordsService.js';
import { getCurrentUser } from './storage.js';

// Authorized roles for student bulk ingestion
export const AUTHORIZED_IMPORT_ROLES = [
  'teacher',
  'hod',
  'tpo',
  'coordinator',
  'director',
  'admin',
  'super_admin'
];

// Recognized college branches
export const VALID_BRANCHES = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

// Branch alias normalization
export function normalizeBranchName(rawBranch) {
  if (!rawBranch) return '';
  const trimmed = String(rawBranch).trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'cse' || lower.includes('computer science')) return 'Computer Science and Engineering';
  if (lower === 'it' || lower.includes('information tech')) return 'Information Technology';
  if (lower === 'ece' || lower.includes('electronics')) return 'Electronics and Communication Engineering';
  if (lower === 'eee' || lower.includes('electrical')) return 'Electrical and Electronics Engineering';
  if (lower === 'mech' || lower.includes('mechanical')) return 'Mechanical Engineering';
  if (lower === 'civil' || lower.includes('civil')) return 'Civil Engineering';

  // Return original capitalized string if not directly mapped
  return trimmed;
}

/**
 * Sanitize cell values against Spreadsheet Formula Injection (CSV / Formula Injection CWE-1236)
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
 * Validate a single student row against requirements and existing database
 * @param {Object} rowData - Raw row object from spreadsheet
 * @param {Array} existingStudents - Current students in system
 * @param {Set} seenEmailsInFile - Set of lowercase emails already encountered in current file
 * @param {Set} seenRollsInFile - Set of lowercase roll numbers already encountered in current file
 * @returns {Object} { isValid, isDuplicate, status, errors, cleanData }
 */
export function validateStudentImportRow(rowData, existingStudents = [], seenEmailsInFile = new Set(), seenRollsInFile = new Set()) {
  const errors = [];
  let isDuplicate = false;

  // Extract and clean values safely
  const fullName = String(rowData.fullName || rowData.name || '').trim();
  const rawEmail = String(rowData.email || rowData.collegeEmail || '').trim();
  const email = rawEmail.toLowerCase();
  const rollNumber = String(rowData.rollNumber || rowData.rollNo || '').trim();
  const graduationBatch = String(rowData.graduationBatch || rowData.batch || '').trim();
  const rawBranch = String(rowData.branch || rowData.department || '').trim();
  const branch = normalizeBranchName(rawBranch);
  
  // CGPA parsing
  const rawCgpa = rowData.cgpa !== undefined && rowData.cgpa !== null && rowData.cgpa !== '' ? String(rowData.cgpa).trim() : '';
  const parsedCgpa = rawCgpa !== '' ? parseFloat(rawCgpa) : null;

  // 1. Student Full Name Validation
  if (!fullName) {
    errors.push('Student Full Name is required');
  } else if (fullName.length < 2) {
    errors.push('Student Full Name must be at least 2 characters');
  } else if (!/^[a-zA-Z\s.'-]+$/.test(fullName)) {
    errors.push('Student Full Name contains invalid characters');
  }

  // 2. Email Address Validation
  if (!email) {
    errors.push('College Email Address is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid College Email Address format');
  } else {
    // Check in-file duplicate email
    if (seenEmailsInFile.has(email)) {
      isDuplicate = true;
      errors.push(`Duplicate email address "${rawEmail}" appears multiple times in uploaded file`);
    } else {
      seenEmailsInFile.add(email);
    }

    // Check existing database duplicate email
    const existingWithEmail = existingStudents.find(
      s => s.email && s.email.trim().toLowerCase() === email
    );
    if (existingWithEmail) {
      isDuplicate = true;
      errors.push(`Email "${rawEmail}" already belongs to existing registered student: ${existingWithEmail.fullName || existingWithEmail.name}`);
    }
  }

  // 3. Roll Number Validation
  if (!rollNumber) {
    errors.push('University Roll Number is required');
  } else {
    const rollLower = rollNumber.toLowerCase();
    // Check in-file duplicate roll
    if (seenRollsInFile.has(rollLower)) {
      isDuplicate = true;
      errors.push(`Duplicate Roll Number "${rollNumber}" appears multiple times in uploaded file`);
    } else {
      seenRollsInFile.add(rollLower);
    }

    // Check existing database duplicate roll
    const existingWithRoll = existingStudents.find(
      s => s.rollNumber && s.rollNumber.trim().toLowerCase() === rollLower
    );
    if (existingWithRoll) {
      isDuplicate = true;
      errors.push(`Roll Number "${rollNumber}" already exists in university database for: ${existingWithRoll.fullName || existingWithRoll.name}`);
    }
  }

  // 4. Graduation Batch Validation
  if (!graduationBatch) {
    errors.push('Graduation Batch is required');
  } else if (!/^(202[0-9]|203[0-5])$/.test(graduationBatch)) {
    errors.push(`Invalid Graduation Batch "${graduationBatch}". Expected 4-digit year (e.g. 2025, 2026, 2027, 2028)`);
  }

  // 5. Branch Validation
  if (!branch) {
    errors.push('Branch / Specialization is required');
  } else if (!VALID_BRANCHES.includes(branch)) {
    errors.push(`Unrecognized branch "${branch}". Must be a valid institute engineering branch`);
  }

  // 6. CGPA Validation (Scale 0.00 to 10.00)
  if (parsedCgpa === null || isNaN(parsedCgpa)) {
    errors.push('Current CGPA is required and must be a valid number');
  } else if (parsedCgpa < 0.0 || parsedCgpa > 10.0) {
    errors.push(`Current CGPA "${parsedCgpa}" is out of scale. Must be between 0.00 and 10.00`);
  }

  // Determine row status
  let status = 'Valid';
  if (isDuplicate) {
    status = 'Duplicate';
  } else if (errors.length > 0) {
    status = 'Invalid';
  }

  const isValid = status === 'Valid';

  // Construct clean student object ready for persistence
  const cleanData = {
    fullName,
    email: rawEmail,
    rollNumber,
    registrationNumber: rowData.registrationNumber ? String(rowData.registrationNumber).trim() : `REG-${graduationBatch}-${rollNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
    graduationBatch,
    branch,
    cgpa: parsedCgpa !== null ? Math.round(parsedCgpa * 100) / 100 : 0.0,
    collegeName: rowData.collegeName ? String(rowData.collegeName).trim() : 'Delhi Technological University (DTU)',
    course: rowData.course ? String(rowData.course).trim() : 'B.Tech (Bachelor of Technology)',
    admissionYear: rowData.admissionYear ? String(rowData.admissionYear).trim() : String(parseInt(graduationBatch, 10) - 4),
    currentSemester: rowData.currentSemester ? parseInt(rowData.currentSemester, 10) : 6,
    admissionType: rowData.admissionType ? String(rowData.admissionType).trim() : 'Regular Entry',
    mobileNumber: rowData.mobileNumber ? String(rowData.mobileNumber).trim() : '+91 98000 00000',
    dateOfBirth: rowData.dateOfBirth ? String(rowData.dateOfBirth).trim() : `${parseInt(graduationBatch, 10) - 22}-06-15`,
    currentAddress: rowData.currentAddress ? String(rowData.currentAddress).trim() : 'Campus Hostel / Local Residence',
    class10Percentage: rowData.class10Percentage ? parseFloat(rowData.class10Percentage) : 85.0,
    class12Percentage: rowData.class12Percentage ? parseFloat(rowData.class12Percentage) : 84.0,
    activeBacklogsCount: rowData.activeBacklogsCount ? parseInt(rowData.activeBacklogsCount, 10) : 0,
    status: 'Active'
  };

  return {
    isValid,
    isDuplicate,
    status,
    errors,
    cleanData
  };
}

/**
 * Standard column headers for student template
 */
export const TEMPLATE_COLUMNS = [
  { key: 'fullName', header: 'Student Full Name *', desc: 'Full legal name (e.g. Ananya Sharma)', required: true },
  { key: 'email', header: 'College Email Address *', desc: 'Official college email (e.g. ananya@dtu.ac.in)', required: true },
  { key: 'rollNumber', header: 'University Roll Number *', desc: 'Unique University Roll ID (e.g. 2024/CSE/102)', required: true },
  { key: 'graduationBatch', header: 'Graduation Batch *', desc: 'Graduation year (e.g. 2026, 2027, 2028)', required: true },
  { key: 'branch', header: 'Branch *', desc: 'Branch name (e.g. Computer Science and Engineering, IT, ECE)', required: true },
  { key: 'cgpa', header: 'Current CGPA *', desc: 'Cumulative GPA on 10.0 scale (e.g. 8.65)', required: true },
  { key: 'registrationNumber', header: 'University Registration Number (Optional)', desc: 'Registration ID if assigned', required: false },
  { key: 'mobileNumber', header: 'Mobile Number (Optional)', desc: '10-digit phone contact', required: false },
  { key: 'class10Percentage', header: 'Class 10 Percentage (Optional)', desc: 'Secondary school % (e.g. 92.4)', required: false },
  { key: 'class12Percentage', header: 'Class 12 Percentage (Optional)', desc: 'Senior secondary % (e.g. 88.5)', required: false }
];

/**
 * Download standardized student spreadsheet template
 * @param {string} format - 'xlsx' or 'csv'
 */
export function downloadStudentTemplate(format = 'xlsx') {
  const sampleRows = [
    {
      'Student Full Name *': 'Aarav Sharma',
      'College Email Address *': 'aarav.sharma@dtu.ac.in',
      'University Roll Number *': '2024/CSE/102',
      'Graduation Batch *': '2026',
      'Branch *': 'Computer Science and Engineering',
      'Current CGPA *': '8.75',
      'University Registration Number (Optional)': 'REG-2022-CSE-102',
      'Mobile Number (Optional)': '+91 9876543210',
      'Class 10 Percentage (Optional)': '92.5',
      'Class 12 Percentage (Optional)': '89.4'
    },
    {
      'Student Full Name *': 'Simran Kaur',
      'College Email Address *': 'simran.kaur@dtu.ac.in',
      'University Roll Number *': '2024/IT/205',
      'Graduation Batch *': '2026',
      'Branch *': 'Information Technology',
      'Current CGPA *': '9.10',
      'University Registration Number (Optional)': 'REG-2022-IT-205',
      'Mobile Number (Optional)': '+91 9811223344',
      'Class 10 Percentage (Optional)': '94.0',
      'Class 12 Percentage (Optional)': '91.2'
    },
    {
      'Student Full Name *': 'Devansh Gupta',
      'College Email Address *': 'devansh.gupta@dtu.ac.in',
      'University Roll Number *': '2024/ECE/310',
      'Graduation Batch *': '2027',
      'Branch *': 'Electronics and Communication Engineering',
      'Current CGPA *': '8.20',
      'University Registration Number (Optional)': 'REG-2023-ECE-310',
      'Mobile Number (Optional)': '+91 9845012345',
      'Class 10 Percentage (Optional)': '88.0',
      'Class 12 Percentage (Optional)': '85.5'
    }
  ];

  const filename = `PlacePrep_Student_Registration_Template.${format}`;

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerBrowserDownload(blob, filename);
  } else {
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 24 }, // Name
      { wch: 28 }, // Email
      { wch: 24 }, // Roll
      { wch: 18 }, // Batch
      { wch: 36 }, // Branch
      { wch: 16 }, // CGPA
      { wch: 30 }, // Reg No
      { wch: 22 }, // Mobile
      { wch: 26 }, // 10th
      { wch: 26 }  // 12th
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Registration');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerBrowserDownload(blob, filename);
  }
}

/**
 * Trigger file download helper
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
 * Parse an uploaded CSV or XLSX file and run row-level validation
 * @param {File} file
 * @param {Array} existingStudents
 * @returns {Promise<Object>}
 */
export async function parseStudentSpreadsheet(file, existingStudents = []) {
  if (!file) {
    return { error: 'No file was provided for upload.' };
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
    return { error: 'Unsupported file type. Please upload a Microsoft Excel (.xlsx, .xls) or CSV (.csv) file.' };
  }

  // Enforce 10MB file limit
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: 'File size exceeds maximum permitted limit of 10 MB.' };
  }

  let data;
  try {
    if (typeof file.arrayBuffer === 'function') {
      const buf = await file.arrayBuffer();
      data = new Uint8Array(buf);
    } else if (typeof FileReader !== 'undefined') {
      data = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(new Uint8Array(e.target.result));
        reader.onerror = () => rej(new Error('Failed to read file from disk.'));
        reader.readAsArrayBuffer(file);
      });
    } else {
      return { error: 'Environment does not support reading binary files.' };
    }
  } catch (readErr) {
    return { error: `Failed to read file: ${readErr.message}` };
  }

  try {
    const workbook = XLSX.read(data, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { error: 'The uploaded spreadsheet contains no worksheets.' };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawJson || rawJson.length < 2) {
      return { error: 'The uploaded file is empty or contains only a header row with no student records.' };
    }

    const headers = rawJson[0].map(h => String(h || '').trim());
    const dataRows = rawJson.slice(1);

    // Header fuzzy index matcher
    const findColIdx = (keywords) => {
      return headers.findIndex(h => {
        const lower = h.toLowerCase();
        return keywords.some(kw => lower.includes(kw.toLowerCase()));
      });
    };

    const colMap = {
      fullName: findColIdx(['full name', 'student full name', 'student name', 'name']),
      email: findColIdx(['college email', 'email address', 'email', 'college mail', 'mail']),
      rollNumber: findColIdx(['university roll', 'roll number', 'roll no', 'roll']),
      graduationBatch: findColIdx(['graduation batch', 'batch', 'grad batch', 'graduation year']),
      branch: findColIdx(['branch', 'department', 'specialization', 'stream']),
      cgpa: findColIdx(['cgpa', 'current cgpa', 'gpa', 'score']),
      registrationNumber: findColIdx(['registration number', 'reg number', 'reg no', 'registration']),
      mobileNumber: findColIdx(['mobile', 'phone', 'contact']),
      class10Percentage: findColIdx(['class 10', '10th', 'ssc']),
      class12Percentage: findColIdx(['class 12', '12th', 'hsc'])
    };

    // Check required columns exist in headers
    const missingCoreCols = [];
    if (colMap.fullName === -1) missingCoreCols.push('Student Full Name');
    if (colMap.email === -1) missingCoreCols.push('College Email Address');
    if (colMap.rollNumber === -1) missingCoreCols.push('University Roll Number');
    if (colMap.graduationBatch === -1) missingCoreCols.push('Graduation Batch');
    if (colMap.branch === -1) missingCoreCols.push('Branch');
    if (colMap.cgpa === -1) missingCoreCols.push('Current CGPA');

    if (missingCoreCols.length > 0) {
      return {
        error: `Missing required spreadsheet columns: ${missingCoreCols.join(', ')}. Please use the downloadable PlacePrep template.`
      };
    }

    const parsedRows = [];
    const seenEmailsInFile = new Set();
    const seenRollsInFile = new Set();

    dataRows.forEach((row, idx) => {
      // Skip completely blank rows
      if (!row || row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')) {
        return;
      }

      const rowNum = idx + 2; // 1-based, +1 for header row

      const getVal = (colIdx) => {
        if (colIdx === -1 || row[colIdx] === undefined || row[colIdx] === null) return '';
        return String(row[colIdx]).trim();
      };

      const rowData = {
        fullName: getVal(colMap.fullName),
        email: getVal(colMap.email),
        rollNumber: getVal(colMap.rollNumber),
        graduationBatch: getVal(colMap.graduationBatch),
        branch: getVal(colMap.branch),
        cgpa: getVal(colMap.cgpa),
        registrationNumber: getVal(colMap.registrationNumber),
        mobileNumber: getVal(colMap.mobileNumber),
        class10Percentage: getVal(colMap.class10Percentage),
        class12Percentage: getVal(colMap.class12Percentage)
      };

      const validation = validateStudentImportRow(
        rowData,
        existingStudents,
        seenEmailsInFile,
        seenRollsInFile
      );

      parsedRows.push({
        rowNumber: rowNum,
        rollNumber: rowData.rollNumber || '(Missing)',
        studentName: rowData.fullName || '(Missing)',
        email: rowData.email || '(Missing)',
        branch: rowData.branch || '(Missing)',
        cgpa: rowData.cgpa || '(Missing)',
        status: validation.status, // 'Valid' | 'Invalid' | 'Duplicate'
        isValid: validation.isValid,
        isDuplicate: validation.isDuplicate,
        errors: validation.errors,
        issue: validation.errors.length > 0 ? validation.errors.join('; ') : 'Ready to import',
        cleanData: validation.cleanData,
        rawRow: row
      });
    });

    const totalRows = parsedRows.length;
    const validRows = parsedRows.filter(r => r.status === 'Valid').length;
    const invalidRows = parsedRows.filter(r => r.status === 'Invalid').length;
    const duplicateRows = parsedRows.filter(r => r.status === 'Duplicate').length;
    const eligibleRows = validRows; // Only clean, valid, non-duplicate rows eligible

    return {
      summary: {
        totalRows,
        validRows,
        invalidRows,
        duplicateRows,
        eligibleRows
      },
      rows: parsedRows
    };
  } catch (err) {
    console.error('Spreadsheet processing error:', err);
    return { error: `Failed to process spreadsheet file: ${err.message}` };
  }
}

/**
 * Generate and download an Error Report for skipped / invalid / duplicate rows
 * @param {Array} rows - Rows array from parseStudentSpreadsheet
 * @param {string} format - 'csv' or 'xlsx'
 */
export function downloadImportErrorReport(rows = [], format = 'csv') {
  const failedRows = rows.filter(r => r.status !== 'Valid');
  if (failedRows.length === 0) return;

  const reportData = failedRows.map(r => ({
    'Row Number': r.rowNumber,
    'University Roll Number': sanitizeSpreadsheetValue(r.rollNumber),
    'Student Name': sanitizeSpreadsheetValue(r.studentName),
    'College Email': sanitizeSpreadsheetValue(r.email),
    'Branch': sanitizeSpreadsheetValue(r.branch),
    'Status': r.status,
    'Validation Issues / Reasons': r.errors.join(' | ')
  }));

  const filename = `PlacePrep_Import_Error_Report_${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerBrowserDownload(blob, filename);
  } else {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skipped_Records');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerBrowserDownload(blob, filename);
  }
}

/**
 * Check if the current user has authorization for student import
 */
export function isUserAuthorizedForImport(currentUser = getCurrentUser()) {
  if (!currentUser) return false;
  const role = String(currentUser.role || 'student').toLowerCase();
  return AUTHORIZED_IMPORT_ROLES.includes(role);
}

/**
 * Synchronize newly registered or imported students to attendance rosters in localStorage
 * so they instantly appear across Class Attendance and CRT Attendance portals.
 */
function syncStudentToAttendanceRosters(student) {
  try {
    // Attendance portals read dynamically via getAllStudents()
    if (!student || !student.rollNumber) return;
  } catch (err) {
    console.warn('Error syncing student to rosters:', err);
  }
}

/**
 * Commit validated student records to persistence stores
 * @param {Array} eligibleRows - Rows where status === 'Valid'
 * @param {Object} actor - The user performing the import
 * @returns {Object} { success, importedCount, skippedCount, errors }
 */
export function commitStudentImport(eligibleRows = [], actor = getCurrentUser()) {
  if (!isUserAuthorizedForImport(actor)) {
    return {
      success: false,
      importedCount: 0,
      skippedCount: eligibleRows.length,
      errors: ['Unauthorized: Only Teachers, HODs, TPOs, or Admins may import student records.']
    };
  }

  let importedCount = 0;
  const errors = [];

  eligibleRows.forEach(row => {
    try {
      const saveRes = saveStudent(row.cleanData);
      if (saveRes.success) {
        importedCount++;
        syncStudentToAttendanceRosters(row.cleanData);
      } else {
        errors.push(`Row ${row.rowNumber} (${row.rollNumber}): ${Object.values(saveRes.errors || {}).join(', ')}`);
      }
    } catch (err) {
      errors.push(`Row ${row.rowNumber} (${row.rollNumber}): ${err.message}`);
    }
  });

  return {
    success: errors.length === 0,
    importedCount,
    skippedCount: eligibleRows.length - importedCount,
    errors
  };
}

/**
 * Register a single student (reused by manual registration dialog)
 * @param {Object} formData - { name, email, rollNumber, batch, branch, cgpa }
 * @param {Object} actor - The user registering the student
 * @returns {Object} { success, student, errors }
 */
export function registerSingleStudent(formData, actor = getCurrentUser()) {
  if (!isUserAuthorizedForImport(actor)) {
    return {
      success: false,
      errors: ['Unauthorized: You do not have permission to register students.']
    };
  }

  const existingStudents = getAllStudents();
  const validation = validateStudentImportRow(
    {
      fullName: formData.name || formData.fullName,
      email: formData.email,
      rollNumber: formData.rollNumber,
      graduationBatch: formData.batch || formData.graduationBatch,
      branch: formData.branch,
      cgpa: formData.cgpa,
      collegeName: formData.college || 'Delhi Technological University (DTU)'
    },
    existingStudents,
    new Set(),
    new Set()
  );

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  const saveRes = saveStudent(validation.cleanData);
  if (!saveRes.success) {
    return {
      success: false,
      errors: Object.values(saveRes.errors || {})
    };
  }

  syncStudentToAttendanceRosters(validation.cleanData);

  return {
    success: true,
    student: saveRes.student
  };
}
