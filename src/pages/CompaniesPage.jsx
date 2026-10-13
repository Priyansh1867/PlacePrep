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
  Calendar
} from 'lucide-react';
import CompanyCard from '../components/CompanyCard';
import { getCompanies, getGraduationBatch } from '../services/storage';

export default function CompaniesPage({ onSelectCompany, onOpenBatchModal }) {
  const currentBatch = getGraduationBatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'batch-eligible'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'recent', 'name'

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
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Personalized Company Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Companies Recruiting Batch {currentBatch}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Explore dedicated preparation hubs with verified question frequencies, actual interview stages, and company-specific AI insights.
          </p>
        </div>

        {/* Batch Status Switcher Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-white shrink-0 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-300" />
            <span className="font-bold text-sm">Graduation Batch:</span>
            <span className="font-extrabold text-indigo-200 text-sm bg-white/15 px-2.5 py-0.5 rounded-lg">
              {currentBatch}
            </span>
          </div>
          <p className="text-[11px] text-indigo-200 mb-3 max-w-[220px]">
            Showing eligibility data verified for {currentBatch} campus placement tracks.
          </p>
          <button
            onClick={onOpenBatchModal}
            className="w-full py-2 px-3 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Change Graduation Batch
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies (e.g. HCLTech, TCS, Deloitte)..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status & Eligibility Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs">
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
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  statusFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
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
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing {filteredCompanies.length} companies</span>
          <span className="text-[11px] text-slate-400 italic">
            *Eligibility data is displayed only when verified from legitimate campus reports.
          </span>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No companies match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try switching the filter to "All Companies" or search for a different company name.
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
