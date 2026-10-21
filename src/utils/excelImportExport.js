// PlacePrep AI - Team 2: Institute Support
// Excel (.xlsx) and CSV Import / Export Utilities with In-Depth Row Validation

import * as XLSX from 'xlsx';
import { calculateAgeFromDOB } from '../data/initialAcademicRecords';

export const IMPORT_EXPORT_COLUMNS = [
  { key: 'fullName', header: 'Full Name *', required: true },
  { key: 'rollNumber', header: 'Roll Number *', required: true },
  { key: 'registrationNumber', header: 'University Registration Number *', required: true },
  { key: 'collegeName', header: 'College / Institute Name *', required: true },
  { key: 'course', header: 'Course *', required: true },
  { key: 'branch', header: 'Branch / Specialization *', required: true },
  { key: 'graduationBatch', header: 'Graduation Batch (e.g. 2026) *', required: true },
  { key: 'admissionYear', header: 'Admission Year (e.g. 2022) *', required: true },
  { key: 'currentSemester', header: 'Current Semester (1-8) *', required: true },
  { key: 'admissionType', header: 'Admission Type (Regular Entry / Diploma / Lateral Entry) *', required: true },
  { key: 'dateOfBirth', header: 'Date of Birth (YYYY-MM-DD) *', required: true },
  { key: 'gender', header: 'Gender (Male/Female/Other)', required: false },
  { key: 'email', header: 'Email Address *', required: true },
  { key: 'mobileNumber', header: 'Mobile Number *', required: true },
  { key: 'currentAddress', header: 'Current Address *', required: true },
  { key: 'class10Percentage', header: 'Class 10 Percentage *', required: true },
  { key: 'class12Percentage', header: 'Class 12 Percentage (Required for Regular Entry)', required: false },
  { key: 'diplomaCollege', header: 'Diploma College (Required for Lateral Entry)', required: false },
  { key: 'diplomaSpecialization', header: 'Diploma Branch (Required for Lateral Entry)', required: false },
  { key: 'diplomaPercentage', header: 'Diploma Percentage (Required for Lateral Entry)', required: false }
];

/**
 * Format a student object to a flat row for export
 */
function studentToFlatRow(student) {
  return {
    'Full Name *': student.fullName || '',
    'Roll Number *': student.rollNumber || '',
    'University Registration Number *': student.registrationNumber || '',
    'College / Institute Name *': student.collegeName || '',
    'Course *': student.course || '',
    'Branch / Specialization *': student.branch || '',
    'Graduation Batch (e.g. 2026) *': student.graduationBatch || '',
    'Admission Year (e.g. 2022) *': student.admissionYear || '',
    'Current Semester (1-8) *': student.currentSemester || '',
    'Admission Type (Regular Entry / Diploma / Lateral Entry) *': student.admissionType || 'Regular Entry',
    'Date of Birth (YYYY-MM-DD) *': student.dateOfBirth || '',
    'Age': student.age || (student.dateOfBirth ? calculateAgeFromDOB(student.dateOfBirth) : ''),
    'Gender (Male/Female/Other)': student.gender || '',
    'Email Address *': student.email || '',
    'Mobile Number *': student.mobileNumber || '',
    'Current Address *': student.currentAddress || '',
    'Class 10 Percentage *': student.class10Percentage || '',
    'Class 12 Percentage (Required for Regular Entry)': student.class12Percentage || '',
    'Diploma College (Required for Lateral Entry)': student.diplomaCollege || '',
    'Diploma Branch (Required for Lateral Entry)': student.diplomaSpecialization || '',
    'Diploma Percentage (Required for Lateral Entry)': student.diplomaPercentage || '',
    'Current CGPA': student.cgpa || '',
    'Active Backlogs': student.activeBacklogsCount || 0
  };
}

/**
 * Trigger file download in browser
 */
function triggerDownload(blob, filename) {
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
 * Export students array to XLSX
 */
export function exportStudentsToXLSX(students, filename = 'PlacePrep_Student_Academic_Records.xlsx') {
  const flatRows = students.map(studentToFlatRow);
  const worksheet = XLSX.utils.json_to_sheet(flatRows);

  // Set column widths for readability
  const colWidths = [
    { wch: 22 }, // Full Name
    { wch: 15 }, // Roll Number
    { wch: 24 }, // Reg Number
    { wch: 30 }, // College
    { wch: 25 }, // Course
    { wch: 30 }, // Branch
    { wch: 12 }, // Batch
    { wch: 12 }, // Adm Year
    { wch: 12 }, // Semester
    { wch: 22 }, // Adm Type
    { wch: 15 }, // DOB
    { wch: 8 },  // Age
    { wch: 10 }, // Gender
    { wch: 26 }, // Email
    { wch: 18 }, // Mobile
    { wch: 35 }, // Address
    { wch: 12 }, // 10th
    { wch: 12 }, // 12th
    { wch: 25 }, // Dip College
    { wch: 20 }, // Dip Spec
    { wch: 12 }, // Dip %
    { wch: 10 }, // CGPA
    { wch: 14 }  // Active Backlogs
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, filename);
}

/**
 * Export students array to CSV
 */
export function exportStudentsToCSV(students, filename = 'PlacePrep_Student_Academic_Records.csv') {
  const flatRows = students.map(studentToFlatRow);
  const worksheet = XLSX.utils.json_to_sheet(flatRows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

/**
 * Download a standardized sample template in XLSX or CSV
 */
export function downloadSampleTemplate(format = 'xlsx') {
  const sampleData = [
    {
      'Full Name *': 'Aarav Sharma',
      'Roll Number *': '22CS0201',
      'University Registration Number *': 'REG-2022-CSE-0201',
      'College / Institute Name *': 'Delhi Technological University (DTU)',
      'Course *': 'B.Tech (Bachelor of Technology)',
      'Branch / Specialization *': 'Computer Science and Engineering',
      'Graduation Batch (e.g. 2026) *': '2026',
      'Admission Year (e.g. 2022) *': '2022',
      'Current Semester (1-8) *': '6',
      'Admission Type (Regular Entry / Diploma / Lateral Entry) *': 'Regular Entry',
      'Date of Birth (YYYY-MM-DD) *': '2004-06-15',
      'Gender (Male/Female/Other)': 'Male',
      'Email Address *': 'aarav.sharma@example.edu',
      'Mobile Number *': '+91 9876543210',
      'Current Address *': 'Flat 402, Sunshine Heights, New Delhi 110001',
      'Class 10 Percentage *': '92.5',
      'Class 12 Percentage (Required for Regular Entry)': '89.4',
      'Diploma College (Required for Lateral Entry)': '',
      'Diploma Branch (Required for Lateral Entry)': '',
      'Diploma Percentage (Required for Lateral Entry)': ''
    },
    {
      'Full Name *': 'Simran Kaur',
      'Roll Number *': '23IT0302',
      'University Registration Number *': 'REG-2023-IT-0302',
      'College / Institute Name *': 'Netaji Subhas University of Technology (NSUT)',
      'Course *': 'B.Tech (Bachelor of Technology)',
      'Branch / Specialization *': 'Information Technology',
      'Graduation Batch (e.g. 2026) *': '2026',
      'Admission Year (e.g. 2023) *': '2023',
      'Current Semester (1-8) *': '6',
      'Admission Type (Regular Entry / Diploma / Lateral Entry) *': 'Diploma / Lateral Entry',
      'Date of Birth (YYYY-MM-DD) *': '2003-09-22',
      'Gender (Male/Female/Other)': 'Female',
      'Email Address *': 'simran.kaur@example.edu',
      'Mobile Number *': '+91 9811223344',
      'Current Address *': 'Pocket B, Mayur Vihar Phase 2, Delhi 110091',
      'Class 10 Percentage *': '88.0',
      'Class 12 Percentage (Required for Regular Entry)': '',
      'Diploma College (Required for Lateral Entry)': 'Guru Tegh Bahadur Polytechnic Institute',
      'Diploma Branch (Required for Lateral Entry)': 'Information Technology & Systems',
      'Diploma Percentage (Required for Lateral Entry)': '87.5'
    }
  ];

  const filename = `PlacePrep_Student_Import_Template.${format}`;
  if (format === 'csv') {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
  } else {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 30 },
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 10 },
      { wch: 25 }, { wch: 18 }, { wch: 35 }, { wch: 15 },
      { wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 18 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, filename);
  }
}

/**
 * Parse and validate an uploaded CSV or XLSX file
 * Returns { summary, rows: [{ rowNumber, rawData, studentData, isValid, errors }] }
 */
export async function parseImportFile(file, existingStudents = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ error: 'The uploaded file contains no sheets or readable data.' });
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          resolve({ error: 'File is empty or contains only a header row with no student records.' });
          return;
        }

        const headers = rawJson[0].map(h => String(h || '').trim());
        const dataRows = rawJson.slice(1);

        // Helper to match column by fuzzy header title
        const findColumnIndex = (matchKeywords) => {
          return headers.findIndex(h => {
            const lower = h.toLowerCase();
            return matchKeywords.some(kw => lower.includes(kw.toLowerCase()));
          });
        };

        const colMap = {
          fullName: findColumnIndex(['full name', 'student name', 'name']),
          rollNumber: findColumnIndex(['roll number', 'roll no', 'roll']),
          registrationNumber: findColumnIndex(['registration number', 'reg no', 'reg number', 'registration']),
          collegeName: findColumnIndex(['college', 'institute']),
          course: findColumnIndex(['course', 'degree']),
          branch: findColumnIndex(['branch', 'specialization', 'stream']),
          graduationBatch: findColumnIndex(['graduation batch', 'batch', 'grad batch']),
          admissionYear: findColumnIndex(['admission year', 'adm year']),
          currentSemester: findColumnIndex(['current semester', 'semester', 'sem']),
          admissionType: findColumnIndex(['admission type', 'entry type']),
          dateOfBirth: findColumnIndex(['date of birth', 'dob']),
          gender: findColumnIndex(['gender', 'sex']),
          email: findColumnIndex(['email address', 'email', 'mail']),
          mobileNumber: findColumnIndex(['mobile number', 'mobile', 'phone']),
          currentAddress: findColumnIndex(['current address', 'address']),
          class10Percentage: findColumnIndex(['class 10', '10th', 'ssc']),
          class12Percentage: findColumnIndex(['class 12', '12th', 'hsc']),
          diplomaCollege: findColumnIndex(['diploma college', 'polytechnic']),
          diplomaSpecialization: findColumnIndex(['diploma branch', 'diploma specialization']),
          diplomaPercentage: findColumnIndex(['diploma percentage', 'diploma marks', 'diploma %'])
        };

        const parsedRows = [];
        const seenRollsInFile = new Set();
        const seenRegsInFile = new Set();

        dataRows.forEach((row, idx) => {
          // Skip completely blank rows
          if (!row || row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')) {
            return;
          }

          const rowNum = idx + 2; // 1-based, +1 for header
          const errors = [];

          const getVal = (colIndex) => {
            if (colIndex === -1 || row[colIndex] === undefined || row[colIndex] === null) return '';
            return String(row[colIndex]).trim();
          };

          const fullName = getVal(colMap.fullName);
          const rollNumber = getVal(colMap.rollNumber);
          const registrationNumber = getVal(colMap.registrationNumber);
          const collegeName = getVal(colMap.collegeName) || 'Delhi Technological University (DTU)';
          const course = getVal(colMap.course) || 'B.Tech (Bachelor of Technology)';
          const branch = getVal(colMap.branch);
          const graduationBatch = getVal(colMap.graduationBatch);
          const admissionYear = getVal(colMap.admissionYear);
          const currentSemester = parseInt(getVal(colMap.currentSemester), 10);
          const rawAdmissionType = getVal(colMap.admissionType);
          const isLateral = 
            rawAdmissionType.toLowerCase().includes('diploma') || 
            rawAdmissionType.toLowerCase().includes('lateral');
          const admissionType = isLateral ? 'Diploma / Lateral Entry' : 'Regular Entry';
          
          let dateOfBirth = getVal(colMap.dateOfBirth);
          // Handle numeric Excel date if converted
          if (/^\d{5}$/.test(dateOfBirth)) {
            const excelDate = new Date((parseInt(dateOfBirth, 10) - (25567 + 1)) * 86400 * 1000);
            dateOfBirth = excelDate.toISOString().slice(0, 10);
          }

          const gender = getVal(colMap.gender) || 'Not Specified';
          const email = getVal(colMap.email);
          const mobileNumber = getVal(colMap.mobileNumber);
          const currentAddress = getVal(colMap.currentAddress);
          const class10Percentage = parseFloat(getVal(colMap.class10Percentage));
          const class12Percentage = parseFloat(getVal(colMap.class12Percentage));
          const diplomaCollege = getVal(colMap.diplomaCollege);
          const diplomaSpecialization = getVal(colMap.diplomaSpecialization);
          const diplomaPercentage = parseFloat(getVal(colMap.diplomaPercentage));

          // Validations
          if (!fullName) errors.push('Full Name is missing');
          
          // Roll Number Checks
          if (!rollNumber) {
            errors.push('Roll Number is missing');
          } else {
            const rollLower = rollNumber.toLowerCase();
            if (seenRollsInFile.has(rollLower)) {
              errors.push(`Duplicate Roll Number "${rollNumber}" found multiple times in this file`);
            } else {
              seenRollsInFile.add(rollLower);
            }

            const existingWithRoll = existingStudents.find(
              s => s.rollNumber && s.rollNumber.trim().toLowerCase() === rollLower
            );
            if (existingWithRoll) {
              errors.push(`Roll Number "${rollNumber}" already belongs to existing student: ${existingWithRoll.fullName}`);
            }
          }

          // Registration Number Checks
          if (!registrationNumber) {
            errors.push('University Registration Number is missing');
          } else {
            const regLower = registrationNumber.toLowerCase();
            if (seenRegsInFile.has(regLower)) {
              errors.push(`Duplicate Registration Number "${registrationNumber}" in this file`);
            } else {
              seenRegsInFile.add(regLower);
            }

            const existingWithReg = existingStudents.find(
              s => s.registrationNumber && s.registrationNumber.trim().toLowerCase() === regLower
            );
            if (existingWithReg) {
              errors.push(`Registration Number "${registrationNumber}" already exists in system for: ${existingWithReg.fullName}`);
            }
          }

          if (!branch) errors.push('Branch / Specialization is missing');
          if (!graduationBatch) errors.push('Graduation Batch is missing');
          if (!admissionYear) errors.push('Admission Year is missing');
          if (isNaN(currentSemester) || currentSemester < 1 || currentSemester > 8) {
            errors.push('Current Semester must be a number between 1 and 8');
          }

          // Date of Birth & Age
          if (!dateOfBirth) {
            errors.push('Date of Birth is missing');
          } else {
            const age = calculateAgeFromDOB(dateOfBirth);
            if (age === '' || age < 14 || age > 65) {
              errors.push('Invalid Date of Birth (Age must be between 14 and 65 years)');
            }
          }

          // Email & Mobile
          if (!email) {
            errors.push('Email is missing');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email address format');
          }

          if (!mobileNumber) {
            errors.push('Mobile Number is missing');
          }

          if (!currentAddress) errors.push('Current Address is missing');

          // Class 10
          if (isNaN(class10Percentage) || class10Percentage < 30 || class10Percentage > 100) {
            errors.push('Class 10 Percentage must be a valid number between 30 and 100');
          }

          // Conditional Diploma vs Class 12
          if (isLateral) {
            if (isNaN(diplomaPercentage) || diplomaPercentage < 30 || diplomaPercentage > 100) {
              errors.push('Diploma Percentage is required for Lateral Entry (between 30 and 100)');
            }
            if (!diplomaCollege) errors.push('Diploma College Name is required for Lateral Entry');
          } else {
            if (isNaN(class12Percentage) || class12Percentage < 30 || class12Percentage > 100) {
              errors.push('Class 12 Percentage is required for Regular Entry (between 30 and 100)');
            }
          }

          const isValid = errors.length === 0;

          const studentData = {
            fullName,
            rollNumber,
            registrationNumber,
            collegeName,
            course,
            branch,
            graduationBatch,
            admissionYear,
            currentSemester: currentSemester || 1,
            admissionType,
            dateOfBirth,
            age: calculateAgeFromDOB(dateOfBirth),
            gender,
            email,
            mobileNumber,
            alternateContact: '',
            currentAddress,
            permanentAddress: currentAddress,
            sameAsCurrentAddress: true,
            class10Board: 'CBSE / State Board',
            class10School: 'Secondary High School',
            class10Year: admissionYear ? String(parseInt(admissionYear, 10) - 2) : '2020',
            class10Percentage: isNaN(class10Percentage) ? null : class10Percentage,
            class10MaxMarks: 100,
            class12Board: isLateral ? '' : 'CBSE / State Board',
            class12School: isLateral ? '' : 'Senior Secondary School',
            class12Year: isLateral ? '' : (admissionYear ? String(parseInt(admissionYear, 10)) : '2022'),
            class12Percentage: isNaN(class12Percentage) ? null : class12Percentage,
            class12MaxMarks: 100,
            diplomaCollege: isLateral ? diplomaCollege : '',
            diplomaSpecialization: isLateral ? diplomaSpecialization : '',
            diplomaYear: isLateral ? admissionYear : '',
            diplomaPercentage: isNaN(diplomaPercentage) ? null : diplomaPercentage,
            diplomaMaxMarks: 100,
            activeBacklogsCount: 0,
            cgpa: null,
            status: 'Active'
          };

          parsedRows.push({
            rowNumber: rowNum,
            isValid,
            errors,
            studentData,
            rawData: row
          });
        });

        const validCount = parsedRows.filter(r => r.isValid).length;
        const invalidCount = parsedRows.length - validCount;

        resolve({
          summary: {
            totalRows: parsedRows.length,
            validRows: validCount,
            invalidRows: invalidCount
          },
          rows: parsedRows
        });
      } catch (err) {
        console.error('File parsing error:', err);
        resolve({ error: `Failed to process spreadsheet file: ${err.message}` });
      }
    };

    reader.onerror = () => {
      resolve({ error: 'Failed to read file from disk.' });
    };

    reader.readAsArrayBuffer(file);
  });
}
