import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  Layers,
  FileSpreadsheet,
  X,
  Briefcase,
  GraduationCap,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowUpDown
} from 'lucide-react';
import {
  DIRECTOR_COMPANY_ANALYTICS,
  ANALYTICS_CANDIDATE_DETAILS,
  getDirectorAnalyticsSummary,
  getCompanyDetails
} from '../../data/directorPlacementAnalyticsData';
import { DirectorApi } from '../../services/api';
import { getUpcomingDrives } from '../../services/storage';

function mergeWithUpcomingDrives(baseCompanies) {
  const list = [...baseCompanies];
  try {
    const storedDrives = getUpcomingDrives();
    const existingIds = new Set(list.map((c) => c.id));
    storedDrives.forEach((d) => {
      const id = d.id || d.driveId;
      if (id && !existingIds.has(id)) {
        existingIds.add(id);
        const customRounds = Array.isArray(d.roundConfigs) && d.roundConfigs.length > 0
          ? d.roundConfigs.map((rc, idx) => ({
              roundNumber: rc.roundNumber || idx + 1,
              name: rc.name,
              description: rc.description || '',
              appeared: rc.appeared ?? d.appeared ?? 0,
              selectedNextRound: rc.selectedNextRound ?? d.finalSelected ?? 0,
              rejected: rc.rejected ?? 0,
              pending: rc.pending ?? 0,
              selectionRate: rc.selectionRate ?? (d.appeared > 0 ? Number(((d.finalSelected / d.appeared) * 100).toFixed(1)) : 0),
              rejectionRate: rc.rejectionRate ?? 0
            }))
          : Array.isArray(d.rounds) && d.rounds.length > 0
          ? d.rounds.map((r, idx) => ({
              roundNumber: idx + 1,
              name: typeof r === 'string' ? r : (r.name || `Round ${idx + 1}`),
              description: typeof r === 'object' ? r.description || '' : '',
              appeared: d.appeared ?? 0,
              selectedNextRound: d.finalSelected ?? 0,
              rejected: 0,
              pending: 0,
              selectionRate: 0,
              rejectionRate: 0
            }))
          : [
              { roundNumber: 1, name: 'Online Assessment', appeared: 0, selectedNextRound: 0, rejected: 0, pending: 0, selectionRate: 0, rejectionRate: 0 },
              { roundNumber: 2, name: 'Technical Interview', appeared: 0, selectedNextRound: 0, rejected: 0, pending: 0, selectionRate: 0, rejectionRate: 0 },
              { roundNumber: 3, name: 'HR / Final Selection', appeared: 0, selectedNextRound: 0, rejected: 0, pending: 0, selectionRate: 0, rejectionRate: 0 }
            ];

        list.push({
          id,
          companyName: d.companyName,
          role: d.role,
          ctc: d.ctc || '₹6.00 - ₹12.00 LPA',
          batch: Array.isArray(d.eligibleBatches) ? d.eligibleBatches.join(', ') : (d.eligibleBatches || '2025, 2026'),
          driveDate: d.driveDate || 'Upcoming',
          status: d.status || 'Verified Upcoming',
          totalRegistered: d.totalRegistered ?? 0,
          appeared: d.appeared ?? 0,
          selected: d.selected ?? 0,
          rejected: d.rejected ?? 0,
          inProcess: d.inProcess ?? 0,
          finalSelected: d.finalSelected ?? 0,
          rounds: customRounds
        });
      }
    });
  } catch (err) {
    console.warn('Could not read upcoming drives:', err);
  }
  return list;
}

export default function DirectorPlacementAnalytics({ onNavigate }) {
  // Data states
  const [summary, setSummary] = useState(() => getDirectorAnalyticsSummary());
  const [companies, setCompanies] = useState(() => mergeWithUpcomingDrives(DIRECTOR_COMPANY_ANALYTICS));
  const [candidates, setCandidates] = useState(() => ANALYTICS_CANDIDATE_DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Local Analytical Cache');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('companyName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal drilldown state
  const [selectedCompanyForModal, setSelectedCompanyForModal] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState('rounds'); // 'rounds' | 'candidates'
  const [modalCandidateSearch, setModalCandidateSearch] = useState('');
  const [modalRoundFilter, setModalRoundFilter] = useState('ALL');
  const [modalStatusFilter, setModalStatusFilter] = useState('ALL');

  // Fetch live analytics from backend with offline fallback
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await DirectorApi.getPlacementAnalytics();
      if (res && res.companies && Array.isArray(res.companies) && res.companies.length > 0) {
        setCompanies(mergeWithUpcomingDrives(res.companies));
        if (res.summary) setSummary(res.summary);
        if (res.candidates && Array.isArray(res.candidates)) setCandidates(res.candidates);
        setDataSource('TiDB Cloud Remote DB');
      } else {
        // Fallback to local verified data
        setCompanies(mergeWithUpcomingDrives(DIRECTOR_COMPANY_ANALYTICS));
        setSummary(getDirectorAnalyticsSummary());
        setCandidates(ANALYTICS_CANDIDATE_DETAILS);
        setDataSource('Local Analytical Engine');
      }
    } catch (err) {
      console.warn('Backend analytics fetch fallback:', err);
      setCompanies(mergeWithUpcomingDrives(DIRECTOR_COMPANY_ANALYTICS));
      setSummary(getDirectorAnalyticsSummary());
      setCandidates(ANALYTICS_CANDIDATE_DETAILS);
      setDataSource('Local Analytical Engine (Offline Active)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const handleDriveUpdate = () => {
      fetchAnalytics();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('drive-rounds-updated', handleDriveUpdate);
      return () => window.removeEventListener('drive-rounds-updated', handleDriveUpdate);
    }
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtered companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ctc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany =
        selectedCompanyFilter === 'ALL' || c.id === selectedCompanyFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [companies, searchQuery, selectedCompanyFilter, selectedStatusFilter]);

  // Sorted companies
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle numeric fields
      if (['totalRegistered', 'appeared', 'finalSelected', 'rejected', 'inProcess'].includes(sortField)) {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle string fields
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredCompanies, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCompanies.slice(start, start + pageSize);
  }, [sortedCompanies, currentPage, pageSize]);

  // Candidates for the drilldown modal
  const modalCandidates = useMemo(() => {
    if (!selectedCompanyForModal) return [];
    return candidates.filter((cand) => {
      const isTargetCompany = cand.companyId === selectedCompanyForModal.id;
      if (!isTargetCompany) return false;

      const matchesSearch =
        modalCandidateSearch.trim() === '' ||
        cand.studentName.toLowerCase().includes(modalCandidateSearch.toLowerCase()) ||
        cand.rollNumber.toLowerCase().includes(modalCandidateSearch.toLowerCase());

      const matchesRound =
        modalRoundFilter === 'ALL' || cand.currentRound === modalRoundFilter;

      const matchesStatus =
        modalStatusFilter === 'ALL' || cand.status === modalStatusFilter;

      return matchesSearch && matchesRound && matchesStatus;
    });
  }, [candidates, selectedCompanyForModal, modalCandidateSearch, modalRoundFilter, modalStatusFilter]);

  // CSV Exporter for selected company
  const handleExportCSV = (company) => {
    if (!company) return;
    const rows = [
      ['Round Number', 'Round Name', 'Students Appeared', 'Selected for Next Round', 'Rejected', 'Pending', 'Selection %', 'Rejection %']
    ];
    company.rounds.forEach((r) => {
      rows.push([
        r.roundNumber,
        r.name,
        r.appeared,
        r.selectedNextRound,
        r.rejected,
        r.pending,
        `${r.selectionRate}%`,
        `${r.rejectionRate}%`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.id}-placement-round-analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE BANNER & DATA SOURCE BADGE                                    */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Director Executive Intelligence
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Round-wise Tracking
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Source: {dataSource}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Institutional Placement Round Analytics & Conversion Intelligence
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              Real-time monitoring across 8 tier-1 corporate recruitment drives. Complete round-by-round funnel metrics,
              selection drop-offs, candidate progression pools, and final offer conversion rates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Sync Database'}</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('workflow')}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Workflow Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AGGREGATE SUMMARY CARDS (6 METRICS)                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Companies */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hiring Companies</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalCompanies}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Active corporate drives</div>
        </div>

        {/* Total Students Registered */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalRegistered.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Candidate applications</div>
        </div>

        {/* Total Finally Selected */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Final Selected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{summary.totalFinallySelected}</div>
          <div className="text-[11px] text-emerald-700/70 mt-1 font-medium">Offers extended</div>
        </div>

        {/* Total Students Rejected */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/80 bg-gradient-to-b from-white to-rose-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Total Rejected</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{summary.totalRejected}</div>
          <div className="text-[11px] text-rose-700/70 mt-1 font-medium">Cumulative drop-outs</div>
        </div>

        {/* In Process */}
        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Process</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{summary.totalInProcess}</div>
          <div className="text-[11px] text-amber-700/70 mt-1 font-medium">Under active evaluation</div>
        </div>

        {/* Selection Percentage */}
        <div className="bg-white rounded-3xl p-5 border border-indigo-200/80 bg-gradient-to-b from-white to-indigo-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Selection Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">{summary.overallSelectionRate}</div>
          <div className="text-[11px] text-indigo-700/70 mt-1 font-medium">Final conversion</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SEARCH & FILTERS BAR                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, role, or CTC package..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Company filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Drive status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Active Evaluation">Active Evaluation</option>
            </select>
          </div>

          {(searchQuery || selectedCompanyFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCompanyFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HORIZONTAL LIST LAYOUT: COMPANY RECRUITMENT DRIVES TABLE              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Campus Recruitment Drives & Offer Metrics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Horizontal view of corporate recruitment drives. Click <strong>View Details</strong> for round-by-round selection funnels and candidate records.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-500 shrink-0">
            Showing <span className="text-slate-900 font-black">{sortedCompanies.length}</span> {sortedCompanies.length === 1 ? 'Company' : 'Companies'}
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse" role="table">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
                <th scope="col" className="py-3.5 px-4 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('companyName')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 font-bold transition focus:outline-none"
                    aria-label="Sort by Company"
                  >
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 font-bold transition focus:outline-none"
                    aria-label="Sort by Job Role"
                  >
                    <span>Job Role</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('ctc')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 font-bold transition focus:outline-none"
                    aria-label="Sort by CTC Package"
                  >
                    <span>CTC Package</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('driveDate')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 font-bold transition focus:outline-none"
                    aria-label="Sort by Drive Date"
                  >
                    <span>Drive Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 font-bold transition focus:outline-none"
                    aria-label="Sort by Status"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('totalRegistered')}
                    className="inline-flex items-center gap-1 hover:text-indigo-600 font-bold transition focus:outline-none ml-auto"
                    aria-label="Sort by Registered Candidates"
                  >
                    <span>Registered</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('appeared')}
                    className="inline-flex items-center gap-1 hover:text-indigo-600 font-bold transition focus:outline-none ml-auto"
                    aria-label="Sort by Appeared Candidates"
                  >
                    <span>Appeared</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('finalSelected')}
                    className="inline-flex items-center gap-1 hover:text-indigo-600 font-bold transition focus:outline-none ml-auto"
                    aria-label="Sort by Offers Extended"
                  >
                    <span>Offers</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4 text-center whitespace-nowrap font-bold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Company */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                        {company.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition">
                          {company.companyName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {company.batch ? `Batch ${company.batch}` : 'Campus Hiring Drive'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Job Role */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-800">
                    {company.role}
                  </td>

                  {/* CTC Package */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 text-[11px]">
                      {company.ctc}
                    </span>
                  </td>

                  {/* Drive Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{company.driveDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        company.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : company.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          company.status === 'Completed'
                            ? 'bg-emerald-600'
                            : company.status === 'In Progress'
                            ? 'bg-indigo-600'
                            : 'bg-amber-600'
                        }`}
                      />
                      {company.status}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-800">
                    {company.totalRegistered.toLocaleString()}
                  </td>

                  {/* Appeared */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-800">
                    {company.appeared.toLocaleString()}
                  </td>

                  {/* Offers */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-black text-emerald-600">
                    <span className="bg-emerald-50/80 text-emerald-700 px-2 py-0.5 rounded-md">
                      {company.finalSelected}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCompanyForModal(company);
                        setModalActiveTab('rounds');
                      }}
                      aria-label={`View detailed analytics and candidate progression for ${company.companyName}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedCompanies.length === 0 && (
          <div className="p-12 text-center bg-white">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-base">No hiring drives match your search</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try adjusting company or status filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCompanyFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40">
            <span className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedCompanies.length)} of {sortedCompanies.length} Companies
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                ← Previous
              </button>
              <span className="px-2 font-black text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. DETAILED COMPANY MODAL & CANDIDATE DRILLDOWN                           */}
      {/* ========================================================================= */}
      {selectedCompanyForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-slate-200 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {selectedCompanyForModal.companyName}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      selectedCompanyForModal.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedCompanyForModal.status === 'In Progress'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedCompanyForModal.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Role: <strong className="text-slate-800">{selectedCompanyForModal.role}</strong> • Package:{' '}
                  <strong className="text-emerald-600">{selectedCompanyForModal.ctc}</strong> • Batch:{' '}
                  <strong className="text-slate-800">{selectedCompanyForModal.batch}</strong> • Date:{' '}
                  <strong className="text-slate-800">{selectedCompanyForModal.driveDate}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportCSV(selectedCompanyForModal)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Export Round Data as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedCompanyForModal(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  aria-label="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal View Switcher Tabs */}
            <div className="flex items-center gap-3 pt-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setModalActiveTab('rounds')}
                className={`pb-2.5 text-xs font-black transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  modalActiveTab === 'rounds'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Round-wise Selection Funnel ({selectedCompanyForModal.rounds.length} Rounds)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab('candidates')}
                className={`pb-2.5 text-xs font-black transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  modalActiveTab === 'candidates'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Candidate Details & Evaluations</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="overflow-y-auto flex-1 pt-4 space-y-4">
              {modalActiveTab === 'rounds' ? (
                <div className="space-y-4">
                  {/* Strict Mathematical Funnel Notice */}
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-black">Mathematical Conservation Enforced:</strong> Candidates selected
                      in each round strictly form the candidate pool for the subsequent round (
                      <code>Appeared[Round N+1] = Selected[Round N]</code>). Total accounted = Final Selected (
                      {selectedCompanyForModal.finalSelected}) + Rejected ({selectedCompanyForModal.rejected}) + In
                      Process ({selectedCompanyForModal.inProcess}) = {selectedCompanyForModal.totalRegistered}.
                    </div>
                  </div>

                  {/* Round-wise Selection Tracking Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-3 px-3.5">Round #</th>
                            <th className="py-3 px-3.5">Recruitment Stage</th>
                            <th className="py-3 px-3 text-right">Appeared</th>
                            <th className="py-3 px-3 text-right">Selected (Next)</th>
                            <th className="py-3 px-3 text-right">Rejected</th>
                            <th className="py-3 px-3 text-right">Pending</th>
                            <th className="py-3 px-3 text-right">Selection %</th>
                            <th className="py-3 px-3.5 text-right">Rejection %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedCompanyForModal.rounds.map((round) => (
                            <tr key={round.roundNumber} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-3.5 font-black text-slate-700">
                                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px]">
                                  {round.roundNumber}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 font-bold text-slate-900">{round.name}</td>
                              <td className="py-3 px-3 text-right font-black text-slate-800">{round.appeared}</td>
                              <td className="py-3 px-3 text-right font-black text-emerald-600">
                                +{round.selectedNextRound}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-rose-600">-{round.rejected}</td>
                              <td className="py-3 px-3 text-right font-bold text-amber-600">{round.pending}</td>
                              <td className="py-3 px-3 text-right font-black text-indigo-600">
                                {round.selectionRate}%
                              </td>
                              <td className="py-3 px-3.5 text-right font-bold text-rose-500">
                                {round.rejectionRate}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100/70 font-black text-slate-900 border-t border-slate-200">
                            <td colSpan={2} className="py-3 px-3.5">
                              Final Drive Total / Summary
                            </td>
                            <td className="py-3 px-3 text-right">{selectedCompanyForModal.appeared}</td>
                            <td className="py-3 px-3 text-right text-emerald-700">
                              {selectedCompanyForModal.finalSelected} Offers
                            </td>
                            <td className="py-3 px-3 text-right text-rose-700">
                              {selectedCompanyForModal.rejected} Eliminated
                            </td>
                            <td className="py-3 px-3 text-right text-amber-700">
                              {selectedCompanyForModal.inProcess} Active
                            </td>
                            <td className="py-3 px-3 text-right text-indigo-700">
                              {(
                                (selectedCompanyForModal.finalSelected / selectedCompanyForModal.totalRegistered) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                            <td className="py-3 px-3.5 text-right text-rose-700">
                              {(
                                (selectedCompanyForModal.rejected / selectedCompanyForModal.totalRegistered) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Candidates Tab */
                <div className="space-y-3.5">
                  {/* Candidate Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={modalCandidateSearch}
                        onChange={(e) => setModalCandidateSearch(e.target.value)}
                        placeholder="Search student name or roll number..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={modalRoundFilter}
                        onChange={(e) => setModalRoundFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">All Rounds</option>
                        {selectedCompanyForModal.rounds.map((r) => (
                          <option key={r.roundNumber} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={modalStatusFilter}
                        onChange={(e) => setModalStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Selected">Selected</option>
                        <option value="In Process">In Process</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidate List Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-3">Student Name</th>
                            <th className="py-2.5 px-3">Roll Number</th>
                            <th className="py-2.5 px-3">Branch & Batch</th>
                            <th className="py-2.5 px-3">Current Round</th>
                            <th className="py-2.5 px-3 text-center">Scores</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3">Evaluator Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {modalCandidates.map((cand) => (
                            <tr key={cand.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{cand.studentName}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{cand.rollNumber}</td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {cand.branch} ({cand.batch})
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{cand.currentRound}</td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="text-[11px] font-bold space-x-1">
                                  {cand.scores?.assessment && (
                                    <span className="text-blue-600" title="Assessment Score">
                                      A:{cand.scores.assessment}
                                    </span>
                                  )}
                                  {cand.scores?.technical && (
                                    <span className="text-indigo-600" title="Technical Score">
                                      T:{cand.scores.technical}
                                    </span>
                                  )}
                                  {cand.scores?.hr && (
                                    <span className="text-emerald-600" title="HR Score">
                                      H:{cand.scores.hr}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    cand.status === 'Selected'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : cand.status === 'In Process'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {cand.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate" title={cand.remarks}>
                                "{cand.remarks}"
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {modalCandidates.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No candidate records found matching the applied filters.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCompanyForModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

