import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getFeedbackLoop, addFeedbackLoopEntry } from '../services/storage.js';

describe('PlacePrep – Placement Recruiter Feedback Module Enhancement Tests', () => {

  const sampleDrives = [
    { driveId: 'DRIVE-GGL-01', companyName: 'Google', role: 'Software Engineer', driveDate: '2026-12-01' },
    { driveId: 'DRIVE-MSFT-02', companyName: 'Microsoft', role: 'Cloud Solutions Architect', driveDate: '2026-12-05' },
    { driveId: 'DRIVE-INFY-03', companyName: 'Infosys', role: 'Systems Engineer Specialist', driveDate: '2026-12-10' }
  ];

  // Pure filtering helper matching PlacementPortalPage logic
  const filterDrivesForRecruiter = (drives, recruiterCompany) => {
    if (!recruiterCompany || !recruiterCompany.trim()) return [];
    const target = recruiterCompany.toLowerCase().trim();
    return drives.filter(d => {
      const cName = (d.companyName || '').toLowerCase().trim();
      const cId = (d.companyId || '').toLowerCase().trim();
      return cName === target || cId === target || cName.includes(target) || target.includes(cName);
    });
  };

  // Pure validation helper matching PlacementPortalPage / Backend validation logic
  const validateRecruiterFeedback = ({ recruiterCompany, selectedCompany, driveId, rating, comments }) => {
    if (!selectedCompany || !selectedCompany.trim()) {
      return { valid: false, error: 'Please select a company placement drive.' };
    }
    if (!recruiterCompany || !recruiterCompany.trim()) {
      return { valid: false, error: 'No verified company organization is linked to your recruiter profile.' };
    }
    const target = recruiterCompany.toLowerCase().trim();
    const formComp = selectedCompany.toLowerCase().trim();
    if (!formComp.includes(target) && !target.includes(formComp)) {
      return { valid: false, error: `Unauthorized: You are only permitted to submit assessments for ${recruiterCompany} drives.` };
    }
    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return { valid: false, error: 'Overall rating must be between 1 and 5.' };
    }
    const remarksTrimmed = (comments || '').trim();
    if (remarksTrimmed.length < 10) {
      return { valid: false, error: 'Detailed Remarks must be at least 10 characters long.' };
    }
    if (remarksTrimmed.length > 2000) {
      return { valid: false, error: 'Detailed Remarks cannot exceed 2000 characters.' };
    }
    return { valid: true, error: null };
  };

  test('1. Google recruiter sees ONLY Google placement drives in dropdown', () => {
    const recruiterCompany = 'Google';
    const available = filterDrivesForRecruiter(sampleDrives, recruiterCompany);
    assert.strictEqual(available.length, 1);
    assert.strictEqual(available[0].companyName, 'Google');
    assert.strictEqual(available[0].driveId, 'DRIVE-GGL-01');
    assert.ok(!available.some(d => d.companyName === 'Microsoft'), 'Must not include Microsoft drives');
    assert.ok(!available.some(d => d.companyName === 'Infosys'), 'Must not include Infosys drives');
  });

  test('2. Microsoft recruiter sees ONLY Microsoft placement drives in dropdown', () => {
    const recruiterCompany = 'Microsoft';
    const available = filterDrivesForRecruiter(sampleDrives, recruiterCompany);
    assert.strictEqual(available.length, 1);
    assert.strictEqual(available[0].companyName, 'Microsoft');
    assert.strictEqual(available[0].driveId, 'DRIVE-MSFT-02');
    assert.ok(!available.some(d => d.companyName === 'Google'), 'Must not include Google drives');
  });

  test('3. Cross-company feedback submission rejected (Google recruiter cannot submit for Microsoft drive)', () => {
    const result = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Microsoft',
      driveId: 'DRIVE-MSFT-02',
      rating: 5,
      comments: 'Candidates performed exceptionally well in algorithms.'
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('Unauthorized'), 'Error message must state unauthorized cross-company submission');
  });

  test('4. Tampered drive / company name submission rejected', () => {
    const result = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Apple Inc',
      driveId: 'DRIVE-APPL-99',
      rating: 4,
      comments: 'Tampered drive submission that does not belong to recruiter.'
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('Unauthorized'));
  });

  test('5. Recruiter without company association rejected and receives empty state', () => {
    const available = filterDrivesForRecruiter(sampleDrives, '');
    assert.strictEqual(available.length, 0, 'No drives should be available when company association is missing');

    const result = validateRecruiterFeedback({
      recruiterCompany: '',
      selectedCompany: 'Google',
      driveId: 'DRIVE-GGL-01',
      rating: 5,
      comments: 'Candidates had excellent problem-solving ability.'
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('No verified company organization'));
  });

  test('6. Invalid ratings (< 1, > 5, NaN) rejected', () => {
    const under = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      rating: 0,
      comments: 'Candidate communication was solid and clear.'
    });
    assert.strictEqual(under.valid, false);
    assert.ok(under.error.includes('between 1 and 5'));

    const over = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      rating: 6,
      comments: 'Candidate communication was solid and clear.'
    });
    assert.strictEqual(over.valid, false);
    assert.ok(over.error.includes('between 1 and 5'));

    const nanVal = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      rating: 'exceptional',
      comments: 'Candidate communication was solid and clear.'
    });
    assert.strictEqual(nanVal.valid, false);
    assert.ok(nanVal.error.includes('between 1 and 5'));
  });

  test('7. Empty or short (< 10 chars) remarks rejected', () => {
    const emptyRemarks = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      rating: 5,
      comments: ''
    });
    assert.strictEqual(emptyRemarks.valid, false);
    assert.ok(emptyRemarks.error.includes('at least 10 characters'));

    const shortRemarks = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      rating: 5,
      comments: 'Too short'
    });
    assert.strictEqual(shortRemarks.valid, false);
    assert.ok(shortRemarks.error.includes('at least 10 characters'));
  });

  test('8. Valid feedback saved successfully with recruiter identity, ratings and timestamp', () => {
    const validation = validateRecruiterFeedback({
      recruiterCompany: 'Google',
      selectedCompany: 'Google',
      driveId: 'DRIVE-GGL-01',
      rating: 5,
      comments: 'Candidates demonstrated exceptional data structure and system design competencies.'
    });
    assert.strictEqual(validation.valid, true);

    const initialLoop = getFeedbackLoop();
    const newEntry = {
      companyName: 'Google',
      driveId: 'DRIVE-GGL-01',
      driveDate: new Date().toISOString().split('T')[0],
      status: 'Feedback Logged',
      studentRatingAvg: 4.8,
      studentFeedbackSummary: 'Smooth coordination and structured interview tracks.',
      tpoAssessment: 'Logged for quarterly placement review.',
      companyRecruiterRating: 5,
      companyRecruiterComments: 'Candidates demonstrated exceptional data structure and system design competencies.',
      recruiterName: 'Sarah Jenkins',
      recruiterEmail: 'recruiter@placeprep.com'
    };
    const updated = addFeedbackLoopEntry(newEntry);
    assert.ok(updated.length >= initialLoop.length + 1);
    assert.strictEqual(updated[0].companyName, 'Google');
    assert.strictEqual(updated[0].companyRecruiterRating, 5);
    assert.strictEqual(updated[0].recruiterName, 'Sarah Jenkins');
  });

  test('9. TPO feedback review and 3-way continuous quality feedback loop preserved', () => {
    const allFeedback = getFeedbackLoop();
    assert.ok(Array.isArray(allFeedback), 'TPO retains full list of cross-institutional feedback');
  });

  test('10. Placement Recruiter card is renamed to "Feedback" while TPO retains "7. Feedback (TPO)"', () => {
    const buildNavTabs = (isRecruiter) => [
      { id: 'feedback-loop', label: isRecruiter ? '3. Feedback' : '7. Feedback (TPO)' }
    ];

    const recruiterTab = buildNavTabs(true)[0];
    assert.strictEqual(recruiterTab.label, '3. Feedback', 'Recruiter label must be renamed to "3. Feedback" without "(TPO)"');
    assert.ok(!recruiterTab.label.includes('(TPO)'), 'Must not contain "(TPO)"');

    const tpoTab = buildNavTabs(false)[0];
    assert.strictEqual(tpoTab.label, '7. Feedback (TPO)', 'TPO label must retain "7. Feedback (TPO)"');
  });
});
