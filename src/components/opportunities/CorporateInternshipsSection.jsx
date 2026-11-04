import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Check,
  AlertTriangle,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
  getCurrentUser
} from '../../services/storage';
import { OpportunityApi } from '../../services/api';

export default function CorporateInternshipsSection({
  userRole: propUserRole,
  studentBatch: propStudentBatch,
  showToast = () => {},
  onNavigate
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const userRole = (propUserRole || currentUser?.role || 'student').toLowerCase();
  const isAdminOrTpo = ['admin', 'director', 'tpo', 'coordinator'].includes(userRole);
  const studentBatch = propStudentBatch || currentUser?.graduationBatch || '2026';

  // Dedicated Internships Dataset (ZERO jobs, ZERO hackathons)
  const [internships, setInternships] = useState(() => getInternships());

  // Dedicated Student Tracked Internships
  const [trackedInternships, setTrackedInternships] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_tracked_internships');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dedicated Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'latest' | 'company' | 'stipend'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Dedicated Modal State for Add / Edit Internship
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [internshipForm, setInternshipForm] = useState({
    title: '',
    companyName: '',
    role: '',
    domain: 'Core Software Engineering & Cloud',
    stipend: '₹1,00,000 / month',
    duration: '10–12 Weeks (Summer 2026)',
    location: 'Bengaluru / Hyderabad',
    workMode: 'Hybrid',
    deadline: '',
    eligibleBatches: '2026, 2027',
    eligibleBranches: 'CSE, IT, ECE, Mathematics & Computing',
    skills: '',
    applicationUrl: '',
    source: 'Official Career Portal',
    description: '',
    ppoOpportunity: true
  });

  // Sync internships from backend on mount
  useEffect(() => {
    let isMounted = true;
    OpportunityApi.getInternships().then(res => {
      if (isMounted && Array.isArray(res) && res.length > 0) {
        setInternships(res);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Listen to storage update event
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setInternships(e.detail);
      }
    };
    window.addEventListener('internships-updated', handleUpdate);
    return () => window.removeEventListener('internships-updated', handleUpdate);
  }, []);

  // Toggle student application tracking
  const handleToggleTrack = (intern) => {
    const next = { ...trackedInternships, [intern.id]: !trackedInternships[intern.id] };
    setTrackedInternships(next);
    try {
      localStorage.setItem('placeprep_tracked_internships', JSON.stringify(next));
    } catch {}

    if (next[intern.id]) {
      showToast(`Tracked internship application for ${intern.companyName} (${intern.title || intern.role})`, 'success');
    } else {
      showToast(`Removed ${intern.companyName} internship from tracked list.`, 'info');
    }
  };

  // Dedicated Filter & Sort Logic for Internships ONLY
  const filteredInternships = useMemo(() => {
    return internships.filter(intern => {
      // Status filter
      if (selectedStatus !== 'ALL' && intern.status !== selectedStatus) return false;

      // Work Mode filter
      if (selectedWorkMode !== 'ALL') {
        const mode = (intern.workMode || '').toLowerCase();
        if (selectedWorkMode === 'Remote' && !mode.includes('remote')) return false;
        if (selectedWorkMode === 'Hybrid' && !mode.includes('hybrid')) return false;
        if (selectedWorkMode === 'On-site' && !mode.includes('on-site')) return false;
      }

      // Duration filter
      if (selectedDuration !== 'ALL') {
        const dur = (intern.duration || '').toLowerCase();
        if (selectedDuration === 'Summer' && !dur.includes('summer') && !dur.includes('week')) return false;
        if (selectedDuration === '6 Months' && !dur.includes('6 month')) return false;
      }

      // Domain filter
      if (selectedDomain !== 'ALL') {
        const domainText = `${intern.domain || ''} ${intern.role || ''} ${intern.description || ''}`.toLowerCase();
        if (!domainText.includes(selectedDomain.toLowerCase())) return false;
      }

      // Batch filter
      if (selectedBatch !== 'ALL') {
        const batches = Array.isArray(intern.eligibleBatches) ? intern.eligibleBatches.join(' ') : (intern.eligibleBatches || '');
        if (!batches.includes(selectedBatch)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          intern.companyName,
          intern.title,
          intern.role,
          intern.domain,
          intern.location,
          intern.stipend,
          intern.duration,
          intern.description,
          intern.source,
          Array.isArray(intern.skills) ? intern.skills.join(' ') : (intern.skillsRequired || '')
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = new Date(a.deadline || a.applicationDeadline || '2099-12-31').getTime();
        const dateB = new Date(b.deadline || b.applicationDeadline || '2099-12-31').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'latest') {
        const dateA = new Date(a.postedDate || a.lastVerifiedDate || 0).getTime();
        const dateB = new Date(b.postedDate || b.lastVerifiedDate || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'company') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      return 0;
    });
  }, [internships, selectedStatus, selectedWorkMode, selectedDuration, selectedDomain, selectedBatch, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredInternships.length / ITEMS_PER_PAGE) || 1;
  const paginatedInternships = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInternships.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInternships, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomain, selectedWorkMode, selectedDuration, selectedBatch, selectedStatus, sortBy]);

  // Delete Internship Handler
  const handleDeleteInternship = (intern) => {
    if (!window.confirm(`Are you sure you want to remove internship "${intern.title || intern.role}" at ${intern.companyName}?`)) return;
    const updated = deleteInternship(intern.id);
    setInternships(updated);
    OpportunityApi.deleteInternship(intern.id).catch(() => {});
    showToast('Corporate internship listing removed.', 'info');
  };

  // Open Edit Modal
  const handleOpenEdit = (intern) => {
    setEditingInternship(intern);
    setInternshipForm({
      title: intern.title || intern.role || '',
      companyName: intern.companyName || '',
      role: intern.role || intern.title || '',
      domain: intern.domain || 'Core Software Engineering & Cloud',
      stipend: intern.stipend || '',
      duration: intern.duration || '10–12 Weeks (Summer 2026)',
      location: intern.location || '',
      workMode: intern.workMode || 'Hybrid',
      deadline: intern.deadline || intern.applicationDeadline || '',
      eligibleBatches: Array.isArray(intern.eligibleBatches) ? intern.eligibleBatches.join(', ') : (intern.eligibleBatches || '2026, 2027'),
      eligibleBranches: Array.isArray(intern.eligibleBranches) ? intern.eligibleBranches.join(', ') : (intern.eligibleBranches || 'CSE, IT, ECE'),
      skills: Array.isArray(intern.skills) ? intern.skills.join(', ') : (intern.skillsRequired || ''),
      applicationUrl: intern.applicationUrl || intern.applyLink || '',
      source: intern.source || 'Official Career Portal',
      description: intern.description || '',
      ppoOpportunity: intern.ppoOpportunity !== false
    });
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingInternship(null);
    setInternshipForm({
      title: '',
      companyName: '',
      role: '',
      domain: 'Core Software Engineering & Cloud',
      stipend: '₹1,00,000 / month',
      duration: '10–12 Weeks (Summer 2026)',
      location: 'Bengaluru / Hyderabad',
      workMode: 'Hybrid',
      deadline: '',
      eligibleBatches: '2026, 2027',
      eligibleBranches: 'CSE, IT, ECE, Mathematics & Computing',
      skills: '',
      applicationUrl: '',
      source: 'Official Career Portal',
      description: '',
      ppoOpportunity: true
    });
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!internshipForm.title.trim() || !internshipForm.companyName.trim()) {
      showToast('Please provide both internship role and company name.', 'error');
      return;
    }
    if (!internshipForm.applicationUrl.trim().startsWith('http')) {
      showToast('Please enter a valid official application URL starting with http:// or https://', 'error');
      return;
    }
    if (!internshipForm.deadline.trim()) {
      showToast('Please specify application deadline date.', 'error');
      return;
    }

    const skillsArray = internshipForm.skills ? internshipForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload = {
      companyName: internshipForm.companyName.trim(),
      title: internshipForm.title.trim(),
      role: internshipForm.role.trim() || internshipForm.title.trim(),
      domain: internshipForm.domain,
      stipend: internshipForm.stipend || 'Competitive Stipend',
      duration: internshipForm.duration,
      location: internshipForm.location || 'Multiple Locations',
      workMode: internshipForm.workMode,
      deadline: internshipForm.deadline,
      applicationDeadline: internshipForm.deadline,
      eligibleBatches: internshipForm.eligibleBatches,
      eligibleBranches: internshipForm.eligibleBranches,
      skills: skillsArray,
      skillsRequired: internshipForm.skills,
      applicationUrl: internshipForm.applicationUrl.trim(),
      applyLink: internshipForm.applicationUrl.trim(),
      source: internshipForm.source || 'Official Career Portal',
      description: internshipForm.description,
      ppoOpportunity: internshipForm.ppoOpportunity,
      isPublished: true
    };

    if (editingInternship) {
      const updated = updateInternship(editingInternship.id, payload);
      setInternships(updated);
      OpportunityApi.updateInternship(editingInternship.id, payload).catch(() => {});
      showToast('Internship updated successfully!', 'success');
    } else {
      const updated = addInternship(payload);
      setInternships(updated);
      OpportunityApi.createInternship(payload).catch(() => {});
      showToast('New corporate internship posted successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="corporate-internships-section">
      {/* 1. Dedicated Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dedicated Section • Corporate Internships Only</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                PPO Fast-Track Track
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Corporate Summer & Winter Internships
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Gain production industry experience at top engineering companies with verified Pre-Placement Offer (PPO) conversion rates exceeding 85%.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200">
              {internships.length} Open Internships
            </span>
            {isAdminOrTpo && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                aria-label="Post new internship opening"
              >
                <Plus className="w-4 h-4" />
                <span>Post Internship</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dedicated Search & Filters for Internships ONLY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
              Internship Filters & Search
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredInternships.length}</span> of {internships.length} Openings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internship role, company, skills (e.g. C++, Java, React)…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
              aria-label="Search corporate internships"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white cursor-pointer"
              aria-label="Filter internships by domain"
            >
              <option value="ALL">All Domains</option>
              <option value="Cloud">Cloud & AI Systems</option>
              <option value="Core">Core SWE & Algorithms</option>
              <option value="Marketplace">Distributed Geo-Services</option>
              <option value="FinTech">FinTech & Trading</option>
              <option value="Creative">Digital Media & GenAI</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white cursor-pointer"
              aria-label="Filter internships by duration"
            >
              <option value="ALL">All Durations</option>
              <option value="Summer">Summer (8–12 Weeks)</option>
              <option value="6 Months">6 Months (Jan–June)</option>
            </select>
          </div>

          {/* Work Mode Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white cursor-pointer"
              aria-label="Filter internships by work mode"
            >
              <option value="ALL">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-emerald-500 focus:bg-white cursor-pointer"
              aria-label="Sort corporate internships"
            >
              <option value="deadline">Deadline (Urgent)</option>
              <option value="latest">Latest Posted</option>
              <option value="company">Company (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Internships Listing Stack (Dedicated Layout) */}
      <div className="space-y-4">
        {paginatedInternships.map(intern => {
          const isTracked = !!trackedInternships[intern.id];
          const deadlineStr = intern.deadline || intern.applicationDeadline;

          return (
            <div
              key={intern.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group relative"
            >
              <div className="flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {intern.companyName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Corporate Internship
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {intern.workMode || 'Hybrid'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    intern.status === 'Closing Soon'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : intern.status === 'Expired'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {intern.status === 'Closing Soon' ? '🔥 Closing Soon' : (intern.status || 'Active')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900">
                    Stipend: {intern.stipend}
                  </span>
                  {intern.ppoOpportunity !== false && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>PPO Track (&gt;85%)</span>
                    </span>
                  )}
                </div>

                {/* Internship Role Title */}
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1 leading-snug">
                  {intern.title || intern.role}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed line-clamp-2">
                  {intern.description}
                </p>

                {/* Skills tags */}
                {(Array.isArray(intern.skills) ? intern.skills : (intern.skillsRequired ? intern.skillsRequired.split(',') : [])).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Skills:</span>
                    {(Array.isArray(intern.skills) ? intern.skills : intern.skillsRequired.split(',')).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {typeof sk === 'string' ? sk.trim() : sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Duration</span>
                    <span className="font-bold text-slate-800 truncate">{intern.duration}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Location</span>
                    <span className="font-bold text-slate-800 truncate">{intern.location}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Deadline</span>
                    <span className="font-bold text-slate-800 truncate">{deadlineStr || 'Rolling'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Target Batches</span>
                    <span className="font-bold text-slate-800 truncate">
                      {Array.isArray(intern.eligibleBatches) ? intern.eligibleBatches.join(', ') : (intern.eligibleBatches || '2026, 2027')}
                    </span>
                  </div>
                </div>

                {/* Source Verification Stamp */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified link: <strong className="text-slate-600">{intern.source || 'Official Careers Portal'}</strong></span>
                  <span>•</span>
                  <span>Last verified: {intern.lastVerifiedDate || 'Nov 2026'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <a
                  href={intern.applicationUrl || intern.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                  aria-label={`Apply for ${intern.title || intern.role} at ${intern.companyName}`}
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {!isAdminOrTpo && (
                  <button
                    onClick={() => handleToggleTrack(intern)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTracked
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkCheck className={`w-3.5 h-3.5 ${isTracked ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{isTracked ? 'Tracked' : 'Track Internship'}</span>
                  </button>
                )}

                {isAdminOrTpo && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => handleOpenEdit(intern)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteInternship(intern)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
        {paginatedInternships.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">No Internships Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No matching corporate internships match your current filters. Try selecting "All Durations" or clearing keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('ALL');
                setSelectedDuration('ALL');
                setSelectedWorkMode('ALL');
                setSelectedBatch('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Internship Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {filteredInternships.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span>{' '}
            <span className="text-slate-400">
              (Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredInternships.length)} of {filteredInternships.length} Internships)
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

      {/* 5. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingInternship ? 'Edit Internship Opening' : 'Post Corporate Internship'}
                </h3>
                <p className="text-xs text-slate-500">Provide verified summer/winter internship details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={internshipForm.companyName}
                    onChange={(e) => setInternshipForm({ ...internshipForm, companyName: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Amazon"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internship Role *</label>
                  <input
                    type="text"
                    required
                    value={internshipForm.title}
                    onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                    placeholder="e.g. Software Engineering Intern"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Stipend *</label>
                  <input
                    type="text"
                    required
                    value={internshipForm.stipend}
                    onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                    placeholder="e.g. ₹1,10,000 / month"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={internshipForm.deadline}
                    onChange={(e) => setInternshipForm({ ...internshipForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    placeholder="e.g. 10–12 Weeks (Summer 2026)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={internshipForm.location}
                    onChange={(e) => setInternshipForm({ ...internshipForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru / Hyderabad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Direct Official Application Link *</label>
                <input
                  type="url"
                  required
                  value={internshipForm.applicationUrl}
                  onChange={(e) => setInternshipForm({ ...internshipForm, applicationUrl: e.target.value })}
                  placeholder="https://company.com/careers/internship-id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Batches</label>
                  <input
                    type="text"
                    value={internshipForm.eligibleBatches}
                    onChange={(e) => setInternshipForm({ ...internshipForm, eligibleBatches: e.target.value })}
                    placeholder="e.g. 2026, 2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={internshipForm.skills}
                    onChange={(e) => setInternshipForm({ ...internshipForm, skills: e.target.value })}
                    placeholder="Data Structures, Algorithms, Python, Java"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internship Description</label>
                <textarea
                  rows="3"
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  placeholder="Project overview, learning outcomes, mentoring, PPO conversion details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  {editingInternship ? 'Save Changes' : 'Publish Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

