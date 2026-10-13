// PlacePrep AI - Persistent Storage and State Management Layer
import {
  INITIAL_BATCHES,
  INITIAL_COMPANIES,
  INITIAL_UPCOMING_DRIVES,
  INITIAL_QUESTIONS,
  INITIAL_EXPERIENCES,
  INITIAL_AI_INSIGHTS
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'placeprep_current_user',
  GRADUATION_BATCH: 'placeprep_graduation_batch',
  ONBOARDING_DONE: 'placeprep_onboarding_completed',
  SAVED_QUESTIONS: 'placeprep_saved_questions',
  PRACTICED_QUESTIONS: 'placeprep_practiced_questions',
  REVISION_LIST: 'placeprep_revision_list',
  SAVED_COMPANIES: 'placeprep_saved_companies',
  CUSTOM_COMPANIES: 'placeprep_custom_companies',
  CUSTOM_QUESTIONS: 'placeprep_custom_questions',
  CUSTOM_EXPERIENCES: 'placeprep_custom_experiences',
  CUSTOM_DRIVES: 'placeprep_custom_drives',
  MOCK_INTERVIEW_SESSIONS: 'placeprep_mock_sessions',
  PLATFORM_FEEDBACK: 'placeprep_feedback_list',
};

// Safe JSON parser
function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// User Profile
export function getCurrentUser() {
  return getStorageItem(STORAGE_KEYS.CURRENT_USER, {
    id: 'user-demo-01',
    name: 'Priyansh Jain',
    email: 'priyansh.jain@example.edu',
    college: 'Delhi Technological University (DTU)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2028',
    role: 'student', // 'student' or 'admin'
    targetCompanies: ['hcltech', 'tcs', 'accenture'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  });
}

export function setCurrentUser(user) {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  if (user && user.graduationBatch) {
    setGraduationBatch(user.graduationBatch);
  }
}

// Batch Management
export function getGraduationBatch() {
  const directBatch = getStorageItem(STORAGE_KEYS.GRADUATION_BATCH, null);
  if (directBatch) return directBatch;
  const user = getCurrentUser();
  return user?.graduationBatch || '2028';
}

export function setGraduationBatch(batchId) {
  setStorageItem(STORAGE_KEYS.GRADUATION_BATCH, batchId);
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, true);
  const user = getCurrentUser();
  if (user) {
    user.graduationBatch = batchId;
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  }
  // Dispatch custom window event so UI reacts instantaneously
  window.dispatchEvent(new CustomEvent('batch-changed', { detail: batchId }));
}

export function isOnboardingCompleted() {
  return getStorageItem(STORAGE_KEYS.ONBOARDING_DONE, false);
}

export function setOnboardingCompleted(completed) {
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, completed);
}

// Companies
export function getCompanies() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, []);
  return [...INITIAL_COMPANIES, ...custom];
}

export function getCompanyBySlugOrId(identifier) {
  const all = getCompanies();
  return all.find(c => c.id === identifier || c.slug === identifier) || all[0];
}

export function addCompany(newCompany) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, []);
  custom.unshift(newCompany);
  setStorageItem(STORAGE_KEYS.CUSTOM_COMPANIES, custom);
  return newCompany;
}

// Placement Drives
export function getUpcomingDrives() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, []);
  return [...INITIAL_UPCOMING_DRIVES, ...custom];
}

export function addDrive(newDrive) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, []);
  custom.unshift(newDrive);
  setStorageItem(STORAGE_KEYS.CUSTOM_DRIVES, custom);
  return newDrive;
}

// Interview Questions
export function getInterviewQuestions() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, []);
  return [...INITIAL_QUESTIONS, ...custom];
}

export function addInterviewQuestion(newQuestion) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, []);
  custom.unshift(newQuestion);
  setStorageItem(STORAGE_KEYS.CUSTOM_QUESTIONS, custom);
  return newQuestion;
}

// Questions Practiced / Saved / Revision
export function getPracticedQuestions() {
  return getStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, ['hcl-tech-01', 'hcl-hr-01']);
}

export function togglePracticedQuestion(questionId) {
  const list = getPracticedQuestions();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, updated);
  window.dispatchEvent(new CustomEvent('practice-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

export function getSavedQuestions() {
  return getStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, ['hcl-tech-02', 'hcl-tech-03']);
}

export function toggleSavedQuestion(questionId) {
  const list = getSavedQuestions();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, updated);
  window.dispatchEvent(new CustomEvent('saved-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

export function getRevisionList() {
  return getStorageItem(STORAGE_KEYS.REVISION_LIST, ['hcl-mgr-01']);
}

export function toggleRevisionQuestion(questionId) {
  const list = getRevisionList();
  let updated;
  if (list.includes(questionId)) {
    updated = list.filter(id => id !== questionId);
  } else {
    updated = [...list, questionId];
  }
  setStorageItem(STORAGE_KEYS.REVISION_LIST, updated);
  window.dispatchEvent(new CustomEvent('revision-status-changed', { detail: { questionId, updated } }));
  return updated.includes(questionId);
}

// Saved Companies
export function getSavedCompanies() {
  return getStorageItem(STORAGE_KEYS.SAVED_COMPANIES, ['hcltech', 'tcs']);
}

export function toggleSavedCompany(companyId) {
  const list = getSavedCompanies();
  let updated;
  if (list.includes(companyId)) {
    updated = list.filter(id => id !== companyId);
  } else {
    updated = [...list, companyId];
  }
  setStorageItem(STORAGE_KEYS.SAVED_COMPANIES, updated);
  return updated.includes(companyId);
}

// Interview Experiences
export function getInterviewExperiences() {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, []);
  return [...custom, ...INITIAL_EXPERIENCES];
}

export function addInterviewExperience(newExp) {
  const custom = getStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, []);
  const prepared = {
    ...newExp,
    id: `exp-${Date.now()}`,
    verified: true,
    helpfulVotes: 1,
    createdAt: new Date().toISOString()
  };
  custom.unshift(prepared);
  setStorageItem(STORAGE_KEYS.CUSTOM_EXPERIENCES, custom);
  window.dispatchEvent(new CustomEvent('experience-added', { detail: prepared }));
  return prepared;
}

// AI Insights
export function getAiInsights(companyId) {
  if (INITIAL_AI_INSIGHTS[companyId]) {
    return INITIAL_AI_INSIGHTS[companyId];
  }
  // Fallback intelligent generator for any company
  const company = getCompanyBySlugOrId(companyId);
  return {
    companyId,
    dataFreshness: 'October 2026',
    totalSamplesAnalyzed: company?.experienceCount || 45,
    confidenceScore: '92%',
    verifiedSourcesBadge: `Campus Drive Logs (${company?.name})`,
    frequentQuestions: [
      { question: 'Data Structures: HashMaps, Arrays & Two Pointers', frequency: '42% of technical tests', trend: '+14% recent', category: 'DSA' },
      { question: 'Core Fundamentals: OOPs Polymorphism & Inheritance', frequency: '36% of interviews', trend: 'Consistent', category: 'OOP' },
      { question: 'Behavioral: Challenging team scenario & resolution', frequency: '85% of HR rounds', trend: 'Universal', category: 'HR' }
    ],
    trendingTopics: [
      { topic: 'Cloud & System Reliability', change: '+35% increase in 2026', reason: 'High client shift towards cloud architectures' },
      { topic: 'Hands-on live coding over pure theoretical MCQs', change: '+40% increase', reason: 'Evaluates hands-on implementation ability' }
    ],
    historicalVsRecentAnalysis: {
      olderTrends: 'Earlier drives emphasized static textbook theory and rote-learned definitions.',
      recentTrends: 'Recent interviews focus heavily on project architectural decisions, clean code, and practical problem solving.',
      keyTakeaway: 'Ensure you can explain your GitHub projects and commit histories fluently.'
    },
    preparationPriority: [
      { priority: 'High Priority (Must-Do)', topics: ['Data Structures (Arrays, Strings, Maps)', 'OOP Concepts in chosen language', 'Top 5 STAR behavioral responses'] },
      { priority: 'Medium Priority (Concept Reinforcement)', topics: ['DBMS Normalization & SQL Queries', 'Operating Systems Core Concepts'] },
      { priority: 'Additional Practice', topics: ['System Design Overview', 'Aptitude & Speed Math'] }
    ],
    disclaimer: 'Note: AI insights are synthesized from historical reports and candidate experiences.'
  };
}

// Mock Interview Session Storage
export function getMockSessions() {
  return getStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, [
    {
      id: 'mock-01',
      companyId: 'hcltech',
      companyName: 'HCLTech',
      round: 'Technical Interview',
      date: '2026-10-10',
      score: 84,
      correctness: 86,
      clarity: 82,
      structure: 85,
      questionsAnswered: 3,
      feedbackSummary: 'Strong technical explanation of Floyd\'s cycle detection and SQL joins. Work on structuring your STAR answer for project challenges.'
    }
  ]);
}

export function saveMockSession(session) {
  const list = getMockSessions();
  list.unshift({ ...session, id: `mock-${Date.now()}` });
  setStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, list);
}

// Platform Feedback
export function getPlatformFeedback() {
  return getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
}

export function submitPlatformFeedback(fb) {
  const list = getPlatformFeedback();
  list.unshift({ ...fb, id: `fb-${Date.now()}`, date: new Date().toISOString() });
  setStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, list);
}
