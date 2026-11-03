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
  ArrowRight
} from 'lucide-react';
import {
  DIRECTOR_COMPANY_ANALYTICS,
  ANALYTICS_CANDIDATE_DETAILS,
  getDirectorAnalyticsSummary,
  getCompanyDetails
} from '../../data/directorPlacementAnalyticsData';
import { DirectorApi } from '../../services/api';

export default function DirectorPlacementAnalytics({ onNavigate }) {
  // Data states
  const [summary, setSummary] = useState(() => getDirectorAnalyticsSummary());
  const [companies, setCompanies] = useState(() => DIRECTOR_COMPANY_ANALYTICS);
  const [candidates, setCandidates] = useState(() => ANALYTICS_CANDIDATE_DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Local Analytical Cache');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

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
        setCompanies(res.companies);
        if (res.summary) setSummary(res.summary);
        if (res.candidates && Array.isArray(res.candidates)) setCandidates(res.candidates);
        setDataSource('TiDB Cloud Remote DB');
      } else {
        // Fallback to local verified data
        setCompanies(DIRECTOR_COMPANY_ANALYTICS);
        setSummary(getDirectorAnalyticsSummary());
        setCandidates(ANALYTICS_CANDIDATE_DETAILS);
        setDataSource('Local Analytical Engine');
      }
    } catch (err) {
      console.warn('Backend analytics fetch fallback:', err);
      setCompanies(DIRECTOR_COMPANY_ANALYTICS);
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
      {/* 4. COMPANY-WISE CARDS & FUNNEL PROGRESSION GRID (8 COMPANIES)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCompanies.map((company) => {
          const selectionPercent = company.totalRegistered > 0
            ? ((company.finalSelected / company.totalRegistered) * 100).toFixed(1)
            : '0.0';
          const rejectionPercent = company.totalRegistered > 0
            ? ((company.rejected / company.totalRegistered) * 100).toFixed(1)
            : '0.0';
          const inProcessPercent = company.totalRegistered > 0
            ? ((company.inProcess / company.totalRegistered) * 100).toFixed(1)
            : '0.0';

          return (
            <div
              key={company.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row: Company name, Role, Status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {company.companyName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          company.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : company.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {company.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-bold text-slate-700">{company.role}</span>
                      <span>•</span>
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {company.ctc}
                      </span>
                      <span>•</span>
                      <span>Drive: {company.driveDate}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCompanyForModal(company);
                      setModalActiveTab('rounds');
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-200 transition shrink-0 cursor-pointer"
                    title="View Detailed Analytics & Candidates"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Key Metrics Strip (6 stats) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered</span>
                    <span className="text-xs font-black text-slate-800">{company.totalRegistered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Appeared</span>
                    <span className="text-xs font-black text-slate-800">{company.appeared}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-500 font-bold uppercase block">Prog. (S)</span>
                    <span className="text-xs font-black text-indigo-600">{company.selected}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-500 font-bold uppercase block">Rejected</span>
                    <span className="text-xs font-black text-rose-600">{company.rejected}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase block">In Process</span>
                    <span className="text-xs font-black text-amber-600">{company.inProcess}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase block">Offers</span>
                    <span className="text-xs font-black text-emerald-600">{company.finalSelected}</span>
                  </div>
                </div>

                {/* Round-wise Funnel Progression Progress Bars */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Round-wise Candidate Pool Progression
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Funnel Drop-off: {company.appeared} → {company.finalSelected}
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/60 p-3 rounded-2xl border border-slate-100 text-xs">
                    {company.rounds.map((round) => {
                      const widthPercent =
                        company.appeared > 0
                          ? Math.max(8, (round.appeared / company.appeared) * 100)
                          : 0;

                      return (
                        <div key={round.roundNumber} className="space-y-0.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600 font-medium truncate max-w-[200px]">
                              R{round.roundNumber}: {round.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-slate-900">{round.appeared} candidates</span>
                              <span className="text-indigo-600 font-black text-[10px]">
                                ({round.selectionRate}%)
                              </span>
                            </div>
                          </div>

                          {/* Multi-segment progression bar */}
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${widthPercent}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                round.roundNumber === 6
                                  ? 'bg-emerald-500'
                                  : round.roundNumber >= 4
                                  ? 'bg-indigo-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selection vs Rejection Ratio Visual */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[11px] mb-1.5">
                    <span className="text-slate-500 font-bold">Outcome Ratio</span>
                    <div className="flex items-center gap-2.5 text-[10px] font-bold">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selected ({selectionPercent}%)
                      </span>
                      <span className="text-amber-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> In Process ({inProcessPercent}%)
                      </span>
                      <span className="text-rose-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected ({rejectionPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${selectionPercent}%` }}
                      className="h-full bg-emerald-500 transition-all duration-500"
                      title={`Selected: ${company.finalSelected}`}
                    />
                    <div
                      style={{ width: `${inProcessPercent}%` }}
                      className="h-full bg-amber-400 transition-all duration-500"
                      title={`In Process: ${company.inProcess}`}
                    />
                    <div
                      style={{ width: `${rejectionPercent}%` }}
                      className="h-full bg-rose-400 transition-all duration-500"
                      title={`Rejected: ${company.rejected}`}
                    />
                  </div>
                </div>
              </div>

              {/* Action: Open Drilldown Modal */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Final Offers: <strong className="text-slate-900 font-black">{company.finalSelected} students</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompanyForModal(company);
                    setModalActiveTab('rounds');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Detailed Analytics & Candidates</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-base">No hiring drives match your search</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting company or status filters.</p>
        </div>
      )}

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

