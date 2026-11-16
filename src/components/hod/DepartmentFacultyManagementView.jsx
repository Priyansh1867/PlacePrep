import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
  Calendar,
  Lock,
  Edit2,
  Eye,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  X,
  Check,
  Power
} from 'lucide-react';
import {
  getHodDepartment,
  fetchDepartmentFaculty,
  updateDepartmentFaculty,
  toggleDepartmentFacultyStatus
} from '../../services/hodFacultyService';

const DESIGNATIONS = [
  'All',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Visiting Faculty'
];

export default function DepartmentFacultyManagementView({
  currentUser,
  onOpenRegisterModal,
  onOpenBulkImportModal
}) {
  const hodDepartment = getHodDepartment(currentUser);

  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'ACTIVE' | 'INACTIVE'
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Selected for View Modal
  const [viewingFaculty, setViewingFaculty] = useState(null);

  // Selected for Edit Modal
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    designation: '',
    specialization: '',
    qualification: '',
    status: 'ACTIVE'
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const loadFaculty = useCallback(async () => {
    setLoading(true);
    setActionErrorMsg('');
    try {
      const data = await fetchDepartmentFaculty(currentUser, {
        search: searchQuery,
        designation: selectedDesignation,
        status: selectedStatus
      });
      setFacultyList(data);
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to load department faculty.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchQuery, selectedDesignation, selectedStatus]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  // Status statistics
  const stats = useMemo(() => {
    const total = facultyList.length;
    const active = facultyList.filter(f => (f.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
    const professors = facultyList.filter(f => f.designation && f.designation.toLowerCase().includes('professor')).length;
    return { total, active, inactive: total - active, professors };
  }, [facultyList]);

  // Toggle status handler
  const handleToggleStatus = async (faculty) => {
    const nextStatus = (faculty.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleDepartmentFacultyStatus(faculty.id, nextStatus, currentUser);
      setActionSuccessMsg(`Status updated for ${faculty.name} to ${nextStatus}.`);
      loadFaculty();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to update faculty status.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (faculty) => {
    setEditingFaculty(faculty);
    setEditFormData({
      name: faculty.name || '',
      phone: faculty.phone || '',
      designation: faculty.designation || 'Assistant Professor',
      specialization: faculty.specialization || '',
      qualification: faculty.qualification || '',
      status: faculty.status || 'ACTIVE'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setIsUpdating(true);
    try {
      await updateDepartmentFaculty(editingFaculty.id, editFormData, currentUser);
      setActionSuccessMsg(`Faculty profile updated successfully.`);
      setEditingFaculty(null);
      loadFaculty();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to save faculty changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Department Title Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>{hodDepartment} Department</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-300" />
              <span>HOD Restricted Access</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Department Faculty Roster & Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Official faculty members belonging to {hodDepartment}. Register new professors, manage qualifications, and monitor account authorizations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Faculty</span>
          </button>
          <button
            type="button"
            onClick={onOpenBulkImportModal}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import (.csv / .xlsx)</span>
          </button>
          <button
            type="button"
            onClick={loadFaculty}
            title="Refresh faculty list"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}
      {actionErrorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Department Faculty</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 block">Active Status</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.active}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Professors / Chairs</span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">{stats.professors}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Department Authorization</span>
          <span className="text-sm font-extrabold text-slate-800 mt-1 block truncate">{hodDepartment}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name, email, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Designation Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {DESIGNATIONS.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Faculty Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading {hodDepartment} department faculty roster...</span>
          </div>
        ) : facultyList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Faculty Records Found</h4>
            <p className="max-w-md mx-auto text-[11px] text-slate-400">
              No faculty members matched the current search criteria in {hodDepartment} Department. Register a new faculty member or clear filters.
            </p>
            <button
              type="button"
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              Register Faculty Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Faculty Member</th>
                  <th className="py-3.5 px-4">Faculty ID</th>
                  <th className="py-3.5 px-4">Specialization / Subject</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyList.map((faculty) => {
                  const isActive = (faculty.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                  return (
                    <tr key={faculty.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Designation */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {faculty.name ? faculty.name.charAt(0) : 'F'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{faculty.name}</span>
                            <span className="text-[11px] text-indigo-700 font-semibold block">{faculty.designation || 'Faculty Member'}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{faculty.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Faculty ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                          {faculty.facultyId}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={faculty.specialization}>
                        {faculty.specialization || '—'}
                      </td>

                      {/* Qualification */}
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {faculty.qualification || '—'}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {faculty.joiningDate || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingFaculty(faculty)}
                            title="View Faculty Details"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(faculty)}
                            title="Edit Faculty Information"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(faculty)}
                            title={isActive ? 'Deactivate Faculty Account' : 'Activate Faculty Account'}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isActive
                                ? 'border-amber-200 hover:bg-amber-50 text-amber-600'
                                : 'border-emerald-200 hover:bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setViewingFaculty(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                {viewingFaculty.name ? viewingFaculty.name.charAt(0) : 'F'}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">{viewingFaculty.name}</h4>
                <p className="text-xs text-indigo-700 font-bold">{viewingFaculty.designation}</p>
                <span className="text-[10px] text-slate-400 font-mono">{viewingFaculty.facultyId}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono font-semibold text-slate-800">{viewingFaculty.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-slate-900">{hodDepartment} Department</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-semibold text-slate-800">{viewingFaculty.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Subject / Specialization:</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{viewingFaculty.specialization || 'General'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Highest Qualification:</span>
                <span className="font-semibold text-slate-800">{viewingFaculty.qualification || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-semibold text-slate-800">{viewingFaculty.joiningDate || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Authorization Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  viewingFaculty.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {viewingFaculty.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingFaculty(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setEditingFaculty(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-black text-slate-900 mb-1">Edit Faculty Information</h4>
            <p className="text-xs text-slate-500 mb-4">
              Update department records for <strong className="text-slate-900">{editingFaculty.name}</strong> ({editingFaculty.facultyId}).
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <select
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold cursor-pointer"
                >
                  {DESIGNATIONS.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization / Subject Domain</label>
                <input
                  type="text"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="ACTIVE">Active (Authorized)</option>
                  <option value="INACTIVE">Inactive (Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
