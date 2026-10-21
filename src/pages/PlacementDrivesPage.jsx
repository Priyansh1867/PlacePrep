import React, { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
  Sparkles,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { DriveApi, ApplicationApi } from '../services/api';
import { getGraduationBatch, getCurrentUser } from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';

export default function PlacementDrivesPage({ onSelectCompany, onNavigate, onOpenAuthModal }) {
  const currentBatch = getGraduationBatch();
  const currentUser = getCurrentUser();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState(currentBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackingLoadingId, setTrackingLoadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [drivesData, appsData] = await Promise.all([
        DriveApi.getAll(selectedBatchFilter === 'all' ? null : selectedBatchFilter),
        currentUser ? ApplicationApi.getMyApplications().catch(() => []) : Promise.resolve([])
      ]);
      setDrives(drivesData || []);
      setApplications(appsData || []);
    } catch (err) {
      console.error('Failed to load placement drives:', err);
      setError(err.message || 'Failed to load placement drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatchFilter, currentUser?.email]);

  const handleTrackDrive = async (drive, initialStatus = 'APPLIED') => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setTrackingLoadingId(drive.driveId || drive.id);
    try {
      const app = await ApplicationApi.trackApplication({
        driveId: drive.driveId || drive.id,
        companyName: drive.companyName,
        roleTitle: drive.role,
        status: initialStatus,
        notes: `Eligible batches: ${(drive.eligibleBatches || []).join(', ')}. Package: ${drive.packageDetails || 'N/A'}`
      });
      setApplications(prev => [...prev.filter(a => a.driveId !== app.driveId), app]);
    } catch (err) {
      alert('Failed to track application: ' + err.message);
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const getApplicationForDrive = (drive) => {
    const id = drive.driveId || drive.id;
    return applications.find(a => a.driveId === id || a.companyName.toLowerCase() === drive.companyName.toLowerCase());
  };

  const filteredDrives = useMemo(() => {
    return drives.filter(d => {
      const matchBatch = selectedBatchFilter === 'all' || 
        (d.eligibleBatches && (d.eligibleBatches.includes(selectedBatchFilter) || d.eligibleBatches.includes(Number(selectedBatchFilter))));
      const matchSearch = d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : (d.status || '').toLowerCase().includes(statusFilter);
      return matchBatch && matchSearch && matchStatus;
    });
  }, [drives, selectedBatchFilter, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        badge="Recruitment Calendar"
        badgeIcon={Briefcase}
        title="Placement Drives Dashboard"
        description="Stay updated with verified on-campus and national recruitment qualifier drives. View batch eligibility, salary packages, and track applications directly."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate('applications')}
            >
              My Tracked Applications ({applications.length})
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate('companies')}
            >
              Explore Company Hubs
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="w-full md:w-96">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drives by company or role..."
              leftIcon={Search}
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

        {/* Quick Stats / Filter tags */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing <b>{filteredDrives.length}</b> verified campus opportunities</span>
            {selectedBatchFilter !== 'all' && (
              <Badge variant="indigo" size="sm">
                Targeting Batch {selectedBatchFilter}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Open Drives
            </button>
          </div>
        </div>
      </Card>

      {/* Drives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-rose-600 border-rose-200 bg-rose-50/50">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="font-semibold">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
            Retry
          </Button>
        </Card>
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No drives match your filters"
          description="Try changing your graduation batch filter or searching for another company or role title."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBatchFilter('all');
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => {
            const driveId = drive.driveId || drive.id;
            const existingApp = getApplicationForDrive(drive);
            const isTracking = trackingLoadingId === driveId;

            return (
              <Card
                key={driveId}
                className="flex flex-col justify-between border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <div>
                  {/* Top Bar with Company & Status */}
                  <div className="p-5 pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {drive.companyName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1">
                            {drive.companyName}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                            {drive.role}
                          </p>
                        </div>
                      </div>

                      {existingApp ? (
                        <Badge variant="indigo" size="sm" dot>
                          {existingApp.status}
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block font-semibold text-[11px]">Package (CTC)</span>
                        <span className="font-extrabold text-slate-900 mt-0.5 block truncate">
                          {drive.packageDetails || '₹7 - ₹12 LPA'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block font-semibold text-[11px]">Drive Date</span>
                        <span className="font-extrabold text-slate-900 mt-0.5 block truncate flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {drive.date || 'TBA'}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility & Batches */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> Eligible Batches:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(drive.eligibleBatches || []).map((batch) => (
                          <span
                            key={batch}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                              batch.toString() === currentBatch
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Class of {batch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Criteria Snippet */}
                    {drive.eligibilityCriteria && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 leading-relaxed">
                        <span className="font-bold text-slate-700">Criteria:</span> {drive.eligibilityCriteria}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {existingApp ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        icon={BookmarkCheck}
                        onClick={() => onNavigate && onNavigate('applications')}
                      >
                        Track Status
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          icon={Check}
                          loading={isTracking}
                          onClick={() => handleTrackDrive(drive, 'APPLIED')}
                        >
                          Apply & Track
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={BookmarkCheck}
                          loading={isTracking}
                          onClick={() => handleTrackDrive(drive, 'INTERESTED')}
                          title="Bookmark for later"
                        />
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (onSelectCompany) {
                          onSelectCompany({
                            id: (drive.companyId || drive.companyName).toLowerCase().replace(/\s+/g, ''),
                            name: drive.companyName
                          });
                        } else if (onNavigate) {
                          onNavigate('companies');
                        }
                      }}
                    >
                      Prep
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
