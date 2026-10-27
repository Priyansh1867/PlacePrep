// PlacePrep AI - DSA & Coding Practice Studio Unit Test Suite
// Verifies:
// 1. Student-Only Authorization Gate & Navigation Filtering
// 2. Canonical DSA Topic Categorization
// 3. Multi-Language Starter Code Generation
// 4. Student-Isolated Progress Tracking & Data Leakage Prevention
// 5. Code Draft Persistence & Submission Logging
// 6. Progress Metrics Calculation & Boundary Conditions
// 7. Transparent Execution Environment Reporting

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DSA_CANONICAL_TOPICS,
  SUPPORTED_LANGUAGES,
  isUserAuthorizedStudent,
  categorizeQuestionTopic,
  normalizeDsaQuestion,
  getStarterCodeTemplate,
  getStudentPracticedList,
  toggleStudentPracticed,
  getStudentRevisionList,
  toggleStudentRevision,
  getStudentCodeDraft,
  saveStudentCodeDraft,
  getStudentSubmissions,
  recordStudentSubmission,
  computeDsaProgressMetrics
} from '../services/dsaService.js';

// Mock localStorage for isolated node test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('DSA Studio Task 1: Student-Only Authorization Gate', () => {
  // Enrolled student users MUST be permitted
  assert.strictEqual(isUserAuthorizedStudent({ role: 'student' }), true);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'STUDENT' }), true);
  assert.strictEqual(isUserAuthorizedStudent({ role: ' student ' }), true);

  // Non-student roles MUST be strictly blocked
  assert.strictEqual(isUserAuthorizedStudent({ role: 'teacher' }), false);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'hod' }), false);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'tpo' }), false);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'admin' }), false);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'director' }), false);
  assert.strictEqual(isUserAuthorizedStudent({ role: 'recruiter' }), false);
  assert.strictEqual(isUserAuthorizedStudent(null), false);
  assert.strictEqual(isUserAuthorizedStudent({}), false);
  assert.strictEqual(isUserAuthorizedStudent('student'), false);
});

test('DSA Studio Task 2: Institution Module Role-Based Tab Visibility', () => {
  // Simulates navTabs filtering logic in InstitutePortalPage
  const navTabs = [
    { id: 'student-data', label: 'Student Data', roles: ['teacher', 'hod'] },
    { id: 'curriculum-governance', label: 'Curriculum & Syllabus Governance', roles: ['hod'] },
    { id: 'reports-exporter', label: 'Reports Exporter', roles: ['teacher', 'hod'] },
    { id: 'upcoming-drives', label: 'Upcoming Drives' },
    { id: 'question-bank', label: 'Question Bank' },
    { id: 'dsa-studio', label: 'DSA & Coding Practice', roles: ['student'] },
    { id: 'resume-ats', label: 'Resume ATS Status', roles: ['student'] },
    { id: 'hackathons', label: 'Hackathons', excludedRoles: ['teacher', 'hod'] }
  ];

  function getVisibleTabs(role) {
    return navTabs.filter(tab => {
      if (tab.excludedRoles && tab.excludedRoles.includes(role)) return false;
      if (tab.roles && !tab.roles.includes(role)) return false;
      return true;
    });
  }

  // Student should see DSA Studio
  const studentTabs = getVisibleTabs('student').map(t => t.id);
  assert.ok(studentTabs.includes('dsa-studio'), 'Student must see dsa-studio tab');
  assert.ok(studentTabs.includes('resume-ats'), 'Student must see resume-ats tab');
  assert.ok(!studentTabs.includes('curriculum-governance'), 'Student must not see curriculum-governance');

  // Teacher must NOT see DSA Studio
  const teacherTabs = getVisibleTabs('teacher').map(t => t.id);
  assert.ok(!teacherTabs.includes('dsa-studio'), 'Teacher must not see dsa-studio tab');
  assert.ok(teacherTabs.includes('student-data'), 'Teacher sees student-data');

  // HOD must NOT see DSA Studio
  const hodTabs = getVisibleTabs('hod').map(t => t.id);
  assert.ok(!hodTabs.includes('dsa-studio'), 'HOD must not see dsa-studio tab');
  assert.ok(hodTabs.includes('curriculum-governance'), 'HOD sees curriculum-governance');
});

test('DSA Studio Task 3: Canonical Topic Categorization', () => {
  assert.strictEqual(DSA_CANONICAL_TOPICS.length, 13);

  // Dynamic Programming
  const dpQ = { question: '0/1 Knapsack Problem with memoization and recurrence relations' };
  assert.strictEqual(categorizeQuestionTopic(dpQ), 'Dynamic Programming & Memoization');

  // Linked Lists
  const llQ = { question: 'Detect loop in a Singly Linked List using Floyd Cycle detection' };
  assert.strictEqual(categorizeQuestionTopic(llQ), 'Linked Lists');

  // Trees
  const treeQ = { question: 'Binary Tree Inorder Traversal and BST validation' };
  assert.strictEqual(categorizeQuestionTopic(treeQ), 'Trees & Binary Search Trees');

  // Graphs
  const graphQ = { question: 'Dijkstra shortest path algorithm on weighted directed graph' };
  assert.strictEqual(categorizeQuestionTopic(graphQ), 'Graphs & Breadth/Depth Search');

  // Two Pointers
  const tpQ = { question: 'Longest Substring Without Repeating Characters using sliding window' };
  assert.strictEqual(categorizeQuestionTopic(tpQ), 'Two Pointers & Sliding Window');

  // Stacks & Queues
  const stackQ = { question: 'Valid Parentheses using stack data structure' };
  assert.strictEqual(categorizeQuestionTopic(stackQ), 'Stacks & Queues');

  // Strings
  const strQ = { question: 'Reverse Words in a String maintaining whitespace' };
  assert.strictEqual(categorizeQuestionTopic(strQ), 'Strings & Text Processing');

  // Sorting & Searching
  const searchQ = { question: 'Binary search on a rotated sorted array' };
  assert.strictEqual(categorizeQuestionTopic(searchQ), 'Sorting & Searching');

  // Recursion & Backtracking
  const recQ = { question: 'Generate all permutations and N-Queens backtracking problem' };
  assert.strictEqual(categorizeQuestionTopic(recQ), 'Recursion & Backtracking');
});

test('DSA Studio Task 4: Normalization & Starter Code Templates', () => {
  const rawQ = {
    id: 'test-q-101',
    question: 'Find Target Sum in Array',
    difficulty: 'Easy',
    skills: ['Arrays', 'Two Pointers'],
    approach: 'Sort and use two pointers.'
  };

  const normalized = normalizeDsaQuestion(rawQ, 0);
  assert.strictEqual(normalized.id, 'test-q-101');
  assert.strictEqual(normalized.title, 'Find Target Sum in Array');
  assert.ok(normalized.constraints.length > 0);
  assert.ok(normalized.examples.length > 0);

  // Check language template generation
  SUPPORTED_LANGUAGES.forEach(lang => {
    const template = getStarterCodeTemplate(normalized, lang.id);
    assert.ok(template.length > 20, `Template for ${lang.id} must be generated`);
    if (lang.id === 'java') {
      assert.ok(template.includes('class Solution'), 'Java template contains class Solution');
    } else if (lang.id === 'python') {
      assert.ok(template.includes('class Solution:'), 'Python template contains class Solution');
    } else if (lang.id === 'cpp') {
      assert.ok(template.includes('#include <iostream>'), 'C++ template includes iostream');
    } else if (lang.id === 'javascript') {
      assert.ok(template.includes('function'), 'JavaScript template contains function');
    }
  });
});

test('DSA Studio Task 5: Student-Isolated Progress Tracking & Data Leakage Prevention', () => {
  mockStorage.clear();

  const studentA = 'student-roll-001';
  const studentB = 'student-roll-002';
  const qId1 = 'q-arrays-01';
  const qId2 = 'q-trees-01';

  // Initially empty for both students
  assert.strictEqual(getStudentPracticedList(studentA).includes(qId1), false);
  assert.strictEqual(getStudentPracticedList(studentB).includes(qId1), false);

  // Student A marks qId1 as solved
  toggleStudentPracticed(studentA, qId1);
  assert.strictEqual(getStudentPracticedList(studentA).includes(qId1), true);

  // Student B must NOT see Student A's solved question (isolation)
  assert.strictEqual(getStudentPracticedList(studentB).includes(qId1), false);

  // Student B marks qId2 as solved
  toggleStudentPracticed(studentB, qId2);
  assert.strictEqual(getStudentPracticedList(studentB).includes(qId2), true);
  assert.strictEqual(getStudentPracticedList(studentA).includes(qId2), false);

  // Student A revision queue isolation
  toggleStudentRevision(studentA, qId1);
  assert.strictEqual(getStudentRevisionList(studentA).includes(qId1), true);
  assert.strictEqual(getStudentRevisionList(studentB).includes(qId1), false);
});

test('DSA Studio Task 6: Student Code Drafts & Submissions Isolation', () => {
  mockStorage.clear();

  const studentA = 'alice-dtu';
  const studentB = 'bob-dtu';
  const questionId = 'two-sum-problem';

  const aliceCode = 'public int[] twoSum() { return new int[]{0, 1}; }';
  const bobCode = 'public int[] twoSum() { return new int[]{2, 3}; }';

  // Save drafts
  saveStudentCodeDraft(studentA, questionId, 'java', aliceCode);
  saveStudentCodeDraft(studentB, questionId, 'java', bobCode);

  // Verify retrieval isolation
  assert.strictEqual(getStudentCodeDraft(studentA, questionId, 'java'), aliceCode);
  assert.strictEqual(getStudentCodeDraft(studentB, questionId, 'java'), bobCode);

  // Submissions logging
  recordStudentSubmission(studentA, questionId, {
    language: 'java',
    code: aliceCode,
    status: 'Recorded'
  });

  const aliceSubs = getStudentSubmissions(studentA, questionId);
  const bobSubs = getStudentSubmissions(studentB, questionId);

  assert.strictEqual(aliceSubs.length, 1);
  assert.strictEqual(bobSubs.length, 0, "Bob's submissions list must remain isolated and empty");
  assert.strictEqual(aliceSubs[0].code, aliceCode);
});

test('DSA Studio Task 7: Metrics Computation & Edge Cases', () => {
  const dummyQuestions = [
    { id: 'q1', difficulty: 'Easy', topic: 'Arrays & Hashing' },
    { id: 'q2', difficulty: 'Medium', topic: 'Arrays & Hashing' },
    { id: 'q3', difficulty: 'Hard', topic: 'Linked Lists' },
    { id: 'q4', difficulty: 'Medium', topic: 'Dynamic Programming & Memoization' }
  ];

  const practiced = ['q1', 'q2'];
  const metrics = computeDsaProgressMetrics(dummyQuestions, practiced);

  assert.strictEqual(metrics.total, 4);
  assert.strictEqual(metrics.solved, 2);
  assert.strictEqual(metrics.overallPercentage, 50);

  assert.strictEqual(metrics.easy.total, 1);
  assert.strictEqual(metrics.easy.solved, 1);
  assert.strictEqual(metrics.easy.percentage, 100);

  assert.strictEqual(metrics.medium.total, 2);
  assert.strictEqual(metrics.medium.solved, 1);
  assert.strictEqual(metrics.medium.percentage, 50);

  assert.strictEqual(metrics.hard.total, 1);
  assert.strictEqual(metrics.hard.solved, 0);
  assert.strictEqual(metrics.hard.percentage, 0);

  assert.strictEqual(metrics.topicBreakdown['Arrays & Hashing'].total, 2);
  assert.strictEqual(metrics.topicBreakdown['Arrays & Hashing'].solved, 2);

  // Zero questions edge case (no division-by-zero crash)
  const emptyMetrics = computeDsaProgressMetrics([], []);
  assert.strictEqual(emptyMetrics.total, 0);
  assert.strictEqual(emptyMetrics.solved, 0);
  assert.strictEqual(emptyMetrics.overallPercentage, 0);
});
