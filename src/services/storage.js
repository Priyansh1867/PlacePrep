// PlacePrep Client Storage & Offline Synchronization Helper
import {
  INITIAL_BATCHES,
  INITIAL_COMPANIES,
  INITIAL_UPCOMING_DRIVES,
  INITIAL_QUESTIONS,
  INITIAL_EXPERIENCES,
  INITIAL_AI_INSIGHTS
} from '../data/initialData';
import { setAuthToken } from './api';

const STORAGE_KEYS = {
  CURRENT_USER: 'placeprep_current_user',
  GRADUATION_BATCH: 'placeprep_graduation_batch',
  ONBOARDING_DONE: 'placeprep_onboarding_completed',
  SAVED_QUESTIONS: 'placeprep_saved_questions',
  PRACTICED_QUESTIONS: 'placeprep_practiced_questions',
  REVISION_LIST: 'placeprep_revision_list',
  SAVED_COMPANIES: 'placeprep_saved_companies',
  MOCK_INTERVIEW_SESSIONS: 'placeprep_mock_sessions',
  PLATFORM_FEEDBACK: 'placeprep_feedback_list',
  THEME_PREFERENCE: 'placeprep_theme'
};

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
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// User Profile & Authentication State
export function getCurrentUser() {
  return getStorageItem(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  if (user && user.graduationBatch) {
    setGraduationBatch(user.graduationBatch);
  }
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
}

export function clearCurrentUser() {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, null);
  setAuthToken(null);
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
}

// Graduation Batch Personalization
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
  window.dispatchEvent(new CustomEvent('batch-changed', { detail: batchId }));
}

export function isOnboardingCompleted() {
  return getStorageItem(STORAGE_KEYS.ONBOARDING_DONE, false);
}

export function setOnboardingCompleted(completed) {
  setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, completed);
}

// Static Seed Data Getters (Used as fallback/offline references)
export function getInitialCompanies() {
  return INITIAL_COMPANIES;
}

export function getInitialDrives() {
  return INITIAL_UPCOMING_DRIVES;
}

export function getInitialQuestions() {
  return INITIAL_QUESTIONS;
}

export function getInitialExperiences() {
  return INITIAL_EXPERIENCES;
}

// Offline / Local Session Caches
export function getSavedQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.savedQuestionIds || getStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, []);
}

export function getPracticedQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.practicedQuestionIds || getStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, []);
}

export function getRevisionQuestionIdsLocal() {
  const user = getCurrentUser();
  return user?.revisionQuestionIds || getStorageItem(STORAGE_KEYS.REVISION_LIST, []);
}

export function getSavedCompanyIdsLocal() {
  const user = getCurrentUser();
  return user?.savedCompanyIds || getStorageItem(STORAGE_KEYS.SAVED_COMPANIES, []);
}

export function getMockSessionsLocal() {
  return getStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, []);
}

export function saveMockSessionLocal(session) {
  const list = getMockSessionsLocal();
  list.unshift({ ...session, id: session.id || `mock-${Date.now()}` });
  setStorageItem(STORAGE_KEYS.MOCK_INTERVIEW_SESSIONS, list);
}

// Backward-compatible aliases for components transitioning to REST API
export const getCompanies = getInitialCompanies;
export const getUpcomingDrives = getInitialDrives;
export const getInterviewQuestions = getInitialQuestions;
export const getInterviewExperiences = getInitialExperiences;

export function getSavedQuestions() {
  return getSavedQuestionIdsLocal();
}

export function toggleSavedQuestion(id) {
  const list = getSavedQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.SAVED_QUESTIONS, updated);
  return index < 0;
}

export function getPracticedQuestions() {
  return getPracticedQuestionIdsLocal();
}

export function togglePracticedQuestion(id) {
  const list = getPracticedQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.PRACTICED_QUESTIONS, updated);
  return index < 0;
}

export function getRevisionList() {
  return getRevisionQuestionIdsLocal();
}

export function toggleRevisionQuestion(id) {
  const list = getRevisionQuestionIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.REVISION_LIST, updated);
  return index < 0;
}

export function getSavedCompanies() {
  return getSavedCompanyIdsLocal();
}

export function toggleSavedCompany(id) {
  const list = getSavedCompanyIdsLocal();
  const index = list.indexOf(id);
  let updated;
  if (index >= 0) {
    updated = list.filter(item => item !== id);
  } else {
    updated = [...list, id];
  }
  setStorageItem(STORAGE_KEYS.SAVED_COMPANIES, updated);
  return index < 0;
}

export function addInterviewExperience(experience) {
  const current = getStorageItem('placeprep_custom_experiences', []);
  const newExp = {
    ...experience,
    id: experience.id || `exp-user-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  current.unshift(newExp);
  setStorageItem('placeprep_custom_experiences', current);
  return newExp;
}

export function submitPlatformFeedback(feedback) {
  const current = getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
  current.unshift({
    ...feedback,
    id: `fb-${Date.now()}`,
    submittedAt: new Date().toISOString()
  });
  setStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, current);
  return true;
}

export function getAiInsights(companyId) {
  if (!companyId) return INITIAL_AI_INSIGHTS;
  return INITIAL_AI_INSIGHTS[companyId] || INITIAL_AI_INSIGHTS.hcltech || null;
}

export const saveMockSession = saveMockSessionLocal;

export function addCompany(company) {
  const current = getStorageItem('placeprep_custom_companies', []);
  const newComp = { ...company, id: company.id || `comp-${Date.now()}` };
  current.unshift(newComp);
  setStorageItem('placeprep_custom_companies', current);
  return newComp;
}

export function addDrive(drive) {
  const current = getStorageItem('placeprep_custom_drives', []);
  const newDrive = { ...drive, id: drive.id || `drive-${Date.now()}` };
  current.unshift(newDrive);
  setStorageItem('placeprep_custom_drives', current);
  return newDrive;
}

export function addInterviewQuestion(question) {
  const current = getStorageItem('placeprep_custom_questions', []);
  const newQ = { ...question, id: question.id || `q-${Date.now()}` };
  current.unshift(newQ);
  setStorageItem('placeprep_custom_questions', current);
  return newQ;
}

export function getPlatformFeedback() {
  return getStorageItem(STORAGE_KEYS.PLATFORM_FEEDBACK, []);
}

// Theme preference
export function getThemePreference() {
  return getStorageItem(STORAGE_KEYS.THEME_PREFERENCE, 'light');
}

export function setThemePreference(theme) {
  setStorageItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
}



