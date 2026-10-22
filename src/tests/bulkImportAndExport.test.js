import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

// Mock localStorage for Node environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

globalThis.localStorage = storageMock;

import {
  TEMPLATE_COLUMNS,
  validateStudentImportRow,
  parseStudentSpreadsheet,
  commitStudentImport,
  registerSingleStudent,
  isUserAuthorizedForImport
} from '../services/studentRegistrationService.js';

import {
  getAllStudents
} from '../services/academicRecordsService.js';

import {
  isUserAuthorizedForReports,
  sanitizeSpreadsheetValue,
  getDriveEligibleStudents,
  generateDriveEligibilityReportData,
  exportDriveEligibilityList,
  generateFinalPlacedReportData,
  getPlacementSummaryStats,
  exportFinalPlacedReport,
  generateMonthlyAttendanceReportData,
  exportMonthlyAttendanceReport
} from '../services/reportsExporterService.js';

describe('PlacePrep AI - Student Bulk Registration & Ingestion Engine Tests', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('Template columns match the 6 registration dialog fields plus optional academic fields', () => {
    assert.ok(Array.isArray(TEMPLATE_COLUMNS));
    assert.ok(TEMPLATE_COLUMNS.length >= 6);

    const requiredHeaders = TEMPLATE_COLUMNS.filter(c => c.required).map(c => c.key);
    assert.ok(requiredHeaders.includes('fullName'), 'Should include Student Full Name');
    assert.ok(requiredHeaders.includes('email'), 'Should include College Email Address');
    assert.ok(requiredHeaders.includes('rollNumber'), 'Should include University Roll Number');
    assert.ok(requiredHeaders.includes('graduationBatch'), 'Should include Graduation Batch');
    assert.ok(requiredHeaders.includes('branch'), 'Should include Branch');
    assert.ok(requiredHeaders.includes('cgpa'), 'Should include Current CGPA');
  });

  test('Valid student row passes validation, normalizes branch and data types', () => {
    const row = {
      fullName: '  Rohan Deshmukh  ',
      email: ' ROHAN.D@dtu.ac.in ',
      rollNumber: ' 24CSE105 ',
      graduationBatch: '2026',
      branch: 'CSE',
      cgpa: '8.85'
    };

    const result = validateStudentImportRow(row, [], new Set(), new Set());
    assert.equal(result.isValid, true);
    assert.equal(result.status, 'Valid');
    assert.equal(result.errors.length, 0);
    assert.equal(result.cleanData.fullName, 'Rohan Deshmukh');
    assert.equal(result.cleanData.email, 'ROHAN.D@dtu.ac.in');
    assert.equal(result.cleanData.rollNumber, '24CSE105');
    assert.equal(result.cleanData.branch, 'Computer Science and Engineering');
    assert.equal(result.cleanData.graduationBatch, '2026');
    assert.equal(result.cleanData.cgpa, 8.85);
  });

  test('Missing required fields trigger detailed row-level validation errors', () => {
    const missingName = {
      fullName: '',
      email: 'valid@dtu.ac.in',
      rollNumber: '24CS001',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 8.5
    };
    const resName = validateStudentImportRow(missingName, [], new Set(), new Set());
    assert.equal(resName.isValid, false);
    assert.equal(resName.status, 'Invalid');
    assert.ok(resName.errors.some(e => e.includes('Student Full Name is required')));

    const missingRoll = {
      fullName: 'Aman Kumar',
      email: 'aman@dtu.ac.in',
      rollNumber: '',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 8.5
    };
    const resRoll = validateStudentImportRow(missingRoll, [], new Set(), new Set());
    assert.equal(resRoll.isValid, false);
    assert.ok(resRoll.errors.some(e => e.includes('University Roll Number is required')));
  });

  test('Invalid email and out-of-scale CGPA values are caught accurately', () => {
    const invalidEmailRow = {
      fullName: 'Pooja Hegde',
      email: 'not-a-valid-email',
      rollNumber: '24CS002',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 8.0
    };
    const resEmail = validateStudentImportRow(invalidEmailRow, [], new Set(), new Set());
    assert.equal(resEmail.isValid, false);
    assert.ok(resEmail.errors.some(e => e.includes('Invalid College Email Address format')));

    const negativeCgpaRow = {
      fullName: 'Pooja Hegde',
      email: 'pooja@dtu.ac.in',
      rollNumber: '24CS002',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: -2.0
    };
    const resNegative = validateStudentImportRow(negativeCgpaRow, [], new Set(), new Set());
    assert.equal(resNegative.isValid, false);
    assert.ok(resNegative.errors.some(e => e.includes('out of scale')));

    const excessiveCgpaRow = {
      fullName: 'Pooja Hegde',
      email: 'pooja@dtu.ac.in',
      rollNumber: '24CS002',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 11.5
    };
    const resExcessive = validateStudentImportRow(excessiveCgpaRow, [], new Set(), new Set());
    assert.equal(resExcessive.isValid, false);
    assert.ok(resExcessive.errors.some(e => e.includes('out of scale')));
  });

  test('Detects duplicate email addresses and roll numbers within the uploaded spreadsheet', () => {
    const seenEmails = new Set(['duplicate@dtu.ac.in']);
    const seenRolls = new Set(['24cs003']);

    const duplicateRow = {
      fullName: 'Duplicate Student',
      email: 'duplicate@dtu.ac.in',
      rollNumber: '24CS003',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 8.0
    };

    const res = validateStudentImportRow(duplicateRow, [], seenEmails, seenRolls);
    assert.equal(res.isValid, false);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.status, 'Duplicate');
    assert.ok(res.errors.some(e => e.includes('appears multiple times in uploaded file')));
  });

  test('Detects duplicate students already present in university database', () => {
    const existingDb = [
      { email: 'existing.student@dtu.ac.in', rollNumber: '22CS0101', name: 'Existing Student', fullName: 'Existing Student' }
    ];

    const duplicateRollRow = {
      fullName: 'Different Name',
      email: 'unique.person@dtu.ac.in',
      rollNumber: '22CS0101',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: 8.0
    };

    const res = validateStudentImportRow(duplicateRollRow, existingDb, new Set(), new Set());
    assert.equal(res.isValid, false);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.status, 'Duplicate');
    assert.ok(res.errors.some(e => e.includes('already exists in university database')));
  });

  test('Empty spreadsheets return clear user-friendly error message', async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buf], 'empty.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const result = await parseStudentSpreadsheet(file, []);
    assert.ok(result.error);
    assert.ok(result.error.includes('empty') || result.error.includes('no student records'));
  });

  test('Unsupported file extensions are safely rejected', async () => {
    const file = new File(['executable'], 'script.exe', { type: 'application/octet-stream' });
    const result = await parseStudentSpreadsheet(file, []);
    assert.ok(result.error);
    assert.ok(result.error.includes('Unsupported file type'));
  });

  test('Spreadsheet missing required column headers is rejected with helpful guidance', async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Unrelated Column A', 'Unrelated Column B'],
      ['123', '456']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buf], 'bad_headers.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const result = await parseStudentSpreadsheet(file, []);
    assert.ok(result.error);
    assert.ok(result.error.includes('Missing required spreadsheet columns'));
  });

  test('Valid XLSX spreadsheet parses rows and computes import summary accurately', async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Student Full Name *', 'College Email Address *', 'University Roll Number *', 'Graduation Batch *', 'Branch *', 'Current CGPA *'],
      ['Kavita Nair', 'kavita.nair@dtu.ac.in', '24CSE201', '2026', 'Computer Science and Engineering', '8.90'],
      ['Varun Tej', 'varun.tej@dtu.ac.in', '24IT202', '2026', 'Information Technology', '9.15']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buf], 'valid_students.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const result = await parseStudentSpreadsheet(file, []);
    assert.ok(!result.error, 'Should not return error for valid spreadsheet');
    assert.equal(result.summary.totalRows, 2);
    assert.equal(result.summary.validRows, 2);
    assert.equal(result.summary.invalidRows, 0);
    assert.equal(result.summary.duplicateRows, 0);
    assert.equal(result.summary.eligibleRows, 2);
    assert.equal(result.rows[0].studentName, 'Kavita Nair');
    assert.equal(result.rows[1].studentName, 'Varun Tej');
  });

  test('Unauthorized user role (student) is strictly blocked from bulk import', () => {
    const studentUser = { role: 'student', email: 'stu@placeprep.ac.in', name: 'Student' };
    assert.equal(isUserAuthorizedForImport(studentUser), false);

    const commitRes = commitStudentImport([{ cleanData: { rollNumber: 'TEST' } }], studentUser);
    assert.equal(commitRes.success, false);
    assert.equal(commitRes.importedCount, 0);
    assert.ok(commitRes.errors.some(e => e.includes('Unauthorized')));
  });

  test('Authorized Teacher, HOD, and TPO are allowed for bulk import', () => {
    assert.equal(isUserAuthorizedForImport({ role: 'teacher' }), true);
    assert.equal(isUserAuthorizedForImport({ role: 'hod' }), true);
    assert.equal(isUserAuthorizedForImport({ role: 'tpo' }), true);
    assert.equal(isUserAuthorizedForImport({ role: 'admin' }), true);
  });

  test('Authorized Teacher/TPO commits valid student records to persistent storage', () => {
    const teacherUser = { role: 'teacher', email: 'teacher@dtu.ac.in', name: 'Prof. Sharma' };
    const validated = validateStudentImportRow({
      fullName: 'Tanvi Joshi',
      email: 'tanvi.j@dtu.ac.in',
      rollNumber: '24CS881',
      graduationBatch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: '9.25'
    });

    const eligibleRows = [
      {
        rowNumber: 2,
        rollNumber: '24CS881',
        cleanData: validated.cleanData
      }
    ];

    const result = commitStudentImport(eligibleRows, teacherUser);
    assert.equal(result.success, true);
    assert.equal(result.importedCount, 1);
    assert.equal(result.skippedCount, 0);

    // Verify student is stored in database
    const allStudents = getAllStudents();
    const stored = allStudents.find(s => s.rollNumber === '24CS881');
    assert.ok(stored, 'Student should be persisted in storage');
    assert.equal(stored.fullName, 'Tanvi Joshi');
    assert.equal(stored.cgpa, 9.25);
  });

  test('Single manual student registration persists and prevents duplicate registration', () => {
    const manualData = {
      name: 'Aditya Singhal',
      email: 'aditya.s@dtu.ac.in',
      rollNumber: '24CS991',
      batch: '2026',
      branch: 'Computer Science and Engineering',
      cgpa: '8.40'
    };

    const res = registerSingleStudent(manualData, { role: 'tpo' });
    assert.equal(res.success, true);
    assert.ok(res.student);
    assert.equal(res.student.rollNumber, '24CS991');

    // Trying to register duplicate roll number fails gracefully
    const dupRes = registerSingleStudent(manualData, { role: 'tpo' });
    assert.equal(dupRes.success, false);
    assert.ok(dupRes.errors.length > 0);
  });
});

describe('PlacePrep AI - Reports Exporter Tests', () => {

  test('Spreadsheet Formula Injection Protection (CWE-1236)', () => {
    // Dangerous formula prefixes: = + - @ tab carriage-return
    assert.equal(sanitizeSpreadsheetValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.equal(sanitizeSpreadsheetValue('+cmd|/c calc'), "'+cmd|/c calc");
    assert.equal(sanitizeSpreadsheetValue('-1+2*3'), "'-1+2*3");
    assert.equal(sanitizeSpreadsheetValue('@HYPERLINK("evil.com")'), "'@HYPERLINK(\"evil.com\")");
    assert.equal(sanitizeSpreadsheetValue('\t=1+1'), "'\t=1+1");

    // Safe regular values remain unchanged
    assert.equal(sanitizeSpreadsheetValue('Priyansh Jain'), 'Priyansh Jain');
    assert.equal(sanitizeSpreadsheetValue('2024/CSE/102'), '2024/CSE/102');
    assert.equal(sanitizeSpreadsheetValue(9.45), 9.45);
    assert.equal(sanitizeSpreadsheetValue(''), '');
    assert.equal(sanitizeSpreadsheetValue(null), '');
  });

  test('Reports Authorization Gate enforces role-based access control', () => {
    assert.equal(isUserAuthorizedForReports({ role: 'student' }), false);
    assert.equal(isUserAuthorizedForReports({ role: 'teacher' }), true);
    assert.equal(isUserAuthorizedForReports({ role: 'hod' }), true);
    assert.equal(isUserAuthorizedForReports({ role: 'tpo' }), true);
    assert.equal(isUserAuthorizedForReports({ role: 'admin' }), true);
    assert.equal(isUserAuthorizedForReports(null), false);
  });

  test('Drive Eligibility List applies real placement drive criteria accurately without fabricating', () => {
    const mockDrive = {
      id: 1,
      companyName: 'Google',
      role: 'SWE Intern',
      minCgpa: 8.0,
      eligibleBatches: ['2026'],
      allowedBranches: ['Computer Science and Engineering', 'Information Technology'],
      maxBacklogs: 0
    };

    const mockStudents = [
      {
        fullName: 'Eligible Student',
        rollNumber: '22CS0101',
        cgpa: 8.85,
        branch: 'Computer Science and Engineering',
        graduationBatch: '2026',
        activeBacklogsCount: 0
      },
      {
        fullName: 'Low CGPA Student',
        rollNumber: '22CS0102',
        cgpa: 7.20, // Below 8.0
        branch: 'Computer Science and Engineering',
        graduationBatch: '2026',
        activeBacklogsCount: 0
      },
      {
        fullName: 'Backlog Student',
        rollNumber: '22CS0103',
        cgpa: 8.90,
        branch: 'Computer Science and Engineering',
        graduationBatch: '2026',
        activeBacklogsCount: 1 // Has active backlog
      },
      {
        fullName: 'Different Branch Student',
        rollNumber: '22ME0104',
        cgpa: 9.10,
        branch: 'Mechanical Engineering', // Not allowed
        graduationBatch: '2026',
        activeBacklogsCount: 0
      }
    ];

    const eligible = getDriveEligibleStudents(mockDrive, mockStudents);
    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].rollNumber, '22CS0101');

    const reportData = generateDriveEligibilityReportData(mockDrive, mockStudents);
    assert.equal(reportData.length, 1);
    assert.equal(reportData[0]['University Roll Number'], '22CS0101');
    assert.equal(reportData[0]['Student Name'], 'Eligible Student');
    assert.equal(reportData[0]['CGPA'], '8.85');
    assert.equal(reportData[0]['Branch'], 'Computer Science and Engineering');
    assert.equal(reportData[0]['Eligibility Status'], 'Eligible');
  });

  test('Drive Eligibility List returns empty dataset when no students match strict criteria', () => {
    const strictDrive = {
      companyName: 'High Bar Corp',
      minCgpa: 9.99,
      eligibleBatches: ['2026'],
      allowedBranches: ['Civil Engineering']
    };

    const eligible = getDriveEligibleStudents(strictDrive, []);
    assert.equal(eligible.length, 0);

    const reportData = generateDriveEligibilityReportData(strictDrive, []);
    assert.equal(reportData.length, 0);
  });

  test('Final Placed Students Report generates accurate placement records and package summary', () => {
    const placedRows = generateFinalPlacedReportData('All', true);
    assert.ok(Array.isArray(placedRows));
    assert.ok(placedRows.length > 0, 'Should have placement records');

    const first = placedRows[0];
    assert.ok(first['Student Name'], 'Must include Student Name');
    assert.ok(first['Company'], 'Must include Company');
    assert.ok(first['Package'], 'Must include Package');
    assert.ok(first['Offer Date'], 'Must include Offer Date');

    // Verify summary statistics
    const stats = getPlacementSummaryStats(placedRows);
    assert.ok(stats.totalOffers > 0);
    assert.ok(stats.uniqueCompanies > 0);
    assert.ok(stats.avgPackageLpa.includes('LPA'));
    assert.ok(stats.highestPackageLpa.includes('LPA'));
  });

  test('Monthly Attendance Summary strictly decouples Academic Class and CRT Training metrics', () => {
    const reportData = generateMonthlyAttendanceReportData(10, 2026, 'CSE');
    assert.ok(Array.isArray(reportData));
    assert.ok(reportData.length > 0);

    const first = reportData[0];
    assert.ok(first['Student Roll Number']);
    assert.ok(first['Student Name']);
    assert.equal(first['Department'], 'CSE');

    // Both categories must be present as distinct metrics without mixing
    assert.ok('Academic Classes Held' in first);
    assert.ok('Academic Classes Attended' in first);
    assert.ok('Academic Attendance %' in first);

    assert.ok('CRT Training Sessions Held' in first);
    assert.ok('CRT Sessions Attended' in first);
    assert.ok('CRT Attendance %' in first);
  });

  test('Export functions generate sensible filenames without crashing', () => {
    const mockDrive = {
      id: 1,
      companyName: 'Amazon',
      role: 'SDE',
      eligibleBatches: ['2026'],
      minCgpa: 8.0
    };

    const driveExport = exportDriveEligibilityList(mockDrive, 'xlsx', []);
    assert.ok(driveExport.filename.includes('drive_eligibility_amazon_2026.xlsx'));

    const placedExport = exportFinalPlacedReport('All', 'csv', true);
    assert.ok(placedExport.filename.includes('final_placed_students_all_companies'));

    const attendanceExport = exportMonthlyAttendanceReport(10, 2026, 'CSE', 'xlsx');
    assert.ok(attendanceExport.filename.includes('monthly_attendance_summary_2026_10_cse.xlsx'));
  });

});
