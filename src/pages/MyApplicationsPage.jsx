import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Bot
} from 'lucide-react';
import { ApplicationApi } from '../services/api';
import { getCurrentUser } from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Dialog from '../components/ui/Dialog';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import PageHeader from '../components/ui/PageHeader';

const STATUS_COLORS = {
  INTERESTED: 'slate',
  APPLIED: 'indigo',
  ASSESSMENT: 'amber',
  INTERVIEW: 'violet',
  OFFER: 'emerald',
  REJECTED: 'rose',
  WITHDRAWN: 'slate'
};

const STATUS_LABELS = {
  INTERESTED: 'Bookmarked / Interested',
  APPLIED: 'Applied',
  ASSESSMENT: 'OA / Online Test',
  INTERVIEW: 'Interview Scheduled',
  OFFER: 'Offer Received 🎉',
  REJECTED: 'Archived / Rejected',
  WITHDRAWN: 'Withdrawn'
};

export default function MyApplicationsPage({ onNavigate, onSelectCompany, onOpenAuthModal }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status update dialog state
  const [updatingApp, setUpdatingApp] = useState(null);
  const [newStatus, setNewStatus] = useState('APPLIED');
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // New Application dialog state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    companyName: '',
    roleTitle: '',
    driveId: '',
    status: 'APPLIED',
    notes: ''
  });
  const [addingApp, setAddingApp] = useState(false);

  const currentUser = getCurrentUser();

  const fetchApplications = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ApplicationApi.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentUser?.email]);

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingApp) return;
    setSavingStatus(true);
    try {
      const updated = await ApplicationApi.updateStatus(updatingApp.id, newStatus, statusNotes);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setUpdatingApp(null);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleWithdraw = async (id, companyName) => {
    if (!window.confirm(`Are you sure you want to remove the tracking record for ${companyName}?`)) {
      return;
    }
    try {
      await ApplicationApi.withdraw(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to remove application: ' + err.message);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.companyName.trim() || !addForm.roleTitle.trim()) {
      alert('Company name and role are required');
      return;
    }
    setAddingApp(true);
    try {
      const created = await ApplicationApi.trackApplication({
        companyName: addForm.companyName.trim(),
        roleTitle: addForm.roleTitle.trim(),
        driveId: addForm.driveId.trim() || null,
        status: addForm.status,
        notes: addForm.notes.trim()
      });
      setApplications(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setAddForm({ companyName: '', roleTitle: '', driveId: '', status: 'APPLIED', notes: '' });
    } catch (err) {
      alert('Failed to track application: ' + err.message);
    } finally {
      setAddingApp(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = (app.companyName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                          (app.roleTitle || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalCount = applications.length;
  const activeCount = applications.filter(a => ['APPLIED', 'ASSESSMENT', 'INTERVIEW'].includes(a.status)).length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length;
  const offerCount = applications.filter(a => a.status === 'OFFER').length;

  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          icon={FileCheck2}
          title="Sign in to Track Your Applications"
          description="Log and monitor your on-campus recruitment pipeline, technical round schedules, and offer letters in one unified dashboard."
          action={
            <Button
              variant="primary"
              onClick={() => onOpenAuthModal && onOpenAuthModal()}
            >
              Sign In or Try Student Demo
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        badge="Placement Lifecycle"
        badgeIcon={FileCheck2}
        title="My Placement Applications"
        description="Track your hiring journey from initial application and online assessments to technical interviews and offer letters."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate('drives')}
            >
              Browse Campus Drives
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Track New Application
            </Button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tracked</span>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalCount}</div>
          <p className="mt-1 text-xs text-slate-500">Across verified recruitment drives</p>
        </Card>

        <Card className="p-5 border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">In Progress</span>
            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-950">{activeCount}</div>
          <p className="mt-1 text-xs text-indigo-700">Applied or in screening rounds</p>
        </Card>

        <Card className="p-5 border-purple-100 bg-purple-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Interviews</span>
            <span className="p-2 bg-purple-100 rounded-xl text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-950">{interviewCount}</div>
          <p className="mt-1 text-xs text-purple-700">Active interview rounds</p>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Offers Received</span>
            <span className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-950">{offerCount}</div>
          <p className="mt-1 text-xs text-emerald-700">Final selection confirmed</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              type="text"
              placeholder="Filter by company or role..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-slate-400 font-semibold text-xs mr-1 hidden sm:inline">Status:</span>
            {['ALL', 'INTERESTED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Applications' : STATUS_LABELS[st] || st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-rose-600 border-rose-200 bg-rose-50/50">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="font-semibold">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchApplications}>
            Retry
          </Button>
        </Card>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={searchQuery || statusFilter !== 'ALL' ? 'No matching applications found' : 'No applications tracked yet'}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Start tracking your campus placement drives to view upcoming rounds, deadline reminders, and preparation shortcuts.'
          }
          action={
            <Button
              variant="primary"
              onClick={() => onNavigate && onNavigate('drives')}
            >
              Browse Campus Drives
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="p-5 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Company & Role */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-base shrink-0 group-hover:scale-105 transition-transform">
                    {app.companyName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        {app.companyName}
                      </h3>
                      <Badge variant={STATUS_COLORS[app.status] || 'slate'} size="sm">
                        {STATUS_LABELS[app.status] || app.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mt-0.5">
                      {app.roleTitle}
                    </p>
                    {app.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2 max-w-2xl">
                        <span className="font-bold text-slate-700">Notes:</span> {app.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Applied: {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</span>
                      {app.lastUpdated && (
                        <span>Updated: {new Date(app.lastUpdated).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Clock}
                    onClick={() => {
                      setUpdatingApp(app);
                      setNewStatus(app.status);
                      setStatusNotes(app.notes || '');
                    }}
                  >
                    Update Stage
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={HelpCircle}
                    onClick={() => {
                      if (onSelectCompany) {
                        onSelectCompany({ id: app.companyName.toLowerCase().replace(/\s+/g, ''), name: app.companyName });
                      } else if (onNavigate) {
                        onNavigate('companies');
                      }
                    }}
                  >
                    Prep Hub
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Bot}
                    onClick={() => {
                      if (onNavigate) onNavigate('mock-interview');
                    }}
                  >
                    Mock
                  </Button>

                  <button
                    onClick={() => handleWithdraw(app.id, app.companyName)}
                    title="Remove Application"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog
        isOpen={Boolean(updatingApp)}
        onClose={() => setUpdatingApp(null)}
        title={`Update Status: ${updatingApp?.companyName}`}
        description={`Update recruitment stage for ${updatingApp?.roleTitle}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setUpdatingApp(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={savingStatus}
              onClick={handleUpdateStatusSubmit}
            >
              Save Stage
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recruitment Stage
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Stage Notes / Date Reminders
            </label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g., Technical Round 1 scheduled for Friday 3 PM on HackerRank..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Dialog>

      {/* Add New Application Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Track Placement Application"
        description="Log an on-campus or off-campus application to track milestones and stay organized."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={addingApp}
              onClick={handleAddSubmit}
            >
              Save Application
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Company Name"
            placeholder="e.g., HCLTech, TCS, Deloitte"
            value={addForm.companyName}
            onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
            required
          />

          <Input
            label="Role Title"
            placeholder="e.g., Graduate Engineer Trainee (GET)"
            value={addForm.roleTitle}
            onChange={(e) => setAddForm({ ...addForm, roleTitle: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Initial Stage
            </label>
            <select
              value={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Notes / Test Link / Salary Details
            </label>
            <textarea
              rows={2}
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="e.g., Eligibility 60% in 10th/12th/BTech, Package 7.5 LPA"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
