import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentUser, getInitialFullStudentProfile, getFullStudentProfile, getCompanies, getInterviewQuestions, getUpcomingDrives, getPracticedQuestions, getSavedQuestions, getSavedCompanies, getMockSessions, evaluateStudentEligibility, getSavedInstituteLocation } from '../services/storage.js';
import { getAllStudents } from '../services/academicRecordsService.js';
import { getLocalSessions, getLocalRecords, getRosterForClass } from '../services/attendanceStorage.js';
import { getLocalCrtSessions, getLocalCrtRecords } from '../services/crtAttendanceStorage.js';
import { getCurriculumTargets } from '../services/curriculumGovernanceService.js';
import { StudentAttendanceApi, ManagementApi } from '../services/api.js';
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,String(value)), removeItem: key => values.delete(key) };
beforeEach(() => values.clear());

test('fresh storage has no fabricated account or preparation activity', () => {
  assert.equal(getCurrentUser(),null);
  for (const getter of [getCompanies,getInterviewQuestions,getUpcomingDrives,getPracticedQuestions,getSavedQuestions,getSavedCompanies,getMockSessions]) assert.deepEqual(getter(),[]);
});
test('fresh storage has no academic, attendance, CRT, or curriculum records', () => {
  for (const getter of [getAllStudents,getLocalSessions,getLocalRecords,getLocalCrtSessions,getLocalCrtRecords,getCurriculumTargets]) assert.deepEqual(getter(),[]);
  assert.deepEqual(getRosterForClass('CSE','6'),[]);
});
test('new profile contains only supplied identity and no invented grades, documents or experience', () => {
  const profile=getInitialFullStudentProfile({id:'registered-account',name:'Registered User',email:'registered@example.edu'});
  assert.equal(profile.basicDetails.fullName,'Registered User');
  assert.equal(profile.basicDetails.phone,'');
  assert.equal(profile.educationDetails.cgpa,'');
  assert.equal(profile.verified,false);
  for (const key of ['workExperiences','projects','accomplishments','responsibilities','volunteering']) assert.deepEqual(profile[key],[]);
  assert.equal(profile.documents.resumeFileName,'');
});
test('existing saved records are preserved when defaults are read', () => {
  const user={id:'saved-account',name:'Saved User',email:'saved@example.edu'};
  const companies=[{id:'saved-company',name:'Saved Company'}];
  localStorage.setItem('placeprep_current_user',JSON.stringify(user));
  localStorage.setItem('placeprep_custom_companies',JSON.stringify(companies));
  localStorage.setItem('placeprep_student_academic_records',JSON.stringify([{id:'saved-record',email:user.email}]));
  assert.deepEqual(getCurrentUser(),user);
  assert.deepEqual(getCompanies(),companies);
  assert.equal(getAllStudents()[0].id,'saved-record');
  assert.deepEqual(JSON.parse(localStorage.getItem('placeprep_current_user')),user);
});
test('signed-out users cannot inherit a legacy saved profile', () => {
  localStorage.setItem('placeprep_student_full_profile',JSON.stringify({basicDetails:{fullName:'Another user',email:'another@example.edu'}}));
  assert.equal(getFullStudentProfile().basicDetails.email,'');
  assert.equal(JSON.parse(localStorage.getItem('placeprep_student_full_profile')).basicDetails.email,'another@example.edu');
});
test('missing academic data cannot be treated as an eligible applicant', () => {
  const result=evaluateStudentEligibility({}, {id:'real-drive',minCgpa:7});
  assert.equal(result.isEligible,false);
  assert.equal(result.status,'INCOMPLETE_PROFILE');
});
test('a missing institute location is unconfigured rather than a fabricated campus', () => {
  assert.equal(getSavedInstituteLocation().latitude,null);
  assert.equal(getSavedInstituteLocation().locationStatus,'NOT_CONFIGURED');
});
test('unavailable backend cannot produce a successful identity or attendance result', async () => {
  const original=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error('Offline');};
  try {
    await assert.rejects(()=>StudentAttendanceApi.verifyFace('image'));
    await assert.rejects(()=>StudentAttendanceApi.markAttendance({latitude:0,longitude:0}));
    await assert.rejects(()=>StudentAttendanceApi.startQrAttendance({sessionId:1}));
    await assert.rejects(()=>ManagementApi.verifyStudentLocation(0,0));
  } finally { globalThis.fetch=original; }
});
