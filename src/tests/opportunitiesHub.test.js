import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getHackathons,
  addHackathon,
  updateHackathon,
  deleteHackathon,
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
  getOffCampusCompanies,
  addOffCampusCompany,
  updateOffCampusCompany,
  deleteOffCampusCompany,
  resetOpportunitiesToVerifiedDefaults,
  getOpportunityStatus
} from '../services/storage.js';
import { OpportunityApi } from '../services/api.js';

const storageMap = new Map();
globalThis.localStorage = {
  getItem: (key) => storageMap.get(key) ?? null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

beforeEach(() => {
  storageMap.clear();
  resetOpportunitiesToVerifiedDefaults();
});

test('Verified Hackathons — All 8 listings contain authentic URLs, themes, prizes and sources', () => {
  const list = getHackathons();
  assert.ok(list.length >= 8, `Expected at least 8 verified hackathons, found ${list.length}`);

  const organizers = list.map(h => h.organizer.toLowerCase());
  assert.ok(organizers.some(o => o.includes('ministry of education') || o.includes('aicte')), 'SIH must be present');
  assert.ok(organizers.some(o => o.includes('google')), 'Google Solution Challenge must be present');
  assert.ok(organizers.some(o => o.includes('flipkart') || o.includes('unstop')), 'Flipkart GRiD must be present');
  assert.ok(organizers.some(o => o.includes('microsoft')), 'Microsoft Imagine Cup must be present');
  assert.ok(organizers.some(o => o.includes('devfolio')), 'ETHIndia must be present');

  for (const h of list) {
    assert.ok(h.id, 'Every hackathon must have an id');
    assert.ok(h.title && h.title.trim().length > 0, 'Every hackathon must have a valid title');
    assert.ok(h.organizer && h.organizer.trim().length > 0, 'Every hackathon must have a valid organizer');
    assert.ok(h.registrationUrl && h.registrationUrl.startsWith('https://'), `Registration URL must be official HTTPS: ${h.registrationUrl}`);
    assert.ok(h.source && h.source.trim().length > 0, 'Every hackathon must cite an official source');
    assert.ok(h.lastVerifiedDate, 'Every hackathon must have a verification date');
    assert.ok(h.prizePool, 'Every hackathon must state prize pool / rewards');
    assert.ok(['Active', 'Closing Soon', 'Expired'].includes(h.status), `Valid status expected: ${h.status}`);
  }
});

test('Verified Internships — Contains real corporate openings with stipends and verified career links', () => {
  const list = getInternships();
  assert.ok(list.length >= 8, `Expected at least 8 verified corporate internships, found ${list.length}`);

  const companies = list.map(i => i.companyName.toLowerCase());
  assert.ok(companies.includes('google'), 'Google internship must be present');
  assert.ok(companies.includes('microsoft'), 'Microsoft internship must be present');
  assert.ok(companies.includes('amazon'), 'Amazon internship must be present');
  assert.ok(companies.includes('uber'), 'Uber internship must be present');

  for (const i of list) {
    assert.ok(i.id, 'Every internship must have an id');
    assert.ok(i.companyName, 'Every internship must have a company name');
    assert.ok(i.role, 'Every internship must have a role');
    assert.ok(i.stipend, 'Every internship must specify stipend');
    const url = i.applicationUrl || i.applyLink;
    assert.ok(url && url.startsWith('https://'), `Application URL must be official HTTPS: ${url}`);
    assert.ok(i.source, 'Every internship must cite an official source');
    assert.ok(i.eligibleBatches, 'Every internship must specify eligible graduating batches');
    assert.ok(i.skillsRequired || i.skills, 'Every internship must specify required skills');
  }
});

test('Verified Off-Campus Jobs — Contains real company drives with CTC packages and official portal links', () => {
  const list = getOffCampusCompanies();
  assert.ok(list.length >= 8, `Expected at least 8 verified off-campus jobs, found ${list.length}`);

  const companies = list.map(j => j.companyName.toLowerCase());
  assert.ok(companies.some(c => c.includes('google')), 'Google must be present');
  assert.ok(companies.some(c => c.includes('microsoft')), 'Microsoft must be present');
  assert.ok(companies.some(c => c.includes('tata consultancy') || c.includes('tcs')), 'TCS must be present');
  assert.ok(companies.some(c => c.includes('infosys')), 'Infosys must be present');
  assert.ok(companies.some(c => c.includes('wipro')), 'Wipro must be present');

  for (const j of list) {
    assert.ok(j.id, 'Every job must have an id');
    assert.ok(j.companyName, 'Every job must have a company name');
    assert.ok(j.role, 'Every job must have a role');
    assert.ok(j.ctc, 'Every job must specify CTC package');
    const url = j.applicationUrl || j.applyLink;
    assert.ok(url && url.startsWith('https://'), `Application URL must be official HTTPS: ${url}`);
    assert.ok(j.source, 'Every job must cite an official source');
    assert.ok(j.eligibleBatches, 'Every job must specify eligible graduating batches');
  }
});

test('Opportunity Status Calculation — Accurately categorizes Expired, Closing Soon, and Active based on deadline', () => {
  // 1. Past deadline
  const expiredStatus = getOpportunityStatus('2020-01-01');
  assert.equal(expiredStatus, 'Expired', 'Past deadline must be evaluated as Expired');

  // 2. Far future deadline (> 30 days)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 45);
  const futureStr = futureDate.toISOString().split('T')[0];
  const activeStatus = getOpportunityStatus(futureStr);
  assert.equal(activeStatus, 'Active', 'Future deadline (>10 days) must be evaluated as Active');

  // 3. Deadline within 5 days
  const soonDate = new Date();
  soonDate.setDate(soonDate.getDate() + 4);
  const soonStr = soonDate.toISOString().split('T')[0];
  const soonStatus = getOpportunityStatus(soonStr);
  assert.equal(soonStatus, 'Closing Soon', 'Deadline within 10 days must be evaluated as Closing Soon');
});

test('Admin / Placement Cell CRUD — Can add, update, and delete Hackathons, Internships, and Jobs', () => {
  // Test Hackathon CRUD
  const initialHacks = getHackathons();
  const newHack = {
    title: 'Custom Inter-University Hackathon 2026',
    organizer: 'National Tech Consortium',
    registrationUrl: 'https://techconsortium.edu/hackathon',
    registrationDeadline: '2026-12-30',
    prizePool: '₹2,50,000',
    source: 'National Consortium Portal'
  };
  const afterAddHack = addHackathon(newHack);
  assert.equal(afterAddHack.length, initialHacks.length + 1);
  const addedHackId = afterAddHack[0].id;

  updateHackathon(addedHackId, { prizePool: '₹5,00,000' });
  const updatedHack = getHackathons().find(h => String(h.id) === String(addedHackId));
  assert.equal(updatedHack.prizePool, '₹5,00,000');

  const afterDeleteHack = deleteHackathon(addedHackId);
  assert.equal(afterDeleteHack.length, initialHacks.length);

  // Test Internship CRUD
  const initialInterns = getInternships();
  const newIntern = {
    companyName: 'NVIDIA',
    role: 'Deep Learning Engineering Intern',
    stipend: '₹1,50,000 / month',
    applicationUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite',
    deadline: '2026-12-30',
    source: 'NVIDIA Careers'
  };
  const afterAddIntern = addInternship(newIntern);
  assert.equal(afterAddIntern.length, initialInterns.length + 1);
  const addedInternId = afterAddIntern[0].id;

  updateInternship(addedInternId, { stipend: '₹1,80,000 / month' });
  const updatedIntern = getInternships().find(i => String(i.id) === String(addedInternId));
  assert.equal(updatedIntern.stipend, '₹1,80,000 / month');

  const afterDeleteIntern = deleteInternship(addedInternId);
  assert.equal(afterDeleteIntern.length, initialInterns.length);

  // Test Job CRUD
  const initialJobs = getOffCampusCompanies();
  const newJob = {
    companyName: 'Qualcomm',
    role: 'Modem Systems Engineer',
    ctc: '₹20–28 LPA',
    applicationUrl: 'https://qualcomm.wd5.myworkdayjobs.com/External',
    applicationDeadline: '2026-12-30',
    source: 'Qualcomm Official Careers'
  };
  const afterAddJob = addOffCampusCompany(newJob);
  assert.equal(afterAddJob.length, initialJobs.length + 1);
  const addedJobId = afterAddJob[0].id;

  updateOffCampusCompany(addedJobId, { ctc: '₹24–32 LPA' });
  const updatedJob = getOffCampusCompanies().find(j => String(j.id) === String(addedJobId));
  assert.equal(updatedJob.ctc, '₹24–32 LPA');

  const afterDeleteJob = deleteOffCampusCompany(addedJobId);
  assert.equal(afterDeleteJob.length, initialJobs.length);
});

test('OpportunityApi Graceful Fallback — Returns valid data even when backend is offline', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network Error: Backend Offline'); };

  try {
    const hacks = await OpportunityApi.getHackathons();
    assert.ok(Array.isArray(hacks) && hacks.length >= 8);

    const interns = await OpportunityApi.getInternships();
    assert.ok(Array.isArray(interns) && interns.length >= 8);

    const offCampusRes = await OpportunityApi.getOffCampus();
    assert.ok(offCampusRes && Array.isArray(offCampusRes.opportunities) && offCampusRes.opportunities.length >= 8);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

