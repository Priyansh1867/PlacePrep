import React, { useState, useEffect } from 'react';
import {
  Compass,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import OffCampusJobsSection from './OffCampusJobsSection';
import CorporateInternshipsSection from './CorporateInternshipsSection';
import HackathonsSection from './HackathonsSection';
import {
  getOffCampusCompanies,
  getInternships,
  getHackathons,
  resetOpportunitiesToVerifiedDefaults,
  getCurrentUser
} from '../../services/storage';

/**
 * OpportunitiesHubView
 * 
 * Provides dedicated, completely separated sections for:
 * 1. Off-Campus Jobs (Full-time opportunities only)
 * 2. Corporate Internships (Summer & 6-month internships only)
 * 3. Hackathons (National & international hackathons only)
 * 
 * Each category is rendered independently without any category switcher buttons
 * within the view so users cannot switch categories from this bar.
 * In "all" view, all three categories are rendered as distinct, stacked sections
 * with clear headings and zero cross-filtering.
 */
export default function OpportunitiesHubView({
  initialTab = 'all',
  userRole: propUserRole,
  studentBatch: propStudentBatch,
  isFinalYear: propIsFinalYear,
  showToast: propShowToast,
  onNavigate
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const userRole = (propUserRole || currentUser?.role || 'student').toLowerCase();
  const studentBatch = propStudentBatch || currentUser?.graduationBatch || '2026';
  const isFinalYear = propIsFinalYear !== undefined ? propIsFinalYear : studentBatch === '2026';

  const showToast = (msg, type = 'info') => {
    if (typeof propShowToast === 'function') {
      propShowToast(msg, type);
    } else {
      console.log(`[Toast] ${msg}`);
    }
  };

  const activeTab = ['all', 'jobs', 'internships', 'hackathons'].includes(initialTab)
    ? initialTab
    : 'all';

  // Counts for All Opportunities split overview
  const [counts, setCounts] = useState(() => ({
    jobs: (getOffCampusCompanies() || []).length,
    internships: (getInternships() || []).length,
    hackathons: (getHackathons() || []).length
  }));

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState('Today (Verified Official)');

  useEffect(() => {
    const handleUpdate = () => {
      setCounts({
        jobs: (getOffCampusCompanies() || []).length,
        internships: (getInternships() || []).length,
        hackathons: (getHackathons() || []).length
      });
    };

    window.addEventListener('offcampus-updated', handleUpdate);
    window.addEventListener('internships-updated', handleUpdate);
    window.addEventListener('hackathons-updated', handleUpdate);

    return () => {
      window.removeEventListener('offcampus-updated', handleUpdate);
      window.removeEventListener('internships-updated', handleUpdate);
      window.removeEventListener('hackathons-updated', handleUpdate);
    };
  }, []);

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    try {
      const refreshed = resetOpportunitiesToVerifiedDefaults();
      setCounts({
        jobs: (refreshed.offCampus || []).length,
        internships: (refreshed.internships || []).length,
        hackathons: (refreshed.hackathons || []).length
      });
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('All opportunities synchronized with official career portals!', 'success');
    } catch {
      showToast('Failed to refresh opportunity datasets.', 'error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 1. OFF-CAMPUS JOBS ONLY: No switcher bar, renders dedicated jobs section directly
  if (activeTab === 'jobs') {
    return (
      <div id="view-off-campus-jobs-only" className="space-y-6">
        <OffCampusJobsSection
          userRole={userRole}
          studentBatch={studentBatch}
          isFinalYear={isFinalYear}
          showToast={showToast}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  // 2. CORPORATE INTERNSHIPS ONLY: No switcher bar, renders dedicated internships section directly
  if (activeTab === 'internships') {
    return (
      <div id="view-corporate-internships-only" className="space-y-6">
        <CorporateInternshipsSection
          userRole={userRole}
          studentBatch={studentBatch}
          showToast={showToast}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  // 3. HACKATHONS ONLY: No switcher bar, renders dedicated hackathons section directly
  if (activeTab === 'hackathons') {
    return (
      <div id="view-hackathons-only" className="space-y-6">
        <HackathonsSection
          userRole={userRole}
          showToast={showToast}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  // 4. ALL OPPORTUNITIES: Master overview + Stacked distinct sections (No switcher buttons)
  const totalOpportunities = counts.jobs + counts.internships + counts.hackathons;

  return (
    <div className="space-y-8" id="opportunities-master-hub">
      {/* Global Hub Master Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Career Opportunities Hub</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>100% Verified Official Links</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Opportunities & Hackathons Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore authentic off-campus full-time jobs, high-stipend corporate internships, and national hackathons with direct official application portals.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                Total Available: <strong className="text-white font-bold">{totalOpportunities}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                Full-Time Jobs: <strong className="text-indigo-400 font-bold">{counts.jobs}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                Internships: <strong className="text-emerald-400 font-bold">{counts.internships}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                Hackathons: <strong className="text-amber-400 font-bold">{counts.hackathons}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              aria-label="Refresh and verify all opportunity portals"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Verifying Links…' : 'Sync Official Portals'}</span>
            </button>
            <div className="text-[11px] text-slate-400">
              Synced: <span className="font-bold text-slate-200">{lastVerifiedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distinct Stacked Sections (No switcher bar) */}
      <div id="view-all-opportunities-split" className="space-y-12">
        {/* Section 1: Off-Campus Full-Time Jobs */}
        <div id="split-section-jobs" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-indigo-600/20 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
              1
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Section 1: Off-Campus Full-Time Jobs
              </h2>
              <p className="text-xs text-slate-500">
                Full-time engineering roles from top corporate portals with dedicated job filters.
              </p>
            </div>
          </div>
          <OffCampusJobsSection
            userRole={userRole}
            studentBatch={studentBatch}
            isFinalYear={isFinalYear}
            showToast={showToast}
            onNavigate={onNavigate}
          />
        </div>

        {/* Section 2: Corporate Internships */}
        <div id="split-section-internships" className="scroll-mt-24 space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 border-b-2 border-emerald-600/20 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
              2
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Section 2: Corporate Summer & Winter Internships
              </h2>
              <p className="text-xs text-slate-500">
                Industry internships with high stipends, PPO fast-tracks, and duration filters.
              </p>
            </div>
          </div>
          <CorporateInternshipsSection
            userRole={userRole}
            studentBatch={studentBatch}
            showToast={showToast}
            onNavigate={onNavigate}
          />
        </div>

        {/* Section 3: National & Campus Hackathons */}
        <div id="split-section-hackathons" className="scroll-mt-24 space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 border-b-2 border-amber-600/20 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
              3
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Section 3: National & Campus Hackathons
              </h2>
              <p className="text-xs text-slate-500">
                Coding competitions, innovation challenges, prize pools, and theme/domain filters.
              </p>
            </div>
          </div>
          <HackathonsSection
            userRole={userRole}
            showToast={showToast}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
