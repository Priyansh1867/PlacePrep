import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  Layers,
  History,
  Archive,
  RefreshCw,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Check,
  Maximize2,
  Minimize2,
  Info,
  CalendarCheck,
  BookOpen,
  Building,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const SESSIONS = ['2026-2027', '2025-2026', '2024-2025', '2027-2028'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'All Departments'
];
const SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8', 'All Semesters'
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All Years'];
const SECTIONS = ['All Sections', 'Section A', 'Section B', 'Section C', 'Section D'];

export default function MasterTimetableManagement({ currentUser }) {
  // Stats
  const [stats, setStats] = useState({
    totalTimetables: 0,
    publishedTimetables: 0,
    draftTimetables: 0,
    archivedTimetables: 0,
    lastUpdated: null
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // List & pagination
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Search & filters
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortDir, setSortDir] = useState('desc');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, item: null, title: '', message: '' });

  // Selected item state
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewTabularData, setPreviewTabularData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Forms
  const [uploadForm, setUploadForm] = useState({
    title: '',
    academicSession: '2026-2027',
    department: 'Computer Science & Engineering',
    branch: 'CSE',
    semester: 'Semester 5',
    academicYear: '3rd Year',
    section: 'All Sections',
    effectiveStartDate: '',
    effectiveEndDate: '',
    description: '',
    status: 'DRAFT',
    file: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replaceForm, setReplaceForm] = useState({ file: null, changeSummary: '' });

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  };

  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await MasterTimetableApi.getStats();
      if (data) setStats(data);
    } catch (err) {
      console.warn('Timetable stats fetch error:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch list
  const fetchTimetables = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MasterTimetableApi.getTimetables({
        search,
        academicSession: selectedSession,
        branch: selectedBranch,
        semester: selectedSemester,
        year: selectedYear,
        section: selectedSection,
        status: selectedStatus,
        page,
        size: 10,
        sortBy,
        sortDir
      });

      if (data && data.content) {
        setTimetables(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setTimetables(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setTimetables([]);
      }
    } catch (err) {
      console.warn('Timetables fetch error:', err.message);
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSession, selectedBranch, selectedSemester, selectedYear, selectedSection, selectedStatus, page, sortBy, sortDir]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTimetables();
  }, [fetchTimetables]);

  // Debounced search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedSession('');
    setSelectedBranch('');
    setSelectedSemester('');
    setSelectedYear('');
    setSelectedSection('');
    setSelectedStatus('ALL');
    setPage(0);
  };

  // File selection
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setUploadForm(prev => ({ ...prev, file: dropped }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.file) {
      showToast('Please provide a title and select a timetable file.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('academicSession', uploadForm.academicSession);
    formData.append('department', uploadForm.department);
    formData.append('branch', uploadForm.branch || uploadForm.department.substring(0, 4));
    formData.append('semester', uploadForm.semester);
    formData.append('academicYear', uploadForm.academicYear);
    formData.append('section', uploadForm.section || 'All Sections');
    if (uploadForm.effectiveStartDate) formData.append('effectiveStartDate', uploadForm.effectiveStartDate);
    if (uploadForm.effectiveEndDate) formData.append('effectiveEndDate', uploadForm.effectiveEndDate);
    if (uploadForm.description) formData.append('description', uploadForm.description);
    formData.append('status', uploadForm.status);
    formData.append('file', uploadForm.file);

    try {
      setUploadProgress(65);
      await MasterTimetableApi.createTimetable(formData);
      setUploadProgress(100);
      showToast('Master Timetable uploaded successfully!', 'success');
      setIsUploadModalOpen(false);
      setUploadForm({
        title: '',
        academicSession: '2026-2027',
        department: 'Computer Science & Engineering',
        branch: 'CSE',
        semester: 'Semester 5',
        academicYear: '3rd Year',
        section: 'All Sections',
        effectiveStartDate: '',
        effectiveEndDate: '',
        description: '',
        status: 'DRAFT',
        file: null
      });
      fetchStats();
      fetchTimetables();
    } catch (err) {
      showToast(err.message || 'Failed to upload timetable.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Edit metadata handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await MasterTimetableApi.updateMetadata(selectedItem.id, selectedItem);
      showToast('Timetable metadata updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to update timetable metadata.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace file handler
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !replaceForm.file) {
      showToast('Please select a new timetable document.', 'error');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', replaceForm.file);
    if (replaceForm.changeSummary) formData.append('changeSummary', replaceForm.changeSummary);

    try {
      await MasterTimetableApi.replaceFile(selectedItem.id, formData);
      showToast('Timetable document replaced and version archived!', 'success');
      setIsReplaceModalOpen(false);
      setReplaceForm({ file: null, changeSummary: '' });
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to replace timetable document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publication workflows
  const handlePublish = async (item) => {
    try {
      await MasterTimetableApi.publishTimetable(item.id);
      showToast(`Timetable "${item.title}" is now published and accessible to students.`, 'success');
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to publish timetable.', 'error');
    }
  };

  const handleUnpublish = async (item) => {
    try {
      await MasterTimetableApi.unpublishTimetable(item.id);
      showToast(`Timetable "${item.title}" moved back to Draft.`, 'info');
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to unpublish timetable.', 'error');
    }
  };

  const handleArchive = async (item) => {
    try {
      await MasterTimetableApi.archiveTimetable(item.id);
      showToast(`Timetable "${item.title}" archived.`, 'info');
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to archive timetable.', 'error');
    }
  };

  const handleDelete = async (item) => {
    try {
      await MasterTimetableApi.deleteTimetable(item.id);
      showToast(`Timetable "${item.title}" removed permanently.`, 'info');
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete timetable.', 'error');
    }
  };

  // Preview loader
  const handleOpenPreview = async (item) => {
    setSelectedItem(item);
    setIsPreviewModalOpen(true);
    setPreviewTabularData(null);

    const isTabular = item.fileName && (
      item.fileName.toLowerCase().endsWith('.xlsx') ||
      item.fileName.toLowerCase().endsWith('.xls') ||
      item.fileName.toLowerCase().endsWith('.csv')
    );

    if (isTabular) {
      setPreviewLoading(true);
      try {
        const res = await MasterTimetableApi.getPreviewData(item.id);
        if (res && res.rows) setPreviewTabularData(res);
      } catch (err) {
        console.warn('Tabular preview fetch error:', err.message);
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  // Version history loader
  const handleOpenVersionHistory = async (item) => {
    setSelectedItem(item);
    setIsVersionModalOpen(true);
    setLoadingVersions(true);
    try {
      const list = await MasterTimetableApi.getVersionHistory(item.id);
      setVersionHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Version history error:', err.message);
      setVersionHistory([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restore past version
  const handleRestoreVersion = async (version) => {
    if (!selectedItem) return;
    if (!window.confirm(`Are you sure you want to restore Version ${version.versionNumber}? This will make it the active timetable document.`)) return;

    try {
      await MasterTimetableApi.restoreVersion(selectedItem.id, version.id);
      showToast(`Version ${version.versionNumber} restored as the active timetable.`, 'success');
      setIsVersionModalOpen(false);
      fetchTimetables();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to restore version.', 'error');
    }
  };

  // Helper for format icons
  const getFormatIcon = (fileName = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      return <ImageIcon className="w-4 h-4 text-sky-500" />;
    }
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Archive className="w-3 h-3 text-purple-500" />
            Archived
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#111439]">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : toast.type === 'info'
            ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Top Overview Cards (KPIs) ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => { setSelectedStatus('ALL'); setPage(0); }}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Timetables</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {statsLoading ? '…' : stats.totalTimetables}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Records</span>
          </div>
        </div>

        {/* Published */}
        <div
          onClick={() => { setSelectedStatus('PUBLISHED'); setPage(0); }}
          className="bg-white rounded-2xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {statsLoading ? '…' : stats.publishedTimetables}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Live to Students</span>
          </div>
        </div>

        {/* Draft */}
        <div
          onClick={() => { setSelectedStatus('DRAFT'); setPage(0); }}
          className="bg-white rounded-2xl border border-amber-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Draft Mode</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {statsLoading ? '…' : stats.draftTimetables}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">In Preparation</span>
          </div>
        </div>

        {/* Archived */}
        <div
          onClick={() => { setSelectedStatus('ARCHIVED'); setPage(0); }}
          className="bg-white rounded-2xl border border-purple-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Archived</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-700">
              {statsLoading ? '…' : stats.archivedTimetables}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">Historical</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Last Activity</span>
            <RefreshCw
              onClick={() => { fetchStats(); fetchTimetables(); }}
              className="w-4 h-4 text-indigo-300 hover:text-white cursor-pointer transition transform hover:rotate-180"
              title="Refresh Stats & Timetables"
            />
          </div>
          <div className="mt-2">
            <span className="text-xs font-semibold text-slate-300 block">Synchronized At</span>
            <span className="text-sm font-black text-white mt-0.5 block truncate">
              {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() + ' ' + new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Controls & Actions Bar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by timetable title, department, or branch..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Master Timetable</span>
          </button>

          <button
            onClick={() => { fetchStats(); fetchTimetables(); }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Pills Bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Multi-Criteria Filters</span>
          </div>
          {(selectedSession || selectedBranch || selectedSemester || selectedYear || selectedSection || selectedStatus !== 'ALL' || search) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Academic Session */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => { setSelectedSession(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Sessions</option>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Branch / Department */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => { setSelectedBranch(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Branches</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => { setSelectedSemester(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setPage(0); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Timetable Management Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Master Academic Timetable Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {timetables.length} of {totalElements} official timetable documents
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading master timetables from database…</p>
          </div>
        ) : timetables.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">No Timetables Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                No timetable records match your current search and filters. Upload an official timetable document to get started.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload First Master Timetable</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3 px-4">Timetable Name</th>
                  <th className="py-3 px-3">Session</th>
                  <th className="py-3 px-3">Branch & Year</th>
                  <th className="py-3 px-3">Section</th>
                  <th className="py-3 px-3">Effective</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timetables.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Name & format */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                          {getFormatIcon(item.fileName)}
                        </div>
                        <div className="min-w-0">
                          <span
                            onClick={() => handleOpenPreview(item)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer truncate block max-w-xs"
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate font-mono">
                            {item.fileName || 'No file attached'} {item.fileSize ? `(${formatFileSize(item.fileSize)})` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Session */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {item.academicSession || '2026-2027'}
                    </td>

                    {/* Branch & Year */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block truncate max-w-[140px]">{item.branch || item.department}</span>
                      <span className="text-[10px] text-slate-500 block">{item.semester} • {item.academicYear}</span>
                    </td>

                    {/* Section */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {item.section || 'All Sections'}
                      </span>
                    </td>

                    {/* Effective Dates */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-600">
                      {item.effectiveStartDate ? (
                        <>
                          <span>{item.effectiveStartDate}</span>
                          {item.effectiveEndDate && <span className="block text-[10px] text-slate-400">to {item.effectiveEndDate}</span>}
                        </>
                      ) : (
                        <span className="text-slate-400">Immediate</span>
                      )}
                    </td>

                    {/* Version & History */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleOpenVersionHistory(item)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition cursor-pointer"
                        title="View Version History"
                      >
                        <History className="w-3 h-3" />
                        <span>v{item.version || 1}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Uploaded By */}
                    <td className="py-3.5 px-3 text-[11px]">
                      <span className="font-semibold text-slate-800 block truncate max-w-[120px]">{item.uploadedBy || 'Management'}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View / Preview */}
                        <button
                          onClick={() => handleOpenPreview(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Preview Timetable"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit metadata */}
                        <button
                          onClick={() => { setSelectedItem({ ...item }); setIsEditModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Replace Document */}
                        <button
                          onClick={() => { setSelectedItem(item); setReplaceForm({ file: null, changeSummary: '' }); setIsReplaceModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                          title="Upload New Document Version"
                        >
                          <Upload className="w-4 h-4" />
                        </button>

                        {/* Publish / Unpublish */}
                        {item.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handleUnpublish(item)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Unpublish (Move to Draft)"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                            title="Publish to Students"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive */}
                        {item.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchive(item)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                            title="Archive Timetable"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${item.title}" and all its versions?`)) {
                              handleDelete(item);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Timetable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: Upload Master Timetable ─────────────────────────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Upload Master Timetable Document</h3>
                  <p className="text-xs text-slate-500">Supported: PDF, Excel (.xlsx, .xls), CSV, Images</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Timetable File <span className="text-rose-500">*</span>
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/20 hover:bg-teal-50/40 rounded-2xl p-6 text-center transition cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadForm.file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                        {getFormatIcon(uploadForm.file.name)}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-slate-900 block truncate max-w-sm">{uploadForm.file.name}</span>
                        <span className="text-xs text-slate-500">{formatFileSize(uploadForm.file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setUploadForm(p => ({ ...p, file: null })); }}
                        className="ml-2 text-rose-500 hover:text-rose-700 p-1 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-800">
                        Drag and drop timetable file here, or <span className="text-teal-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF, Excel (.xlsx, .xls), CSV, or Image (PNG, JPG) up to 25 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {isSubmitting && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-teal-700">
                    <span>Uploading and verifying document…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-teal-600 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Metadata Form Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Timetable Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Odd Semester 2026-2027 CSE Master Timetable"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Session <span className="text-rose-500">*</span></label>
                    <select
                      value={uploadForm.academicSession}
                      onChange={(e) => setUploadForm({ ...uploadForm, academicSession: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    >
                      {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department / Branch <span className="text-rose-500">*</span></label>
                    <select
                      value={uploadForm.department}
                      onChange={(e) => setUploadForm({ ...uploadForm, department: e.target.value, branch: e.target.value.substring(0, 4) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    >
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Semester <span className="text-rose-500">*</span></label>
                    <select
                      value={uploadForm.semester}
                      onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Year <span className="text-rose-500">*</span></label>
                    <select
                      value={uploadForm.academicYear}
                      onChange={(e) => setUploadForm({ ...uploadForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Section</label>
                    <select
                      value={uploadForm.section}
                      onChange={(e) => setUploadForm({ ...uploadForm, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    >
                      {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Effective Start Date</label>
                    <input
                      type="date"
                      value={uploadForm.effectiveStartDate}
                      onChange={(e) => setUploadForm({ ...uploadForm, effectiveStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Effective End Date</label>
                    <input
                      type="date"
                      value={uploadForm.effectiveEndDate}
                      onChange={(e) => setUploadForm({ ...uploadForm, effectiveEndDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Version Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Provide department context, venue details, or room allocation notes..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="DRAFT"
                        checked={uploadForm.status === 'DRAFT'}
                        onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value })}
                      />
                      <span>Save as Draft (Internal review only)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="PUBLISHED"
                        checked={uploadForm.status === 'PUBLISHED'}
                        onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value })}
                      />
                      <span className="font-bold text-emerald-700">Publish Immediately to Students</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadForm.file || !uploadForm.title}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading…' : 'Save & Register Timetable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Timetable Preview ───────────────────────────────────────── */}
      {isPreviewModalOpen && selectedItem && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150`}>
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col transition-all duration-200 ${
            isFullscreenPreview ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
          }`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-3xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  {getFormatIcon(selectedItem.fileName)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{selectedItem.title}</h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedItem.department} • {selectedItem.semester} • {selectedItem.section} • v{selectedItem.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={MasterTimetableApi.getFileUrl(selectedItem.id)}
                  download={selectedItem.fileName || 'timetable.pdf'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  title={isFullscreenPreview ? 'Exit Fullscreen' : 'Fullscreen Preview'}
                >
                  {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Preview Container */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Document Display */}
              <div className="flex-1 bg-slate-100 p-3 sm:p-4 overflow-auto flex items-center justify-center relative">
                {previewLoading ? (
                  <div className="text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Parsing document preview…</p>
                  </div>
                ) : previewTabularData && previewTabularData.rows && previewTabularData.rows.length > 0 ? (
                  /* Tabular Excel/CSV renderer */
                  <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-xs">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Spreadsheet Preview ({previewTabularData.sheetName || 'Sheet 1'})</span>
                      </span>
                      <span className="text-slate-400">{previewTabularData.rowCount} rows parsed</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <tbody>
                          {previewTabularData.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx === 0 ? 'bg-slate-100 font-bold border-b border-slate-200 text-slate-800' : 'hover:bg-slate-50 border-b border-slate-100'}
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 border-r border-slate-100 text-slate-700 whitespace-nowrap">
                                  {cell || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedItem.fileName && (selectedItem.fileName.toLowerCase().endsWith('.png') || selectedItem.fileName.toLowerCase().endsWith('.jpg') || selectedItem.fileName.toLowerCase().endsWith('.jpeg') || selectedItem.fileName.toLowerCase().endsWith('.webp')) ? (
                  /* Image preview */
                  <img
                    src={MasterTimetableApi.getFileUrl(selectedItem.id)}
                    alt={selectedItem.title}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                  />
                ) : (
                  /* PDF embedded iframe / object */
                  <iframe
                    src={MasterTimetableApi.getFileUrl(selectedItem.id)}
                    title={selectedItem.title}
                    className="w-full h-full rounded-xl border border-slate-200 shadow-xs bg-white"
                  />
                )}
              </div>

              {/* Metadata Sidebar */}
              <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-100 p-5 overflow-y-auto space-y-4 shrink-0 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Academic Session</span>
                    <span className="font-bold text-slate-900">{selectedItem.academicSession}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Department</span>
                    <span className="font-bold text-slate-900">{selectedItem.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Semester & Year</span>
                    <span className="font-bold text-slate-900">{selectedItem.semester} • {selectedItem.academicYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Section</span>
                    <span className="font-bold text-slate-900">{selectedItem.section}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Document File</span>
                    <span className="font-mono text-slate-700 block truncate">{selectedItem.fileName}</span>
                    <span className="text-slate-400">{formatFileSize(selectedItem.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Uploaded By</span>
                    <span className="font-semibold text-slate-800">{selectedItem.uploadedBy || 'Management'}</span>
                    <span className="text-slate-400 block text-[10px]">
                      {selectedItem.uploadedAt ? new Date(selectedItem.uploadedAt).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Notes / Description</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                {/* Quick actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {selectedItem.status !== 'PUBLISHED' ? (
                    <button
                      onClick={() => { handlePublish(selectedItem); setSelectedItem({ ...selectedItem, status: 'PUBLISHED' }); }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Publish Timetable</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { handleUnpublish(selectedItem); setSelectedItem({ ...selectedItem, status: 'DRAFT' }); }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Move to Draft</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsPreviewModalOpen(false); setReplaceForm({ file: null, changeSummary: '' }); setIsReplaceModalOpen(true); }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Version</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit Metadata ───────────────────────────────────────────── */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-600" />
                <span>Edit Timetable Metadata</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session</label>
                  <select
                    value={selectedItem.academicSession}
                    onChange={(e) => setSelectedItem({ ...selectedItem, academicSession: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={selectedItem.section}
                    onChange={(e) => setSelectedItem({ ...selectedItem, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={selectedItem.department}
                    onChange={(e) => setSelectedItem({ ...selectedItem, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={selectedItem.semester}
                    onChange={(e) => setSelectedItem({ ...selectedItem, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effective Start</label>
                  <input
                    type="date"
                    value={selectedItem.effectiveStartDate || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, effectiveStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effective End</label>
                  <input
                    type="date"
                    value={selectedItem.effectiveEndDate || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, effectiveEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Replace Document (Version Creation) ─────────────────────── */}
      {isReplaceModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Replace Timetable Document</h3>
                <p className="text-xs text-slate-500">Will archive current file as Version {selectedItem.version || 1}</p>
              </div>
              <button onClick={() => setIsReplaceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">New Document File *</label>
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setReplaceForm({ ...replaceForm, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Revision / Change Summary</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Swapped Wednesday DBMS lab to Thursday; faculty room updated."
                  value={replaceForm.changeSummary}
                  onChange={(e) => setReplaceForm({ ...replaceForm, changeSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Previous version will remain permanently accessible and restorable under <strong>Version History</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replaceForm.file}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Replacing…' : 'Upload & Create Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Version History ─────────────────────────────────────────── */}
      {isVersionModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Version History Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-sm">{selectedItem.title}</p>
              </div>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingVersions ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400 mt-2">Loading historical versions…</p>
              </div>
            ) : versionHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past revisions logged for this timetable.
              </div>
            ) : (
              <div className="space-y-3">
                {versionHistory.map((ver) => {
                  const isCurrent = ver.versionNumber === selectedItem.version;
                  return (
                    <div
                      key={ver.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isCurrent
                          ? 'border-indigo-300 bg-indigo-50/40'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            Version {ver.versionNumber}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                              Active Version
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={MasterTimetableApi.getVersionFileUrl(ver.id)}
                            download={ver.fileName || `timetable_v${ver.versionNumber}.pdf`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Download Version Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {!isCurrent && (
                            <button
                              onClick={() => handleRestoreVersion(ver)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          {getFormatIcon(ver.fileName)}
                          <span>{ver.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(ver.fileSize)}</span>
                        </div>
                        {ver.changeSummary && (
                          <p className="text-slate-700 font-medium italic text-[11px] bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                            "{ver.changeSummary}"
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Uploaded by: {ver.uploadedBy || 'Management'}</span>
                          <span>{ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
