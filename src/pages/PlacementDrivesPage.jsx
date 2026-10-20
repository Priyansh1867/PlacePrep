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
  AlertCircle,
  Activity,
  Terminal,
  FileCheck
} from 'lucide-react';
import { getUpcomingDrives, getCompanies, getGraduationBatch } from '../services/storage';

export default function PlacementDrivesPage({ onSelectCompany }) {
  const currentBatch = getGraduationBatch();
  const [selectedBatchFilter, setSelectedBatchFilter] = useState(currentBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      
      {/* Header Banner - Next-Gen Dark Tech */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B0F19] via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80 relative overflow-hidden">
        {/* Ambient glow in corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300 mb-3">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>CAMPUS HIRING RADAR • REAL-TIME</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Placement Drives Dashboard
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Confirmed on-campus and national qualifier placement drives with verified venue reporting times, round workflows, and automated eligibility criteria.
          </p>
        </div>

        {/* Batch Notice Box */}
        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-indigo-300 font-mono shadow-inner">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>Prioritizing scheduled drives for <b>Batch {selectedBatchFilter}</b> students.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel bg-[#0B0F19]/90 rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role or tech stack..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono text-xs"
            />
          </div>

          {/* Batch Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-mono">
            <span className="text-slate-400 text-xs mr-1 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['all', '2026', '2027', '2028', '2029'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
                  selectedBatchFilter === b
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {b === 'all' ? 'All Batches' : `Batch ${b}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Found {filteredDrives.length} active placement drives</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Verified Institutional Drives Only
          </span>
        </div>

        {filteredDrives.length === 0 ? (
          <div className="text-center py-16 glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800 p-8 shadow-xl">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No placement drives found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
              No active drives match your current filter query. Try selecting "All Batches" or resetting the search keywords.
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
                  className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-extrabold text-xl text-white group-hover:text-indigo-400 transition-colors">{drive.companyName}</h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {drive.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-300 mt-0.5">{drive.role}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-mono">CTC Package</span>
                        <p className="text-base font-extrabold text-emerald-400 font-mono">{drive.ctc}</p>
                      </div>
                    </div>

                    {/* Meta stats box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Drive Date</span>
                        <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {drive.driveDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Apply Deadline</span>
                        <span className="font-bold text-rose-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-rose-400" /> {drive.deadline}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Target Batches</span>
                        <span className="font-bold text-slate-300 mt-0.5 block">
                          {drive.eligibleBatches.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Locations & Venue */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Venue / Region: {drive.venue || drive.locations.join(', ')}</span>
                    </div>

                    {/* Rounds Sequence */}
                    <div className="mb-4">
                      <p className="text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" /> Interview Pipeline:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {drive.rounds.map((r, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-mono"
                          >
                            R{i + 1}: {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Eligibility Status */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Batch {currentBatch} Eligible
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          Batches: {drive.eligibleBatches.join(', ')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (matchedCompany) onSelectCompany(matchedCompany);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all group-hover:translate-x-0.5"
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
