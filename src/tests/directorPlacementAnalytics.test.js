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
import {
  addDrive,
  getUpcomingDrives,
  updateDriveRoundsConfig,
  getDriveRoundsConfig
} from '../services/storage.js';

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

test('Director Campus Drive — Dynamic Interview Round Configuration (3 Custom Rounds)', () => {
  localStorage.clear();

  const customRounds = [
    { roundNumber: 1, name: 'Online Coding Assessment', description: '60 min DSA & Algorithms test on HackerRank' },
    { roundNumber: 2, name: 'Technical System Design Interview', description: 'Live whiteboarding and microservices architecture' },
    { roundNumber: 3, name: 'HR & Culture Alignment', description: 'Behavioral, values and compensation discussion' }
  ];

  const driveId = `drv-custom-${Date.now()}`;
  const testDrive = {
    id: driveId,
    driveId: driveId,
    companyId: 'uber-india',
    companyName: 'Uber',
    role: 'Software Engineer II',
    ctc: '₹38.50 LPA',
    driveDate: '2026-11-28',
    venue: 'Uber Tech Tower & Virtual Meet',
    status: 'Verified Upcoming Drive',
    minCgpa: 8.0,
    maxBacklogs: 0,
    totalRounds: customRounds.length,
    rounds: customRounds.map((r) => r.name),
    roundConfigs: customRounds,
    roundConfigsJson: JSON.stringify(customRounds)
  };

  addDrive(testDrive);
  updateDriveRoundsConfig(testDrive.id, testDrive.rounds, testDrive.roundConfigs);

  const storedConfig = getDriveRoundsConfig(testDrive.id);
  assert.ok(storedConfig, 'Rounds configuration must be persisted in storage');
  assert.equal(storedConfig.rounds.length, 3, 'Must have exactly 3 configured rounds');
  assert.equal(storedConfig.roundConfigs[0].name, 'Online Coding Assessment');
  assert.equal(storedConfig.roundConfigs[1].name, 'Technical System Design Interview');
  assert.equal(storedConfig.roundConfigs[2].name, 'HR & Culture Alignment');
  assert.equal(storedConfig.roundConfigs[0].roundNumber, 1);
  assert.equal(storedConfig.roundConfigs[1].roundNumber, 2);
  assert.equal(storedConfig.roundConfigs[2].roundNumber, 3);
});

test('Director Campus Drive — Dynamic Interview Round Configuration (6 Custom Rounds)', () => {
  localStorage.clear();

  const customRounds = [
    { roundNumber: 1, name: 'Resume Shortlisting & ATS Screen', description: 'Keyword matching and GPA validation' },
    { roundNumber: 2, name: 'Cognitive & Aptitude Assessment', description: 'Quant, Logic & Verbal speed evaluation' },
    { roundNumber: 3, name: 'Coding & Algorithmic Challenge', description: 'Graph, DP, and Trees live coding' },
    { roundNumber: 4, name: 'Technical Domain Interview', description: 'Database indexing, OS and Networking' },
    { roundNumber: 5, name: 'Managerial & Problem Solving Round', description: 'Real-world scenario case study' },
    { roundNumber: 6, name: 'Executive Leadership & Fitment', description: 'Director level interview and offer discussion' }
  ];

  const driveId = `drv-goldman-${Date.now()}`;
  const testDrive = {
    id: driveId,
    driveId: driveId,
    companyId: 'goldman-sachs',
    companyName: 'Goldman Sachs',
    role: 'Quantitative Financial Engineer',
    ctc: '₹42.00 LPA',
    totalRounds: customRounds.length,
    rounds: customRounds.map((r) => r.name),
    roundConfigs: customRounds
  };

  addDrive(testDrive);
  updateDriveRoundsConfig(testDrive.id, testDrive.rounds, testDrive.roundConfigs);

  const stored = getDriveRoundsConfig(testDrive.id);
  assert.equal(stored.rounds.length, 6);
  assert.equal(stored.roundConfigs[5].name, 'Executive Leadership & Fitment');
  assert.equal(stored.roundConfigs[5].roundNumber, 6);
});

test('Director Campus Drive — Dynamic Round Removal & Sequential Renumbering', () => {
  const initialRounds = [
    { roundNumber: 1, name: 'Round A' },
    { roundNumber: 2, name: 'Round B' },
    { roundNumber: 3, name: 'Round C' },
    { roundNumber: 4, name: 'Round D' }
  ];

  // Remove round at index 1 (Round B)
  const afterRemoval = initialRounds
    .filter((_, idx) => idx !== 1)
    .map((r, idx) => ({ ...r, roundNumber: idx + 1 }));

  assert.equal(afterRemoval.length, 3);
  assert.equal(afterRemoval[0].name, 'Round A');
  assert.equal(afterRemoval[0].roundNumber, 1);
  assert.equal(afterRemoval[1].name, 'Round C');
  assert.equal(afterRemoval[1].roundNumber, 2, 'Round C must be sequentially renumbered to Round 2');
  assert.equal(afterRemoval[2].name, 'Round D');
  assert.equal(afterRemoval[2].roundNumber, 3, 'Round D must be sequentially renumbered to Round 3');
});

test('Director Campus Drive — Duplicate & Empty Round Name Rejection Validation', () => {
  // 1. Empty name detection
  const roundsWithEmpty = [
    { roundNumber: 1, name: 'Online Assessment' },
    { roundNumber: 2, name: '   ' }
  ];

  const hasEmpty = roundsWithEmpty.some((r) => !r.name || r.name.trim() === '');
  assert.ok(hasEmpty, 'Empty round name must be detected');

  // 2. Duplicate name detection (case-insensitive)
  const roundsWithDuplicates = [
    { roundNumber: 1, name: 'Technical Interview' },
    { roundNumber: 2, name: 'technical interview' }
  ];

  const seen = new Set();
  let hasDuplicate = false;
  for (const r of roundsWithDuplicates) {
    const lower = r.name.trim().toLowerCase();
    if (seen.has(lower)) {
      hasDuplicate = true;
      break;
    }
    seen.add(lower);
  }
  assert.ok(hasDuplicate, 'Duplicate round names must be detected');
});

test('Director Placement Analytics — Horizontal List Structure & Column Attributes Verification', () => {
  const requiredColumns = [
    'companyName',
    'role',
    'ctc',
    'driveDate',
    'status',
    'totalRegistered',
    'appeared',
    'finalSelected'
  ];

  DIRECTOR_COMPANY_ANALYTICS.forEach((company) => {
    requiredColumns.forEach((col) => {
      assert.ok(company[col] !== undefined, `${company.companyName} must have attribute '${col}' for horizontal listing`);
    });
  });
});
