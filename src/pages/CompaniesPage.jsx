import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  GraduationCap, 
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import CompanyCard from '../components/CompanyCard';
import { CompanyApi } from '../services/api';
import { getInitialCompanies, getGraduationBatch } from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import SearchBar from '../components/ui/SearchBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import BackNavButton from '../components/ui/BackNavButton';

export default function CompaniesPage({ onSelectCompany, onOpenBatchModal, onNavigate, onBack }) {
  const currentBatch = getGraduationBatch();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CompanyApi.getAll(currentBatch);
      if (data && data.length > 0) {
        setCompanies(data);
      } else {
        setCompanies(getInitialCompanies());
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to cached companies:', err);
      setCompanies(getInitialCompanies());
    } finally {
      setLoading(false);
    }
  };

  // Reset scroll to top on mount so SearchBar is directly visible
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [currentBatch]);

  const filteredCompanies = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    let list = companies.filter(c => {
      const matchSearch = !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.tier || '').toLowerCase().includes(q) ||
        (c.roles || []).some(r => r.toLowerCase().includes(q)) ||
        (c.frequentTopics || []).some(t => t.toLowerCase().includes(q)) ||
        (c.eligibilityCriteria || '').toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === 'upcoming') {
        matchStatus = c.verifiedUpcomingDrive === true;
      } else if (statusFilter === 'batch-eligible') {
        matchStatus = (c.eligibleBatches || []).includes(currentBatch);
      }

      return matchSearch && matchStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'recent') {
        return (b.experienceCount || 0) - (a.experienceCount || 0);
      }
      return 0;
    });

    return list;
  }, [companies, searchQuery, statusFilter, sortBy, currentBatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        badge="Company Intelligence"
        badgeIcon={Building2}
        title={`Companies Recruiting Batch ${currentBatch}`}
        description="Explore dedicated preparation hubs with verified question frequencies, actual interview stages, and company-specific AI insights."
        actions={
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Batch</span>
                <span className="font-extrabold text-slate-900 text-sm">{currentBatch}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBatchModal}
            >
              Change
            </Button>
          </div>
        }
      />

      {/* Filter and Search Controls */}
      <Card className="p-4 sm:p-5 border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="w-full lg:w-96">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search companies by name, role, skill, or tier..."
              resultCount={filteredCompanies.length}
              totalCount={companies.length}
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto text-xs pb-1 lg:pb-0">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Companies ({companies.length})
            </button>
            <button
              onClick={() => setStatusFilter('batch-eligible')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'batch-eligible'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Batch {currentBatch} Eligible
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active Drives
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="popularity">Most Frequently Asked</option>
              <option value="recent">Most Peer Experiences</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Company Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No companies found"
          description={
            searchQuery.trim()
              ? `No recruiting companies matched "${searchQuery.trim()}". Try checking spelling or clear search.`
              : 'No companies match the selected filter criteria.'
          }
          actionLabel="Clear Filters & Search"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard
              key={company.companyId || company.id}
              company={company}
              currentBatch={currentBatch}
              onExplore={onSelectCompany}
              onSelectCompany={onSelectCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
}
