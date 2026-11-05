import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Search,
  Filter,
  ExternalLink,
  Calendar,
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
  Trophy,
  Users,
  Flame,
  Globe
} from 'lucide-react';
import {
  getHackathons,
  addHackathon,
  updateHackathon,
  deleteHackathon,
  getCurrentUser
} from '../../services/storage';
import { OpportunityApi } from '../../services/api';

export default function HackathonsSection({
  userRole: propUserRole,
  showToast = () => {},
  onNavigate
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const userRole = (propUserRole || currentUser?.role || 'student').toLowerCase();
  const isAdminOrTpo = ['admin', 'director', 'tpo', 'coordinator'].includes(userRole);

  // Dedicated Hackathons Dataset (ZERO jobs, ZERO internships)
  const [hackathons, setHackathons] = useState(() => getHackathons());

  // Dedicated Student Bookmarked Hackathons
  const [bookmarkedHacks, setBookmarkedHacks] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_bookmarked_hackathons');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dedicated Search & Filter States requested explicitly by user:
  // Domains: AI/ML, Web Development, Blockchain, Cybersecurity, Cloud Computing, IoT, Open Innovation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState('ALL'); // Online, Offline, Hybrid
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // Upcoming, Active / Registration Open, Closing Soon, Completed / Expired
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'eventDate' | 'organizer' | 'prize'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Dedicated Modal State for Add / Edit Hackathon
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHack, setEditingHack] = useState(null);
  const [hackForm, setHackForm] = useState({
    title: '',
    organizer: '',
    problemStatement: '',
    domain: 'AI/ML',
    mode: 'Online',
    prizePool: '₹1,00,000 per problem statement',
    rewards: '',
    teamSize: '1–4 Members',
    registrationStartDate: '',
    registrationDeadline: '',
    eventDate: '',
    eligibilityCriteria: 'All regular undergraduate and postgraduate engineering & polytechnic students',
    registrationUrl: '',
    source: 'Official Organizer Portal'
  });

  // Sync hackathons from backend on mount
  useEffect(() => {
    let isMounted = true;
    OpportunityApi.getHackathons().then(res => {
      if (isMounted && Array.isArray(res) && res.length > 0) {
        setHackathons(res);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Listen to storage update event
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setHackathons(e.detail);
      }
    };
    window.addEventListener('hackathons-updated', handleUpdate);
    return () => window.removeEventListener('hackathons-updated', handleUpdate);
  }, []);

  // Toggle student hackathon bookmarking
  const handleToggleBookmark = (hack) => {
    const next = { ...bookmarkedHacks, [hack.id]: !bookmarkedHacks[hack.id] };
    setBookmarkedHacks(next);
    try {
      localStorage.setItem('placeprep_bookmarked_hackathons', JSON.stringify(next));
    } catch {}

    if (next[hack.id]) {
      showToast(`Bookmarked "${hack.title}" in your hackathon calendar!`, 'success');
    } else {
      showToast(`Removed "${hack.title}" from bookmarks.`, 'info');
    }
  };

  // Dedicated Filter & Sort Logic for Hackathons ONLY
  const filteredHackathons = useMemo(() => {
    return hackathons.filter(hack => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        const s = (hack.status || '').toLowerCase();
        if (selectedStatus === 'Closing Soon' && !s.includes('closing')) return false;
        if (selectedStatus === 'Active' && !s.includes('active') && !s.includes('open')) return false;
        if (selectedStatus === 'Expired' && !s.includes('expired') && !s.includes('closed')) return false;
        if (selectedStatus === 'Upcoming' && !s.includes('upcoming')) return false;
      }

      // Format / Mode filter (Online, Offline, Hybrid)
      if (selectedFormat !== 'ALL') {
        const mode = (hack.mode || hack.format || '').toLowerCase();
        if (selectedFormat === 'Online' && !mode.includes('online') && !mode.includes('virtual')) return false;
        if (selectedFormat === 'Offline' && !mode.includes('offline') && !mode.includes('in-person')) return false;
        if (selectedFormat === 'Hybrid' && !mode.includes('hybrid')) return false;
      }

      // Specific Domains Filter:
      // AI/ML, Web Development, Blockchain, Cybersecurity, Cloud Computing, IoT, Open Innovation
      if (selectedDomain !== 'ALL') {
        const domainsHaystack = [
          Array.isArray(hack.domains) ? hack.domains.join(' ') : (hack.domains || ''),
          hack.tags || '',
          hack.problemStatement || '',
          hack.title || ''
        ].join(' ').toLowerCase();

        if (selectedDomain === 'AI/ML' && !domainsHaystack.includes('ai') && !domainsHaystack.includes('ml') && !domainsHaystack.includes('learning')) return false;
        if (selectedDomain === 'Web Development' && !domainsHaystack.includes('web') && !domainsHaystack.includes('full stack')) return false;
        if (selectedDomain === 'Blockchain' && !domainsHaystack.includes('blockchain') && !domainsHaystack.includes('web3') && !domainsHaystack.includes('ethereum') && !domainsHaystack.includes('crypto')) return false;
        if (selectedDomain === 'Cybersecurity' && !domainsHaystack.includes('cyber') && !domainsHaystack.includes('security')) return false;
        if (selectedDomain === 'Cloud Computing' && !domainsHaystack.includes('cloud') && !domainsHaystack.includes('aws') && !domainsHaystack.includes('azure')) return false;
        if (selectedDomain === 'IoT' && !domainsHaystack.includes('iot') && !domainsHaystack.includes('robotics') && !domainsHaystack.includes('hardware')) return false;
        if (selectedDomain === 'Open Innovation' && !domainsHaystack.includes('innovation') && !domainsHaystack.includes('sustainable') && !domainsHaystack.includes('governance')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          hack.title,
          hack.organizer,
          hack.problemStatement,
          hack.description,
          hack.tags,
          hack.source,
          hack.prizePool,
          hack.mode,
          Array.isArray(hack.domains) ? hack.domains.join(' ') : (hack.domains || '')
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = new Date(a.registrationDeadline || '2099-12-31').getTime();
        const dateB = new Date(b.registrationDeadline || '2099-12-31').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'eventDate') {
        const dateA = new Date(a.eventDate || '2099-12-31').getTime();
        const dateB = new Date(b.eventDate || '2099-12-31').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'organizer') {
        return (a.organizer || '').localeCompare(b.organizer || '');
      }
      return 0;
    });
  }, [hackathons, selectedStatus, selectedFormat, selectedDomain, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredHackathons.length / ITEMS_PER_PAGE) || 1;
  const paginatedHackathons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHackathons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHackathons, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomain, selectedFormat, selectedStatus, sortBy]);

  // Delete Hackathon Handler
  const handleDeleteHackathon = (hack) => {
    if (!window.confirm(`Are you sure you want to remove hackathon "${hack.title}"?`)) return;
    const updated = deleteHackathon(hack.id);
    setHackathons(updated);
    OpportunityApi.deleteHackathon(hack.id).catch(() => {});
    showToast('Hackathon listing removed.', 'info');
  };

  // Open Edit Modal
  const handleOpenEdit = (hack) => {
    setEditingHack(hack);
    setHackForm({
      title: hack.title || '',
      organizer: hack.organizer || '',
      problemStatement: hack.problemStatement || hack.description || '',
      domain: Array.isArray(hack.domains) ? hack.domains.join(', ') : (hack.tags || 'AI/ML, Web3'),
      mode: hack.mode || 'Online',
      prizePool: hack.prizePool || '',
      rewards: hack.rewards || '',
      teamSize: hack.teamSize || '1–4 Members',
      registrationStartDate: hack.registrationStartDate || '',
      registrationDeadline: hack.registrationDeadline || '',
      eventDate: hack.eventDate || '',
      eligibilityCriteria: hack.eligibilityCriteria || 'All regular undergraduate and postgraduate engineering students',
      registrationUrl: hack.registrationUrl || '',
      source: hack.source || 'Official Organizer Portal'
    });
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingHack(null);
    setHackForm({
      title: '',
      organizer: '',
      problemStatement: '',
      domain: 'AI/ML, Cloud Computing',
      mode: 'Online',
      prizePool: '₹1,00,000 per problem statement',
      rewards: '',
      teamSize: '1–4 Members',
      registrationStartDate: '',
      registrationDeadline: '',
      eventDate: '',
      eligibilityCriteria: 'All regular undergraduate and postgraduate engineering students across India',
      registrationUrl: '',
      source: 'Official Organizer Portal'
    });
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!hackForm.title.trim() || !hackForm.organizer.trim()) {
      showToast('Please provide both hackathon title and organizer name.', 'error');
      return;
    }
    if (!hackForm.registrationUrl.trim().startsWith('http')) {
      showToast('Please enter a valid official registration link starting with http:// or https://', 'error');
      return;
    }
    if (!hackForm.registrationDeadline.trim()) {
      showToast('Please specify registration deadline date.', 'error');
      return;
    }

    const domainsArray = hackForm.domain ? hackForm.domain.split(',').map(s => s.trim()).filter(Boolean) : ['General Tech'];

    const payload = {
      title: hackForm.title.trim(),
      organizer: hackForm.organizer.trim(),
      problemStatement: hackForm.problemStatement.trim(),
      description: hackForm.problemStatement.trim(),
      domains: domainsArray,
      tags: hackForm.domain,
      mode: hackForm.mode,
      prizePool: hackForm.prizePool || 'Cash Prizes & Certificates',
      rewards: hackForm.rewards,
      teamSize: hackForm.teamSize,
      registrationStartDate: hackForm.registrationStartDate,
      registrationDeadline: hackForm.registrationDeadline,
      eventDate: hackForm.eventDate,
      eligibilityCriteria: hackForm.eligibilityCriteria,
      registrationUrl: hackForm.registrationUrl.trim(),
      source: hackForm.source || 'Official Organizer Portal',
      isPublished: true
    };

    if (editingHack) {
      const updated = updateHackathon(editingHack.id, payload);
      setHackathons(updated);
      OpportunityApi.updateHackathon(editingHack.id, payload).catch(() => {});
      showToast('Hackathon updated successfully!', 'success');
    } else {
      const updated = addHackathon(payload);
      setHackathons(updated);
      OpportunityApi.createHackathon(payload).catch(() => {});
      showToast('New hackathon posted successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="hackathons-section">
      {/* 1. Dedicated Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Dedicated Section • Hackathons Only</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                National, Tech Giants & Web3
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              National & Campus Hackathons
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Compete in flagship challenges (Smart India Hackathon, Google Solution Challenge, Flipkart GRiD, Imagine Cup, ETHIndia) to win cash prizes and direct PPI/PPO interview fast-tracks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200">
              {hackathons.length} Active Challenges
            </span>
            {isAdminOrTpo && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                aria-label="Post new hackathon"
              >
                <Plus className="w-4 h-4" />
                <span>Post Hackathon</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dedicated Search & Filters for Hackathons ONLY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
              Hackathon Filters & Domains
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredHackathons.length}</span> of {hackathons.length} Hackathons
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
              placeholder="Search hackathon, organizer, theme (e.g. SIH, GenAI, Web3)…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white transition"
              aria-label="Search hackathons"
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

          {/* Explicit User Requested Domain Filters: AI/ML, Web Dev, Blockchain, Cyber, Cloud, IoT, Open Innovation */}
          <div className="md:col-span-3">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-purple-500 focus:bg-white cursor-pointer"
              aria-label="Filter hackathons by domain"
            >
              <option value="ALL">All Tech Domains</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="Blockchain">Blockchain & Web3</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="IoT">IoT & Robotics</option>
              <option value="Open Innovation">Open Innovation</option>
            </select>
          </div>

          {/* Format / Mode Filter: Online, Offline, Hybrid */}
          <div className="md:col-span-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-purple-500 focus:bg-white cursor-pointer"
              aria-label="Filter hackathons by format"
            >
              <option value="ALL">All Formats</option>
              <option value="Online">Online / Virtual</option>
              <option value="Offline">In-Person / Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-purple-500 focus:bg-white cursor-pointer"
              aria-label="Filter hackathons by registration status"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Registration Open</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Expired">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-purple-500 focus:bg-white cursor-pointer"
              aria-label="Sort hackathons"
            >
              <option value="deadline">Registration Deadline</option>
              <option value="eventDate">Event Date</option>
              <option value="organizer">Organizer (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Hackathons Listing Stack (Dedicated Layout) */}
      <div className="space-y-4">
        {paginatedHackathons.map(hack => {
          const isBookmarked = !!bookmarkedHacks[hack.id];

          return (
            <div
              key={hack.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-purple-500 hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group relative"
            >
              <div className="flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-purple-700 transition-colors">
                    {hack.organizer}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Hackathon
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {hack.mode || 'Online'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    hack.status === 'Closing Soon'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : hack.status === 'Expired'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {hack.status === 'Closing Soon' ? '🔥 Closing Soon' : (hack.status || 'Active')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Prize Pool: {hack.prizePool}</span>
                  </span>
                </div>

                {/* Hackathon Title */}
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1 leading-snug">
                  {hack.title}
                </h3>

                {/* Problem Statement / Theme */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed line-clamp-2">
                  {hack.problemStatement || hack.description}
                </p>

                {/* Domains / Tags Pills */}
                {(Array.isArray(hack.domains) ? hack.domains : (hack.tags ? hack.tags.split(',') : [])).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Domains:</span>
                    {(Array.isArray(hack.domains) ? hack.domains : hack.tags.split(',')).map((dm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-semibold"
                      >
                        {typeof dm === 'string' ? dm.trim() : dm}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Reg Deadline</span>
                    <span className="font-bold text-slate-800 truncate">{hack.registrationDeadline}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Event Date</span>
                    <span className="font-bold text-slate-800 truncate">{hack.eventDate || 'TBA'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Team Rules</span>
                    <span className="font-bold text-slate-800 truncate">{hack.teamSize || '1–4 Members'}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Format</span>
                    <span className="font-bold text-slate-800 truncate">{hack.mode || 'Online / Hybrid'}</span>
                  </div>
                </div>

                {/* Source Verification Stamp */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified platform: <strong className="text-slate-600">{hack.source || 'Official Organizer'}</strong></span>
                  <span>•</span>
                  <span>Last verified: {hack.lastVerifiedDate || 'Nov 2026'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <a
                  href={hack.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                  aria-label={`Register for ${hack.title}`}
                >
                  <span>Register Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {!isAdminOrTpo && (
                  <button
                    onClick={() => handleToggleBookmark(hack)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isBookmarked
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookmarkCheck className={`w-3.5 h-3.5 ${isBookmarked ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Hackathon'}</span>
                  </button>
                )}

                {isAdminOrTpo && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => handleOpenEdit(hack)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteHackathon(hack)}
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
        {paginatedHackathons.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">No Hackathons Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No matching hackathon challenges found for your selected domain or format. Try resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('ALL');
                setSelectedFormat('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Hackathon Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {filteredHackathons.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span>{' '}
            <span className="text-slate-400">
              (Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredHackathons.length)} of {filteredHackathons.length} Hackathons)
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
                  {editingHack ? 'Edit Hackathon Challenge' : 'Post Hackathon Challenge'}
                </h3>
                <p className="text-xs text-slate-500">Provide official hackathon registration details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hackathon Name *</label>
                  <input
                    type="text"
                    required
                    value={hackForm.title}
                    onChange={(e) => setHackForm({ ...hackForm, title: e.target.value })}
                    placeholder="e.g. Smart India Hackathon 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organizer *</label>
                  <input
                    type="text"
                    required
                    value={hackForm.organizer}
                    onChange={(e) => setHackForm({ ...hackForm, organizer: e.target.value })}
                    placeholder="e.g. AICTE / Ministry of Education"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prize Pool</label>
                  <input
                    type="text"
                    value={hackForm.prizePool}
                    onChange={(e) => setHackForm({ ...hackForm, prizePool: e.target.value })}
                    placeholder="e.g. ₹1,00,000 per problem statement"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Deadline *</label>
                  <input
                    type="date"
                    required
                    value={hackForm.registrationDeadline}
                    onChange={(e) => setHackForm({ ...hackForm, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format / Mode</label>
                  <select
                    value={hackForm.mode}
                    onChange={(e) => setHackForm({ ...hackForm, mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Online">Online / Virtual</option>
                    <option value="Offline">In-Person / Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Team Size & Rules</label>
                  <input
                    type="text"
                    value={hackForm.teamSize}
                    onChange={(e) => setHackForm({ ...hackForm, teamSize: e.target.value })}
                    placeholder="e.g. Team of 6 (Min 1 female)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Registration Link *</label>
                <input
                  type="url"
                  required
                  value={hackForm.registrationUrl}
                  onChange={(e) => setHackForm({ ...hackForm, registrationUrl: e.target.value })}
                  placeholder="https://sih.gov.in/ or https://devfolio.co/hackathons"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Dates</label>
                  <input
                    type="text"
                    value={hackForm.eventDate}
                    onChange={(e) => setHackForm({ ...hackForm, eventDate: e.target.value })}
                    placeholder="e.g. Dec 18–20, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domains (Comma separated)</label>
                  <input
                    type="text"
                    value={hackForm.domain}
                    onChange={(e) => setHackForm({ ...hackForm, domain: e.target.value })}
                    placeholder="AI/ML, Web Development, Blockchain, IoT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Problem Statement / Theme</label>
                <textarea
                  rows="3"
                  value={hackForm.problemStatement}
                  onChange={(e) => setHackForm({ ...hackForm, problemStatement: e.target.value })}
                  placeholder="Themes, problem statements, technology requirements..."
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
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  {editingHack ? 'Save Changes' : 'Publish Hackathon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

