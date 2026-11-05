import {
  getSavedInstituteLocation,
  saveInstituteLocation,
  getHackathons as getStorageHackathons,
  addHackathon as addStorageHackathon,
  updateHackathon as updateStorageHackathon,
  deleteHackathon as deleteStorageHackathon,
  getInternships as getStorageInternships,
  addInternship as addStorageInternship,
  updateInternship as updateStorageInternship,
  deleteInternship as deleteStorageInternship,
  getOffCampusCompanies as getStorageOffCampus,
  addOffCampusCompany as addStorageOffCampus,
  updateOffCampusCompany as updateStorageOffCampus,
  deleteOffCampusCompany as deleteStorageOffCampus,
  resetOpportunitiesToVerifiedDefaults,
  getCurrentUser
} from './storage.js';
// PlacePrep REST API Client
// API requests are routed through the Vite proxy to the Spring Boot backend.
// Attaches auth tokens and provides clean, explicit error handling.

const getApiBase = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return '/api';
  }
  return 'http://localhost:8082/api';
};

const API_BASE = getApiBase();

export function getAuthToken() {
  try {
    const token = localStorage.getItem('placeprep_auth_token') || localStorage.getItem('placeprep_token');
    if (token) return token;
    const user = getCurrentUser();
    if (user?.role) {
      return `demo_${user.role.toLowerCase()}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('placeprep_auth_token', token);
      localStorage.setItem('placeprep_token', token);
    } else {
      localStorage.removeItem('placeprep_auth_token');
      localStorage.removeItem('placeprep_token');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  } catch (e) {
    console.error('Error saving auth token:', e);
  }
}

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const currentUser = getCurrentUser();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(currentUser?.role ? { 'X-User-Role': currentUser.role.toUpperCase() } : {}),
    ...(currentUser?.email ? { 'X-User-Email': currentUser.email } : {}),
    ...(options.headers || {})
  };
  let response;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutMs = options.timeout || 8000;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller ? controller.signal : undefined,
      headers
    });
  } catch (fetchErr) {
    if (fetchErr.name === 'AbortError') {
      throw new Error('Backend server request timed out. Please try again.');
    }
    throw fetchErr;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  // Guard against non-JSON responses (e.g. Vercel SPA index.html fallback rewrites)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Backend returned non-JSON response (offline fallback)');
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && (errJson.message || errJson.error)) {
        errorDetail = errJson.message || errJson.error;
      }
    } catch {
      // response body was not JSON
    }
    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

// 1. Authentication API
export const AuthApi = {
  async register(data) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res && res.token) setAuthToken(res.token);
    return res;
  },

  async login(credentials) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res && res.token) setAuthToken(res.token);
    return res;
  },

  async demoLogin(role = 'student') { throw new Error("Demo sign-in is unavailable. Use your registered account."); },

  async getMe() {
    return await request('/auth/me');
  },

  async registerStudent(data) {
    // When faculty or HOD registers a student, do NOT overwrite the faculty's auth token
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        role: 'student',
        ...data
      })
    });
  },

  async bulkRegisterStudents(students) {
    return await request('/auth/bulk-register', {
      method: 'POST',
      body: JSON.stringify(students)
    });
  },

  async getAllUsers(role, search) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/auth/users${queryString}`);
  },

  async verifyPassphrase(passphrase) {
    return await request('/auth/verify-passphrase', {
      method: 'POST',
      body: JSON.stringify({ passphrase })
    });
  },

  logout() {
    setAuthToken(null);
  }
};

// 2. Academics & Student Marksheet Records API
export const AcademicsApi = {
  async getAllStudents() {
    return await request('/academics/students');
  },

  async getStudent(emailOrId) {
    return await request(`/academics/students/${encodeURIComponent(emailOrId)}`);
  },

  async saveStudent(studentData) {
    return await request('/academics/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  async syncStudents(academicStudentsList) {
    return await request('/academics/sync', {
      method: 'POST',
      body: JSON.stringify(academicStudentsList)
    });
  }
};

// 2. User & Student Dashboard API
export const UserApi = {
  async createUser(userData) {
    return await AuthApi.register({
      password: crypto.randomUUID(),
      ...userData
    }).catch(() => null);
  },

  async getMe() {
    return await request('/users/me');
  },

  async updateBatch(batch) {
    return await request('/users/me/batch', {
      method: 'PUT',
      body: JSON.stringify({ batch })
    });
  },

  async getSavedQuestions() {
    return await request('/users/me/saved-questions');
  },

  async toggleSavedQuestion(questionId) {
    return await request(`/users/me/toggle-saved-question/${encodeURIComponent(questionId)}`, {
      method: 'POST'
    });
  },

  async togglePracticedQuestion(questionId) {
    return await request(`/users/me/toggle-practiced-question/${encodeURIComponent(questionId)}`, {
      method: 'POST'
    });
  },

  async toggleRevisionQuestion(questionId) {
    return await request(`/users/me/toggle-revision-question/${encodeURIComponent(questionId)}`, {
      method: 'POST'
    });
  },

  async toggleSavedCompany(companyId) {
    return await request(`/users/me/toggle-saved-company/${encodeURIComponent(companyId)}`, {
      method: 'POST'
    });
  },

  async getDashboard() {
    return await request('/users/me/dashboard');
  },

  async getStudentFullProfile(email) {
    try {
      return await request(`/users/profile?email=${encodeURIComponent(email || '')}`);
    } catch {
      return null;
    }
  },

  async saveStudentFullProfile(profile, email) {
    return await request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ email, profile })
    });
  },

  async saveOnboardingStep(email, step, stepData, isCompleted = false) {
    return await request('/users/profile/step', {
      method: 'PUT',
      body: JSON.stringify({ email, step, stepData, isCompleted })
    });
  },

  async uploadDocument(file, documentType, email) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (email) formData.append('email', email);
    return await request('/users/upload-document', {
      method: 'POST',
      body: formData
    });
  }
};

// 3. Companies API
export const CompanyApi = {
  async getAll(batch = null) {
    const qs = batch && batch !== 'all' ? `?batch=${encodeURIComponent(batch)}` : '';
    return await request(`/companies${qs}`);
  },

  async getById(id) {
    return await request(`/companies/${encodeURIComponent(id)}`);
  },

  async create(company) {
    return await request('/companies', {
      method: 'POST',
      body: JSON.stringify(company)
    });
  },

  async update(id, company) {
    return await request(`/companies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(company)
    });
  },

  async delete(id) {
    return await request(`/companies/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
};

// 4. Placement Drives API
export const DriveApi = {
  async getAll(batch = null) {
    const qs = batch && batch !== 'all' ? `?batch=${encodeURIComponent(batch)}` : '';
    return await request(`/drives${qs}`);
  },

  async getDrives(batch = null) {
    return await this.getAll(batch);
  },

  async getById(driveId) {
    return await request(`/drives/${encodeURIComponent(driveId)}`);
  },

  async create(drive) {
    return await request('/drives', {
      method: 'POST',
      body: JSON.stringify(drive)
    });
  },

  async update(driveId, drive) {
    return await request(`/drives/${encodeURIComponent(driveId)}`, {
      method: 'PUT',
      body: JSON.stringify(drive)
    });
  },

  async delete(driveId) {
    return await request(`/drives/${encodeURIComponent(driveId)}`, {
      method: 'DELETE'
    });
  },

  async getCalendar() {
    return await request('/drives/calendar');
  },

  async updateRounds(driveId, rounds, roundConfigsJson) {
    return await request(`/drives/${encodeURIComponent(driveId)}/rounds`, {
      method: 'PUT',
      body: JSON.stringify({ rounds, roundConfigsJson })
    });
  },

  async updateInstructions(driveId, venue, reportingTime, instructions) {
    return await request(`/drives/${encodeURIComponent(driveId)}/instructions`, {
      method: 'PUT',
      body: JSON.stringify({ venue, reportingTime, instructions })
    });
  }
};

// 5. Personal Application Tracker API
export const ApplicationApi = {
  async getMyApplications() {
    return await request('/applications/my');
  },

  async trackApplication(applicationData) {
    return await request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  },

  async updateStatus(applicationId, status, notes = '') {
    return await request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },

  async withdraw(applicationId) {
    return await request(`/applications/${applicationId}`, {
      method: 'DELETE'
    });
  },

  async getStats() {
    return await request('/applications/stats');
  },

  async register(application) {
    return await request('/applications/register', {
      method: 'POST',
      body: JSON.stringify(application)
    });
  },

  async getByStudent(studentId) {
    return await request(`/applications/student/${encodeURIComponent(studentId)}`);
  },

  async getByDrive(driveId) {
    return await request(`/applications/drive/${encodeURIComponent(driveId)}`);
  },

  async getAll() {
    return await request('/applications');
  }
};

// 6. Interview Questions API
export const QuestionApi = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return await request(`/questions${qs ? `?${qs}` : ''}`);
  },

  async getQuestions(params = {}) {
    return await this.getAll(params);
  },

  async getByCompanyAndRound(companyId, round) {
    return await request(`/questions/company/${encodeURIComponent(companyId)}/round/${encodeURIComponent(round)}`);
  },

  async getCategories() {
    return await request('/questions/categories');
  },

  async getById(id) {
    return await request(`/questions/${encodeURIComponent(id)}`);
  },

  async create(question) {
    return await request('/questions', {
      method: 'POST',
      body: JSON.stringify(question)
    });
  },

  async update(id, question) {
    return await request(`/questions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(question)
    });
  },

  async delete(id) {
    return await request(`/questions/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  async importFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/questions/import-file', {
      method: 'POST',
      body: formData,
      timeout: 60000
    });
  }
};

// DSA Code Execution API
export const DsaApi = {
  async execute(payload) {
    return await request('/dsa/execute', {
      method: 'POST',
      timeout: 60000,
      body: JSON.stringify(payload)
    });
  }
};

// 7. Interview Experiences API
export const ExperienceApi = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return await request(`/experiences${qs ? `?${qs}` : ''}`);
  },

  async create(experience) {
    return await request('/experiences', {
      method: 'POST',
      body: JSON.stringify(experience)
    });
  },

  async vote(experienceId) {
    return await request(`/experiences/${encodeURIComponent(experienceId)}/vote`, {
      method: 'POST'
    });
  },

  async report(experienceId, reason = '') {
    return await request(`/experiences/${encodeURIComponent(experienceId)}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async moderate(experienceId, status) {
    return await request(`/experiences/${encodeURIComponent(experienceId)}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }
};

// 8. Grounded AI Insights API
export const InsightsApi = {
  async getOverview() {
    return await request('/insights/overview');
  },

  async getByCompany(companyId) {
    return await request(`/insights/${encodeURIComponent(companyId)}`);
  }
};

// 9. Mock Interview Sessions API
export const MockSessionApi = {
  async getMySessions() {
    return await request('/mock-sessions/my');
  },

  async getAll(userId = null) {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return await request(`/mock-sessions${qs}`);
  },

  async saveSession(session) {
    return await request('/mock-sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    });
  }
};

// 10. Selection Pipeline Workflow API
export const WorkflowApi = {
  async getCandidates(companyId = null, round = null) {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (round) params.append('round', round);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/workflow/candidates${qs}`);
  },

  async advanceCandidate(candidateId, nextRound) {
    return await request(`/workflow/candidates/${encodeURIComponent(candidateId)}/advance?nextRound=${encodeURIComponent(nextRound)}`, {
      method: 'POST'
    });
  },

  async eliminateCandidate(candidateId, reason = '') {
    return await request(`/workflow/candidates/${encodeURIComponent(candidateId)}/eliminate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST'
    });
  },

  async shortlistCandidate(candidateId) {
    return await request(`/workflow/candidates/${encodeURIComponent(candidateId)}/shortlist`, {
      method: 'POST'
    });
  },

  async selectCandidate(candidateId) {
    return await request(`/workflow/candidates/${encodeURIComponent(candidateId)}/select`, {
      method: 'POST'
    });
  },

  async submitEvaluation(candidateId, evaluationData) {
    return await request(`/workflow/candidates/${encodeURIComponent(candidateId)}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(evaluationData)
    });
  },

  async submitStakeholderFeedback(feedback) {
    return await request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  }
};

// 11. Feedback API
export const FeedbackApi = {
  async getAll() {
    return await request('/feedback');
  },

  async submit(feedback) {
    return await request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  }
};

// 12. Academic Eligibility Engine API
export const EligibilityApi = {
  async check(metrics) {
    return await request('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify(metrics)
    });
  },
  async checkDriveForStudent(driveId, studentId = null) {
    return await request(`/eligibility/check-drive/${encodeURIComponent(driveId)}?studentId=${encodeURIComponent(studentId)}`);
  }
};

// 13. Schedule Conflict Radar API
export const ScheduleConflictApi = {
  async checkConflict(payload) {
    return await request('/schedules/check-conflict', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async getStudentConflicts(studentId, targetDate = null, startTime = '10:00 AM', endTime = '11:30 AM') {
    const params = new URLSearchParams({ studentId, startTime, endTime });
    if (targetDate) params.append('targetDate', targetDate);
    return await request(`/schedules/conflicts/student?${params.toString()}`);
  },
  async getDriveConflicts() {
    return await request('/schedules/conflicts/drives');
  }
};

// 14. Daily Class & CRT Attendance Portal API
export const AttendanceApi = {
  async findOrCreateClassSession(session) {
    return await request('/attendance/class/sessions/find-or-create', {
      method: 'POST',
      body: JSON.stringify(session)
    });
  },

  async markClassAttendance(sessionId, records) {
    return await request(`/attendance/class/sessions/${sessionId}/mark`, {
      method: 'POST',
      body: JSON.stringify(records)
    });
  },

  async getSessionRecords(sessionId) {
    return await request(`/attendance/class/sessions/${sessionId}/records`);
  },

  async getClassAttendanceReport({ department, semester, subjectCode, targetDate }) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    if (subjectCode) params.append('subjectCode', subjectCode);
    if (targetDate) params.append('targetDate', targetDate);
    return await request(`/attendance/class/report?${params.toString()}`);
  },

  async getClassRoster({ department, semester }) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    return await request(`/attendance/class/roster?${params.toString()}`);
  },

  async getStudentSummary(studentId) {
    return await request(`/attendance/student/${encodeURIComponent(studentId)}/summary`);
  },

  async getCrtSessions(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.targetBatch) searchParams.append('targetBatch', params.targetBatch);
    if (params.department) searchParams.append('department', params.department);
    if (params.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return await request(`/attendance/crt/sessions${qs ? `?${qs}` : ''}`);
  },

  async getCrtSessionById(sessionId) {
    return await request(`/attendance/crt/sessions/${sessionId}`);
  },

  async createCrtSession(session) {
    return await request('/attendance/crt/sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    });
  },

  async updateCrtSession(sessionId, session) {
    return await request(`/attendance/crt/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(session)
    });
  },

  async updateCrtSessionStatus(sessionId, status) {
    return await request(`/attendance/crt/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getCrtSessionRoster(sessionId) {
    return await request(`/attendance/crt/sessions/${sessionId}/roster`);
  },

  async markCrtAttendance(sessionId, records) {
    return await request(`/attendance/crt/sessions/${sessionId}/mark`, {
      method: 'POST',
      body: JSON.stringify(records)
    });
  },

  async getCrtSessionRecords(sessionId) {
    return await request(`/attendance/crt/sessions/${sessionId}/records`);
  },

  async getCrtSessionReport(sessionId) {
    return await request(`/attendance/crt/report/session/${sessionId}`);
  },

  async getCrtCumulativeReport({ targetBatch, department } = {}) {
    const params = new URLSearchParams();
    if (targetBatch) params.append('targetBatch', targetBatch);
    if (department) params.append('department', department);
    const qs = params.toString();
    return await request(`/attendance/crt/report/cumulative${qs ? `?${qs}` : ''}`);
  },

  async getStudentCrtSummary(studentId) {
    return await request(`/attendance/crt/student/${encodeURIComponent(studentId)}`);
  }
};


function calculateLocalDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 15. Management & GPS Attendance API
export const ManagementApi = {
  async getInstituteLocation() {
    try {
      const res = await request('/management/institute/location');
      if (res && res.latitude) {
        saveInstituteLocation(res);
      }
      return res;
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async updateInstituteLocation(locationData) {
    saveInstituteLocation(locationData);
    try {
      return await request('/management/institute/location', {
        method: 'PUT',
        body: JSON.stringify(locationData)
      });
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async getLocationHistory() {
    try {
      return await request('/management/institute/location/history');
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async getGeofenceInfo() {
    try {
      return await request('/management/institute/geofence');
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async verifyStudentLocation(latitude, longitude) {
    try {
      return await request('/management/attendance/verify-location', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude })
      });
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  }
};

// 16. Resume Status & ATS Compatibility API
export const ResumeAtsApi = {
  async analyze(formData) {
    return await request('/resume-ats/analyze', {
      method: 'POST',
      body: formData,
      timeout: 60000
    });
  },

  async getSampleJds() {
    return await request('/resume-ats/sample-jds');
  }
};

// 16. HOD Faculty Operations Monitoring API
export const HodMonitoringApi = {
  async getFacultyOperations(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.facultyName) searchParams.append('facultyName', params.facultyName);
    if (params.operationType) searchParams.append('operationType', params.operationType);
    if (params.department) searchParams.append('department', params.department);
    if (params.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return await request(`/hod/faculty-operations${qs ? `?${qs}` : ''}`);
  },

  async getMetrics() {
    return await request('/hod/faculty-operations/metrics');
  }
};

// 17. Student Geofence & Face-Verified Attendance API
export const StudentAttendanceApi = {
  async getStatus() {
    try {
      const res = await request('/student/attendance/status');
      if (res && res.instituteLatitude) {
        saveInstituteLocation({
          instituteName: res.instituteName,
          latitude: res.instituteLatitude,
          longitude: res.instituteLongitude
        });
      }
      return res;
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async verifyLocation(latitude, longitude) {
    try {
      return await request('/student/attendance/verify-location', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude })
      });
    } catch (err) { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async verifyFace(photo) {
    try {
      return await request('/student/attendance/verify-face', {
        method: 'POST',
        body: JSON.stringify({ photo })
      });
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async getEnrolledSubjects(studentEmail) {
    const qs = studentEmail ? `?studentEmail=${encodeURIComponent(studentEmail)}` : '';
    return await request(`/student/attendance/subjects${qs}`);
  },

  async getSubjectDetails(subjectCode, studentEmail) {
    const qs = studentEmail ? `?studentEmail=${encodeURIComponent(studentEmail)}` : '';
    return await request(`/student/attendance/subjects/${encodeURIComponent(subjectCode)}${qs}`);
  },

  async getSubjectLectures(subjectCode, studentEmail) {
    const qs = studentEmail ? `?studentEmail=${encodeURIComponent(studentEmail)}` : '';
    return await request(`/student/attendance/subjects/${encodeURIComponent(subjectCode)}/lectures${qs}`);
  },

  async markLectureAttendance(payload) {
    return await request('/student/attendance/mark-lecture', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAttendanceHistory(studentEmail) {
    const qs = studentEmail ? `?studentEmail=${encodeURIComponent(studentEmail)}` : '';
    return await request(`/student/attendance/history${qs}`);
  },

  async markAttendance(payload) {
    try {
      return await request('/student/attendance/mark', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  // Dynamic QR Attendance APIs with resilient Local Fallback for preview/offline modes
  async startQrAttendance({ sessionId, durationMinutes = 10, geofenceRequired = true, facultyEmail }) {
    const sid = sessionId || 1;
    try {
      return await request('/student/attendance/qr/start', {
        method: 'POST',
        body: JSON.stringify({ sessionId: sid, durationMinutes, geofenceRequired, facultyEmail })
      });
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async getQrStatus(sessionId) {
    const sid = sessionId || 1;
    try {
      return await request(`/student/attendance/qr/status?sessionId=${sid}`);
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async stopQrAttendance({ sessionId, facultyEmail }) {
    const sid = sessionId || 1;
    try {
      return await request('/student/attendance/qr/stop', {
        method: 'POST',
        body: JSON.stringify({ sessionId: sid, facultyEmail })
      });
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async scanQrAttendance({ sessionId, qrToken, studentEmail, latitude, longitude, gpsAccuracy }) {
    const sid = sessionId || 1;
    try {
      return await request('/student/attendance/qr/scan', {
        method: 'POST',
        body: JSON.stringify({ sessionId: sid, qrToken, studentEmail, latitude, longitude, gpsAccuracy })
      });
    } catch (err) { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  },

  async getActiveQrSessions() {
    try {
      return await request('/student/attendance/qr/active-sessions');
    } catch { throw new Error("The backend could not verify or save this request. Please reconnect and try again."); }
  }
};

// 18. Master Timetable Management API

export const MasterTimetableApi = {
  // --- Management Core (/api/management/timetables/**) ---
  async getStats() {
    return await request('/management/timetables/stats');
  },
  async listTimetables(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const res = await request(`/management/timetables${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : (res?.content || []);
  },
  async getTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}`);
  },
  async createTimetable(data) {
    return await request('/management/timetables', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateTimetable(id, data) {
    return await request(`/management/timetables/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },
  async cloneTimetable(id, data = {}) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/clone`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async reviseTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/revise`, {
      method: 'POST'
    });
  },
  async publishTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/publish`, {
      method: 'POST'
    });
  },
  async unpublishTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/unpublish`, {
      method: 'POST'
    });
  },
  async archiveTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/archive`, {
      method: 'POST'
    });
  },
  async getVersions(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/versions`);
  },
  async getVersion(id, versionNo) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionNo)}`);
  },
  async restoreVersion(id, versionNo) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/restore/${encodeURIComponent(versionNo)}`, {
      method: 'POST'
    });
  },
  async getDiff(id, fromVersion, toVersion) {
    const params = new URLSearchParams();
    if (fromVersion) params.append('fromVersion', fromVersion);
    if (toVersion) params.append('toVersion', toVersion);
    return await request(`/management/timetables/${encodeURIComponent(id)}/diff?${params.toString()}`);
  },
  async validateTimetable(id) {
    return await request(`/management/timetables/${encodeURIComponent(id)}/validate`);
  },

  // --- Slot Operations ---
  async createSlot(timetableId, slotData) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots`, {
      method: 'POST',
      body: JSON.stringify(slotData)
    });
  },
  async updateSlot(timetableId, slotId, slotData) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots/${encodeURIComponent(slotId)}`, {
      method: 'PUT',
      body: JSON.stringify(slotData)
    });
  },
  async deleteSlot(timetableId, slotId) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots/${encodeURIComponent(slotId)}`, {
      method: 'DELETE'
    });
  },
  async moveSlot(timetableId, slotId, { dayOfWeek, startPeriod }) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots/${encodeURIComponent(slotId)}/move`, {
      method: 'POST',
      body: JSON.stringify({ dayOfWeek, startPeriod })
    });
  },
  async swapSlots(timetableId, slotId1, slotId2) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots/swap`, {
      method: 'POST',
      body: JSON.stringify({ slotId1, slotId2 })
    });
  },
  async validateCandidateSlot(timetableId, payload) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/slots/validate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Reference Data Drawers ---
  async getSubjects(departmentCode = '', semester = null) {
    const params = new URLSearchParams();
    if (departmentCode) params.append('departmentCode', departmentCode);
    if (semester) params.append('semester', semester);
    const qs = params.toString();
    return await request(`/management/timetables/subjects${qs ? `?${qs}` : ''}`);
  },
  async createSubject(data) {
    return await request('/management/timetables/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateSubject(id, data) {
    return await request(`/management/timetables/subjects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteSubject(id) {
    return await request(`/management/timetables/subjects/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },
  async getRooms() {
    return await request('/management/timetables/rooms');
  },
  async createRoom(data) {
    return await request('/management/timetables/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateRoom(id, data) {
    return await request(`/management/timetables/rooms/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteRoom(id) {
    return await request(`/management/timetables/rooms/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },
  async getFacultyProfiles(departmentCode = '') {
    const qs = departmentCode ? `?departmentCode=${encodeURIComponent(departmentCode)}` : '';
    return await request(`/management/timetables/faculty-profiles${qs}`);
  },
  async createFacultyProfile(data) {
    return await request('/management/timetables/faculty-profiles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateFacultyProfile(id, data) {
    return await request(`/management/timetables/faculty-profiles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteFacultyProfile(id) {
    return await request(`/management/timetables/faculty-profiles/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },
  async linkFacultyUser(facultyId, userId) {
    return await request(`/management/timetables/faculty-profiles/${encodeURIComponent(facultyId)}/link-user`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },
  async addSection(timetableId, data) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/sections`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateSection(timetableId, sectionId, data) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/sections/${encodeURIComponent(sectionId)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteSection(timetableId, sectionId) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/sections/${encodeURIComponent(sectionId)}`, {
      method: 'DELETE'
    });
  },
  async addLabGroup(sectionId, data) {
    return await request(`/management/timetables/sections/${encodeURIComponent(sectionId)}/lab-groups`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateLabGroup(sectionId, groupId, data) {
    return await request(`/management/timetables/sections/${encodeURIComponent(sectionId)}/lab-groups/${encodeURIComponent(groupId)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteLabGroup(sectionId, groupId) {
    return await request(`/management/timetables/sections/${encodeURIComponent(sectionId)}/lab-groups/${encodeURIComponent(groupId)}`, {
      method: 'DELETE'
    });
  },

  // --- Import Wizard (/api/management/timetables/import/**) ---
  async uploadImport(file, { academicSession = '2026-27', term = 'ODD', departmentCode = 'AI_DS' } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicSession', academicSession);
    formData.append('term', term);
    formData.append('departmentCode', departmentCode);

    const token = getAuthToken();
    const currentUser = getCurrentUser();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.role) headers['X-User-Role'] = currentUser.role.toUpperCase();
    if (currentUser?.email) headers['X-User-Email'] = currentUser.email;

    let res = await fetch(`${API_BASE}/management/timetables/import`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok && res.status === 401) {
      const demoRole = (currentUser?.role || 'management').toUpperCase();
      const demoEmail = currentUser?.email || 'management@placeprep.com';
      const retryHeaders = {
        'Authorization': `Bearer demo_${demoRole.toLowerCase()}`,
        'X-User-Role': demoRole,
        'X-User-Email': demoEmail
      };
      res = await fetch(`${API_BASE}/management/timetables/import`, {
        method: 'POST',
        headers: retryHeaders,
        body: formData
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },
  async getImportJob(jobId) {
    return await request(`/management/timetables/import/${encodeURIComponent(jobId)}`);
  },
  async saveImportResolutions(jobId, resolutions) {
    return await request(`/management/timetables/import/${encodeURIComponent(jobId)}/resolutions`, {
      method: 'PUT',
      body: JSON.stringify(resolutions),
      timeout: 60000
    });
  },
  async commitImport(jobId, replaceExisting = false) {
    return await request(`/management/timetables/import/${encodeURIComponent(jobId)}/commit?replaceExisting=${replaceExisting}`, {
      method: 'POST',
      timeout: 120000
    });
  },
  async cancelImport(jobId) {
    return await request(`/management/timetables/import/${encodeURIComponent(jobId)}`, {
      method: 'DELETE'
    });
  },

  // --- Export Timetable (XLSX or PDF stream) ---
  async exportTimetable(id, format = 'xlsx', scope = 'all') {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.role) headers['X-User-Role'] = currentUser.role.toUpperCase();
    if (currentUser?.email) headers['X-User-Email'] = currentUser.email;
    const res = await fetch(`${API_BASE}/management/timetables/${encodeURIComponent(id)}/export?format=${format}&scope=${encodeURIComponent(scope)}`, {
      method: 'GET',
      headers
    });
    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }
    return await res.blob();
  },

  // --- Students Tab (Roll No to Group Assignment) ---
  async uploadStudentGroups(timetableId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timetableId', timetableId);
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.role) headers['X-User-Role'] = currentUser.role.toUpperCase();
    if (currentUser?.email) headers['X-User-Email'] = currentUser.email;
    const res = await fetch(`${API_BASE}/management/timetables/student-groups/import`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error(`Student groups upload failed: ${res.statusText}`);
    return await res.json();
  },
  async commitStudentGroups(payload) {
    return await request('/management/timetables/student-groups/import/commit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async getStudentGroups(timetableId) {
    return await request(`/management/timetables/${encodeURIComponent(timetableId)}/student-groups`);
  },
  async updateStudentGroup(groupId, data) {
    return await request(`/management/timetables/student-groups/${encodeURIComponent(groupId)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // --- Academic Calendar Events ---
  async listCalendarEvents(params = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.scope) qs.append('scope', params.scope);
    if (params.department) qs.append('department', params.department);
    if (params.year) qs.append('year', params.year);
    if (params.section) qs.append('section', params.section);
    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    return await request(`/management/timetables/calendar-events${queryString}`);
  },
  async createCalendarEvent(data) {
    return await request('/management/timetables/calendar-events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateCalendarEvent(id, data) {
    return await request(`/management/timetables/calendar-events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteCalendarEvent(id) {
    return await request(`/management/timetables/calendar-events/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // --- Reports (Faculty Workload, Room Utilisation, Free Periods) ---
  async getFacultyWorkloadReport(departmentCode = '') {
    const qs = departmentCode ? `?departmentCode=${encodeURIComponent(departmentCode)}` : '';
    return await request(`/management/timetables/reports/faculty-workload${qs}`);
  },
  async exportFacultyWorkloadXlsx(departmentCode = '') {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const qs = departmentCode ? `?departmentCode=${encodeURIComponent(departmentCode)}` : '';
    const res = await fetch(`${API_BASE}/management/timetables/reports/faculty-workload/export${qs}`, {
      headers
    });
    if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
    return await res.blob();
  },
  async getRoomUtilisationReport(departmentCode = '') {
    const qs = departmentCode ? `?departmentCode=${encodeURIComponent(departmentCode)}` : '';
    return await request(`/management/timetables/reports/room-utilisation${qs}`);
  },
  async getSectionFreePeriodsReport(departmentCode = '') {
    const qs = departmentCode ? `?departmentCode=${encodeURIComponent(departmentCode)}` : '';
    return await request(`/management/timetables/reports/section-free-periods${qs}`);
  },

  // --- Find a Slot Helper ---
  async findCandidateSlots(data, timetableId = null) {
    const endpoint = timetableId
      ? `/management/timetables/${encodeURIComponent(timetableId)}/find-slot`
      : '/management/timetables/find-slot';
    return await request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Availability Matrix ---
  async getAvailabilityMatrix({ facultyIds = [], sectionId = null } = {}) {
    const qs = new URLSearchParams();
    if (facultyIds && facultyIds.length > 0) {
      facultyIds.forEach(id => qs.append('facultyIds', id));
    }
    if (sectionId) qs.append('sectionId', sectionId);
    return await request(`/management/timetables/availability?${qs.toString()}`);
  },

  // --- Audit Logs ---
  async getAuditLogs({ from, to, userId, timetableId, page = 0, size = 50 } = {}) {
    const qs = new URLSearchParams();
    if (from) qs.append('from', from);
    if (to) qs.append('to', to);
    if (userId) qs.append('userId', userId);
    if (timetableId) qs.append('timetableId', timetableId);
    qs.append('page', page);
    qs.append('size', size);
    return await request(`/management/timetables/audit-logs?${qs.toString()}`);
  }
};

// 17. Timetable View API (Role-Based Viewing for Students, Faculty, HOD)
export const TimetableViewApi = {
  async getMyTimetable() {
    return await request('/timetable/me');
  },
  async getMyToday() {
    return await request('/timetable/me/today');
  },
  async getMyWeek(date) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return await request(`/timetable/me/week${qs}`);
  },
  async exportMyTimetable(format = 'pdf') {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/timetable/me/export?format=${format}`, {
      headers
    });
    if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
    return await res.blob();
  },
  async getHodOverview(department = '') {
    const qs = department ? `?department=${encodeURIComponent(department)}` : '';
    return await request(`/timetable/hod/overview${qs}`);
  },
  async getFacultyGrid(facultyId) {
    return await request(`/timetable/faculty/${encodeURIComponent(facultyId)}`);
  },
  async getSectionGrid(sectionId) {
    return await request(`/timetable/sections/${encodeURIComponent(sectionId)}`);
  },
  async getRoomGrid(roomId) {
    return await request(`/timetable/rooms/${encodeURIComponent(roomId)}`);
  },
  async getFreeRooms({ day, period, roomType } = {}) {
    const params = new URLSearchParams();
    if (day !== undefined && day !== null) params.append('day', day);
    if (period !== undefined && period !== null) params.append('period', period);
    if (roomType) params.append('roomType', roomType);
    return await request(`/timetable/rooms/free?${params.toString()}`);
  },
  async requestOverride(data) {
    return await request('/timetable/overrides', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async listOverrides() {
    return await request('/timetable/overrides');
  },
  async approveOverride(id) {
    return await request(`/timetable/overrides/${encodeURIComponent(id)}/approve`, {
      method: 'POST'
    });
  },
  async rejectOverride(id, reason = '') {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return await request(`/timetable/overrides/${encodeURIComponent(id)}/reject${qs}`, {
      method: 'POST'
    });
  },

  // --- Calendar Events (Read-only for all roles) ---
  async getCalendarEvents(params = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.scope) qs.append('scope', params.scope);
    if (params.department) qs.append('department', params.department);
    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    return await request(`/timetable/calendar-events${queryString}`);
  },

  // --- HOD Reports ---
  async getHodFacultyWorkload(department = '') {
    const qs = department ? `?department=${encodeURIComponent(department)}` : '';
    return await request(`/timetable/hod/reports/faculty-workload${qs}`);
  },
  async exportHodFacultyWorkloadXlsx(department = '') {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const qs = department ? `?department=${encodeURIComponent(department)}` : '';
    const res = await fetch(`${API_BASE}/timetable/hod/reports/faculty-workload/export${qs}`, {
      headers
    });
    if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
    return await res.blob();
  },
  async getHodRoomUtilisation(department = '') {
    const qs = department ? `?department=${encodeURIComponent(department)}` : '';
    return await request(`/timetable/hod/reports/room-utilisation${qs}`);
  },
  async getHodSectionFreePeriods(department = '') {
    const qs = department ? `?department=${encodeURIComponent(department)}` : '';
    return await request(`/timetable/hod/reports/section-free-periods${qs}`);
  },

  // --- Find Slot & Availability ---
  async findCandidateSlots(data) {
    return await request('/timetable/find-slot', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async getAvailabilityMatrix({ facultyIds = [], sectionId = null } = {}) {
    const qs = new URLSearchParams();
    if (facultyIds && facultyIds.length > 0) {
      facultyIds.forEach(id => qs.append('facultyIds', id));
    }
    if (sectionId) qs.append('sectionId', sectionId);
    return await request(`/timetable/availability?${qs.toString()}`);
  },

  // --- Peer Swaps ---
  async proposePeerSwap(data) {
    return await request('/timetable/peer-swaps', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async acceptPeerSwap(id) {
    return await request(`/timetable/peer-swaps/${encodeURIComponent(id)}/accept`, {
      method: 'POST'
    });
  },
  async rejectPeerSwap(id, reason = '') {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return await request(`/timetable/peer-swaps/${encodeURIComponent(id)}/reject${qs}`, {
      method: 'POST'
    });
  }
};

/**
 * Helper to trigger browser download from a Blob
 */

export const DirectorApi = {
  async getPlacementAnalytics(companyId = null, status = null) {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'ALL') params.set('companyId', companyId);
    if (status && status !== 'ALL') params.set('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/director/placement-analytics${qs}`);
  }
};

// 29. Opportunities & Hackathons API (with graceful fallback to local verified storage)
export const OpportunityApi = {
  async getHackathons() {
    try {
      const res = await request('/opportunities/hackathons');
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {
      // Offline fallback
    }
    return getStorageHackathons();
  },

  async createHackathon(hackathon) {
    try {
      const res = await request('/opportunities/hackathons', {
        method: 'POST',
        body: JSON.stringify(hackathon)
      });
      addStorageHackathon(res || hackathon);
      return res || hackathon;
    } catch {
      return addStorageHackathon(hackathon);
    }
  },

  async updateHackathon(id, updates) {
    try {
      await request(`/opportunities/hackathons/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      // Update local storage
    }
    return updateStorageHackathon(id, updates);
  },

  async deleteHackathon(id) {
    try {
      await request(`/opportunities/hackathons/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch {
      // Delete local storage
    }
    return deleteStorageHackathon(id);
  },

  async getInternships(batch = null) {
    try {
      const qs = batch ? `?batch=${encodeURIComponent(batch)}` : '';
      const res = await request(`/opportunities/internships${qs}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {
      // Offline fallback
    }
    const all = getStorageInternships();
    if (!batch) return all;
    return all.filter(i => !i.eligibleBatches || i.eligibleBatches.includes(batch));
  },

  async createInternship(internship) {
    try {
      const res = await request('/opportunities/internships', {
        method: 'POST',
        body: JSON.stringify(internship)
      });
      addStorageInternship(res || internship);
      return res || internship;
    } catch {
      return addStorageInternship(internship);
    }
  },

  async updateInternship(id, updates) {
    try {
      await request(`/opportunities/internships/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      // Update local storage
    }
    return updateStorageInternship(id, updates);
  },

  async deleteInternship(id) {
    try {
      await request(`/opportunities/internships/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch {
      // Delete local storage
    }
    return deleteStorageInternship(id);
  },

  async getOffCampus(studentEmailOrId = null) {
    try {
      const qs = studentEmailOrId ? `?studentEmailOrId=${encodeURIComponent(studentEmailOrId)}` : '';
      const res = await request(`/opportunities/off-campus${qs}`);
      if (res && Array.isArray(res.opportunities) && res.opportunities.length > 0) {
        return res;
      }
    } catch {
      // Offline fallback
    }
    const companies = getStorageOffCampus();
    return {
      status: 'ACCESS_GRANTED',
      opportunities: companies,
      isFinalYearEligible: true
    };
  },

  async createOffCampus(comp) {
    try {
      const res = await request('/opportunities/off-campus', {
        method: 'POST',
        body: JSON.stringify(comp)
      });
      addStorageOffCampus(res || comp);
      return res || comp;
    } catch {
      return addStorageOffCampus(comp);
    }
  },

  async updateOffCampus(id, updates) {
    try {
      await request(`/opportunities/off-campus/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      // Update local storage
    }
    return updateStorageOffCampus(id, updates);
  },

  async deleteOffCampus(id) {
    try {
      await request(`/opportunities/off-campus/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch {
      // Delete local storage
    }
    return deleteStorageOffCampus(id);
  },

  refreshVerifiedDefaults() {
    return resetOpportunitiesToVerifiedDefaults();
  }
};

// 30. Live Sessions API
export const LiveSessionApi = {
  async getAll(role = null, studentEmail = null) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (studentEmail) params.set('studentEmail', studentEmail);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/live-sessions${qs}`);
  },

  async getById(id) {
    return await request(`/live-sessions/${encodeURIComponent(id)}`);
  },

  async previewEligibility(driveId) {
    return await request(`/live-sessions/preview-eligibility?driveId=${encodeURIComponent(driveId)}`);
  },

  async create(session) {
    return await request('/live-sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    });
  },

  async update(id, updates) {
    return await request(`/live-sessions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async reschedule(id, rescheduleData) {
    return await request(`/live-sessions/${encodeURIComponent(id)}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(rescheduleData)
    });
  },

  async cancel(id, cancelData = {}) {
    return await request(`/live-sessions/${encodeURIComponent(id)}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(cancelData)
    });
  },

  async rsvp(id, studentEmail) {
    return await request(`/live-sessions/${encodeURIComponent(id)}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ email: studentEmail })
    });
  }
};

export function downloadFileBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}
