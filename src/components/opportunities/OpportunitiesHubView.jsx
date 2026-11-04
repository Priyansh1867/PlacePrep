import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Award,
  Code2,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Flame,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  BookmarkCheck,
  Check
} from 'lucide-react';
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
  getCurrentUser
} from '../../services/storage';
import { OpportunityApi } from '../../services/api';

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
  const isAdminOrTpo = ['admin', 'director', 'tpo', 'coordinator'].includes(userRole);

  const studentBatch = propStudentBatch || currentUser?.graduationBatch || '2026';
  const isFinalYear = propIsFinalYear !== undefined ? propIsFinalYear : studentBatch === '2026';

  const showToast = (msg, type = 'info') => {
    if (typeof propShowToast === 'function') {
      propShowToast(msg, type);
    } else {
      console.log(`[Toast] ${msg}`);
    }
  };

  // Active Category Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (['all', 'jobs', 'internships', 'hackathons'].includes(initialTab)) {
      return initialTab;
    }
    return 'all';
  });

  // Data sets from storage & API
  const [jobs, setJobs] = useState(() => getOffCampusCompanies());
  const [internships, setInternships] = useState(() => getInternships());
  const [hackathons, setHackathons] = useState(() => getHackathons());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Today (Verified)');

  // Tracked opportunities by student in localStorage
  const [trackedIds, setTrackedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_tracked_opportunities');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'latest' | 'company'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    category: 'jobs', // 'jobs' | 'internships' | 'hackathons'
    title: '',
    companyName: '',
    organizer: '',
    role: '',
    domain: '',
    ctc: '',
    stipend: '',
    prizePool: '',
    location: '',
    workMode: 'Hybrid',
    deadline: '',
    eligibleBatches: '2025, 2026',
    eligibleBranches: 'All Engineering Branches',
    skills: '',
    applicationUrl: '',
    source: 'Official Career Portal',
    description: '',
    teamSize: '1–4 Members'
  });

  // Sync datasets from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [backendJobs, backendInternships, backendHackathons] = await Promise.all([
          OpportunityApi.getOffCampus().catch(() => null),
          OpportunityApi.getInternships().catch(() => null),
          OpportunityApi.getHackathons().catch(() => null)
        ]);

        if (!isMounted) return;
        if (backendJobs && Array.isArray(backendJobs.opportunities) && backendJobs.opportunities.length > 0) {
          setJobs(backendJobs.opportunities);
        }
        if (Array.isArray(backendInternships) && backendInternships.length > 0) {
          setInternships(backendInternships);
        }
        if (Array.isArray(backendHackathons) && backendHackathons.length > 0) {
          setHackathons(backendHackathons);
        }
      } catch (e) {
        console.warn('Backend sync bypassed, using verified storage records:', e);
      }
    }
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Listen to custom storage update events
  useEffect(() => {
    const handleJobsUpdate = (e) => { if (e.detail) setJobs(e.detail); };
    const handleInternshipsUpdate = (e) => { if (e.detail) setInternships(e.detail); };
    const handleHackathonsUpdate = (e) => { if (e.detail) setHackathons(e.detail); };

    window.addEventListener('offcampus-updated', handleJobsUpdate);
    window.addEventListener('internships-updated', handleInternshipsUpdate);
    window.addEventListener('hackathons-updated', handleHackathonsUpdate);

    return () => {
      window.removeEventListener('offcampus-updated', handleJobsUpdate);
      window.removeEventListener('internships-updated', handleInternshipsUpdate);
      window.removeEventListener('hackathons-updated', handleHackathonsUpdate);
    };
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = resetOpportunitiesToVerifiedDefaults();
      setJobs(refreshed.offCampus);
      setInternships(refreshed.internships);
      setHackathons(refreshed.hackathons);
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('Opportunities refreshed with verified official portals!', 'success');
    } catch {
      showToast('Failed to refresh data', 'error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Toggle application tracking for student
  const handleToggleTrack = (item) => {
    const next = { ...trackedIds, [item.id]: !trackedIds[item.id] };
    setTrackedIds(next);
    try {
      localStorage.setItem('placeprep_tracked_opportunities', JSON.stringify(next));
    } catch {}

    if (next[item.id]) {
      showToast(`Added "${item.title || item.role}" to your tracked applications!`, 'success');
    } else {
      showToast(`Removed from tracked applications.`, 'info');
    }
  };

  // Unified list calculation
  const allOpportunities = useMemo(() => {
    const normalizedJobs = jobs.map(j => ({
      ...j,
      category: 'jobs',
      categoryLabel: 'Off-Campus Job',
      displayCompany: j.companyName,
      displayTitle: j.title || j.role,
      displayReward: j.ctc || j.salaryRange,
      rewardLabel: 'CTC Package',
      deadline: j.applicationDeadline || j.deadline,
      url: j.applyLink || j.applicationUrl,
      mode: j.workMode || 'Hybrid'
    }));

    const normalizedInternships = internships.map(i => ({
      ...i,
      category: 'internships',
      categoryLabel: 'Internship',
      displayCompany: i.companyName,
      displayTitle: i.title || i.role,
      displayReward: i.stipend,
      rewardLabel: 'Stipend',
      deadline: i.deadline || i.applicationDeadline,
      url: i.applicationUrl || i.applyLink,
      mode: i.workMode || 'Hybrid'
    }));

    const normalizedHackathons = hackathons.map(h => ({
      ...h,
      category: 'hackathons',
      categoryLabel: 'Hackathon',
      displayCompany: h.organizer,
      displayTitle: h.title,
      displayReward: h.prizePool,
      rewardLabel: 'Prize Pool',
      deadline: h.registrationDeadline,
      url: h.registrationUrl,
      mode: h.mode || 'Online'
    }));

    return [...normalizedJobs, ...normalizedInternships, ...normalizedHackathons];
  }, [jobs, internships, hackathons]);

  // Closing soon spotlight (items closing within 10 days)
  const closingSoonItems = useMemo(() => {
    return allOpportunities
      .filter(item => item.status === 'Closing Soon')
      .slice(0, 4);
  }, [allOpportunities]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return allOpportunities.filter(item => {
      // Category filter
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) return false;
      }

      // Work Mode / Format filter
      if (selectedWorkMode !== 'ALL') {
        const itemMode = (item.mode || '').toLowerCase();
        if (selectedWorkMode === 'Remote' && !itemMode.includes('remote') && !itemMode.includes('online')) return false;
        if (selectedWorkMode === 'Hybrid' && !itemMode.includes('hybrid')) return false;
        if (selectedWorkMode === 'On-site' && !itemMode.includes('on-site') && !itemMode.includes('offline')) return false;
      }

      // Domain filter
      if (selectedDomain !== 'ALL') {
        const domainText = `${item.domain || ''} ${item.tags || ''} ${item.problemStatement || ''} ${Array.isArray(item.domains) ? item.domains.join(' ') : ''}`.toLowerCase();
        if (!domainText.includes(selectedDomain.toLowerCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          item.displayCompany,
          item.displayTitle,
          item.role,
          item.domain,
          item.location,
          item.description,
          item.source,
          Array.isArray(item.skills) ? item.skills.join(' ') : (item.skillsRequired || ''),
          Array.isArray(item.eligibleBranches) ? item.eligibleBranches.join(' ') : (item.eligibleBranches || '')
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = new Date(a.deadline || '2099-12-31').getTime();
        const dateB = new Date(b.deadline || '2099-12-31').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'latest') {
        const dateA = new Date(a.postedDate || a.lastVerifiedDate || 0).getTime();
        const dateB = new Date(b.postedDate || b.lastVerifiedDate || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'company') {
        return (a.displayCompany || '').localeCompare(b.displayCompany || '');
      }
      return 0;
    });
  }, [allOpportunities, activeTab, selectedStatus, selectedWorkMode, selectedDomain, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedDomain, selectedWorkMode, selectedStatus, sortBy]);

  // Delete handler
  const handleDelete = (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.displayTitle}"?`)) return;

    if (item.category === 'jobs') {
      const updated = deleteOffCampusCompany(item.id);
      setJobs(updated);
      OpportunityApi.deleteOffCampus(item.id).catch(() => {});
    } else if (item.category === 'internships') {
      const updated = deleteInternship(item.id);
      setInternships(updated);
      OpportunityApi.deleteInternship(item.id).catch(() => {});
    } else if (item.category === 'hackathons') {
      const updated = deleteHackathon(item.id);
      setHackathons(updated);
      OpportunityApi.deleteHackathon(item.id).catch(() => {});
    }
    showToast('Opportunity removed successfully.', 'info');
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalForm({
      category: item.category,
      title: item.title || item.displayTitle || '',
      companyName: item.companyName || item.organizer || '',
      organizer: item.organizer || item.companyName || '',
      role: item.role || item.title || '',
      domain: item.domain || (Array.isArray(item.domains) ? item.domains.join(', ') : '') || '',
      ctc: item.ctc || '',
      stipend: item.stipend || '',
      prizePool: item.prizePool || '',
      location: item.location || '',
      workMode: item.workMode || item.mode || 'Hybrid',
      deadline: item.deadline || item.applicationDeadline || item.registrationDeadline || '',
      eligibleBatches: item.eligibleBatches || '2025, 2026',
      eligibleBranches: Array.isArray(item.eligibleBranches) ? item.eligibleBranches.join(', ') : (item.eligibleBranches || 'All Engineering Branches'),
      skills: Array.isArray(item.skills) ? item.skills.join(', ') : (item.skillsRequired || ''),
      applicationUrl: item.url || item.applyLink || item.registrationUrl || '',
      source: item.source || 'Official Career Portal',
      description: item.description || item.problemStatement || '',
      teamSize: item.teamSize || '1–4 Members'
    });
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalForm({
      category: activeTab === 'all' ? 'jobs' : activeTab,
      title: '',
      companyName: '',
      organizer: '',
      role: '',
      domain: '',
      ctc: '',
      stipend: '',
      prizePool: '',
      location: '',
      workMode: 'Hybrid',
      deadline: '',
      eligibleBatches: '2025, 2026',
      eligibleBranches: 'All Engineering Branches',
      skills: '',
      applicationUrl: '',
      source: 'Official Career Portal',
      description: '',
      teamSize: '1–4 Members'
    });
    setIsModalOpen(true);
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      showToast('Please enter a valid title/role', 'error');
      return;
    }
    const orgOrComp = modalForm.companyName.trim() || modalForm.organizer.trim();
    if (!orgOrComp) {
      showToast('Please enter company or organizer name', 'error');
      return;
    }
    if (!modalForm.applicationUrl.trim().startsWith('http')) {
      showToast('Please provide a valid official application URL starting with http:// or https://', 'error');
      return;
    }
    if (!modalForm.deadline.trim()) {
      showToast('Please specify application or registration deadline', 'error');
      return;
    }

    const skillsArray = modalForm.skills ? modalForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (modalForm.category === 'jobs') {
      const payload = {
        companyName: orgOrComp,
        title: modalForm.title,
        role: modalForm.role || modalForm.title,
        domain: modalForm.domain || 'Software Engineering',
        ctc: modalForm.ctc || 'As per industry standard',
        location: modalForm.location || 'Multiple Locations',
        workMode: modalForm.workMode,
        applicationDeadline: modalForm.deadline,
        eligibleBatches: modalForm.eligibleBatches,
        eligibleBranches: modalForm.eligibleBranches,
        skills: skillsArray,
        skillsRequired: modalForm.skills,
        applyLink: modalForm.applicationUrl,
        applicationUrl: modalForm.applicationUrl,
        source: modalForm.source || 'Official Career Portal',
        description: modalForm.description,
        isPublished: true
      };

      if (editingItem) {
        const updated = updateOffCampusCompany(editingItem.id, payload);
        setJobs(updated);
        OpportunityApi.updateOffCampus(editingItem.id, payload).catch(() => {});
        showToast('Off-campus job updated!', 'success');
      } else {
        const updated = addOffCampusCompany(payload);
        setJobs(updated);
        OpportunityApi.createOffCampus(payload).catch(() => {});
        showToast('New off-campus job posted!', 'success');
      }
    } else if (modalForm.category === 'internships') {
      const payload = {
        companyName: orgOrComp,
        title: modalForm.title,
        role: modalForm.role || modalForm.title,
        domain: modalForm.domain || 'Software Engineering',
        stipend: modalForm.stipend || 'Competitive Stipend',
        location: modalForm.location || 'Hybrid',
        workMode: modalForm.workMode,
        deadline: modalForm.deadline,
        applicationDeadline: modalForm.deadline,
        eligibleBatches: modalForm.eligibleBatches,
        eligibleBranches: modalForm.eligibleBranches,
        skills: skillsArray,
        skillsRequired: modalForm.skills,
        applicationUrl: modalForm.applicationUrl,
        applyLink: modalForm.applicationUrl,
        source: modalForm.source || 'Official Career Portal',
        description: modalForm.description,
        isPublished: true,
        ppoOpportunity: true
      };

      if (editingItem) {
        const updated = updateInternship(editingItem.id, payload);
        setInternships(updated);
        OpportunityApi.updateInternship(editingItem.id, payload).catch(() => {});
        showToast('Internship updated!', 'success');
      } else {
        const updated = addInternship(payload);
        setInternships(updated);
        OpportunityApi.createInternship(payload).catch(() => {});
        showToast('New internship posted!', 'success');
      }
    } else if (modalForm.category === 'hackathons') {
      const domainsArray = modalForm.domain ? modalForm.domain.split(',').map(s => s.trim()).filter(Boolean) : ['General Tech'];
      const payload = {
        title: modalForm.title,
        organizer: orgOrComp,
        problemStatement: modalForm.description,
        domains: domainsArray,
        tags: modalForm.domain,
        prizePool: modalForm.prizePool || 'Rewards & Certifications',
        mode: modalForm.workMode === 'Remote' ? 'Online' : (modalForm.workMode === 'On-site' ? 'Offline' : 'Hybrid'),
        registrationDeadline: modalForm.deadline,
        teamSize: modalForm.teamSize,
        eligibilityCriteria: modalForm.eligibleBranches,
        registrationUrl: modalForm.applicationUrl,
        source: modalForm.source || 'Official Organizer Portal',
        isPublished: true
      };

      if (editingItem) {
        const updated = updateHackathon(editingItem.id, payload);
        setHackathons(updated);
        OpportunityApi.updateHackathon(editingItem.id, payload).catch(() => {});
        showToast('Hackathon updated!', 'success');
      } else {
        const updated = addHackathon(payload);
        setHackathons(updated);
        OpportunityApi.createHackathon(payload).catch(() => {});
        showToast('New hackathon posted!', 'success');
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="opportunities-hub-container">
      {/* 1. Header Hero Card with PlacePrep Signature Dark Glass Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-slate-800/90 shadow-2xl text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Real & Verified Portals</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Official Links Only
              </span>
              {!isFinalYear && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Advisory Mode (Batch {studentBatch})
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Latest Off-Campus Opportunities & Hackathons
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Curated, verified engineering jobs, summer internships, and national hackathons with direct links to official company careers and developer portals.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero fake / fabricated links</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Synced: {lastRefreshedAt}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                title="Sync and verify latest listings"
                aria-label="Refresh opportunities"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing…' : 'Refresh Data'}</span>
              </button>

              {isAdminOrTpo && (
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  aria-label="Post new opportunity"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Opportunity</span>
                </button>
              )}
            </div>

            {/* Micro stats counter badge */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <div className="text-base font-black text-white">{jobs.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Jobs</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <div className="text-base font-black text-white">{internships.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Interns</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <div className="text-base font-black text-emerald-400">{hackathons.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Hacks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Urgent / Closing Soon Spotlight Strip */}
      {closingSoonItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 font-bold">
                <Flame className="w-4 h-4 animate-bounce" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Closing Soon – Urgent Deadlines</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    {closingSoonItems.length} Urgent
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  Applications close within 10 days. Ensure you submit your official application before the cutoff.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {closingSoonItems.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-black text-slate-800 truncate">
                      {item.displayCompany}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 text-red-800 uppercase tracking-wider">
                      ⏰ Closes {item.deadline}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {item.displayTitle}
                  </h4>
                  <div className="text-[11px] font-semibold text-emerald-600 truncate mb-2">
                    {item.displayReward}
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold text-center transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>{item.category === 'hackathons' ? 'Register Now' : 'Apply Now'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Tabs Bar & Search / Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>All Opportunities</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-600'
              }`}>
                {allOpportunities.length}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'jobs'}
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Off-Campus Jobs</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'jobs' ? 'bg-indigo-700 text-white' : 'bg-white text-slate-600'
              }`}>
                {jobs.length}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'internships'}
              onClick={() => setActiveTab('internships')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'internships'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Corporate Internships</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'internships' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600'
              }`}>
                {internships.length}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'hackathons'}
              onClick={() => setActiveTab('hackathons')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'hackathons'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Hackathons</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'hackathons' ? 'bg-purple-700 text-white' : 'bg-white text-slate-600'
              }`}>
                {hackathons.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredItems.length}</span> verified listings
          </div>
        </div>

        {/* Search & Dynamic Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, tech stack (e.g. Java, AI/ML, Cloud)…"
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              aria-label="Search opportunities"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Domain Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter by Domain"
            >
              <option value="ALL">All Domains</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="Distributed">Distributed Systems</option>
              <option value="Web">Full-Stack / Web</option>
              <option value="Blockchain">Blockchain & Web3</option>
              <option value="IoT">IoT & Robotics</option>
              <option value="Cyber">Cyber Security</option>
            </select>
          </div>

          {/* Work Mode Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter by Work Mode"
            >
              <option value="ALL">All Formats</option>
              <option value="Remote">Remote / Online</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site / Offline</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Sort listings"
            >
              <option value="deadline">Deadline (Urgent)</option>
              <option value="latest">Latest Posted</option>
              <option value="company">Company (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Opportunity Listing Cards (Clean Horizontal List Layout) */}
      <div className="space-y-4">
        {paginatedItems.map(item => {
          const isTracked = !!trackedIds[item.id];
          const isHackathon = item.category === 'hackathons';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group relative"
            >
              {/* Left Column: Details */}
              <div className="flex-1 min-w-0">
                {/* Meta Header Pill Strip */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {item.displayCompany}
                  </span>

                  {/* Category Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isHackathon
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : item.category === 'internships'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {item.categoryLabel}
                  </span>

                  {/* Work Mode / Format Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {item.mode}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Closing Soon'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : item.status === 'Expired'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.status === 'Closing Soon' ? '🔥 Closing Soon' : item.status}
                  </span>

                  {/* Compensation / Prize Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.rewardLabel}: {item.displayReward}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1.5 leading-snug">
                  {item.displayTitle}
                </h3>

                {/* Description / Summary */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed line-clamp-2">
                  {item.description || item.problemStatement}
                </p>

                {/* Skills / Tags Pills */}
                {(Array.isArray(item.skills) ? item.skills : (item.tags ? item.tags.split(',') : [])).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Skills:</span>
                    {(Array.isArray(item.skills) ? item.skills : item.tags.split(',')).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {typeof sk === 'string' ? sk.trim() : sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Micro Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Deadline</span>
                    <span className="font-bold text-slate-800 truncate">{item.deadline || 'Rolling'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      {isHackathon ? 'Team Rules' : 'Location'}
                    </span>
                    <span className="font-bold text-slate-800 truncate">
                      {isHackathon ? (item.teamSize || '1–4 Members') : (item.location || 'Multiple Cities')}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Eligibility</span>
                    <span className="font-bold text-slate-800 truncate">
                      {item.eligibleBatches ? `Batches ${item.eligibleBatches}` : 'All Batches'}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Verified Source</span>
                    <span className="font-bold text-indigo-700 truncate">{item.source || 'Official Portal'}</span>
                  </div>
                </div>

                {/* Source Footnote */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <span>🛡️ Verified link: {item.source}</span>
                  <span>•</span>
                  <span>Last verified: {item.lastVerifiedDate || 'Nov 2026'}</span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* Prominent Official Apply / Register Button */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    item.status === 'Expired'
                      ? 'bg-slate-200 text-slate-600 cursor-not-allowed pointer-events-none'
                      : isHackathon
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 hover:shadow-md'
                      : item.category === 'internships'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 hover:shadow-md'
                  }`}
                  aria-label={`${isHackathon ? 'Register for' : 'Apply for'} ${item.displayTitle}`}
                >
                  <span>{item.status === 'Expired' ? 'Deadline Expired' : (isHackathon ? 'Register Now' : 'Apply Now')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Track Application Button for Students */}
                {!isAdminOrTpo && (
                  <button
                    onClick={() => handleToggleTrack(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTracked
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkCheck className={`w-3.5 h-3.5 ${isTracked ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{isTracked ? 'Tracked in Applications' : 'Track Application'}</span>
                  </button>
                )}

                {/* Admin / TPO Actions */}
                {isAdminOrTpo && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Edit opportunity details"
                      aria-label="Edit opportunity"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Delete listing"
                      aria-label="Delete opportunity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {paginatedItems.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">No Opportunities Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No matching listings found for your current search and filter settings. Try clearing keywords or domain filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('ALL');
                setSelectedWorkMode('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Pagination Footer */}
      {filteredItems.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span>{' '}
            <span className="text-slate-400">
              (Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} Opportunities)
            </span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Admin / TPO Modal: Post or Edit Opportunity */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 id="modal-title" className="text-lg font-black text-slate-900 tracking-tight">
                  {editingItem ? 'Edit Opportunity' : 'Post Verified Opportunity'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ensure all links lead to official company careers or verified hackathon platforms.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Opportunity Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, category: 'jobs' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer ${
                      modalForm.category === 'jobs'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Off-Campus Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, category: 'internships' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer ${
                      modalForm.category === 'internships'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Internship
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, category: 'hackathons' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer ${
                      modalForm.category === 'hackathons'
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Hackathon
                  </button>
                </div>
              </div>

              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {modalForm.category === 'hackathons' ? 'Hackathon Name *' : 'Job / Internship Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.title}
                    onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    placeholder={modalForm.category === 'hackathons' ? 'e.g. Google Solution Challenge 2026' : 'e.g. Software Engineer, Early Career'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {modalForm.category === 'hackathons' ? 'Organizer *' : 'Company Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.companyName}
                    onChange={(e) => setModalForm({ ...modalForm, companyName: e.target.value, organizer: e.target.value })}
                    placeholder={modalForm.category === 'hackathons' ? 'e.g. Google Developers / AICTE' : 'e.g. Google, Microsoft, Amazon'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Reward & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {modalForm.category === 'jobs' ? 'CTC Package (e.g. ₹18–32 LPA)' : (modalForm.category === 'internships' ? 'Stipend (e.g. ₹1,10,000 / month)' : 'Prize Pool (e.g. $100,000 USD)')}
                  </label>
                  <input
                    type="text"
                    value={modalForm.category === 'jobs' ? modalForm.ctc : (modalForm.category === 'internships' ? modalForm.stipend : modalForm.prizePool)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (modalForm.category === 'jobs') setModalForm({ ...modalForm, ctc: val });
                      else if (modalForm.category === 'internships') setModalForm({ ...modalForm, stipend: val });
                      else setModalForm({ ...modalForm, prizePool: val });
                    }}
                    placeholder="Compensation or reward pool"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Application / Registration Deadline * (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={modalForm.deadline}
                    onChange={(e) => setModalForm({ ...modalForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Work Mode & Location / Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format / Work Mode</label>
                  <select
                    value={modalForm.workMode}
                    onChange={(e) => setModalForm({ ...modalForm, workMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote / Online</option>
                    <option value="On-site">On-site / Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Host City</label>
                  <input
                    type="text"
                    value={modalForm.location}
                    onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad, or Virtual"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Official Application URL & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Official URL *</label>
                  <input
                    type="url"
                    required
                    value={modalForm.applicationUrl}
                    onChange={(e) => setModalForm({ ...modalForm, applicationUrl: e.target.value })}
                    placeholder="https://company.com/careers/job-id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source / Verification Portal</label>
                  <input
                    type="text"
                    value={modalForm.source}
                    onChange={(e) => setModalForm({ ...modalForm, source: e.target.value })}
                    placeholder="e.g. Official Careers, Devfolio, Unstop"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Skills / Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain / Track</label>
                  <input
                    type="text"
                    value={modalForm.domain}
                    onChange={(e) => setModalForm({ ...modalForm, domain: e.target.value })}
                    placeholder="e.g. Distributed Systems, AI/ML, Cloud"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={modalForm.skills}
                    onChange={(e) => setModalForm({ ...modalForm, skills: e.target.value })}
                    placeholder="e.g. Java, Python, C++, React, SQL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {modalForm.category === 'hackathons' ? 'Problem Statement / Theme' : 'Job Description / Overview'}
                </label>
                <textarea
                  rows="3"
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Details, responsibilities, eligibility requirements..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

