// PlacePrep - REST API Client for Java Fullstack Spring Boot Backend
// Connects with http://localhost:8080/api/* with robust fallback to client-side data

const API_BASE = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[PlacePrep API] Fallback active for ${endpoint}:`, err.message);
    return null;
  }
}

export const WorkflowApi = {
  // Get all candidates
  async getCandidates(companyId = null, round = null) {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (round) params.append('round', round);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await fetchJson(`/workflow/candidates${queryString}`);
  },

  // Advance candidate
  async advanceCandidate(candidateId, nextRound) {
    return await fetchJson(`/workflow/candidates/${candidateId}/advance?nextRound=${nextRound}`, {
      method: 'POST'
    });
  },

  // Eliminate candidate
  async eliminateCandidate(candidateId, reason = '') {
    return await fetchJson(`/workflow/candidates/${candidateId}/eliminate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST'
    });
  },

  // Shortlist candidate
  async shortlistCandidate(candidateId) {
    return await fetchJson(`/workflow/candidates/${candidateId}/shortlist`, {
      method: 'POST'
    });
  },

  // Select candidate (Final Offer)
  async selectCandidate(candidateId) {
    return await fetchJson(`/workflow/candidates/${candidateId}/select`, {
      method: 'POST'
    });
  },

  // Submit evaluation rubric & notes
  async submitEvaluation(candidateId, evaluationData) {
    return await fetchJson(`/workflow/candidates/${candidateId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(evaluationData)
    });
  },

  // Submit Stakeholder Feedback (Student, TPO, Faculty, Company)
  async submitStakeholderFeedback(feedback) {
    return await fetchJson(`/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  },

  // Get Stakeholder Feedbacks
  async getStakeholderFeedbacks() {
    return await fetchJson(`/feedback`);
  }
};

export const CompanyApi = {
  async getAll() {
    return await fetchJson(`/companies`);
  },
  async getById(id) {
    return await fetchJson(`/companies/${id}`);
  },
  async create(companyData) {
    return await fetchJson(`/companies`, {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  },
  async update(id, updatedData) {
    return await fetchJson(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  }
};

export const QuestionApi = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return await fetchJson(`/questions${qs ? `?${qs}` : ''}`);
  },
  async getByCompanyAndRound(companyId, round) {
    return await fetchJson(`/questions/company/${companyId}/round/${round}`);
  }
};

export const DriveApi = {
  async getAll(batch = null) {
    const qs = batch && batch !== 'all' ? `?batch=${batch}` : '';
    return await fetchJson(`/drives${qs}`);
  },
  async getById(id) {
    return await fetchJson(`/drives/${id}`);
  },
  async getCalendar() {
    return await fetchJson(`/drives/calendar`);
  },
  async updateRounds(driveId, rounds, roundConfigsJson) {
    return await fetchJson(`/drives/${driveId}/rounds`, {
      method: 'PUT',
      body: JSON.stringify({ rounds, roundConfigsJson })
    });
  },
  async updateInstructions(driveId, venue, reportingTime, instructions) {
    return await fetchJson(`/drives/${driveId}/instructions`, {
      method: 'PUT',
      body: JSON.stringify({ venue, reportingTime, instructions })
    });
  }
};

export const EligibilityApi = {
  async check(metrics) {
    return await fetchJson(`/eligibility/check`, {
      method: 'POST',
      body: JSON.stringify(metrics)
    });
  },
  async checkDriveForStudent(driveId, studentId = 'user-demo-01') {
    return await fetchJson(`/eligibility/check-drive/${driveId}?studentId=${studentId}`);
  }
};

export const ApplicationApi = {
  async register(application) {
    return await fetchJson(`/applications/register`, {
      method: 'POST',
      body: JSON.stringify(application)
    });
  },
  async getByStudent(studentId) {
    return await fetchJson(`/applications/student/${studentId}`);
  },
  async getByDrive(driveId) {
    return await fetchJson(`/applications/drive/${driveId}`);
  },
  async getAll() {
    return await fetchJson(`/applications`);
  },
  async updateStatus(applicationId, updatePayload) {
    return await fetchJson(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload)
    });
  }
};

export const ScheduleConflictApi = {
  async checkConflict(payload) {
    return await fetchJson(`/schedules/check-conflict`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async getStudentConflicts(studentId, targetDate = null, startTime = '10:00 AM', endTime = '11:30 AM') {
    const params = new URLSearchParams({ studentId, startTime, endTime });
    if (targetDate) params.append('targetDate', targetDate);
    return await fetchJson(`/schedules/conflicts/student?${params.toString()}`);
  },
  async getDriveConflicts() {
    return await fetchJson(`/schedules/conflicts/drives`);
  }
};

export const InsightsApi = {
  async getOverview() {
    return await fetchJson(`/insights/overview`);
  }
};

export const OpportunityApi = {
  async getHackathons() {
    return await fetchJson('/opportunities/hackathons');
  },
  async getInternships(batch) {
    const qs = batch ? `?batch=${encodeURIComponent(batch)}` : '';
    return await fetchJson(`/opportunities/internships${qs}`);
  },
  async getOffCampus(studentEmailOrId) {
    const qs = new URLSearchParams({ studentEmailOrId }).toString();
    return await fetchJson(`/opportunities/off-campus?${qs}`);
  }
};
