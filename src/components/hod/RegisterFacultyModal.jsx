import React, { useState } from 'react';
import {
  UserPlus,
  X,
  Building,
  Mail,
  User,
  Phone,
  Briefcase,
  BookOpen,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { getHodDepartment, registerDepartmentFaculty } from '../../services/hodFacultyService';

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Visiting Faculty',
  'Head of Department (HOD)'
];

const QUALIFICATIONS = [
  'Ph.D. in Computer Science & Engineering',
  'Ph.D. in Artificial Intelligence & Data Science',
  'Ph.D. in Information Technology',
  'Ph.D. in Electronics & Communication',
  'Ph.D. in Engineering',
  'M.Tech / M.E.',
  'M.S. by Research',
  'B.Tech / B.E.',
  'M.Sc. Computer Science / IT',
  'MCA (Master of Computer Applications)'
];

export default function RegisterFacultyModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  onOpenBulkImport
}) {
  const hodDepartment = getHodDepartment(currentUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facultyId: '',
    phone: '',
    designation: 'Assistant Professor',
    specialization: '',
    qualification: 'M.Tech / M.E.',
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const registered = await registerDepartmentFaculty(
        {
          ...formData,
          department: hodDepartment
        },
        currentUser
      );

      setSuccessMsg(`Faculty member ${registered.name} (${registered.facultyId}) successfully registered in ${hodDepartment} department.`);
      if (onSuccess) onSuccess(registered);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register faculty member.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Register Faculty Member</h3>
            <p className="text-xs text-slate-500">
              Department restricted registration for official department faculty roster.
            </p>
          </div>
        </div>

        {/* Quick Bulk Import Banner */}
        {onOpenBulkImport && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 my-4 text-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-slate-700 font-medium">Need to register multiple faculty members?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBulkImport();
              }}
              className="font-bold text-indigo-700 hover:text-indigo-900 underline text-xs shrink-0 cursor-pointer"
            >
              Bulk Import (.csv / .xlsx)
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Department Locked Badge */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-slate-700 block">Department Authorization</span>
                <span className="text-xs font-extrabold text-slate-900">{hodDepartment} Department</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>HOD Locked</span>
            </span>
          </div>

          {/* Row 1: Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Ramesh Chand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition"
              />
            </div>
          </div>

          {/* Row 2: Official Email & Faculty ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@dtu.ac.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty ID / Employee ID *</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  placeholder={`FAC-${hodDepartment}-005`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold text-slate-800 transition uppercase"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Mobile Number & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation *</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-800 transition cursor-pointer"
                >
                  {DESIGNATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Specialization / Subject */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Specialization / Subject Domain</label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Distributed Operating Systems, Machine Learning"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition"
              />
            </div>
          </div>

          {/* Row 5: Qualification & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Highest Qualification</label>
              <select
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition cursor-pointer"
              >
                {QUALIFICATIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 transition"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Account Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Status</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={formData.status === 'ACTIVE'}
                  onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">Active (Authorized for academic sessions & marks)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="INACTIVE"
                  checked={formData.status === 'INACTIVE'}
                  onChange={() => setFormData({ ...formData, status: 'INACTIVE' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-500">Inactive</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Faculty Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
