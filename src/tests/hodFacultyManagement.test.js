import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for test runner
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

import {
  normalizeDepartmentCode,
  getHodDepartment,
  registerDepartmentFaculty,
  bulkImportDepartmentFaculty,
  fetchDepartmentFaculty,
  updateDepartmentFaculty,
  toggleDepartmentFacultyStatus,
  parseFacultyImportFile
} from '../services/hodFacultyService.js';

test.beforeEach(() => {
  mockStorage.clear();
});

test('Scenario 1: CSE HOD registers CSE faculty successfully', async () => {
  const cseHod = {
    id: 'user-cse-hod',
    name: 'Dr. Ramesh Kumar',
    email: 'hod.cse@dtu.ac.in',
    role: 'hod',
    branch: 'CSE',
    department: 'Computer Science & Engineering'
  };

  const payload = {
    fullName: 'Dr. Anita Sharma',
    email: 'anita.cse@dtu.ac.in',
    facultyId: 'FAC-CSE-901',
    mobileNumber: '9876543210',
    designation: 'Associate Professor',
    specialization: 'Distributed Systems',
    qualification: 'Ph.D. in Computer Science',
    joiningDate: '2023-07-15',
    status: 'ACTIVE'
  };

  const result = await registerDepartmentFaculty(payload, cseHod);
  assert.ok(result.id);
  assert.strictEqual(result.name, 'Dr. Anita Sharma');
  assert.strictEqual(result.email, 'anita.cse@dtu.ac.in');
  assert.strictEqual(result.facultyId, 'FAC-CSE-901');
  assert.strictEqual(result.department, 'CSE');
  assert.strictEqual(result.status, 'ACTIVE');

  // Verify faculty is stored in CSE roster and present at top
  const list = await fetchDepartmentFaculty(cseHod);
  assert.ok(list.length >= 1);
  assert.strictEqual(list[0].facultyId, 'FAC-CSE-901');
});

test('Scenario 2: CSE HOD cannot register AI & DS faculty (auto-assigned/locked to CSE)', async () => {
  const cseHod = {
    id: 'user-cse-hod',
    role: 'hod',
    branch: 'CSE'
  };

  // Attempting to inject department: "AI & DS" in payload
  const payload = {
    fullName: 'Dr. Rajesh Gupta',
    email: 'rajesh.aids@dtu.ac.in',
    facultyId: 'FAC-CROSS-002',
    department: 'AI & DS', // Mistaken or malicious override
    designation: 'Assistant Professor'
  };

  const result = await registerDepartmentFaculty(payload, cseHod);
  // Must be strictly forced to HOD's department (CSE)
  assert.strictEqual(result.department, 'CSE');
  assert.notStrictEqual(result.department, 'AI & DS');

  // Verify AI&DS HOD cannot see this member
  const aidsHod = {
    id: 'user-aids-hod',
    role: 'hod',
    branch: 'AI & DS'
  };
  const aidsList = await fetchDepartmentFaculty(aidsHod);
  assert.ok(!aidsList.some(f => f.facultyId === 'FAC-CROSS-002'));
});

test('Scenario 3: AI & DS HOD can register AI & DS faculty', async () => {
  const aidsHod = {
    id: 'user-aids-hod',
    name: 'Dr. Priya Sundaram',
    email: 'hod.aids@dtu.ac.in',
    role: 'hod',
    branch: 'AI & DS'
  };

  const payload = {
    fullName: 'Dr. Sandeep Verma',
    email: 'sandeep.aids@dtu.ac.in',
    facultyId: 'FAC-AIDS-901',
    mobileNumber: '9123456789',
    designation: 'Professor',
    specialization: 'Deep Learning & NLP',
    qualification: 'Ph.D. in AI',
    status: 'ACTIVE'
  };

  const result = await registerDepartmentFaculty(payload, aidsHod);
  assert.strictEqual(normalizeDepartmentCode(result.department), 'AI&DS');
  assert.strictEqual(result.name, 'Dr. Sandeep Verma');

  const aidsFaculty = await fetchDepartmentFaculty(aidsHod);
  assert.ok(aidsFaculty.some(f => f.facultyId === 'FAC-AIDS-901'));
});

test('Scenario 4: Duplicate faculty email is rejected', async () => {
  const cseHod = { id: 'hod-cse', role: 'hod', branch: 'CSE' };

  await registerDepartmentFaculty({
    fullName: 'Professor A',
    email: 'duplicate@dtu.ac.in',
    facultyId: 'FAC-DUP-01'
  }, cseHod);

  await assert.rejects(
    async () => {
      await registerDepartmentFaculty({
        fullName: 'Professor B',
        email: 'DUPLICATE@dtu.ac.in', // case-insensitive check
        facultyId: 'FAC-DUP-02'
      }, cseHod);
    },
    /already registered/i
  );
});

test('Scenario 5: Duplicate Faculty ID is rejected', async () => {
  const cseHod = { id: 'hod-cse', role: 'hod', branch: 'CSE' };

  await registerDepartmentFaculty({
    fullName: 'Professor One',
    email: 'one@dtu.ac.in',
    facultyId: 'EMP-9999'
  }, cseHod);

  await assert.rejects(
    async () => {
      await registerDepartmentFaculty({
        fullName: 'Professor Two',
        email: 'two@dtu.ac.in',
        facultyId: 'emp-9999' // case-insensitive check
      }, cseHod);
    },
    /already exists/i
  );
});

test('Scenario 6: Unauthorized users cannot access faculty registration', async () => {
  const studentUser = { id: 'student-1', role: 'student', branch: 'CSE' };
  const teacherUser = { id: 'teacher-1', role: 'teacher', branch: 'CSE' };

  await assert.rejects(
    async () => {
      await registerDepartmentFaculty({
        fullName: 'Illegal Faculty',
        email: 'illegal@dtu.ac.in',
        facultyId: 'FAC-ILL-01'
      }, studentUser);
    },
    /unauthorized|only department heads/i
  );

  await assert.rejects(
    async () => {
      await registerDepartmentFaculty({
        fullName: 'Illegal Faculty 2',
        email: 'illegal2@dtu.ac.in',
        facultyId: 'FAC-ILL-02'
      }, teacherUser);
    },
    /unauthorized|only department heads/i
  );
});

test('Scenario 7: HOD cannot access another department faculty records', async () => {
  const cseHod = { id: 'hod-cse', role: 'hod', branch: 'CSE' };
  const itHod = { id: 'hod-it', role: 'hod', branch: 'IT' };

  // Register in CSE
  await registerDepartmentFaculty({
    fullName: 'Dr. CSE Faculty',
    email: 'faculty@cse.dtu.ac.in',
    facultyId: 'FAC-CSE-ISOLATE'
  }, cseHod);

  // Register in IT
  await registerDepartmentFaculty({
    fullName: 'Dr. IT Faculty',
    email: 'faculty@it.dtu.ac.in',
    facultyId: 'FAC-IT-ISOLATE'
  }, itHod);

  // Verify CSE HOD only sees CSE
  const cseList = await fetchDepartmentFaculty(cseHod);
  assert.ok(cseList.some(f => f.facultyId === 'FAC-CSE-ISOLATE'));
  assert.ok(!cseList.some(f => f.facultyId === 'FAC-IT-ISOLATE'));

  // Verify IT HOD only sees IT
  const itUpdated = await fetchDepartmentFaculty(itHod);
  assert.ok(itUpdated.some(f => f.facultyId === 'FAC-IT-ISOLATE'));
  assert.ok(!itUpdated.some(f => f.facultyId === 'FAC-CSE-ISOLATE'));
});

test('Scenario 8: Bulk import parses, validates, and rejects in-file duplicates', async () => {
  const eceHod = { id: 'hod-ece', role: 'hod', branch: 'ECE' };

  const csvContent = `Full Name,Official Email Address,Faculty ID / Employee ID,Mobile Number,Designation,Specialization,Qualification,Joining Date,Account Status
Dr. Vikram Singh,vikram@dtu.ac.in,FAC-ECE-801,9876543211,Professor,VLSI Design,Ph.D,2022-01-10,ACTIVE
Dr. Meera Nair,meera@dtu.ac.in,FAC-ECE-802,9876543212,Assistant Professor,Embedded Systems,M.Tech,2023-06-01,ACTIVE
Duplicate Row,vikram@dtu.ac.in,FAC-ECE-803,9876543213,Lecturer,Telecom,M.Tech,2023-01-01,ACTIVE
Missing Email,Invalid Person,,9876543214,Lecturer,Telecom,M.Tech,2023-01-01,ACTIVE`;

  const parsed = parseFacultyImportFile(csvContent, 'ECE');
  assert.strictEqual(parsed.validRows.length, 2);
  assert.strictEqual(parsed.invalidRows.length, 2);

  // Verify reason for failure
  assert.ok(parsed.invalidRows.some(r => r.reason.includes('Duplicate email')));
  assert.ok(parsed.invalidRows.some(r => r.reason.includes('Missing required field')));

  // Execute bulk import
  const result = await bulkImportDepartmentFaculty(parsed.validRows, eceHod);
  assert.strictEqual(result.successCount, 2);
  assert.strictEqual(result.failureCount, 0);
  assert.strictEqual(result.department, 'ECE');

  const roster = await fetchDepartmentFaculty(eceHod);
  assert.ok(roster.some(f => f.facultyId === 'FAC-ECE-801'));
  assert.ok(roster.some(f => f.facultyId === 'FAC-ECE-802'));
});

test('Department Faculty Operations: Update and Status Toggle', async () => {
  const cseHod = { id: 'hod-cse', role: 'hod', branch: 'CSE' };

  const created = await registerDepartmentFaculty({
    fullName: 'Prof. Test Operations',
    email: 'ops@dtu.ac.in',
    facultyId: 'FAC-OPS-1',
    designation: 'Assistant Professor',
    status: 'ACTIVE'
  }, cseHod);

  // Toggle status
  const toggled = await toggleDepartmentFacultyStatus(created.id, 'INACTIVE', cseHod);
  assert.strictEqual(toggled.status, 'INACTIVE');

  // Update designation
  const updated = await updateDepartmentFaculty(created.id, {
    designation: 'Associate Professor',
    specialization: 'Cloud Computing'
  }, cseHod);

  assert.strictEqual(updated.designation, 'Associate Professor');
  assert.strictEqual(updated.specialization, 'Cloud Computing');
});
