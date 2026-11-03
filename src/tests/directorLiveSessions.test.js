import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = storageMock;

import {
  getLiveSessions,
  calculateEligibleStudentsForDrive,
  publishLiveSessionWithNotifications,
  getLiveSessionsForStudent,
  rescheduleLiveSession,
  cancelLiveSession,
  updateLiveSession,
  rsvpLiveSession,
  getPushNotifications
} from '../services/storage.js';

test('Director Live Sessions — calculateEligibleStudentsForDrive Filters by CGPA, Backlogs, Branch & Batch', () => {
  localStorage.clear();

  // Mock candidates database in localStorage
  const mockStudents = [
    {
      id: 'st-1',
      name: 'Priyansh Sharma',
      email: 'priyansh@dtu.ac.in',
      cgpa: 8.5,
      backlogs: 0,
      activeBacklogs: 0,
      branch: 'Computer Science & Engineering',
      batch: '2026',
      graduationBatch: 2026
    },
    {
      id: 'st-2',
      name: 'Aman Verma',
      email: 'aman@dtu.ac.in',
      cgpa: 6.2, // Below 7.0 cutoff
      backlogs: 0,
      activeBacklogs: 0,
      branch: 'Computer Science & Engineering',
      batch: '2026',
      graduationBatch: 2026
    },
    {
      id: 'st-3',
      name: 'Rohan Gupta',
      email: 'rohan@dtu.ac.in',
      cgpa: 7.8,
      backlogs: 2, // Exceeds 0 backlogs limit
      activeBacklogs: 2,
      branch: 'Computer Science & Engineering',
      batch: '2026',
      graduationBatch: 2026
    },
    {
      id: 'st-4',
      name: 'Sneha Patel',
      email: 'sneha@dtu.ac.in',
      cgpa: 9.1,
      backlogs: 0,
      activeBacklogs: 0,
      branch: 'Mechanical Engineering', // Disallowed branch
      batch: '2026',
      graduationBatch: 2026
    },
    {
      id: 'st-5',
      name: 'Vikram Singh',
      email: 'vikram@dtu.ac.in',
      cgpa: 7.5,
      backlogs: 0,
      activeBacklogs: 0,
      branch: 'Computer Science & Engineering',
      batch: '2027', // Wrong batch
      graduationBatch: 2027
    }
  ];

  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const drive = {
    id: 'test-drive-1',
    company: 'Google Cloud India',
    role: 'Cloud Solutions Architect',
    minCgpa: 7.0,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science & Engineering', 'Information Technology'],
    allowedBatches: ['2026']
  };

  const eligibility = calculateEligibleStudentsForDrive(drive);

  assert.equal(eligibility.count, 1, 'Only 1 candidate (Priyansh) satisfies all strict criteria');
  assert.equal(eligibility.students[0].email, 'priyansh@dtu.ac.in');
  assert.equal(eligibility.details.minCgpa, 7.0);
  assert.equal(eligibility.details.maxBacklogs, 0);
});

test('Director Live Sessions — publishLiveSessionWithNotifications Validates Meeting URL and Creates Smart Notifications', () => {
  localStorage.clear();

  const mockStudents = [
    { id: 'st-1', name: 'Alice', email: 'alice@dtu.ac.in', cgpa: 8.8, backlogs: 0, branch: 'CSE', batch: '2026' },
    { id: 'st-2', name: 'Bob', email: 'bob@dtu.ac.in', cgpa: 8.2, backlogs: 0, branch: 'CSE', batch: '2026' },
    { id: 'st-3', name: 'Charlie', email: 'charlie@dtu.ac.in', cgpa: 5.5, backlogs: 1, branch: 'CSE', batch: '2026' }
  ];
  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const drive = {
    id: 'drive-microsoft',
    company: 'Microsoft India',
    role: 'Software Engineer',
    minCgpa: 7.5,
    maxBacklogs: 0
  };

  // 1. Invalid Meeting URL rejection
  assert.throws(() => {
    publishLiveSessionWithNotifications({
      title: 'Microsoft Pre-Placement Talk',
      companyName: 'Microsoft India',
      driveId: 'drive-microsoft',
      sessionType: 'Pre-Placement Talk',
      platform: 'Microsoft Teams',
      joinUrl: 'invalid-url-without-protocol',
      date: '2026-11-15',
      startTime: '10:00 AM',
      endTime: '11:30 AM'
    }, drive, { name: 'Director', email: 'director@dtu.ac.in' });
  }, /Valid meeting URL.*required/i);

  // 2. Successful publish with smart notifications
  const result = publishLiveSessionWithNotifications({
    title: 'Microsoft Pre-Placement Talk',
    companyName: 'Microsoft India',
    driveId: 'drive-microsoft',
    sessionType: 'Pre-Placement Talk',
    platform: 'Microsoft Teams',
    joinUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_test',
    date: '2026-11-15',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    speaker: 'Satya Nadella, Exec Leadership',
    agenda: 'Campus hiring roadmap, system design expectations and culture.'
  }, drive, { name: 'Director Sharma', email: 'director@dtu.ac.in' });

  assert.ok(result.session.id, 'Session must be assigned an ID');
  assert.equal(result.session.eligibleStudentsCount, 2, 'Alice and Bob are eligible (CGPA >= 7.5, 0 backlogs)');
  assert.equal(result.session.notifiedCount, 2);
  assert.deepEqual(result.session.eligibleStudentEmails.sort(), ['alice@dtu.ac.in', 'bob@dtu.ac.in'].sort());

  // Verify notifications sent to storage
  const notifications = getPushNotifications();
  const sessionNotif = notifications.find(n => n.type === 'LIVE_SESSION' && n.company === 'Microsoft India');
  assert.ok(sessionNotif, 'Push notification must be created for live session');
  assert.ok(sessionNotif.targetStudentEmails.includes('alice@dtu.ac.in'));
  assert.ok(sessionNotif.targetStudentEmails.includes('bob@dtu.ac.in'));
  assert.ok(!sessionNotif.targetStudentEmails.includes('charlie@dtu.ac.in'), 'Ineligible Charlie must NOT be targeted');
  assert.equal(sessionNotif.joinUrl, 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_test');
});

test('Director Live Sessions — Student Visibility Gatekeeping Excludes Ineligible Students', () => {
  localStorage.clear();

  const mockStudents = [
    { id: 'st-1', name: 'Alice', email: 'alice@dtu.ac.in', cgpa: 8.8, backlogs: 0 },
    { id: 'st-3', name: 'Charlie', email: 'charlie@dtu.ac.in', cgpa: 5.5, backlogs: 1 }
  ];
  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const drive = {
    id: 'drive-google',
    company: 'Google',
    role: 'SDE-1',
    minCgpa: 8.0,
    maxBacklogs: 0
  };

  publishLiveSessionWithNotifications({
    title: 'Google Campus PPT',
    companyName: 'Google',
    driveId: 'drive-google',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/xyz-abcd-efg',
    date: '2026-11-20',
    startTime: '04:00 PM',
    endTime: '05:30 PM'
  }, drive, { name: 'Director' });

  // Check Alice (Eligible)
  const aliceSessions = getLiveSessionsForStudent({ email: 'alice@dtu.ac.in', cgpa: 8.8, backlogs: 0 }, [drive]);
  assert.equal(aliceSessions.length, 1, 'Alice is eligible and must see the session');
  assert.equal(aliceSessions[0].joinUrl, 'https://meet.google.com/xyz-abcd-efg');

  // Check Charlie (Ineligible)
  const charlieSessions = getLiveSessionsForStudent({ email: 'charlie@dtu.ac.in', cgpa: 5.5, backlogs: 1 }, [drive]);
  assert.equal(charlieSessions.length, 0, 'Charlie is ineligible and must NOT see the session');
});

test('Director Live Sessions — Reschedule Session Updates Status, Audit Trail & Alerts Eligible Pool', () => {
  localStorage.clear();

  const drive = { id: 'drive-amzn', company: 'Amazon', minCgpa: 6.0, maxBacklogs: 0 };
  const mockStudents = [{ id: 'st-1', email: 'student1@dtu.ac.in', cgpa: 7.5, backlogs: 0 }];
  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const { session } = publishLiveSessionWithNotifications({
    title: 'Amazon PPT',
    companyName: 'Amazon',
    driveId: 'drive-amzn',
    platform: 'Amazon Chime',
    joinUrl: 'https://chime.aws/123456',
    date: '2026-11-10',
    startTime: '02:00 PM',
    endTime: '03:00 PM'
  }, drive, { name: 'Director' });

  const updatedSession = rescheduleLiveSession(
    session.id,
    '2026-11-12',
    '03:30 PM',
    '05:00 PM',
    'Technical presenter availability conflict',
    { name: 'Director Sharma' }
  );

  assert.equal(updatedSession.status, 'Rescheduled');
  assert.equal(updatedSession.date, '2026-11-12');
  assert.equal(updatedSession.startTime, '03:30 PM');
  assert.equal(updatedSession.endTime, '05:00 PM');
  assert.ok(updatedSession.auditTrail.some(entry => entry.action === 'RESCHEDULED'));

  // Verify reschedule notification dispatched
  const notifications = getPushNotifications();
  const rescheduleNotif = notifications.find(n => n.type === 'LIVE_SESSION_RESCHEDULED');
  assert.ok(rescheduleNotif, 'Reschedule notification must be dispatched');
  assert.ok(rescheduleNotif.message.includes('rescheduled to 2026-11-12'));
  assert.ok(rescheduleNotif.targetStudentEmails.includes('student1@dtu.ac.in'));
});

test('Director Live Sessions — Cancel Session Updates Status, Reason & Dispatches Cancellation Alert', () => {
  localStorage.clear();

  const drive = { id: 'drive-meta', company: 'Meta', minCgpa: 6.0, maxBacklogs: 0 };
  const mockStudents = [{ id: 'st-1', email: 'dev@dtu.ac.in', cgpa: 8.0, backlogs: 0 }];
  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const { session } = publishLiveSessionWithNotifications({
    title: 'Meta Hiring Overview',
    companyName: 'Meta',
    driveId: 'drive-meta',
    platform: 'Zoom',
    joinUrl: 'https://zoom.us/j/987654321',
    date: '2026-11-18',
    startTime: '11:00 AM',
    endTime: '12:00 PM'
  }, drive, { name: 'Director' });

  const cancelled = cancelLiveSession(session.id, 'Campus placement schedule realignment', { name: 'Director Sharma' });

  assert.equal(cancelled.status, 'Cancelled');
  assert.ok(cancelled.auditTrail.some(entry => entry.action === 'CANCELLED'));

  const notifications = getPushNotifications();
  const cancelNotif = notifications.find(n => n.type === 'LIVE_SESSION_CANCELLED');
  assert.ok(cancelNotif, 'Cancellation notification must be created');
  assert.ok(cancelNotif.message.includes('has been cancelled'));
  assert.ok(cancelNotif.targetStudentEmails.includes('dev@dtu.ac.in'));
});

test('Director Live Sessions — Student RSVP Increments RSVP Counter with De-duplication', () => {
  localStorage.clear();

  const drive = { id: 'drive-goldman', company: 'Goldman Sachs', minCgpa: 7.0, maxBacklogs: 0 };
  const mockStudents = [{ id: 'st-1', email: 'quant@dtu.ac.in', cgpa: 9.0, backlogs: 0 }];
  localStorage.setItem('placeprep_candidates_db', JSON.stringify(mockStudents));

  const { session } = publishLiveSessionWithNotifications({
    title: 'Goldman Sachs Quant Talk',
    companyName: 'Goldman Sachs',
    driveId: 'drive-goldman',
    platform: 'Zoom',
    joinUrl: 'https://zoom.us/j/123456789',
    date: '2026-11-22',
    startTime: '05:00 PM',
    endTime: '06:30 PM'
  }, drive, { name: 'Director' });

  assert.equal(session.rsvpsCount, 0);

  // First RSVP
  const afterFirst = rsvpLiveSession(session.id, 'quant@dtu.ac.in');
  assert.equal(afterFirst.rsvpsCount, 1);
  assert.ok(afterFirst.attendeeEmails.includes('quant@dtu.ac.in'));

  // Duplicate RSVP attempt
  const afterDuplicate = rsvpLiveSession(session.id, 'quant@dtu.ac.in');
  assert.equal(afterDuplicate.rsvpsCount, 1, 'Duplicate RSVP must not increment counter');
});

test('Director Live Sessions — updateLiveSession Modifies Link & Speaker with Audit Log', () => {
  localStorage.clear();

  const drive = { id: 'drive-oracle', company: 'Oracle', minCgpa: 6.5, maxBacklogs: 0 };
  const { session } = publishLiveSessionWithNotifications({
    title: 'Oracle Cloud Webinar',
    companyName: 'Oracle',
    driveId: 'drive-oracle',
    platform: 'Zoom',
    joinUrl: 'https://zoom.us/j/111222333',
    date: '2026-11-25',
    startTime: '01:00 PM',
    endTime: '02:00 PM'
  }, drive, { name: 'Director' });

  const updated = updateLiveSession(session.id, {
    joinUrl: 'https://oracle.zoom.us/j/999888777',
    speaker: 'Chief Technology Officer',
    agenda: 'OCI Architecture deep-dive'
  }, { name: 'Director Sharma' });

  assert.equal(updated.joinUrl, 'https://oracle.zoom.us/j/999888777');
  assert.equal(updated.speaker, 'Chief Technology Officer');
  assert.equal(updated.agenda, 'OCI Architecture deep-dive');
  assert.ok(updated.auditTrail.some(entry => entry.action === 'EDIT_LINK' || entry.action === 'UPDATED'));
});

