// PlacePrep REST API Client
// API requests are routed through the Vite proxy to the Spring Boot backend.
// Attaches auth tokens and provides clean, explicit error handling.

const API_BASE = '/api';

export function getAuthToken() {
  try {
    return localStorage.getItem('placeprep_auth_token') || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('placeprep_auth_token', token);
    } else {
      localStorage.removeItem('placeprep_auth_token');
    }
  } catch (e) {
    console.error('Error saving auth token:', e);
  }
}

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

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

  async demoLogin(role = 'student') {
    const res = await request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    if (res && res.token) setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return await request('/auth/me');
  },

  async getAllUsers() {
    return await request('/auth/users');
  },

  logout() {
    setAuthToken(null);
  }
};

// 2. User & Student Dashboard API
export const UserApi = {
  async createUser(userData) {
    return await AuthApi.register({
      password: 'password123',
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
  async checkDriveForStudent(driveId, studentId = 'user-demo-01') {
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

// 15. Management & GPS Attendance API
export const ManagementApi = {
  async getInstituteLocation() {
    return await request('/management/institute/location');
  },

  async updateInstituteLocation(locationData) {
    return await request('/management/institute/location', {
      method: 'PUT',
      body: JSON.stringify(locationData)
    });
  },

  async getLocationHistory() {
    return await request('/management/institute/location/history');
  },

  async getGeofenceInfo() {
    return await request('/management/institute/geofence');
  },

  async verifyStudentLocation(latitude, longitude) {
    return await request('/management/attendance/verify-location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
  }
};

// 16. Resume Status & ATS Compatibility API
export const ResumeAtsApi = {
  async analyze(formData) {
    return await request('/resume-ats/analyze', {
      method: 'POST',
      body: formData
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
    return await request('/student/attendance/status');
  },

  async verifyLocation(latitude, longitude) {
    return await request('/student/attendance/verify-location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
  },

  async verifyFace(photo) {
    return await request('/student/attendance/verify-face', {
      method: 'POST',
      body: JSON.stringify({ photo })
    });
  },

  async markAttendance(payload) {
    return await request('/student/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

