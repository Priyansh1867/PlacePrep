import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Sparkles, 
  GraduationCap, 
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Terminal,
  Activity
} from 'lucide-react';
import CompanyCard from '../components/CompanyCard';
import { getCompanies, getGraduationBatch } from '../services/storage';

export default function CompaniesPage({ onSelectCompany, onOpenBatchModal }) {
  const currentBatch = getGraduationBatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const allCompanies = getCompanies();

  const filteredCompanies = useMemo(() => {
    let list = allCompanies.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.frequentTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'upcoming') {
        matchStatus = c.verifiedUpcomingDrive === true;
      } else if (statusFilter === 'batch-eligible') {
        matchStatus = c.eligibleBatches?.includes(currentBatch);
      }

      return matchSearch && matchStatus;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'recent') {
        return (b.experienceCount || 0) - (a.experienceCount || 0);
      }
      return 0;
    });

    return list;
  }, [allCompanies, searchQuery, statusFilter, sortBy, currentBatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner - Next-Gen Dark Tech */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B0F19] via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 mb-3">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>INSTITUTIONAL RECRUITER REGISTRY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Companies Recruiting Batch {currentBatch}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Explore dedicated company hubs with verified question frequencies, actual interview stages, package distributions, and AI insights.
          </p>
        </div>

        {/* Batch Status Switcher Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shrink-0 flex flex-col justify-between relative z-10 shadow-xl font-mono">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-xs text-slate-300">Target Cohort:</span>
            <span className="font-extrabold text-indigo-300 text-xs bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg">
              Batch {currentBatch}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 max-w-[220px]">
            Displaying recruitment criteria tailored for {currentBatch} on-campus drives.
          </p>
          <button
            onClick={onOpenBatchModal}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all font-mono"
          >
            Change Cohort Batch
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel bg-[#0B0F19]/90 rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, tech stack (e.g. HCLTech, TCS)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono"
            />
          </div>

          {/* Status & Eligibility Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Companies' },
              { id: 'batch-eligible', label: `Batch ${currentBatch} Eligible` },
              { id: 'upcoming', label: 'Verified Upcoming Drives' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  statusFilter === f.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="popularity">Sort: Most Popular</option>
                <option value="recent">Sort: Most Experiences</option>
                <option value="name">Sort: A-Z Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Company Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Displaying {filteredCompanies.length} partner recruiters</span>
          <span className="text-[11px] text-slate-500 italic">
            *Institutional eligibility criteria verified against official placement records.
          </span>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16 glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800 p-8 shadow-xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No recruiters match current criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
              Try switching the filter to "All Companies" or search for a broader industry or role keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                currentBatch={currentBatch}
                onExplore={onSelectCompany}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
