import React, { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Trophy,
  Users
} from 'lucide-react';
import { OpportunityApi } from '../services/api';
import {
  INITIAL_HACKATHONS,
  INITIAL_INTERNSHIPS,
  INITIAL_OFF_CAMPUS_OPPORTUNITIES
} from '../data/initialOpportunities';
import { getCurrentUser, getGraduationBatch } from '../services/storage';

const TABS = [
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'internships', label: 'Internships', icon: BriefcaseBusiness },
  { id: 'off-campus', label: 'Off-campus jobs', icon: GraduationCap }
];

function formatDate(value) {
  if (!value) return 'Date not listed';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function internshipsForBatch(batch) {
  return INITIAL_INTERNSHIPS.filter((item) => {
    if (!item.eligibleBatches) return true;
    const eligibleBatches = Array.isArray(item.eligibleBatches)
      ? item.eligibleBatches
      : item.eligibleBatches.split(',').map((year) => year.trim());
    return eligibleBatches.includes(batch);
  });
}

function ExternalAction({ href, children = 'View opportunity' }) {
  if (!href) return <span className="text-xs text-slate-400">Link unavailable</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">
      {children}<ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState('hackathons');
  const [searchQuery, setSearchQuery] = useState('');
  const [batch, setBatch] = useState(getGraduationBatch());
  const [hackathons, setHackathons] = useState(INITIAL_HACKATHONS);
  const [internships, setInternships] = useState(() => internshipsForBatch(getGraduationBatch()));
  const [offCampus, setOffCampus] = useState(INITIAL_OFF_CAMPUS_OPPORTUNITIES);
  const [offCampusMessage, setOffCampusMessage] = useState('');
  const [dataSource, setDataSource] = useState('sample');

  useEffect(() => {
    const handleBatchChange = (event) => setBatch(event.detail || getGraduationBatch());
    window.addEventListener('batch-changed', handleBatchChange);
    return () => window.removeEventListener('batch-changed', handleBatchChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setInternships(internshipsForBatch(batch));
    Promise.all([OpportunityApi.getHackathons(), OpportunityApi.getInternships(batch)]).then(([remoteHackathons, remoteInternships]) => {
      if (cancelled) return;
      if (Array.isArray(remoteHackathons) && Array.isArray(remoteInternships)) setDataSource('live');
      else if (Array.isArray(remoteHackathons) || Array.isArray(remoteInternships)) setDataSource('mixed');
      if (Array.isArray(remoteHackathons)) setHackathons(remoteHackathons);
      if (Array.isArray(remoteInternships)) setInternships(remoteInternships);
    });
    return () => { cancelled = true; };
  }, [batch]);

  useEffect(() => {
    let cancelled = false;
    const loadOffCampus = async () => {
      if (batch !== '2026') {
        setOffCampusMessage('');
        setOffCampus(INITIAL_OFF_CAMPUS_OPPORTUNITIES);
        return;
      }
      const response = await OpportunityApi.getOffCampus(getCurrentUser()?.email || '');
      if (cancelled) return;
      if (response?.status === 'ACCESS_GRANTED' && Array.isArray(response.opportunities)) {
        setOffCampus(response.opportunities);
        setOffCampusMessage(response.message || '');
        setDataSource('live');
      } else if (response?.status === 'ACCESS_RESTRICTED') {
        setOffCampus([]);
        setOffCampusMessage(response.message || 'This feed is only available to verified final-year students.');
      } else {
        setOffCampus(INITIAL_OFF_CAMPUS_OPPORTUNITIES);
        setOffCampusMessage('Showing sample listings because the opportunities service is unavailable.');
      }
    };
    loadOffCampus();
    return () => { cancelled = true; };
  }, [batch]);

  const filterItems = (items, fields) => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? items.filter((item) => fields(item).filter(Boolean).join(' ').toLowerCase().includes(query))
      : items;
  };
  const filteredHackathons = useMemo(() => filterItems(hackathons, (item) => [item.title, item.organizer, item.description, item.tags, item.mode]), [hackathons, searchQuery]);
  const filteredInternships = useMemo(() => filterItems(internships, (item) => [item.companyName, item.role, item.location, item.skillsRequired]), [internships, searchQuery]);
  const filteredOffCampus = useMemo(() => filterItems(offCampus, (item) => [item.companyName, item.role, item.ctc, ...(item.locations || [])]), [offCampus, searchQuery]);
  const selectedTab = TABS.find((tab) => tab.id === activeTab);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
              <Trophy className="h-3.5 w-3.5" />Student opportunities board
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Build, compete, and launch your career</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Find hackathons, batch-eligible internships, and verified off-campus openings in one place.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700">
            <GraduationCap className="h-4 w-4 text-indigo-600" />Your batch: {batch}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dataSource === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {dataSource === 'live' ? 'LIVE DATA' : dataSource === 'mixed' ? 'MIXED DATA' : 'SAMPLE DATA'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Opportunity categories">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => { setActiveTab(id); setSearchQuery(''); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={`Search ${selectedTab.label.toLowerCase()}...`} aria-label={`Search ${selectedTab.label}`}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </label>
      </div>

      {activeTab === 'hackathons' && (
        <div>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Upcoming hackathons</h2><span className="text-xs text-slate-500">{filteredHackathons.length} opportunities</span></div>
          {filteredHackathons.length ? <div className="grid gap-4 lg:grid-cols-2">
            {filteredHackathons.map((item) => (
              <article key={item.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-semibold text-indigo-700">{item.organizer}</span><h3 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{item.mode || 'OPEN'}</span></div>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="my-4 grid gap-2 border-y border-slate-100 py-3 text-xs text-slate-600 sm:grid-cols-2">
                  <span className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />Register by {formatDate(item.registrationDeadline)}</span>
                  <span className="flex gap-2"><Users className="h-4 w-4 shrink-0 text-indigo-500" />{item.teamSize || 'Team size not listed'}</span>
                  <span className="sm:col-span-2"><strong className="text-slate-700">Event:</strong> {item.eventDate || 'Date to be announced'}</span>
                  <span className="sm:col-span-2"><strong className="text-slate-700">Prize:</strong> {item.prizePool || 'See event page'}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">{(item.tags || '').split(',').filter(Boolean).slice(0, 4).map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{tag.trim()}</span>)}</div>
                  <ExternalAction href={item.registrationUrl} />
                </div>
              </article>
            ))}
          </div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No hackathons match your search.</p>}
        </div>
      )}

      {activeTab === 'internships' && (
        <div>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Internships for Batch {batch}</h2><span className="text-xs text-slate-500">{filteredInternships.length} opportunities</span></div>
          {filteredInternships.length ? <div className="grid gap-4 lg:grid-cols-2">
            {filteredInternships.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{item.companyName}</h3><p className="mt-0.5 text-sm font-medium text-indigo-700">{item.role}</p></div>{item.ppoOpportunity && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">PPO possible</span>}</div>
                <div className="my-4 grid gap-2 border-y border-slate-100 py-3 text-xs text-slate-600 sm:grid-cols-2">
                  <span><strong className="text-slate-700">Stipend:</strong> {item.stipend || 'Not listed'}</span><span><strong className="text-slate-700">Duration:</strong> {item.duration || 'Not listed'}</span>
                  <span className="flex gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-500" />{item.location || 'Location not listed'}</span><span><strong className="text-slate-700">Deadline:</strong> {formatDate(item.deadline)}</span>
                </div>
                <p className="mb-1 text-xs text-slate-600"><strong className="text-slate-700">Eligible batches:</strong> {item.eligibleBatches || 'All batches'}</p>
                <p className="mb-4 text-xs leading-5 text-slate-600"><strong className="text-slate-700">Skills:</strong> {item.skillsRequired || 'See listing'}</p>
                <ExternalAction href={item.applicationUrl} />
              </article>
            ))}
          </div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No internships match your search or batch eligibility.</p>}
        </div>
      )}

      {activeTab === 'off-campus' && (
        <div>
          {batch !== '2026' ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center">
              <ShieldCheck className="mx-auto h-9 w-9 text-amber-600" />
              <h2 className="mt-3 text-xl font-bold text-slate-900">Off-campus feed is locked</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">This feed is reserved for final-year students. Your current batch is {batch}; the final-year batch is 2026. Change your graduation batch using the batch selector to check eligibility.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"><ShieldCheck className="h-3.5 w-3.5" />Restricted until final-year eligibility is confirmed</div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold text-slate-900">Off-campus openings for Batch 2026</h2><p className="mt-1 text-xs text-slate-500">{offCampusMessage || 'Final-year eligibility is required to view these openings.'}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{filteredOffCampus.length} openings</span></div>
              {filteredOffCampus.length ? <div className="grid gap-4 lg:grid-cols-2">
                {filteredOffCampus.map((item) => (
                  <article key={item.driveId || item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><div><span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />{item.verifiedBadge ? 'Verified off-campus' : 'Off-campus opening'}</span><h3 className="mt-1 text-lg font-bold text-slate-900">{item.companyName}</h3><p className="text-sm font-medium text-indigo-700">{item.role}</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">{item.ctc || 'Pay listed externally'}</span></div>
                    <div className="my-4 grid gap-2 border-y border-slate-100 py-3 text-xs text-slate-600 sm:grid-cols-2"><span><strong className="text-slate-700">Apply by:</strong> {formatDate(item.deadline)}</span><span><strong className="text-slate-700">Drive date:</strong> {formatDate(item.driveDate)} {item.driveTime || ''}</span><span className="flex gap-1.5 sm:col-span-2"><MapPin className="h-3.5 w-3.5 text-indigo-500" />{(item.locations || []).join(', ') || item.venue || 'Location listed externally'}</span></div>
                    {item.instructions && <p className="mb-4 text-xs leading-5 text-slate-600">{item.instructions}</p>}
                    <ExternalAction href={item.registrationLink}>View opening</ExternalAction>
                  </article>
                ))}
              </div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{offCampusMessage || 'No off-campus openings are available for your profile.'}</p>}
            </>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-[11px] text-slate-400">Opportunity details and external application links are provided for discovery. Confirm current eligibility and deadlines on each organizer’s website.</p>
    </section>
  );
}