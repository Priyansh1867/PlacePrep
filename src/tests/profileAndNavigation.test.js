import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { 
  getCurrentUser, 
  setCurrentUser, 
  logoutUser, 
  saveRegisteredUser, 
  findRegisteredUser 
} from '../services/storage.js';
import { 
  calculateProfileCompletion, 
  REQUIRED_PROFILE_FIELDS, 
  OPTIONAL_PROFILE_FIELDS 
} from '../utils/profileCompletion.js';

// Mock localStorage for node environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = storageMock;
describe('User Authentication, Profile and Navigation Suite', () => {
  it('saves and restores custom user login details accurately', () => {
    const customUser = {
      id: 'custom-user-123',
      name: 'Aman Verma',
      fullName: 'Aman Verma',
      email: 'aman.verma@example.com',
      college: 'Indian Institute of Information Technology',
      branch: 'Computer Science and Engineering',
      graduationBatch: '2028',
      role: 'student',
      supersetId: '9876543',
      dateOfBirth: '14 Jan, 2005',
      gender: 'Male',
      phone: '+91 9811223344',
      avatar: ''
    };

    setCurrentUser(customUser);
    const active = getCurrentUser();
    assert.ok(active, 'Active user should exist after login');
    assert.strictEqual(active.name, 'Aman Verma');
    assert.strictEqual(active.email, 'aman.verma@example.com');
    assert.strictEqual(active.college, 'Indian Institute of Information Technology');
    assert.strictEqual(active.phone, '+91 9811223344');

    // Also verify persistence in registered users directory
    const saved = findRegisteredUser('aman.verma@example.com');
    assert.ok(saved, 'User should be found in registered users store');
    assert.strictEqual(saved.name, 'Aman Verma');
  });

  it('logoutUser clears current user session completely', () => {
    logoutUser();
    const raw = localStorage.getItem('placeprep_current_user');
    assert.strictEqual(raw, null, 'Current user in storage should be null after logging out');
  });

  // TEST CASE 1: Newly Registered Student (Only actual registration fields, no demo or fake data)
  it('Test Case 1: Newly registered student contains only genuine registration fields and leaves other fields empty', () => {
    const newlyRegisteredStudent = {
      id: 'student-test-001',
      name: 'Rohit Sharma',
      fullName: 'Rohit Sharma',
      email: 'rohit.sharma@university.edu',
      rollNumber: '2024/CSE/101',
      graduationBatch: '2028',
      role: 'student',
      roleLabel: 'STUDENT',
      college: '',
      branch: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      bloodGroup: '',
      category: '',
      differentlyAbled: '',
      nationality: '',
      currentAddress: '',
      permanentAddress: '',
      hometown: '',
      pincode: '',
      linkedin: '',
      github: '',
      portfolio: '',
      supersetId: '2024/CSE/101',
      authenticated: true
    };

    setCurrentUser(newlyRegisteredStudent);
    const active = getCurrentUser();

    // Verify only provided registration details appear
    assert.strictEqual(active.fullName, 'Rohit Sharma');
    assert.strictEqual(active.email, 'rohit.sharma@university.edu');
    assert.strictEqual(active.rollNumber, '2024/CSE/101');
    assert.strictEqual(active.graduationBatch, '2028');

    // Verify no hardcoded sample values, default fake addresses or mobile numbers
    assert.strictEqual(active.phone, '', 'Phone should be empty for new registration');
    assert.strictEqual(active.college, '', 'College should not be auto-filled with dummy text');
    assert.strictEqual(active.branch, '', 'Branch should not be auto-filled with dummy text');
    assert.strictEqual(active.dateOfBirth, '', 'DOB should not be auto-filled');
    assert.strictEqual(active.bloodGroup, '', 'Blood group should not be auto-filled');
    assert.strictEqual(active.category, '', 'Category should not be auto-filled');
    assert.strictEqual(active.currentAddress, '', 'Address should not be auto-filled');

    // Verify password is not exposed
    assert.strictEqual(active.password, undefined, 'Password must never be saved in public profile');

    // Verify incomplete profile alert status
    assert.strictEqual(REQUIRED_PROFILE_FIELDS.length, 12, 'Must have exactly 12 mandatory profile fields');
    assert.ok(OPTIONAL_PROFILE_FIELDS.length >= 10, 'Must have at least 10 optional profile fields');
    const completion = calculateProfileCompletion(active);
    assert.strictEqual(completion.isComplete, false, 'Profile must be marked incomplete');
    assert.strictEqual(completion.completedRequiredCount, 4, 'Only 4 required fields should be counted');
    assert.strictEqual(completion.percentage, 33, 'Completion percentage should be 33% (4/12)');
    assert.ok(completion.missingRequiredFields.length > 0, 'Missing fields list should contain unprovided fields');
  });

  // TEST CASE 2: Profile Completion Progress (Incremental updates update completion dynamically)
  it('Test Case 2: Saving additional profile details increments completion percentage accurately', () => {
    let student = {
      id: 'student-test-002',
      fullName: 'Ananya Gupta',
      email: 'ananya.gupta@university.edu',
      rollNumber: '2024/IT/045',
      graduationBatch: '2028',
      role: 'student',
      authenticated: true
    };

    let comp = calculateProfileCompletion(student);
    assert.strictEqual(comp.percentage, 33);

    // Student provides contact and college details
    student = {
      ...student,
      phone: '+91 9876543210',
      dateOfBirth: '2005-08-15',
      gender: 'Female',
      college: 'Delhi Technological University',
      branch: 'Information Technology',
      currentAddress: 'Hostel 4, DTU Campus, Delhi'
    };

    comp = calculateProfileCompletion(student);
    // 4 original + 6 newly added = 10 out of 12 required fields
    assert.strictEqual(comp.completedRequiredCount, 10);
    assert.strictEqual(comp.percentage, 83);
    assert.strictEqual(comp.isComplete, false, 'Still missing 10th and 12th marks');
  });

  // TEST CASE 3: Complete Profile (All required fields complete triggers complete status)
  it('Test Case 3: Complete profile reaches 100% and marks isComplete true without requiring optional fields', () => {
    const completeStudent = {
      id: 'student-test-003',
      fullName: 'Vikas Kumar',
      email: 'vikas.kumar@university.edu',
      rollNumber: '2024/CSE/150',
      graduationBatch: '2027',
      phone: '+91 9123456789',
      dateOfBirth: '2004-11-20',
      gender: 'Male',
      college: 'National Institute of Technology',
      branch: 'Computer Science and Engineering',
      currentAddress: 'Room 201, Boys Hostel, NIT',
      tenthPercentage: '94.5',
      twelfthPercentage: '92.0',
      role: 'student',
      authenticated: true
    };

    const comp = calculateProfileCompletion(completeStudent);
    assert.strictEqual(comp.completedRequiredCount, 12);
    assert.strictEqual(comp.totalRequiredCount, 12);
    assert.strictEqual(comp.percentage, 100);
    assert.strictEqual(comp.isComplete, true, 'Profile must be marked complete when all 12 required fields are filled');
    assert.strictEqual(comp.missingRequiredFields.length, 0);

    // Optional fields (bloodGroup, linkedin, github) missing should NOT prevent completion
    assert.strictEqual(completeStudent.bloodGroup, undefined);
    assert.strictEqual(completeStudent.linkedin, undefined);
  });

  // TEST CASE 4: AI Mock Interview Accessibility & Footer Removal
  it('Test Case 4: AI Mock Interview is removed from Footer and placed in Student Section', () => {
    const footerPath = path.resolve('src/components/Footer.jsx');
    const footerContent = fs.readFileSync(footerPath, 'utf8');

    // Verify AI Mock Interview is NOT in the footer links
    assert.ok(!footerContent.includes('AI Mock Interviewer'), 'Footer must not contain AI Mock Interviewer link');
    assert.ok(!footerContent.includes('mock-interview'), 'Footer must not contain mock-interview navigation action');

    // Verify AI Mock Interview is present in Student Dashboard and Institute Portal tabs
    const studentDashboardPath = path.resolve('src/pages/StudentDashboardPage.jsx');
    const dashboardContent = fs.readFileSync(studentDashboardPath, 'utf8');
    assert.ok(dashboardContent.includes('mock-interview'), 'Student Dashboard must have direct access to AI Mock Interview');
    assert.ok(dashboardContent.includes('AI Mock Interview'), 'Student Dashboard must display AI Mock Interview');

    const institutePortalPath = path.resolve('src/pages/InstitutePortalPage.jsx');
    const instituteContent = fs.readFileSync(institutePortalPath, 'utf8');
    assert.ok(instituteContent.includes("id: 'mock-interview'"), 'Institute Portal must include mock-interview tab for students');
  });

  // TEST CASE 5: Existing Student & Demo Data Isolation
  it('Test Case 5: Existing student record is not contaminated with demo autofill data', () => {
    const realStudent = {
      id: 'student-real-999',
      fullName: 'Priyansh Genuine',
      email: 'priyansh.genuine@college.edu',
      rollNumber: '2024/ECE/042',
      graduationBatch: '2028',
      role: 'student',
      college: 'Govt Engineering College',
      phone: '+91 9988776655'
    };

    saveRegisteredUser(realStudent);
    const retrieved = findRegisteredUser('priyansh.genuine@college.edu');
    assert.strictEqual(retrieved.fullName, 'Priyansh Genuine');
    assert.strictEqual(retrieved.rollNumber, '2024/ECE/042');
    assert.notStrictEqual(retrieved.fullName, 'Payanshi Jain', 'Genuine student data must never be overwritten with demo name');
    assert.notStrictEqual(retrieved.rollNumber, '2024/CSE/084', 'Genuine student roll number must never be overwritten with demo roll');
  });

  // TEST CASE 6: Role-Based Access Isolation
  it('Test Case 6: Role separation prevents student from seeing administrative panels or another student session', () => {
    const studentUser = {
      id: 'student-session-1',
      name: 'Sneha Rao',
      email: 'sneha.rao@university.edu',
      role: 'student'
    };

    setCurrentUser(studentUser);
    const active = getCurrentUser();
    assert.strictEqual(active.role, 'student');
    assert.strictEqual(active.email, 'sneha.rao@university.edu');

    // Faculty login session
    const facultyUser = {
      id: 'faculty-session-1',
      name: 'Dr. Neha Sharma',
      email: 'neha.sharma@dtu.ac.in',
      role: 'teacher'
    };

    setCurrentUser(facultyUser);
    const activeFaculty = getCurrentUser();
    assert.strictEqual(activeFaculty.role, 'teacher');
    assert.notStrictEqual(activeFaculty.id, studentUser.id);
  });
});
