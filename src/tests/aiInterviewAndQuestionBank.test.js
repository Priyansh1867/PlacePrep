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
  INTERVIEW_CATEGORIES,
  INTERVIEW_DIFFICULTIES,
  extractJsonFromAiResponse
} from '../services/aiInterviewService.js';

import {
  STANDARD_QUESTION_CATALOG,
  normalizeQuestionBankItem,
  recordStudentQuestionAttempt,
  getStudentQuestionAttempts,
  resetStudentQuestionAttempt,
  computeStudentQuestionStats
} from '../services/questionBankService.js';

test('AI Interview Service: JSON parser handles direct JSON, markdown fences, and text wrapping', () => {
  // 1. Direct JSON array
  const directArr = '[{"id":"q1","question":"Explain B+ Trees"}]';
  const parsed1 = extractJsonFromAiResponse(directArr);
  assert.ok(Array.isArray(parsed1));
  assert.strictEqual(parsed1[0].question, 'Explain B+ Trees');

  // 2. Markdown wrapped code block
  const fenced = '```json\n[{"id":"q2","question":"What is Star method?"}]\n```';
  const parsed2 = extractJsonFromAiResponse(fenced);
  assert.ok(Array.isArray(parsed2));
  assert.strictEqual(parsed2[0].id, 'q2');

  // 3. Object with commentary
  const wrapped = 'Here is the evaluation response:\n{\n  "overallScore": 85,\n  "verdict": "Strong Answer"\n}\nHope this helps!';
  const parsed3 = extractJsonFromAiResponse(wrapped);
  assert.ok(parsed3 && typeof parsed3 === 'object');
  assert.strictEqual(parsed3.overallScore, 85);

  // 4. Invalid input returns null safely
  assert.strictEqual(extractJsonFromAiResponse('Just prose without any JSON'), null);
  assert.strictEqual(extractJsonFromAiResponse(null), null);
  assert.strictEqual(extractJsonFromAiResponse(''), null);
});

test('AI Interview Service: Categories & Difficulty configurations are complete', () => {
  assert.strictEqual(INTERVIEW_CATEGORIES.length, 6);
  const ids = INTERVIEW_CATEGORIES.map(c => c.id);
  assert.ok(ids.includes('technical'));
  assert.ok(ids.includes('hr'));
  assert.ok(ids.includes('dsa'));
  assert.ok(ids.includes('programming'));
  assert.ok(ids.includes('fullstack'));
  assert.ok(ids.includes('database'));

  assert.strictEqual(INTERVIEW_DIFFICULTIES.length, 3);
  const diffs = INTERVIEW_DIFFICULTIES.map(d => d.id);
  assert.ok(diffs.includes('Beginner'));
  assert.ok(diffs.includes('Intermediate'));
  assert.ok(diffs.includes('Advanced'));
});

test('Question Bank Service: Normalizes question types and subjects accurately', () => {
  // Test MCQ normalization
  const rawMcq = {
    id: 'test-mcq',
    question: 'Sample MCQ question?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctOption: 1,
    category: 'DBMS'
  };
  const normMcq = normalizeQuestionBankItem(rawMcq);
  assert.strictEqual(normMcq.type, 'MCQ');
  assert.strictEqual(normMcq.subject, 'DBMS');
  assert.strictEqual(normMcq.correctOption, 1);

  // Test SQL normalization
  const rawSql = {
    id: 'test-sql',
    question: 'Find 2nd highest salary',
    category: 'SQL'
  };
  const normSql = normalizeQuestionBankItem(rawSql);
  assert.strictEqual(normSql.type, 'SQL');
  assert.strictEqual(normSql.subject, 'DBMS');

  // Test Coding normalization
  const rawCode = {
    id: 'test-code',
    question: 'Two Sum',
    sampleCode: 'public int[] twoSum()',
    category: 'DSA'
  };
  const normCode = normalizeQuestionBankItem(rawCode);
  assert.strictEqual(normCode.type, 'CODING');
  assert.strictEqual(normCode.subject, 'DSA');
});

test('Question Bank Service: Student Attempt & Performance Metrics Tracking', () => {
  const studentId = 'test_student_42';
  mockStorage.clear();

  // 1. Initial attempts map is empty
  let attempts = getStudentQuestionAttempts(studentId);
  assert.deepStrictEqual(attempts, {});

  // 2. Record a correct MCQ attempt
  recordStudentQuestionAttempt(studentId, 'q-1', {
    selectedOption: 0,
    isCorrect: true,
    status: 'SOLVED'
  });

  // 3. Record an incorrect MCQ attempt
  recordStudentQuestionAttempt(studentId, 'q-2', {
    selectedOption: 2,
    isCorrect: false,
    status: 'INCORRECT'
  });

  // 4. Record a coding attempt
  recordStudentQuestionAttempt(studentId, 'q-3', {
    studentAnswer: 'class Solution {}',
    isCorrect: true,
    status: 'SOLVED'
  });

  attempts = getStudentQuestionAttempts(studentId);
  assert.strictEqual(Object.keys(attempts).length, 3);
  assert.strictEqual(attempts['q-1'].isCorrect, true);
  assert.strictEqual(attempts['q-2'].isCorrect, false);

  // 5. Calculate statistics
  const pool = [{ id: 'q-1' }, { id: 'q-2' }, { id: 'q-3' }, { id: 'q-4' }, { id: 'q-5' }];
  const stats = computeStudentQuestionStats(studentId, pool);

  assert.strictEqual(stats.totalQuestions, 5);
  assert.strictEqual(stats.attemptedCount, 3);
  assert.strictEqual(stats.unattemptedCount, 2);
  assert.strictEqual(stats.correctCount, 2);
  assert.strictEqual(stats.incorrectCount, 1);
  // Accuracy = 2 / (2 + 1) = 67%
  assert.strictEqual(stats.accuracyPct, 67);

  // 6. Reset an attempt
  resetStudentQuestionAttempt(studentId, 'q-2');
  attempts = getStudentQuestionAttempts(studentId);
  assert.strictEqual(attempts['q-2'], undefined);
  assert.strictEqual(Object.keys(attempts).length, 2);
});

test('Question Bank Service: Standard catalog questions contain valid fields and explanations', () => {
  assert.ok(STANDARD_QUESTION_CATALOG.length >= 6);
  STANDARD_QUESTION_CATALOG.forEach(q => {
    assert.ok(q.id, 'Every question must have an id');
    assert.ok(q.question, 'Every question must have a statement');
    assert.ok(q.type, 'Every question must have a type');
    assert.ok(q.subject, 'Every question must have a subject');
    if (q.type === 'MCQ' || q.type === 'APTITUDE') {
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, 'MCQs must have at least 2 options');
      assert.strictEqual(typeof q.correctOption, 'number', 'MCQs must specify a numeric correctOption index');
      assert.ok(q.explanation, 'MCQs must provide an explanation');
    }
  });
});
