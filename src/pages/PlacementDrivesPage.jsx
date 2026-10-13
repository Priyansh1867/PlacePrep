import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  ArrowRight, 
  GraduationCap, 
  Clock, 
  Building2, 
  Filter,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getUpcomingDrives, getCompanies, getGraduationBatch } from '../services/storage';

export default function PlacementDrivesPage({ onSelectCompany }) {
  const currentBatch = getGraduationBatch();
  const [selectedBatchFilter, setSelectedBatchFilter] = useState(currentBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'verified', 'open'

  const allDrives = getUpcomingDrives();
  const companies = getCompanies();

  const filteredDrives = useMemo(() => {
    return allDrives.filter(d => {
      const matchBatch = selectedBatchFilter === 'all' || d.eligibleBatches.includes(selectedBatchFilter);
      const matchSearch = d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : d.status.toLowerCase().includes(statusFilter);
      return matchBatch && matchSearch && matchStatus;
    });
  }, [allDrives, selectedBatchFilter, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Campus Hiring Schedule</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Placement Drives Dashboard
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Stay updated with confirmed on-campus and national qualifier placement drives. Check batch-specific eligibility criteria and recruitment rounds.
          </p>
        </div>

        {/* Batch Notice Box */}
        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-indigo-100 backdrop-blur-xs">
          <GraduationCap className="w-4 h-4 text-indigo-300" />
          <span>Currently viewing drives prioritized for <b>Batch {selectedBatchFilter}</b> students.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drives by company or role..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Batch Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
            <span className="text-slate-400 text-xs mr-1 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Batch:
            </span>
            {['all', '2026', '2027', '2028', '2029'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedBatchFilter === b
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'all' ? 'All Batches' : `${b} Batch`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Found {filteredDrives.length} placement drives</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Verified College Drives Only
          </span>
        </div>

        {filteredDrives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No placement drives found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No active drives match your current filters. Try selecting "All Batches" or resetting the search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDrives.map((drive) => {
              const matchedCompany = companies.find(c => c.id === drive.companyId);
              const isEligible = drive.eligibleBatches.includes(currentBatch);

              return (
                <div
                  key={drive.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-extrabold text-xl text-slate-900">{drive.companyName}</h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {drive.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{drive.role}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium">CTC Package</span>
                        <p className="text-base font-extrabold text-indigo-600">{drive.ctc}</p>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Drive Date</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {drive.driveDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Registration Deadline</span>
                        <span className="font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-rose-500" /> {drive.deadline}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Eligible Batches</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {drive.eligibleBatches.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Locations: {drive.locations.join(', ')}</span>
                    </div>

                    {/* Rounds Sequence */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" /> Recruitment Stages:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {drive.rounds.map((r, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-medium"
                          >
                            Round {i + 1}: {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Eligibility Status */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Batch {currentBatch} Eligible
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Batches: {drive.eligibleBatches.join(', ')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (matchedCompany) onSelectCompany(matchedCompany);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all"
                    >
                      <span>Prepare for {drive.companyName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
