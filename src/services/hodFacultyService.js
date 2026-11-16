// PlacePrep - HOD Faculty Registration & Management Service
// Enforces that HOD users can only register and manage faculty belonging to their own department.
// Provides local offline fallback persistence, validation, and CSV / Spreadsheet import tools.

import * as XLSX from 'xlsx';
import { HodFacultyApi } from './api.js';

// Canonical department normalization
export function normalizeDepartmentCode(rawDept) {
  if (!rawDept) return 'CSE';
  const norm = String(rawDept).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (norm.includes('AIDS') || norm.includes('ARTIFICIAL') || norm.includes('DATA')) return 'AI&DS';
  if (norm.includes('CSE') || norm.includes('COMPUTER') || norm.includes('CS')) return 'CSE';
  if (norm.includes('IT') || norm.includes('INFORMATION')) return 'IT';
  if (norm.includes('ECE') || norm.includes('ELECTRONIC') || norm.includes('COMMUNICATION')) return 'ECE';
  if (norm.includes('MECH') || norm.includes('MECHANICAL')) return 'ME';
  if (norm.includes('CIVIL')) return 'CIVIL';
  if (norm.includes('ELECTRICAL')) return 'EE';
  return String(rawDept).trim().toUpperCase();
}

export function getHodDepartment(currentUser) {
  if (!currentUser) return 'CSE';
  const raw = currentUser.department || currentUser.branch || 'CSE';
  return normalizeDepartmentCode(raw);
}

// Initial verified faculty records for standard departments
const INITIAL_FACULTY_CATALOG = {
  'CSE': [
    {
      id: 101,
      name: 'Dr. Anand Sharma',
      email: 'a.sharma@placeprep.com',
      facultyId: 'FAC-CSE-001',
      phone: '9876543210',
      department: 'CSE',
      designation: 'Professor',
      specialization: 'Design & Analysis of Algorithms',
      qualification: 'Ph.D. in Computer Science (IIT Delhi)',
      joiningDate: '2020-07-15',
      status: 'ACTIVE',
      shortCode: 'AS'
    },
    {
      id: 102,
      name: 'Prof. Priya Verma',
      email: 'p.verma@placeprep.com',
      facultyId: 'FAC-CSE-002',
      phone: '9876543211',
      department: 'CSE',
      designation: 'Associate Professor',
      specialization: 'Database Management Systems & Distributed DBs',
      qualification: 'M.Tech, Ph.D. (BITS Pilani)',
      joiningDate: '2021-08-01',
      status: 'ACTIVE',
      shortCode: 'PV'
    },
    {
      id: 103,
      name: 'Dr. Manoj Gupta',
      email: 'm.gupta@placeprep.com',
      facultyId: 'FAC-CSE-003',
      phone: '9876543212',
      department: 'CSE',
      designation: 'Associate Professor',
      specialization: 'Operating Systems & Linux Kernel',
      qualification: 'Ph.D. Computer Systems',
      joiningDate: '2022-01-10',
      status: 'ACTIVE',
      shortCode: 'MG'
    },
    {
      id: 104,
      name: 'Dr. Sunita Nair',
      email: 's.nair@placeprep.com',
      facultyId: 'FAC-CSE-004',
      phone: '9876543213',
      department: 'CSE',
      designation: 'Assistant Professor',
      specialization: 'Computer Networks & Network Security',
      qualification: 'M.Tech, Ph.D.',
      joiningDate: '2023-07-20',
      status: 'ACTIVE',
      shortCode: 'SN'
    }
  ],
  'AI&DS': [
    {
      id: 201,
      name: 'Ms. Ambika Bagri',
      email: 'faculty.ab@placeprep.com',
      facultyId: 'FAC-AIDS-001',
      phone: '9876543220',
      department: 'AI&DS',
      designation: 'Assistant Professor',
      specialization: 'Artificial Intelligence & Neural Networks',
      qualification: 'M.Tech (AI & Robotics)',
      joiningDate: '2021-09-01',
      status: 'ACTIVE',
      shortCode: 'AB'
    },
    {
      id: 202,
      name: 'Mr. Rahul Guha',
      email: 'faculty.rg@placeprep.com',
      facultyId: 'FAC-AIDS-002',
      phone: '9876543221',
      department: 'AI&DS',
      designation: 'Assistant Professor',
      specialization: 'Machine Learning & Big Data Analytics',
      qualification: 'M.Tech (Data Science)',
      joiningDate: '2022-08-15',
      status: 'ACTIVE',
      shortCode: 'RG'
    },
    {
      id: 203,
      name: 'Dr. Kavita Singhal',
      email: 'k.singhal@placeprep.com',
      facultyId: 'FAC-AIDS-003',
      phone: '9876543222',
      department: 'AI&DS',
      designation: 'Associate Professor',
      specialization: 'Computer Vision & Natural Language Processing',
      qualification: 'Ph.D. in AI (IIT Bombay)',
      joiningDate: '2020-06-10',
      status: 'ACTIVE',
      shortCode: 'KS'
    }
  ],
  'IT': [
    {
      id: 301,
      name: 'Dr. Vivek Mehra',
      email: 'v.mehra@placeprep.com',
      facultyId: 'FAC-IT-001',
      phone: '9876543230',
      department: 'IT',
      designation: 'Associate Professor',
      specialization: 'Web Systems & Cloud Infrastructure',
      qualification: 'Ph.D. Information Technology',
      joiningDate: '2021-02-15',
      status: 'ACTIVE',
      shortCode: 'VM'
    }
  ],
  'ECE': [
    {
      id: 401,
      name: 'Dr. Ritu Choudhary',
      email: 'r.choudhary@placeprep.com',
      facultyId: 'FAC-ECE-001',
      phone: '9876543240',
      department: 'ECE',
      designation: 'Professor',
      specialization: 'VLSI Design & Embedded Systems',
      qualification: 'Ph.D. Electronics',
      joiningDate: '2019-07-01',
      status: 'ACTIVE',
      shortCode: 'RC'
    }
  ]
};

const STORAGE_KEY_PREFIX = 'placeprep_hod_faculty_';

export function getStoredDepartmentFaculty(deptCode) {
  const norm = normalizeDepartmentCode(deptCode);
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + norm);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // localStorage optional
  }
  return INITIAL_FACULTY_CATALOG[norm] || [
    {
      id: 501,
      name: `Dr. Head Faculty (${norm})`,
      email: `faculty.${norm.toLowerCase()}@placeprep.com`,
      facultyId: `FAC-${norm}-001`,
      phone: '9876543200',
      department: norm,
      designation: 'Professor',
      specialization: 'Core Engineering Foundations',
      qualification: 'Ph.D.',
      joiningDate: '2021-08-01',
      status: 'ACTIVE',
      shortCode: 'HF'
    }
  ];
}

export function saveStoredDepartmentFaculty(deptCode, facultyList) {
  const norm = normalizeDepartmentCode(deptCode);
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + norm, JSON.stringify(facultyList));
  } catch {
    // ignore
  }
}

/**
 * Register a single faculty member belonging ONLY to the HOD's department.
 */
export async function registerDepartmentFaculty(facultyData, currentUser) {
  if (currentUser && currentUser.role && currentUser.role !== 'hod' && currentUser.role !== 'admin') {
    throw new Error('Unauthorized: Only Department Heads (HOD) or Administrators can register faculty.');
  }

  const hodDept = getHodDepartment(currentUser);
  const fullName = (facultyData.fullName || facultyData.name || '').trim();
  const email = (facultyData.email || '').trim().toLowerCase();
  const facultyId = (facultyData.facultyId || facultyData.employeeId || '').trim().toUpperCase();

  // Department is strictly locked to HOD's department
  const payload = {
    ...facultyData,
    name: fullName,
    fullName: fullName,
    email: email,
    facultyId: facultyId,
    department: hodDept, // Force HOD's department
    status: facultyData.status || 'ACTIVE'
  };

  if (!payload.name) throw new Error('Full Name is required.');
  if (!payload.email) throw new Error('Official Email Address is required.');
  if (!payload.facultyId) throw new Error('Faculty ID / Employee ID is required.');

  // Validate duplicate against local storage
  const currentList = getStoredDepartmentFaculty(hodDept);
  const emailExists = currentList.some(f => f.email && f.email.toLowerCase() === payload.email.toLowerCase());
  if (emailExists) {
    throw new Error(`Email address is already registered in ${hodDept} Department: ${payload.email}`);
  }
  const idExists = currentList.some(f => f.facultyId && f.facultyId.toUpperCase() === payload.facultyId.toUpperCase());
  if (idExists) {
    throw new Error(`Faculty ID already exists in ${hodDept} Department: ${payload.facultyId}`);
  }

  try {
    const res = await HodFacultyApi.register(payload);
    if (res && res.id) {
      const updated = [res, ...currentList.filter(f => f.id !== res.id)];
      saveStoredDepartmentFaculty(hodDept, updated);
      return res;
    }
  } catch (err) {
    // If backend rejects due to permission / duplicates, rethrow
    if (err.status === 400 || err.status === 403) {
      throw err;
    }
    console.warn('Backend faculty registration deferred, saving to local department roster:', err);
  }

  // Local fallback persistence
  const newRecord = {
    ...payload,
    id: Date.now(),
    department: hodDept,
    status: payload.status || 'ACTIVE'
  };
  const updated = [newRecord, ...currentList];
  saveStoredDepartmentFaculty(hodDept, updated);
  return newRecord;
}

/**
 * Bulk import faculty for HOD's department.
 */
export async function bulkImportDepartmentFaculty(facultyRows, currentUser) {
  const hodDept = getHodDepartment(currentUser);
  const currentList = getStoredDepartmentFaculty(hodDept);

  const seenEmails = new Set(currentList.map(f => (f.email || '').toLowerCase()));
  const seenIds = new Set(currentList.map(f => (f.facultyId || '').toUpperCase()));

  const successful = [];
  const failed = [];

  const validPayloadList = [];

  for (let i = 0; i < facultyRows.length; i++) {
    const row = facultyRows[i];
    const rowNum = i + 1;
    const name = (row.name || row['Full Name'] || '').trim();
    const email = (row.email || row['Email Address'] || row['Official Email'] || '').trim().toLowerCase();
    const facultyId = (row.facultyId || row['Faculty ID'] || row['Employee ID'] || '').trim().toUpperCase();

    if (!name || !email || !facultyId) {
      failed.push({
        row: rowNum,
        name,
        email,
        facultyId,
        reason: 'Missing required field: Name, Email, and Faculty ID are required.'
      });
      continue;
    }

    if (seenEmails.has(email)) {
      failed.push({
        row: rowNum,
        name,
        email,
        facultyId,
        reason: `Email address already exists or is duplicate in file: ${email}`
      });
      continue;
    }

    if (seenIds.has(facultyId)) {
      failed.push({
        row: rowNum,
        name,
        email,
        facultyId,
        reason: `Faculty ID already exists or is duplicate in file: ${facultyId}`
      });
      continue;
    }

    seenEmails.add(email);
    seenIds.add(facultyId);

    const record = {
      id: Date.now() + i,
      name,
      email,
      facultyId,
      phone: (row.phone || row['Mobile Number'] || row['Phone'] || '').trim(),
      department: hodDept, // STRICTLY HOD DEPARTMENT
      designation: (row.designation || row['Designation'] || 'Assistant Professor').trim(),
      specialization: (row.specialization || row['Specialization'] || row['Subject'] || '').trim(),
      qualification: (row.qualification || row['Qualification'] || '').trim(),
      joiningDate: (row.joiningDate || row['Joining Date'] || new Date().toISOString().slice(0, 10)).trim(),
      status: (row.status || row['Status'] || 'ACTIVE').trim().toUpperCase()
    };

    validPayloadList.push(record);
    successful.push(record);
  }

  // Attempt backend bulk import
  try {
    if (validPayloadList.length > 0) {
      const res = await HodFacultyApi.bulkImport(validPayloadList);
      if (res && res.successful) {
        const updated = [...res.successful, ...currentList];
        saveStoredDepartmentFaculty(hodDept, updated);
        return res;
      }
    }
  } catch (err) {
    console.warn('Backend bulk import deferred, saving to local department storage:', err);
  }

  // Local fallback
  const updated = [...successful, ...currentList];
  saveStoredDepartmentFaculty(hodDept, updated);

  return {
    totalProcessed: facultyRows.length,
    successCount: successful.length,
    failureCount: failed.length,
    department: hodDept,
    successful,
    failed
  };
}

/**
 * Parses and validates CSV content or row objects for Faculty Bulk Import.
 */
export function parseFacultyImportFile(contentOrRows, department = 'CSE') {
  let rows = [];
  if (typeof contentOrRows === 'string') {
    const lines = contentOrRows.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length > 1) {
      const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const obj = {};
        header.forEach((h, idx) => {
          obj[h] = parts[idx] || '';
        });
        rows.push(obj);
      }
    }
  } else if (Array.isArray(contentOrRows)) {
    rows = contentOrRows;
  }

  const existing = getStoredDepartmentFaculty(department);
  const existingEmails = new Set(existing.map(f => (f.email || '').toLowerCase()));
  const existingIds = new Set(existing.map(f => (f.facultyId || '').toUpperCase()));

  const seenEmails = new Set();
  const seenIds = new Set();

  const validRows = [];
  const invalidRows = [];
  const allRows = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const name = (row['Full Name'] || row.Name || row.name || '').toString().trim();
    const email = (row['Official Email Address'] || row['Official Email'] || row['Email Address'] || row.Email || row.email || '').toString().trim().toLowerCase();
    const facultyId = (row['Faculty ID / Employee ID'] || row['Faculty ID'] || row['Employee ID'] || row.facultyId || row.FacultyId || '').toString().trim().toUpperCase();
    const phone = (row['Mobile Number'] || row.Phone || row.phone || '').toString().trim();
    const designation = (row['Designation'] || row.designation || 'Assistant Professor').toString().trim();
    const specialization = (row['Specialization / Subject'] || row['Specialization'] || row['Subject'] || row.specialization || '').toString().trim();
    const qualification = (row['Qualification'] || row.qualification || '').toString().trim();
    const joiningDate = (row['Joining Date'] || row.joiningDate || new Date().toISOString().slice(0, 10)).toString().trim();
    const status = (row['Account Status'] || row['Status'] || row.status || 'ACTIVE').toString().trim().toUpperCase();

    const errors = [];
    if (!name) errors.push('Missing required field: Full Name is required');
    if (!email) errors.push('Missing required field: Official Email is required');
    else if (!email.includes('@') || !email.includes('.')) errors.push('Invalid email format');

    if (!facultyId) errors.push('Missing required field: Faculty ID is required');

    if (email) {
      if (seenEmails.has(email)) {
        errors.push(`Duplicate email in this file: ${email}`);
      } else if (existingEmails.has(email)) {
        errors.push(`Email already registered in ${department}: ${email}`);
      }
    }

    if (facultyId) {
      if (seenIds.has(facultyId)) {
        errors.push(`Duplicate Faculty ID in this file: ${facultyId}`);
      } else if (existingIds.has(facultyId)) {
        errors.push(`Faculty ID already registered in ${department}: ${facultyId}`);
      }
    }

    const processedRow = {
      rowNum,
      name,
      email,
      facultyId,
      phone,
      department,
      designation,
      specialization,
      qualification,
      joiningDate,
      status: status || 'ACTIVE',
      isValid: errors.length === 0,
      reason: errors.join(', ')
    };

    allRows.push(processedRow);
    if (errors.length === 0) {
      seenEmails.add(email);
      seenIds.add(facultyId);
      validRows.push(processedRow);
    } else {
      invalidRows.push(processedRow);
    }
  });

  return { validRows, invalidRows, allRows };
}

/**
 * Fetch all faculty members belonging strictly to HOD's department.
 */
export async function fetchDepartmentFaculty(currentUser, filters = {}) {
  const hodDept = getHodDepartment(currentUser);
  let list = [];

  try {
    const res = await HodFacultyApi.getAll(filters);
    if (Array.isArray(res) && res.length > 0) {
      list = res;
    }
  } catch (err) {
    // fallback
  }

  if (list.length === 0) {
    list = getStoredDepartmentFaculty(hodDept);
  }

  // Client-side filter guarantee: HOD CAN NEVER SEE OTHER DEPARTMENTS
  list = list.filter(f => normalizeDepartmentCode(f.department) === hodDept);

  const { search, designation, status } = filters;
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(f =>
      (f.name && f.name.toLowerCase().includes(s)) ||
      (f.email && f.email.toLowerCase().includes(s)) ||
      (f.facultyId && f.facultyId.toLowerCase().includes(s)) ||
      (f.specialization && f.specialization.toLowerCase().includes(s))
    );
  }

  if (designation && designation !== 'All') {
    list = list.filter(f => f.designation && f.designation.toLowerCase().includes(designation.toLowerCase()));
  }

  if (status && status !== 'All') {
    list = list.filter(f => (f.status || 'ACTIVE').toUpperCase() === status.toUpperCase());
  }

  return list;
}

/**
 * Update faculty info
 */
export async function updateDepartmentFaculty(id, updates, currentUser) {
  const hodDept = getHodDepartment(currentUser);
  try {
    const res = await HodFacultyApi.update(id, updates);
    if (res) return res;
  } catch {
    // fallback
  }

  const currentList = getStoredDepartmentFaculty(hodDept);
  const updated = currentList.map(f => (String(f.id) === String(id) ? { ...f, ...updates } : f));
  saveStoredDepartmentFaculty(hodDept, updated);
  return updated.find(f => String(f.id) === String(id));
}

/**
 * Toggle faculty status
 */
export async function toggleDepartmentFacultyStatus(id, newStatus, currentUser) {
  const hodDept = getHodDepartment(currentUser);
  try {
    const res = await HodFacultyApi.updateStatus(id, newStatus);
    if (res) return res;
  } catch {
    // fallback
  }

  const currentList = getStoredDepartmentFaculty(hodDept);
  const updated = currentList.map(f => (String(f.id) === String(id) ? { ...f, status: newStatus } : f));
  saveStoredDepartmentFaculty(hodDept, updated);
  return updated.find(f => String(f.id) === String(id));
}

/**
 * Generates and downloads a clean Excel / CSV template for Faculty Bulk Import.
 */
export function downloadFacultyImportTemplate(format = 'csv') {
  const headers = [
    'Full Name',
    'Official Email',
    'Faculty ID',
    'Mobile Number',
    'Designation',
    'Specialization',
    'Qualification',
    'Joining Date',
    'Status'
  ];

  const sampleRows = [
    [
      'Dr. Suresh Rathi',
      'suresh.rathi@univ.edu',
      'FAC-EMP-105',
      '9876543210',
      'Associate Professor',
      'Artificial Intelligence & Deep Learning',
      'Ph.D. in Computer Science',
      '2024-07-01',
      'ACTIVE'
    ],
    [
      'Prof. Meenakshi Sundaram',
      'm.sundaram@univ.edu',
      'FAC-EMP-106',
      '9876543211',
      'Assistant Professor',
      'Cloud Architecture & Microservices',
      'M.Tech Computer Engineering',
      '2024-08-15',
      'ACTIVE'
    ]
  ];

  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty Template');
    XLSX.writeFile(wb, 'PlacePrep_Faculty_Import_Template.xlsx');
  } else {
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PlacePrep_Faculty_Import_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
