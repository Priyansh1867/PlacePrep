import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
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
      
      {/* Page Header */}
      <div className="surface-card p-6 sm:p-8 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Recruiter Directory</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Recruiting Companies & Hubs
            </h1>

            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Explore dedicated recruiter profiles with verified question frequencies, actual interview stages, package distributions, and alumni experiences.
            </p>
          </div>

          {/* Batch Status Switcher Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-700">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Active Cohort:</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.2 rounded">
                Batch {currentBatch}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 max-w-[200px]">
              Displaying criteria filtered for {currentBatch} campus placement.
            </p>
            <button
              onClick={onOpenBatchModal}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs shadow-2xs transition-colors"
            >
              Change Cohort Batch
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, job role, or topic (e.g. DBMS)..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus-ring"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <div className="segmented-control shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                All ({allCompanies.length})
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'upcoming' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Confirmed Drives
              </button>
              <button
                onClick={() => setStatusFilter('batch-eligible')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'batch-eligible' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Batch {currentBatch} Eligible
              </button>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus-ring"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="recent">Most Experiences</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Recruiter Cards Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              currentBatch={currentBatch}
              onExplore={onSelectCompany}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card p-12 text-center text-slate-500">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No recruiters match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search keyword or filter options.</p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="mt-3 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
