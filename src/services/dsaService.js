// PlacePrep AI - DSA & Coding Practice Studio Service
// Manages question categorization, multi-language starter templates,
// student-isolated progress tracking, code drafts, and submission history.

import {
  getInterviewQuestions,
  getCurrentUser,
  getPracticedQuestions,
  togglePracticedQuestion,
  getRevisionList,
  toggleRevisionQuestion
} from './storage.js';
import { QuestionApi, UserApi } from './api.js';

export const DSA_CANONICAL_TOPICS = [
  'All Topics',
  'Arrays & Hashing',
  'Two Pointers & Sliding Window',
  'Strings & Text Processing',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & Binary Search Trees',
  'Graphs & Breadth/Depth Search',
  'Dynamic Programming & Memoization',
  'Recursion & Backtracking',
  'Sorting & Searching',
  'Greedy Algorithms',
  'Bit Manipulation & Math'
];

export const SUPPORTED_LANGUAGES = [
  { id: 'java', label: 'Java', extension: 'java', defaultFile: 'Main.java' },
  { id: 'python', label: 'Python 3', extension: 'py', defaultFile: 'solution.py' },
  { id: 'cpp', label: 'C++', extension: 'cpp', defaultFile: 'solution.cpp' },
  { id: 'javascript', label: 'JavaScript', extension: 'js', defaultFile: 'solution.js' },
  { id: 'sql', label: 'SQL (SQLite)', extension: 'sql', defaultFile: 'solution.sql' }
];

/**
 * Enforces Student-Only Authorization Gate
 * Strictly grants access only to student accounts.
 */
export function isUserAuthorizedStudent(user) {
  if (!user || typeof user !== 'object') return false;
  const role = String(user.role || '').trim().toLowerCase();
  return role === 'student';
}

/**
 * Maps and categorizes raw question records into standardized DSA topics.
 */
export function categorizeQuestionTopic(q) {
  if (!q) return 'Arrays & Hashing';
  if (q.canonicalTopic) return q.canonicalTopic;

  const raw = `${q.title || ''} ${q.question || ''} ${q.category || ''} ${Array.isArray(q.skills) ? q.skills.join(' ') : ''} ${q.approach || ''}`.toLowerCase();

  if (raw.includes('dynamic programming') || /\bdp\b/.test(raw) || raw.includes('knapsack') || raw.includes('memoiz') || raw.includes('fibonacci')) {
    return 'Dynamic Programming & Memoization';
  }
  if (raw.includes('linked list') || raw.includes('cycle') || raw.includes('reverse list') || raw.includes('floyd')) {
    return 'Linked Lists';
  }
  if (raw.includes('stack') || raw.includes('queue') || raw.includes('monotonic') || raw.includes('parentheses')) {
    return 'Stacks & Queues';
  }
  if (raw.includes('two pointer') || raw.includes('sliding window') || raw.includes('fast slow')) {
    return 'Two Pointers & Sliding Window';
  }
  if (raw.includes('tree') || /\bbst\b/.test(raw) || raw.includes('inorder') || raw.includes('preorder') || raw.includes('postorder') || raw.includes('traversal')) {
    return 'Trees & Binary Search Trees';
  }
  if (raw.includes('graph') || /\bbfs\b/.test(raw) || /\bdfs\b/.test(raw) || raw.includes('dijkstra') || raw.includes('topological')) {
    return 'Graphs & Breadth/Depth Search';
  }
  if (raw.includes('string') || raw.includes('palindrome') || raw.includes('anagram') || raw.includes('substring') || raw.includes('reverse words')) {
    return 'Strings & Text Processing';
  }
  if (raw.includes('backtrack') || raw.includes('recursion') || raw.includes('subset') || raw.includes('permutation') || raw.includes('n-queen')) {
    return 'Recursion & Backtracking';
  }
  if (raw.includes('sort') || raw.includes('binary search') || raw.includes('search') || raw.includes('quicksort') || raw.includes('mergesort')) {
    return 'Sorting & Searching';
  }
  if (raw.includes('greedy') || raw.includes('interval') || raw.includes('huffman')) {
    return 'Greedy Algorithms';
  }
  if (raw.includes('bit') || raw.includes('xor') || raw.includes('bitwise') || raw.includes('prime') || raw.includes('gcd')) {
    return 'Bit Manipulation & Math';
  }
  return 'Arrays & Hashing';
}

/**
 * Normalizes question object into standard studio format.
 */
export function normalizeDsaQuestion(rawQ, index = 0) {
  const id = rawQ.id || rawQ.questionId || `dsa-q-${index + 1}`;
  const title = rawQ.title || rawQ.question || `Coding Problem #${index + 1}`;
  const topic = categorizeQuestionTopic(rawQ);
  const difficulty = rawQ.difficulty || 'Medium';
  const company = rawQ.companyName || (rawQ.companyId ? rawQ.companyId.toUpperCase() : 'General');
  
  // Extract or synthesize constraints & examples where not explicitly given
  const constraints = rawQ.constraints || [
    'Time Complexity Target: O(N) or O(N log N)',
    'Space Complexity Target: O(1) auxiliary or O(N)',
    '1 <= input.length <= 10^5'
  ];

  const examples = rawQ.examples || [
    {
      input: '',
      output: '',
      hasExpectedOutput: false,
      explanation: 'No executable sample input/output is provided for this question. Code can be run, but correctness cannot be automatically checked until concrete test cases are added.'
    }
  ];

  return {
    ...rawQ,
    id,
    title,
    topic,
    difficulty,
    companyName: company,
    constraints,
    examples,
    sampleCode: rawQ.sampleCode || '',
    approach: rawQ.approach || '',
    suggestedAnswer: rawQ.suggestedAnswer || '',
    skills: Array.isArray(rawQ.skills) ? rawQ.skills : ['DSA', 'Algorithms']
  };
}

/**
 * Generates default starter code for a question in the selected programming language.
 */
export function getStarterCodeTemplate(question, language = 'java') {
  const qTitle = (question?.title || 'Solution').replace(/[^a-zA-Z0-9]/g, '');
  const methodName = qTitle.charAt(0).toLowerCase() + qTitle.slice(1) || 'solve';

  switch (language) {
    case 'sql':
      return `-- SQLite example: WHERE filters input rows before grouping.
-- HAVING filters the grouped results after aggregation.
CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER NOT NULL
);

INSERT INTO employees (employee_name, department, salary) VALUES
  ('Asha', 'Engineering', 90000),
  ('Ben', 'Engineering', 70000),
  ('Cara', 'Engineering', 45000),
  ('Dev', 'Sales', 60000),
  ('Esha', 'Sales', 55000);

-- WHERE removes salaries below 50000 before COUNT(*).
-- HAVING keeps only departments with at least 2 remaining employees.
SELECT department, COUNT(*) AS employee_count
FROM employees
WHERE salary >= 50000
GROUP BY department
HAVING COUNT(*) >= 2
ORDER BY department;`;

    case 'java':
      if (question?.sampleCode && question.sampleCode.includes('class') || question?.sampleCode?.includes('public static')) {
        return question.sampleCode;
      }
      return `import java.util.*;

public class Main {
    /**
     * Problem: ${question?.title || 'Algorithmic Problem'}
     * Difficulty: ${question?.difficulty || 'Medium'} | Company: ${question?.companyName || 'Campus'}
     */
    public static void main(String[] args) {
        Main sol = new Main();
        // Test with sample inputs
        System.out.println("PlacePrep DSA Studio Runner initialized.");
    }

    public void ${methodName}() {
        // Write your solution here
        
    }
}`;

    case 'python':
      return `from typing import List, Dict, Optional
import collections
import heapq

# Problem: ${question?.title || 'Algorithmic Problem'}
# Difficulty: ${question?.difficulty || 'Medium'} | Company: ${question?.companyName || 'Campus'}

class Solution:
    def ${methodName}(self) -> None:
        """
        Write your optimized algorithmic solution here.
        """
        pass

if __name__ == '__main__':
    sol = Solution()
    print("PlacePrep DSA Studio Python Runner initialized.")
`;

    case 'cpp':
      return `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

// Problem: ${question?.title || 'Algorithmic Problem'}
// Difficulty: ${question?.difficulty || 'Medium'} | Company: ${question?.companyName || 'Campus'}

class Solution {
public:
    void ${methodName}() {
        // Write your solution here
    }
};

int main() {
    Solution sol;
    cout << "PlacePrep DSA Studio C++ Runner initialized." << endl;
    return 0;
}
`;

    case 'javascript':
    default:
      return `/**
 * Problem: ${question?.title || 'Algorithmic Problem'}
 * Difficulty: ${question?.difficulty || 'Medium'} | Company: ${question?.companyName || 'Campus'}
 */

function ${methodName}() {
  // Write your solution here
  
}

// Example local invocation
console.log("PlacePrep DSA Studio JavaScript Runner initialized.");
`;
  }
}

// ==========================================
// STUDENT-ISOLATED PERSISTENCE HELPERS
// ==========================================

function getStudentStorageKey(studentId, prefix) {
  const safeId = studentId ? String(studentId).replace(/[^a-zA-Z0-9_-]/g, '_') : 'guest_student';
  return `placeprep_dsa_${prefix}_${safeId}`;
}

/**
 * Gets student-specific practiced questions.
 */
export function getStudentPracticedList(studentId) {
  if (!studentId) return getPracticedQuestions();
  try {
    const key = getStudentStorageKey(studentId, 'practiced');
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

/**
 * Toggles practiced status for a specific student without leaking to other students.
 */
export function toggleStudentPracticed(studentId, questionId) {
  const list = getStudentPracticedList(studentId);
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }

  if (studentId) {
    try {
      localStorage.setItem(getStudentStorageKey(studentId, 'practiced'), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving student practiced list:', e);
    }
  }

  // Only sync global fallback for demo student
  if (!studentId || studentId === 'default_student' || studentId === 'user-demo-01') {
    togglePracticedQuestion(questionId);
  }

  // Sync with backend API if user identity is authenticated
  const user = getCurrentUser();
  if (user && user.id) {
    UserApi.togglePracticedQuestion(questionId).catch(() => {});
  }

  return updated.includes(questionId);
}

/**
 * Gets student-specific revision queue.
 */
export function getStudentRevisionList(studentId) {
  if (!studentId) return getRevisionList();
  try {
    const key = getStudentStorageKey(studentId, 'revision');
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

/**
 * Toggles revision status for a specific student.
 */
export function toggleStudentRevision(studentId, questionId) {
  const list = getStudentRevisionList(studentId);
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }

  if (studentId) {
    try {
      localStorage.setItem(getStudentStorageKey(studentId, 'revision'), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving student revision list:', e);
    }
  }

  if (!studentId || studentId === 'default_student' || studentId === 'user-demo-01') {
    toggleRevisionQuestion(questionId);
  }

  const user = getCurrentUser();
  if (user && user.id) {
    UserApi.toggleRevisionQuestion(questionId).catch(() => {});
  }

  return updated.includes(questionId);
}

/**
 * Retrieves the code draft saved by the student for a given question and language.
 */
export function getStudentCodeDraft(studentId, questionId, language = 'java') {
  if (!questionId) return null;
  try {
    const key = getStudentStorageKey(studentId, `draft_${questionId}_${language}`);
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

/**
 * Saves the student's code draft locally.
 */
export function saveStudentCodeDraft(studentId, questionId, language, code) {
  if (!questionId) return;
  try {
    const key = getStudentStorageKey(studentId, `draft_${questionId}_${language}`);
    localStorage.setItem(key, code);
  } catch (e) {
    console.warn('Failed saving student code draft:', e);
  }
}

/**
 * Retrieves past submissions made by the student on this question.
 */
export function getStudentSubmissions(studentId, questionId) {
  if (!questionId) return [];
  try {
    const key = getStudentStorageKey(studentId, `subs_${questionId}`);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Records a new submission for the student.
 */
export function recordStudentSubmission(studentId, questionId, submissionData) {
  if (!questionId) return null;
  const submissions = getStudentSubmissions(studentId, questionId);
  const entry = {
    id: `sub-${Date.now()}`,
    timestamp: new Date().toISOString(),
    language: submissionData.language || 'java',
    code: submissionData.code || '',
    status: submissionData.status || 'Submitted',
    notes: submissionData.notes || 'Draft recorded in Student DSA Studio.'
  };
  submissions.unshift(entry);
  try {
    const key = getStudentStorageKey(studentId, `subs_${questionId}`);
    localStorage.setItem(key, JSON.stringify(submissions.slice(0, 20)));
  } catch (e) {
    console.warn('Failed saving student submission:', e);
  }
  return entry;
}

/**
 * Retrieves recently attempted questions for this student.
 */
export function getRecentlyAttemptedQuestions(studentId) {
  try {
    const key = getStudentStorageKey(studentId, 'recent');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Records a question as recently attempted by this student.
 */
export function recordRecentlyAttempted(studentId, questionId) {
  if (!questionId) return;
  const recent = getRecentlyAttemptedQuestions(studentId).filter(id => id !== questionId);
  recent.unshift(questionId);
  try {
    const key = getStudentStorageKey(studentId, 'recent');
    localStorage.setItem(key, JSON.stringify(recent.slice(0, 10)));
  } catch (e) {
    console.warn('Failed saving recently attempted:', e);
  }
}

/**
 * Computes metrics and topic-wise progress breakdown.
 */
export function computeDsaProgressMetrics(questions, practicedIds) {
  const total = questions.length;
  const isPracticed = (q) => practicedIds.includes(q.id) || (q.questionId && practicedIds.includes(q.questionId));
  const solved = questions.filter(isPracticed).length;
  const overallPercentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  const easyList = questions.filter(q => (q.difficulty || '').toLowerCase() === 'easy');
  const easySolved = easyList.filter(isPracticed).length;

  const medList = questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium');
  const medSolved = medList.filter(isPracticed).length;

  const hardList = questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard');
  const hardSolved = hardList.filter(isPracticed).length;

  // Topic breakdown
  const topicBreakdown = {};
  questions.forEach(q => {
    const t = q.topic || 'General';
    if (!topicBreakdown[t]) {
      topicBreakdown[t] = { total: 0, solved: 0 };
    }
    topicBreakdown[t].total += 1;
    if (isPracticed(q)) {
      topicBreakdown[t].solved += 1;
    }
  });

  return {
    total,
    solved,
    overallPercentage,
    easy: { total: easyList.length, solved: easySolved, percentage: easyList.length > 0 ? Math.round((easySolved / easyList.length) * 100) : 0 },
    medium: { total: medList.length, solved: medSolved, percentage: medList.length > 0 ? Math.round((medSolved / medList.length) * 100) : 0 },
    hard: { total: hardList.length, solved: hardSolved, percentage: hardList.length > 0 ? Math.round((hardSolved / hardList.length) * 100) : 0 },
    topicBreakdown
  };
}
