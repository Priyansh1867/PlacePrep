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
  async getAll() {
    return await fetchJson(`/drives`);
  }
};

export const InsightsApi = {
  async getOverview() {
    return await fetchJson(`/insights/overview`);
  }
};
