// PlacePrep AI - Question Bank Practice & Progress Service
// Manages question filtering, interactive attempt evaluation,
// student-isolated performance metrics, and database/storage synchronization.

import { 
  getInterviewQuestions, 
  getPracticedQuestions, 
  togglePracticedQuestion,
  getSavedQuestions,
  toggleSavedQuestion,
  getRevisionList,
  toggleRevisionQuestion,
  getCurrentUser
} from './storage.js';
import { QuestionApi, UserApi } from './api.js';

export const QUESTION_SUBJECTS = [
  { id: 'ALL', label: 'All Subjects' },
  { id: 'DSA', label: 'Data Structures & Algorithms', short: 'DSA' },
  { id: 'DBMS', label: 'Database & SQL Systems', short: 'DBMS & SQL' },
  { id: 'CORE_CS', label: 'Core Computer Science', short: 'OS, CN & OOP' },
  { id: 'APTITUDE', label: 'Aptitude & Quantitative', short: 'Aptitude' },
  { id: 'FULLSTACK', label: 'Full Stack & Web Dev', short: 'Web & API' },
  { id: 'HR', label: 'HR & Behavioral', short: 'HR' }
];

export const QUESTION_TYPES = [
  { id: 'ALL', label: 'All Question Types' },
  { id: 'MCQ', label: 'Multiple Choice (MCQ)' },
  { id: 'CODING', label: 'Coding Questions' },
  { id: 'TECHNICAL', label: 'Technical Theory' },
  { id: 'SQL', label: 'SQL / Database Queries' },
  { id: 'APTITUDE', label: 'Aptitude & Logic' }
];

export const QUESTION_DIFFICULTIES = [
  { id: 'ALL', label: 'All Difficulties' },
  { id: 'Easy', label: 'Easy' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Hard', label: 'Hard' }
];

/**
 * Standard Verified Questions Catalog
 * Used when backend questions database has not yet been populated via staff import.
 */
export const STANDARD_QUESTION_CATALOG = [
  // 1. MCQs - DBMS & SQL
  {
    id: 'qb-dbms-mcq-1',
    questionId: 'qb-dbms-mcq-1',
    type: 'MCQ',
    subject: 'DBMS',
    topic: 'SQL & Indexing',
    category: 'DBMS',
    difficulty: 'Medium',
    companyId: 'amazon',
    companyName: 'Amazon',
    question: 'Which index structure is predominantly utilized by relational database storage engines (such as MySQL InnoDB) for primary key B-Tree clustering, and why?',
    options: [
      'B+ Tree, because all data records or row pointers reside strictly in the leaf nodes, enabling fast sequential range scans and predictable disk I/O.',
      'Hash Index, because hash collisions are rare and range queries run in O(1) constant time.',
      'Binary Search Tree, because tree balancing guarantees minimal memory overhead.',
      'R-Tree, because spatial indexing avoids disk page splits during concurrent transactions.'
    ],
    correctOption: 0,
    explanation: 'InnoDB clusters table rows on the primary key using a B+ Tree. Non-leaf nodes hold only keys and child page pointers, maximizing the fan-out factor. Leaf nodes contain the complete data rows and are linked sequentially in a doubly-linked list, allowing high-performance range scans with minimal random disk seeks.',
    approach: 'Identify the difference between standard B-Trees (data in all nodes) and B+ Trees (data only in leaf nodes linked for range scans).',
    suggestedAnswer: 'B+ Tree is the standard clustering index structure in MySQL InnoDB. It stores records exclusively in the doubly-linked leaf level, minimizing tree depth and optimizing range queries.',
    frequencyScore: 92,
    skills: ['SQL', 'InnoDB', 'B+ Tree', 'Indexing']
  },
  {
    id: 'qb-dbms-mcq-2',
    questionId: 'qb-dbms-mcq-2',
    type: 'MCQ',
    subject: 'DBMS',
    topic: 'Transactions & ACID',
    category: 'DBMS',
    difficulty: 'Hard',
    companyId: 'microsoft',
    companyName: 'Microsoft',
    question: 'In relational database transaction processing, which phenomenon is prevented under the REPEATABLE READ isolation level that is permitted under READ COMMITTED?',
    options: [
      'Dirty Reads (reading uncommitted changes from another transaction).',
      'Non-Repeatable Reads (reading different values when re-querying the same row in one transaction).',
      'Phantom Reads (seeing newly inserted rows matching a range query).',
      'Deadlocks (circular lock waiting dependencies).'
    ],
    correctOption: 1,
    explanation: 'READ COMMITTED prevents Dirty Reads but allows Non-Repeatable Reads (if Transaction B updates and commits row X while Transaction A is running, A will see the updated value upon re-reading). REPEATABLE READ uses snapshot isolation/MVCC to guarantee that any row read by Transaction A maintains the exact same values for the duration of Transaction A.',
    approach: 'Recall ANSI SQL isolation levels hierarchy: Read Uncommitted -> Read Committed -> Repeatable Read -> Serializable.',
    suggestedAnswer: 'Non-Repeatable Reads are prevented under REPEATABLE READ. READ COMMITTED only prevents Dirty Reads.',
    frequencyScore: 88,
    skills: ['ACID', 'Transactions', 'MVCC', 'SQL']
  },

  // 2. MCQs - Operating Systems & OOP
  {
    id: 'qb-core-mcq-1',
    questionId: 'qb-core-mcq-1',
    type: 'MCQ',
    subject: 'CORE_CS',
    topic: 'Operating Systems',
    category: 'OS',
    difficulty: 'Medium',
    companyId: 'google',
    companyName: 'Google',
    question: 'Which condition is NOT one of the four necessary Coffman conditions required for a system deadlock to occur?',
    options: [
      'Mutual Exclusion (resources cannot be shared concurrently).',
      'Hold and Wait (processes holding resources can request additional ones).',
      'Preemption (the operating system forcefully deallocates resources from a running process).',
      'Circular Wait (a closed loop chain of processes where each waits for a resource held by the next).'
    ],
    correctOption: 2,
    explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be preempted), and 4. Circular Wait. Preemption is a mechanism used to PREVENT or RECOVER from deadlocks, not cause them.',
    approach: 'Review the Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.',
    suggestedAnswer: 'Preemption is NOT a deadlock condition; "No Preemption" is the necessary Coffman condition.',
    frequencyScore: 90,
    skills: ['OS', 'Concurrency', 'Deadlocks']
  },
  {
    id: 'qb-core-mcq-2',
    questionId: 'qb-core-mcq-2',
    type: 'MCQ',
    subject: 'CORE_CS',
    topic: 'OOP Principles',
    category: 'OOP',
    difficulty: 'Easy',
    companyId: 'tcs',
    companyName: 'TCS',
    question: 'Which SOLID principle states that high-level modules should not depend on low-level modules, but rather both should depend on abstractions?',
    options: [
      'Single Responsibility Principle (SRP)',
      'Open/Closed Principle (OCP)',
      'Liskov Substitution Principle (LSP)',
      'Dependency Inversion Principle (DIP)'
    ],
    correctOption: 3,
    explanation: 'The Dependency Inversion Principle (the D in SOLID) states: High-level modules should not depend upon low-level modules; both should depend on abstractions (interfaces). Abstractions should not depend upon details; details should depend upon abstractions.',
    approach: 'Remember the acronym SOLID: S=Single Responsibility, O=Open/Closed, L=Liskov, I=Interface Segregation, D=Dependency Inversion.',
    suggestedAnswer: 'Dependency Inversion Principle (DIP).',
    frequencyScore: 85,
    skills: ['OOP', 'SOLID', 'Software Design']
  },

  // 3. MCQs - Aptitude & Quantitative Reasoning
  {
    id: 'qb-apt-mcq-1',
    questionId: 'qb-apt-mcq-1',
    type: 'APTITUDE',
    subject: 'APTITUDE',
    topic: 'Time, Speed & Distance',
    category: 'Aptitude',
    difficulty: 'Easy',
    companyId: 'infosys',
    companyName: 'Infosys',
    question: 'A train 180 meters long is traveling at a uniform speed of 54 km/h. How many seconds will it take to completely pass a stationary platform 360 meters long?',
    options: [
      '24 seconds',
      '36 seconds',
      '30 seconds',
      '42 seconds'
    ],
    correctOption: 1,
    explanation: 'Step 1: Convert speed from km/h to m/s: 54 * (5/18) = 15 m/s. Step 2: Total distance to cover = Train length + Platform length = 180m + 360m = 540m. Step 3: Time = Distance / Speed = 540 / 15 = 36 seconds.',
    approach: 'First convert km/h to m/s by multiplying with 5/18. Then divide total distance (train + platform) by speed in m/s.',
    suggestedAnswer: '36 seconds. Distance = 180 + 360 = 540m. Speed = 54 * (5/18) = 15 m/s. Time = 540 / 15 = 36s.',
    frequencyScore: 94,
    skills: ['Quantitative Aptitude', 'Arithmetic', 'Speed & Distance']
  },
  {
    id: 'qb-apt-mcq-2',
    questionId: 'qb-apt-mcq-2',
    type: 'APTITUDE',
    subject: 'APTITUDE',
    topic: 'Permutations & Probability',
    category: 'Aptitude',
    difficulty: 'Medium',
    companyId: 'wipro',
    companyName: 'Wipro',
    question: 'Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on the top faces is a prime number?',
    options: [
      '5/12',
      '7/18',
      '15/36',
      '1/3'
    ],
    correctOption: 0,
    explanation: 'Total outcomes = 6 * 6 = 36. Possible prime sums between 2 and 12 are 2, 3, 5, 7, 11. Sum 2: (1,1) [1]. Sum 3: (1,2),(2,1) [2]. Sum 5: (1,4),(2,3),(3,2),(4,1) [4]. Sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) [6]. Sum 11: (5,6),(6,5) [2]. Total favorable outcomes = 1 + 2 + 4 + 6 + 2 = 15. Probability = 15 / 36 = 5 / 12.',
    approach: 'Count favorable pairs for prime sums (2, 3, 5, 7, 11) over total 36 outcomes, then simplify.',
    suggestedAnswer: '5/12 (15 favorable pairs out of 36 total combinations).',
    frequencyScore: 82,
    skills: ['Probability', 'Combinatorics']
  },

  // 4. Coding Questions - DSA
  {
    id: 'qb-dsa-code-1',
    questionId: 'qb-dsa-code-1',
    type: 'CODING',
    subject: 'DSA',
    topic: 'Arrays & Two Pointers',
    category: 'DSA',
    difficulty: 'Easy',
    companyId: 'amazon',
    companyName: 'Amazon',
    question: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
    approach: 'Use a Hash Map to store each visited number and its index. For each number, compute complement = target - nums[i]. If complement is already in the map, return [map.get(complement), i]. This achieves O(N) time and O(N) space.',
    sampleCode: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    throw new IllegalArgumentException("No two sum solution");
}`,
    suggestedAnswer: 'Optimal solution uses a single pass hash table in O(N) time and O(N) auxiliary space, checking complement lookup in O(1) average time.',
    frequencyScore: 98,
    skills: ['Arrays', 'Hash Table', 'Two Pointers']
  },
  {
    id: 'qb-dsa-code-2',
    questionId: 'qb-dsa-code-2',
    type: 'CODING',
    subject: 'DSA',
    topic: 'Linked Lists & Two Pointers',
    category: 'DSA',
    difficulty: 'Medium',
    companyId: 'microsoft',
    companyName: 'Microsoft',
    question: 'Given the head of a singly linked list, reverse the list and return the reversed list head using both iterative and recursive implementations.',
    approach: 'Iterative: Maintain three pointers: prev = null, curr = head, next = null. In each iteration, save curr.next, point curr.next to prev, advance prev to curr, and advance curr to next. Runs in O(N) time and O(1) space.',
    sampleCode: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
    suggestedAnswer: 'Iterative approach runs in O(N) time with O(1) space complexity by pointer manipulation.',
    frequencyScore: 95,
    skills: ['Linked List', 'Pointers', 'In-place Algorithms']
  },

  // 5. SQL / Database Questions
  {
    id: 'qb-sql-1',
    questionId: 'qb-sql-1',
    type: 'SQL',
    subject: 'DBMS',
    topic: 'SQL Subqueries & Window Functions',
    category: 'DBMS',
    difficulty: 'Medium',
    companyId: 'oracle',
    companyName: 'Oracle',
    question: 'Write a standard SQL query to find the N-th highest salary from an Employee table schema: Employee(id INT, emp_name VARCHAR(100), department_id INT, salary DECIMAL(10,2)). Handle tied salaries correctly.',
    approach: 'Approach 1: Use window function DENSE_RANK() OVER (ORDER BY salary DESC) in a Common Table Expression (CTE) or subquery. Approach 2: Use SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET (N - 1).',
    sampleCode: `-- Using Standard DENSE_RANK window function
WITH RankedSalaries AS (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
    FROM Employee
)
SELECT salary 
FROM RankedSalaries 
WHERE rnk = 2 -- replace 2 with target N
LIMIT 1;

-- Alternative compatible with MySQL / PostgreSQL without CTE:
SELECT DISTINCT salary 
FROM Employee 
ORDER BY salary DESC 
LIMIT 1 OFFSET 1; -- for 2nd highest, OFFSET is N - 1`,
    suggestedAnswer: 'DENSE_RANK() handles salary ties appropriately without skipping rank numbers.',
    frequencyScore: 96,
    skills: ['SQL', 'Window Functions', 'Subqueries', 'Query Tuning']
  },

  // 6. Technical Theory & System Design
  {
    id: 'qb-tech-1',
    questionId: 'qb-tech-1',
    type: 'TECHNICAL',
    subject: 'FULLSTACK',
    topic: 'Web Architecture & REST',
    category: 'Full Stack',
    difficulty: 'Medium',
    companyId: 'google',
    companyName: 'Google',
    question: 'Explain what happens under the hood from the moment a user types "https://example.com" into the browser and presses Enter until the page renders.',
    approach: 'Structure your explanation sequentially across network and browser layers: 1. URL parsing & HSTS cache check, 2. DNS Resolution (Browser cache -> OS resolver -> Recursive resolver -> Root/TLD/Authoritative nameservers), 3. TCP 3-Way Handshake (SYN, SYN-ACK, ACK), 4. TLS 1.3 Cryptographic Handshake, 5. HTTP GET request & Reverse Proxy routing, 6. Server processing & response streaming, 7. Browser Critical Rendering Path (DOM, CSSOM, Render Tree, Layout, Paint, Compositing).',
    suggestedAnswer: 'Comprehensive end-to-end breakdown covering DNS, TCP/IP, TLS handshakes, HTTP request-response cycle, and browser DOM/CSSOM critical rendering path.',
    frequencyScore: 91,
    skills: ['Networking', 'DNS', 'TCP/IP', 'Browser Internals', 'Web Architecture']
  },
  {
    id: 'qb-hr-1',
    questionId: 'qb-hr-1',
    type: 'HR',
    subject: 'HR',
    topic: 'Behavioral & Leadership',
    category: 'HR',
    difficulty: 'Easy',
    companyId: 'accenture',
    companyName: 'Accenture',
    question: 'Describe a situation in an academic project or team assignment where a team member was not contributing their assigned share. How did you resolve the deadlock?',
    approach: 'Apply the STAR Framework: Situation (project goal & deadline), Task (your role & the team distribution), Action (held an empathetic 1-on-1 private discussion, understood blockers/technical struggles, redistributed tasks based on strengths, set daily micro-milestones), Result (project completed on time with quality code, team cohesion preserved).',
    suggestedAnswer: 'Candidate demonstrates emotional intelligence, constructive communication, avoidance of blame, and quantifiable outcome using STAR method.',
    frequencyScore: 93,
    skills: ['Conflict Resolution', 'STAR Framework', 'Leadership', 'Teamwork']
  }
];

/**
 * Normalizes question object to ensure standard fields.
 */
export function normalizeQuestionBankItem(rawQ, index = 0) {
  const id = rawQ.id || rawQ.questionId || `qb-${index + 1}`;
  const title = rawQ.question || rawQ.title || `Interview Question #${index + 1}`;
  
  // Detect question type
  let type = rawQ.type || 'TECHNICAL';
  if (Array.isArray(rawQ.options) && rawQ.options.length > 0) {
    type = 'MCQ';
  } else if (rawQ.sampleCode || (rawQ.category && /dsa|algo|structure|code/i.test(rawQ.category))) {
    type = 'CODING';
  } else if (/sql|dbms|query/i.test(rawQ.category || '')) {
    type = 'SQL';
  } else if (/aptitude|quant|reasoning/i.test(rawQ.category || '')) {
    type = 'APTITUDE';
  }

  // Detect subject
  let subject = rawQ.subject || 'DSA';
  const cat = (rawQ.category || '').toLowerCase();
  if (cat.includes('dbms') || cat.includes('sql') || cat.includes('database')) subject = 'DBMS';
  else if (cat.includes('os') || cat.includes('operating') || cat.includes('oop') || cat.includes('network')) subject = 'CORE_CS';
  else if (cat.includes('aptitude') || cat.includes('quant')) subject = 'APTITUDE';
  else if (cat.includes('web') || cat.includes('fullstack') || cat.includes('react') || cat.includes('api')) subject = 'FULLSTACK';
  else if (cat.includes('hr') || rawQ.round === 'hr') subject = 'HR';
  else subject = 'DSA';

  return {
    ...rawQ,
    id,
    questionId: id,
    question: title,
    type,
    subject,
    topic: rawQ.topic || rawQ.category || 'General',
    difficulty: rawQ.difficulty || 'Medium',
    companyId: rawQ.companyId || 'GENERAL',
    companyName: rawQ.companyName || (rawQ.companyId ? rawQ.companyId.toUpperCase() : 'General Panel'),
    options: Array.isArray(rawQ.options) ? rawQ.options : null,
    correctOption: typeof rawQ.correctOption === 'number' ? rawQ.correctOption : null,
    explanation: rawQ.explanation || rawQ.approach || rawQ.suggestedAnswer || '',
    approach: rawQ.approach || '',
    suggestedAnswer: rawQ.suggestedAnswer || '',
    sampleCode: rawQ.sampleCode || '',
    frequencyScore: rawQ.frequencyScore || 85,
    skills: Array.isArray(rawQ.skills) ? rawQ.skills : ['Placement Prep']
  };
}

/**
 * Loads all questions from backend API, local storage, and standard repository.
 */
export async function loadQuestionBankPool() {
  let backendQs = [];
  try {
    const res = await QuestionApi.getAll().catch(() => []);
    if (Array.isArray(res) && res.length > 0) {
      backendQs = res;
    }
  } catch (err) {
    console.warn('Backend question fetch deferred:', err);
  }

  const customQs = getInterviewQuestions() || [];

  // Combine and deduplicate
  const combinedMap = new Map();

  // First add standard catalog as foundational pool
  STANDARD_QUESTION_CATALOG.forEach(q => {
    combinedMap.set(q.id, normalizeQuestionBankItem(q));
  });

  // Then add backend DB questions
  backendQs.forEach((q, idx) => {
    const normalized = normalizeQuestionBankItem(q, idx);
    combinedMap.set(normalized.id, normalized);
  });

  // Then add custom questions
  customQs.forEach((q, idx) => {
    const normalized = normalizeQuestionBankItem(q, idx);
    combinedMap.set(normalized.id, normalized);
  });

  return Array.from(combinedMap.values());
}

/**
 * Returns student-scoped storage key for attempts
 */
function getAttemptsStorageKey(studentId) {
  const safeId = String(studentId || 'default_student').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `placeprep_question_attempts_${safeId}`;
}

/**
 * Reads student's saved attempts map
 */
export function getStudentQuestionAttempts(studentId) {
  try {
    const key = getAttemptsStorageKey(studentId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Records student's attempt on a question and synchronizes practiced state
 */
export function recordStudentQuestionAttempt(studentId, questionId, attemptData) {
  try {
    const key = getAttemptsStorageKey(studentId);
    const current = getStudentQuestionAttempts(studentId);
    const updated = {
      ...current,
      [questionId]: {
        questionId,
        attemptedAt: new Date().toISOString(),
        ...attemptData
      }
    };
    localStorage.setItem(key, JSON.stringify(updated));

    // Also sync practiced toggle if not already practiced
    const practicedList = getPracticedQuestions();
    if (!practicedList.includes(questionId)) {
      togglePracticedQuestion(questionId);
      const user = getCurrentUser();
      if (user) {
        UserApi.togglePracticedQuestion(questionId).catch(() => {});
      }
    }

    return updated;
  } catch (e) {
    console.warn('Failed to record question attempt:', e);
    return {};
  }
}

/**
 * Resets student's attempt on a question
 */
export function resetStudentQuestionAttempt(studentId, questionId) {
  try {
    const key = getAttemptsStorageKey(studentId);
    const current = getStudentQuestionAttempts(studentId);
    delete current[questionId];
    localStorage.setItem(key, JSON.stringify(current));
    return current;
  } catch {
    return {};
  }
}

/**
 * Computes performance statistics for the current student
 */
export function computeStudentQuestionStats(studentId, questionsPool = []) {
  const attempts = getStudentQuestionAttempts(studentId);
  const attemptedIds = Object.keys(attempts);
  const totalQuestions = questionsPool.length;

  let correctCount = 0;
  let incorrectCount = 0;

  attemptedIds.forEach(id => {
    const att = attempts[id];
    if (att && att.isCorrect === true) {
      correctCount++;
    } else if (att && att.isCorrect === false) {
      incorrectCount++;
    }
  });

  const accuracyPct = (correctCount + incorrectCount) > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  return {
    totalQuestions,
    attemptedCount: attemptedIds.length,
    unattemptedCount: Math.max(0, totalQuestions - attemptedIds.length),
    correctCount,
    incorrectCount,
    accuracyPct,
    practicedCount: getPracticedQuestions().length,
    savedCount: getSavedQuestions().length,
    revisionCount: getRevisionList().length
  };
}
