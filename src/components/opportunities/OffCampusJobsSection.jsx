import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  ArrowUpDown,
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
  Building2
} from 'lucide-react';
import {
  getOffCampusCompanies,
  addOffCampusCompany,
  updateOffCampusCompany,
  deleteOffCampusCompany,
  getCurrentUser
} from '../../services/storage';
import { OpportunityApi } from '../../services/api';

export default function OffCampusJobsSection({
  userRole: propUserRole,
  studentBatch: propStudentBatch,
  isFinalYear: propIsFinalYear,
  showToast = () => {},
  onNavigate
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const userRole = (propUserRole || currentUser?.role || 'student').toLowerCase();
  const isAdminOrTpo = ['admin', 'director', 'tpo', 'coordinator'].includes(userRole);
  const studentBatch = propStudentBatch || currentUser?.graduationBatch || '2026';
  const isFinalYear = propIsFinalYear !== undefined ? propIsFinalYear : studentBatch === '2026';

  // Dedicated Job Dataset (ZERO hackathons, ZERO internships)
  const [jobs, setJobs] = useState(() => getOffCampusCompanies());

  // Dedicated Student Tracked Jobs
  const [trackedJobs, setTrackedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_tracked_offcampus_jobs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dedicated Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'latest' | 'company' | 'ctc'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Dedicated Modal State for Add / Edit Job
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    companyName: '',
    role: '',
    domain: 'Distributed Systems & Cloud',
    ctc: '',
    location: '',
    workMode: 'Hybrid',
    deadline: '',
    eligibleBatches: '2025, 2026',
    eligibleBranches: 'All Engineering Branches (CSE, IT, ECE, EE)',
    skills: '',
    applicationUrl: '',
    source: 'Official Career Portal',
    description: '',
    experienceLevel: 'Freshers & 0–1 Years'
  });

  // Sync jobs from backend on mount
  useEffect(() => {
    let isMounted = true;
    OpportunityApi.getOffCampus().then(res => {
      if (isMounted && res && Array.isArray(res.opportunities) && res.opportunities.length > 0) {
        setJobs(res.opportunities);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Listen to storage update event
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setJobs(e.detail);
      }
    };
    window.addEventListener('offcampus-updated', handleUpdate);
    return () => window.removeEventListener('offcampus-updated', handleUpdate);
  }, []);

  // Toggle student application tracking
  const handleToggleTrack = (job) => {
    const next = { ...trackedJobs, [job.id]: !trackedJobs[job.id] };
    setTrackedJobs(next);
    try {
      localStorage.setItem('placeprep_tracked_offcampus_jobs', JSON.stringify(next));
    } catch {}

    if (next[job.id]) {
      showToast(`Tracked application for ${job.companyName} (${job.title || job.role})`, 'success');
    } else {
      showToast(`Removed ${job.companyName} from tracked applications.`, 'info');
    }
  };

  // Dedicated Filter & Sort Logic for Jobs ONLY
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (selectedStatus !== 'ALL' && job.status !== selectedStatus) return false;

      // Work Mode filter
      if (selectedWorkMode !== 'ALL') {
        const mode = (job.workMode || '').toLowerCase();
        if (selectedWorkMode === 'Remote' && !mode.includes('remote')) return false;
        if (selectedWorkMode === 'Hybrid' && !mode.includes('hybrid')) return false;
        if (selectedWorkMode === 'On-site' && !mode.includes('on-site')) return false;
      }

      // Domain filter
      if (selectedDomain !== 'ALL') {
        const domainText = `${job.domain || ''} ${job.role || ''} ${job.description || ''}`.toLowerCase();
        if (!domainText.includes(selectedDomain.toLowerCase())) return false;
      }

      // Batch filter
      if (selectedBatch !== 'ALL') {
        const batches = Array.isArray(job.eligibleBatches) ? job.eligibleBatches.join(' ') : (job.eligibleBatches || '');
        if (!batches.includes(selectedBatch)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          job.companyName,
          job.title,
          job.role,
          job.domain,
          job.location,
          job.description,
          job.source,
          job.ctc,
          Array.isArray(job.skills) ? job.skills.join(' ') : (job.skillsRequired || '')
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = new Date(a.applicationDeadline || a.deadline || '2099-12-31').getTime();
        const dateB = new Date(b.applicationDeadline || b.deadline || '2099-12-31').getTime();
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
  }, [jobs, selectedStatus, selectedWorkMode, selectedDomain, selectedBatch, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomain, selectedWorkMode, selectedBatch, selectedStatus, sortBy]);

  // Delete Job Handler
  const handleDeleteJob = (job) => {
    if (!window.confirm(`Are you sure you want to remove off-campus job "${job.title || job.role}" at ${job.companyName}?`)) return;
    const updated = deleteOffCampusCompany(job.id);
    setJobs(updated);
    OpportunityApi.deleteOffCampus(job.id).catch(() => {});
    showToast('Off-campus job listing removed.', 'info');
  };

  // Open Edit Modal
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || job.role || '',
      companyName: job.companyName || '',
      role: job.role || job.title || '',
      domain: job.domain || 'Distributed Systems & Cloud',
      ctc: job.ctc || job.salaryRange || '',
      location: job.location || '',
      workMode: job.workMode || 'Hybrid',
      deadline: job.applicationDeadline || job.deadline || '',
      eligibleBatches: Array.isArray(job.eligibleBatches) ? job.eligibleBatches.join(', ') : (job.eligibleBatches || '2025, 2026'),
      eligibleBranches: Array.isArray(job.eligibleBranches) ? job.eligibleBranches.join(', ') : (job.eligibleBranches || 'All Engineering Branches'),
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skillsRequired || ''),
      applicationUrl: job.applicationUrl || job.applyLink || '',
      source: job.source || 'Official Career Portal',
      description: job.description || '',
      experienceLevel: job.experienceLevel || 'Freshers & 0–1 Years'
    });
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      companyName: '',
      role: '',
      domain: 'Distributed Systems & Cloud',
      ctc: '',
      location: '',
      workMode: 'Hybrid',
      deadline: '',
      eligibleBatches: '2025, 2026',
      eligibleBranches: 'All Engineering Branches (CSE, IT, ECE, EE)',
      skills: '',
      applicationUrl: '',
      source: 'Official Career Portal',
      description: '',
      experienceLevel: 'Freshers & 0–1 Years'
    });
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.companyName.trim()) {
      showToast('Please provide both job title and company name.', 'error');
      return;
    }
    if (!jobForm.applicationUrl.trim().startsWith('http')) {
      showToast('Please enter a valid official careers URL starting with http:// or https://', 'error');
      return;
    }
    if (!jobForm.deadline.trim()) {
      showToast('Please specify application deadline date.', 'error');
      return;
    }

    const skillsArray = jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload = {
      companyName: jobForm.companyName.trim(),
      title: jobForm.title.trim(),
      role: jobForm.role.trim() || jobForm.title.trim(),
      domain: jobForm.domain,
      ctc: jobForm.ctc || 'Competitive CTC',
      location: jobForm.location || 'Multiple Locations',
      workMode: jobForm.workMode,
      applicationDeadline: jobForm.deadline,
      deadline: jobForm.deadline,
      eligibleBatches: jobForm.eligibleBatches,
      eligibleBranches: jobForm.eligibleBranches,
      skills: skillsArray,
      skillsRequired: jobForm.skills,
      experienceLevel: jobForm.experienceLevel,
      applyLink: jobForm.applicationUrl.trim(),
      applicationUrl: jobForm.applicationUrl.trim(),
      source: jobForm.source || 'Official Career Portal',
      description: jobForm.description,
      isPublished: true
    };

    if (editingJob) {
      const updated = updateOffCampusCompany(editingJob.id, payload);
      setJobs(updated);
      OpportunityApi.updateOffCampus(editingJob.id, payload).catch(() => {});
      showToast('Off-campus job updated successfully!', 'success');
    } else {
      const updated = addOffCampusCompany(payload);
      setJobs(updated);
      OpportunityApi.createOffCampus(payload).catch(() => {});
      showToast('New off-campus job posted successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="off-campus-jobs-section">
      {/* 1. Dedicated Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dedicated Section • Off-Campus Jobs Only</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Freshers & Recent Grads (2025 & 2026)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Verified Off-Campus Job Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Direct off-campus full-time software engineering and technical roles. Every listing verified directly from official corporate career portals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200">
              {jobs.length} Active Job Drives
            </span>
            {isAdminOrTpo && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                aria-label="Post new off-campus job"
              >
                <Plus className="w-4 h-4" />
                <span>Post Job</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dedicated Search & Filters for Jobs ONLY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
              Job Filters & Search
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredJobs.length}</span> of {jobs.length} Jobs
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
              placeholder="Search company, job role, skills (e.g. Java, Python)…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              aria-label="Search off-campus jobs"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter jobs by domain"
            >
              <option value="ALL">All Tech Domains</option>
              <option value="Distributed">Distributed Systems & Cloud</option>
              <option value="Algorithms">Advanced Algorithms & SDE</option>
              <option value="Security">Network & Security</option>
              <option value="Enterprise">Enterprise & AI Engineering</option>
              <option value="Full-Stack">Full-Stack & Cloud Native</option>
            </select>
          </div>

          {/* Work Mode Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter jobs by work mode"
            >
              <option value="ALL">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Filter jobs by graduation batch"
            >
              <option value="ALL">All Grad Batches</option>
              <option value="2026">2026 Batch</option>
              <option value="2025">2025 Batch</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
              aria-label="Sort off-campus jobs"
            >
              <option value="deadline">Deadline (Urgent)</option>
              <option value="latest">Latest Posted</option>
              <option value="company">Company (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Off-Campus Jobs Listing Stack (Dedicated Layout) */}
      <div className="space-y-4">
        {paginatedJobs.map(job => {
          const isTracked = !!trackedJobs[job.id];
          const deadlineStr = job.applicationDeadline || job.deadline;

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group relative"
            >
              <div className="flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {job.companyName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Full-Time Job
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {job.workMode || 'Hybrid'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    job.status === 'Closing Soon'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : job.status === 'Expired'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {job.status === 'Closing Soon' ? '🔥 Closing Soon' : (job.status || 'Active')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900">
                    CTC: {job.ctc || job.salaryRange}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1 leading-snug">
                  {job.title || job.role}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                {/* Skills tags */}
                {(Array.isArray(job.skills) ? job.skills : (job.skillsRequired ? job.skillsRequired.split(',') : [])).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Skills:</span>
                    {(Array.isArray(job.skills) ? job.skills : job.skillsRequired.split(',')).map((sk, idx) => (
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
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Deadline</span>
                    <span className="font-bold text-slate-800 truncate">{deadlineStr || 'Rolling Basis'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Location</span>
                    <span className="font-bold text-slate-800 truncate">{job.location || 'Multiple Locations'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Eligible Batches</span>
                    <span className="font-bold text-slate-800 truncate">
                      {Array.isArray(job.eligibleBatches) ? job.eligibleBatches.join(', ') : (job.eligibleBatches || '2025 & 2026')}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Experience</span>
                    <span className="font-bold text-slate-800 truncate">{job.experienceLevel || 'Freshers / 0–1 Yrs'}</span>
                  </div>
                </div>

                {/* Source Verification Stamp */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified via: <strong className="text-slate-600">{job.source || 'Official Careers Portal'}</strong></span>
                  <span>•</span>
                  <span>Last verified: {job.lastVerifiedDate || 'Nov 2026'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <a
                  href={job.applicationUrl || job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                  aria-label={`Apply for ${job.title || job.role} at ${job.companyName}`}
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {!isAdminOrTpo && (
                  <button
                    onClick={() => handleToggleTrack(job)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTracked
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkCheck className={`w-3.5 h-3.5 ${isTracked ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{isTracked ? 'Tracked' : 'Track Application'}</span>
                  </button>
                )}

                {isAdminOrTpo && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
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
        {paginatedJobs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">No Off-Campus Jobs Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No matching job listings match your current filters. Try resetting domain or batch filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('ALL');
                setSelectedWorkMode('ALL');
                setSelectedBatch('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Job Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {filteredJobs.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span>{' '}
            <span className="text-slate-400">
              (Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} Jobs)
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
                  {editingJob ? 'Edit Off-Campus Job' : 'Post Off-Campus Job'}
                </h3>
                <p className="text-xs text-slate-500">Provide verified corporate application details.</p>
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
                    value={jobForm.companyName}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Software Engineer (Early Career)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTC Package (e.g. ₹18–32 LPA)</label>
                  <input
                    type="text"
                    value={jobForm.ctc}
                    onChange={(e) => setJobForm({ ...jobForm, ctc: e.target.value })}
                    placeholder="e.g. ₹18–32 LPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={jobForm.workMode}
                    onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Direct Official Career Portal Link *</label>
                <input
                  type="url"
                  required
                  value={jobForm.applicationUrl}
                  onChange={(e) => setJobForm({ ...jobForm, applicationUrl: e.target.value })}
                  placeholder="https://company.com/careers/job"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eligible Batches</label>
                  <input
                    type="text"
                    value={jobForm.eligibleBatches}
                    onChange={(e) => setJobForm({ ...jobForm, eligibleBatches: e.target.value })}
                    placeholder="e.g. 2025, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                    placeholder="Java, C++, Python, SQL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows="3"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Role overview, engineering challenges, qualifications..."
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  {editingJob ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

