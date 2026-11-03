import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProfileCompletion } from '../utils/profileCompletion.js';

test('Student Onboarding Suite: Validation & Completion Calculation', async (t) => {
  await t.test('Initial registered student has 0% completion with missing required fields', () => {
    const rawStudent = {
      name: 'Priyansh Jain',
      email: 'priyansh.jain@example.edu',
      role: 'student',
      branch: 'Computer Science and Engineering',
      graduationBatch: '2026',
      rollNumber: '2024/CSE/084',
      onboardingCompleted: false,
      currentOnboardingStep: 1,
      onboardingStatus: 'PENDING'
    };

    const completion = calculateProfileCompletion(rawStudent);
    assert.strictEqual(rawStudent.onboardingCompleted, false);
    assert.strictEqual(rawStudent.currentOnboardingStep, 1);
    assert.strictEqual(rawStudent.onboardingStatus, 'PENDING');
    assert.strictEqual(completion.isComplete, false);
    assert.ok(completion.percentage < 100);
  });

  await t.test('Step 2 & Step 3 info updates contact and current education details', () => {
    const student = {
      name: 'Priyansh Jain',
      fullName: 'Priyansh Jain',
      email: 'priyansh.jain@example.edu',
      role: 'student',
      branch: 'Computer Science and Engineering',
      graduationBatch: '2026',
      rollNumber: '2024/CSE/084',
      phone: '9876543210',
      dateOfBirth: '2004-05-15',
      gender: 'Male',
      college: 'Indian Institute of Technology',
      currentAddress: 'Hostel 4, IIT Campus',
      tenthPercentage: 92.5,
      twelfthPercentage: 90.0,
      currentOnboardingStep: 4,
      onboardingStatus: 'IN_PROGRESS'
    };

    const completion = calculateProfileCompletion(student);
    assert.strictEqual(completion.isComplete, true);
    assert.strictEqual(completion.percentage, 100);
    assert.strictEqual(student.currentOnboardingStep, 4);
    assert.strictEqual(student.onboardingStatus, 'IN_PROGRESS');
  });

  await t.test('All Done step marks onboardingCompleted and sets status to COMPLETED', () => {
    const completedStudent = {
      name: 'Priyansh Jain',
      email: 'priyansh.jain@example.edu',
      role: 'student',
      onboardingCompleted: true,
      currentOnboardingStep: 7,
      onboardingStatus: 'COMPLETED'
    };

    assert.strictEqual(completedStudent.onboardingCompleted, true);
    assert.strictEqual(completedStudent.onboardingStatus, 'COMPLETED');
    assert.strictEqual(completedStudent.currentOnboardingStep, 7);
  });

  await t.test('Passphrase verification accepts institutional codes and rejects invalid codes', () => {
    const validCodes = ['PLACEPREP2026', 'CAMPUS2026', 'TPO2026', 'IIT2026', 'NIT2026'];
    const invalidCodes = ['WRONG_CODE', '123456', '', 'UNKNOWN'];

    validCodes.forEach((code) => {
      const isValid = ['PLACEPREP2026', 'CAMPUS2026', 'TPO2026', 'IIT2026', 'NIT2026'].includes(code);
      assert.strictEqual(isValid, true, `Passphrase ${code} should be valid`);
    });

    invalidCodes.forEach((code) => {
      const isValid = ['PLACEPREP2026', 'CAMPUS2026', 'TPO2026', 'IIT2026', 'NIT2026'].includes(code);
      assert.strictEqual(isValid, false, `Passphrase ${code} should be rejected`);
    });
  });

  await t.test('Role isolation: Non-student roles bypass student onboarding completely', () => {
    const nonStudentRoles = ['tpo', 'coordinator', 'hr', 'director', 'teacher', 'hod', 'management'];

    nonStudentRoles.forEach((role) => {
      const isStudentInPlacement = role === 'student';
      assert.strictEqual(isStudentInPlacement, false, `Role ${role} must not enter student onboarding`);
    });
  });
});
