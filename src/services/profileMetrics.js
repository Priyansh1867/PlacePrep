import { getFullStudentProfile } from './storage.js';
import { getAllStudents } from './academicRecordsService.js';

export function numericValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getProfileMetrics(user = {}) {
  const profile = getFullStudentProfile(user).educationDetails || {};
  const record = user.email ? getAllStudents().find(item => item.email?.toLowerCase() === user.email.toLowerCase()) : null;
  return {
    cgpa: numericValue(record?.cumulativeCgpa ?? user.cgpa ?? profile.cgpa),
    backlogs: numericValue(record?.activeBacklogs ?? user.activeBacklogs ?? profile.activeBacklogs),
    tenthPercentage: numericValue(record?.tenthPercentage ?? user.tenthPercentage ?? profile.tenthPercentage),
    twelfthPercentage: numericValue(record?.twelfthPercentage ?? user.twelfthPercentage ?? profile.twelfthPercentage),
  };
}

export function attendancePercentage(records = []) {
  const totals = records.reduce((sum, item) => ({ attended: sum.attended + Number(item.attended ?? item.lecturesAttended ?? 0), held: sum.held + Number(item.totalClasses ?? item.totalApplicableLectures ?? item.total ?? 0) }), { attended: 0, held: 0 });
  return totals.held > 0 ? Math.round(totals.attended / totals.held * 1000) / 10 : null;
}

export function displayValue(value, suffix = '') {
  return value === null || value === undefined || value === '' ? 'Not available' : `${value}${suffix}`;
}
