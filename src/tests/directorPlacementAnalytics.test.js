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
  DIRECTOR_COMPANY_ANALYTICS,
  ANALYTICS_CANDIDATE_DETAILS,
  getDirectorAnalyticsSummary,
  getCompanyPlacementStats,
  getCompanyDetails,
  getCandidatesForCompany
} from '../data/directorPlacementAnalyticsData.js';
import { addDrive, getUpcomingDrives } from '../services/storage.js';

test('Director Placement Analytics — 8 Companies Dataset Verification', () => {
  assert.equal(DIRECTOR_COMPANY_ANALYTICS.length, 8, 'Must contain exactly 8 corporate hiring drives');

  const companyIds = DIRECTOR_COMPANY_ANALYTICS.map((c) => c.id);
  const expectedIds = ['tcs', 'infosys', 'wipro', 'accenture', 'capgemini', 'cognizant', 'hcltech', 'deloitte'];
  expectedIds.forEach((id) => {
    assert.ok(companyIds.includes(id), `Dataset must contain company ID: ${id}`);
  });
});

test('Director Placement Analytics — Strict Mathematical Funnel Conservation', () => {
  DIRECTOR_COMPANY_ANALYTICS.forEach((company) => {
    assert.ok(company.companyName, 'Company must have a valid name');
    assert.ok(company.role, 'Company must have a valid role');
    assert.ok(company.ctc, 'Company must have a CTC package');
    assert.equal(company.rounds.length, 6, `${company.companyName} must have 6 recruitment rounds`);

    // Verify round 1 appeared matches totalRegistered
    assert.equal(
      company.rounds[0].appeared,
      company.totalRegistered,
      `${company.companyName}: Round 1 appeared must equal totalRegistered`
    );

    let sumRejected = 0;
    let sumPending = 0;

    for (let i = 0; i < company.rounds.length; i++) {
      const r = company.rounds[i];

      // Round internal conservation: appeared = selected + rejected + pending
      const roundSum = r.selectedNextRound + r.rejected + r.pending;
      assert.equal(
        roundSum,
        r.appeared,
        `${company.companyName} Round ${r.roundNumber} conservation failed: ${roundSum} != ${r.appeared}`
      );

      sumRejected += r.rejected;
      sumPending += r.pending;

      // Sequential funnel pool conservation: appeared[i+1] == selectedNextRound[i]
      if (i < company.rounds.length - 1) {
        const nextRound = company.rounds[i + 1];
        assert.equal(
          nextRound.appeared,
          r.selectedNextRound,
          `${company.companyName} Round ${r.roundNumber} -> ${nextRound.roundNumber} pool transfer failed: Next appeared (${nextRound.appeared}) != Prev selected (${r.selectedNextRound})`
        );
      } else {
        // Final round selected must equal finalSelected
        assert.equal(
          r.selectedNextRound,
          company.finalSelected,
          `${company.companyName} Final round selected must equal company.finalSelected`
        );
      }
    }

    // Total conservation: totalRegistered = rejected + inProcess + finalSelected
    assert.equal(
      company.rejected,
      sumRejected,
      `${company.companyName} company.rejected must equal sum of round rejections`
    );
    assert.equal(
      company.inProcess,
      sumPending,
      `${company.companyName} company.inProcess must equal sum of round pending`
    );
    assert.equal(
      company.totalRegistered,
      company.rejected + company.inProcess + company.finalSelected,
      `${company.companyName} Total candidate conservation failed: totalRegistered != rejected + inProcess + finalSelected`
    );
  });
});

test('Director Placement Analytics — Aggregate Summary Computation', () => {
  const summary = getDirectorAnalyticsSummary();

  assert.equal(summary.totalCompanies, 8);
  assert.equal(summary.totalRegistered, 1455);
  assert.equal(summary.totalFinallySelected, 196);
  assert.equal(summary.totalRejected, 1127);
  assert.equal(summary.totalInProcess, 132);
  assert.equal(summary.overallSelectionRate, '13.5%');
  assert.equal(summary.isDemoData, true);
});

test('Director Placement Analytics — Candidate Details & Filter Queries', () => {
  const tcsCandidates = getCandidatesForCompany('tcs');
  assert.ok(tcsCandidates.length > 0, 'Must return candidate records for TCS');

  tcsCandidates.forEach((cand) => {
    assert.equal(cand.companyId, 'tcs');
    assert.ok(cand.studentName, 'Candidate must have studentName');
    assert.ok(cand.rollNumber, 'Candidate must have rollNumber');
    assert.ok(cand.branch, 'Candidate must have branch');
    assert.ok(cand.currentRound, 'Candidate must have currentRound');
    assert.ok(cand.status, 'Candidate must have status');
    assert.ok(cand.scores, 'Candidate must have scores object');
  });

  const allCandidates = getCandidatesForCompany('ALL');
  assert.equal(allCandidates.length, ANALYTICS_CANDIDATE_DETAILS.length);
});

test('Director Campus Drive Creation — Field Validation & Persistence', () => {
  localStorage.clear();

  const testDrive = {
    id: `test-drv-${Date.now()}`,
    companyId: 'test-google-sde',
    companyName: 'Google',
    role: 'Software Engineer - University Graduate',
    ctc: '₹32.00 LPA',
    driveDate: '2026-12-01',
    venue: 'Main Auditorium & Coding Labs',
    status: 'Verified Upcoming Drive',
    minCgpa: 8.0,
    maxBacklogs: 0,
    eligibleBatches: ['2026'],
    allowedBranches: ['CSE', 'IT']
  };

  const added = addDrive(testDrive);
  assert.equal(added.companyName, 'Google');
  assert.equal(added.role, 'Software Engineer - University Graduate');

  const upcoming = getUpcomingDrives();
  const found = upcoming.find((d) => d.id === testDrive.id);
  assert.ok(found, 'Created drive must be found in upcoming drives list');
  assert.equal(found.ctc, '₹32.00 LPA');
});
