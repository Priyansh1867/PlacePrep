// PlacePrep AI - Team 2: Institute Support
// Student Creation & Editing Form Modal with Conditional Diploma and Live Age Calculation

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  GraduationCap, 
  BookOpen, 
  Award, 
  AlertCircle, 
  Info, 
  Sparkles
} from 'lucide-react';
import { 
  INITIAL_BRANCHES, 
  INITIAL_COURSES, 
  calculateAgeFromDOB 
} from '../../data/initialAcademicRecords';
import { 
  saveStudent, 
  getAllStudents, 
  validateStudentRecord 
} from '../../services/academicRecordsService';

export default function StudentFormModal({ 
  isOpen, 
  onClose, 
  student = null, 
  onSaveSuccess 
}) {
  const isEditing = Boolean(student && student.id);

  const initialFormState = {
    fullName: '',
    rollNumber: '',
    registrationNumber: '',
    collegeName: '',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Regular Entry',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    mobileNumber: '',
    alternateContact: '',
    currentAddress: '',
    permanentAddress: '',
    sameAsCurrentAddress: true,
    // 10th
    class10Board: 'CBSE',
    class10School: '',
    class10Year: '2020',
    class10Percentage: '',
    class10MaxMarks: 100,
    // 12th
    class12Board: 'CBSE',
    class12School: '',
    class12Year: '2022',
    class12Percentage: '',
    class12MaxMarks: 100,
    // Diploma (Lateral Entry)
    diplomaCollege: '',
    diplomaSpecialization: '',
    diplomaYear: '2023',
    diplomaPercentage: '',
    diplomaMaxMarks: 100
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'academic', 'qualification'

  useEffect(() => {
    if (student) {
      setFormData({
        ...initialFormState,
        ...student,
        class10Percentage: student.class10Percentage ?? '',
        class12Percentage: student.class12Percentage ?? '',
        diplomaPercentage: student.diplomaPercentage ?? ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setActiveTab('personal');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const isLateralEntry = 
    formData.admissionType === 'Diploma / Lateral Entry' || 
    (formData.course && formData.course.toLowerCase().includes('diploma'));

  // Live Calculated Age
  const liveAge = calculateAgeFromDOB(formData.dateOfBirth);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (name === 'currentAddress' && formData.sameAsCurrentAddress) {
      setFormData(prev => ({
        ...prev,
        currentAddress: val,
        permanentAddress: val
      }));
    } else if (name === 'sameAsCurrentAddress') {
      setFormData(prev => ({
        ...prev,
        sameAsCurrentAddress: val,
        permanentAddress: val ? prev.currentAddress : prev.permanentAddress
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }

    // Clear error for field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const existingStudents = getAllStudents();
    const validation = validateStudentRecord(formData, existingStudents, isEditing);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);

      // Switch to the tab containing the first error
      const errKeys = Object.keys(validation.errors);
      if (errKeys.some(k => ['fullName', 'rollNumber', 'registrationNumber', 'collegeName', 'email', 'mobileNumber', 'dateOfBirth', 'currentAddress'].includes(k))) {
        setActiveTab('personal');
      } else if (errKeys.some(k => ['course', 'branch', 'graduationBatch', 'admissionYear', 'currentSemester', 'admissionType'].includes(k))) {
        setActiveTab('academic');
      } else {
        setActiveTab('qualification');
      }
      return;
    }

    const res = saveStudent(formData);
    setIsSubmitting(false);

    if (res.success) {
      onSaveSuccess(res.student);
      onClose();
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog" 
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? `Edit Student: ${formData.fullName || formData.rollNumber}` : 'Register New Student Profile'}
              </h2>
              <p className="text-xs text-slate-500">
                PlacePrep AI Academic Records & Enrollment Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Personal & Institute Identity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Academic Program Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'qualification'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Qualifications {isLateralEntry ? '(Class 10 & Diploma)' : '(Class 10 & 12)'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Personal & Identity */}
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.fullName}</p>}
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number / Institute ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 22CS0101"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all font-mono ${
                      errors.rollNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.rollNumber && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.rollNumber}</p>}
                </div>

                {/* University Registration Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. REG-2022-CSE-0101"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all font-mono ${
                      errors.registrationNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.registrationNumber && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.registrationNumber}</p>}
                </div>

                {/* College / Institute Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / Institute Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="e.g. Delhi Technological University"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.collegeName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.collegeName && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.collegeName}</p>}
                </div>

                {/* Date of Birth & Live Calculated Age */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    {liveAge !== '' && (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Calculated Age: {liveAge} years
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().slice(0, 10)}
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.dateOfBirth ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional / Personal Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.edu"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.email}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.mobileNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.mobileNumber && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.mobileNumber}</p>}
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Residential Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    placeholder="Room/Flat No, Street, City, State, PIN code"
                    className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.currentAddress ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.currentAddress && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.currentAddress}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAsCurrentAddress"
                    name="sameAsCurrentAddress"
                    checked={formData.sameAsCurrentAddress}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="sameAsCurrentAddress" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Permanent Address is the same as Current Address
                  </label>
                </div>

                {!formData.sameAsCurrentAddress && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      rows={2}
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      placeholder="Permanent hometown address"
                      className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Academic Program Details */}
          {activeTab === 'academic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Course */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Degree Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {INITIAL_COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch / Specialization <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {INITIAL_BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Admission Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="admissionYear"
                    value={formData.admissionYear}
                    onChange={handleChange}
                    placeholder="2022"
                    min="2018"
                    max="2030"
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {errors.admissionYear && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.admissionYear}</p>}
                </div>

                {/* Graduation Batch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Graduation Batch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="graduationBatch"
                    value={formData.graduationBatch}
                    onChange={handleChange}
                    placeholder="2026"
                    min="2020"
                    max="2032"
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {errors.graduationBatch && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.graduationBatch}</p>}
                </div>

                {/* Current Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester (1 to 8) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Admission Type (Triggers conditional diploma) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Pathway / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="admissionType"
                    value={formData.admissionType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Regular Entry">Regular Entry (10+2 / JEE)</option>
                    <option value="Diploma / Lateral Entry">Diploma / Lateral Entry (Direct to 2nd Year)</option>
                    <option value="Management Quota">Management / Institutional Quota</option>
                    <option value="Sports / NRI Quota">Sports / Special Quota</option>
                  </select>
                  {isLateralEntry && (
                    <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1 bg-amber-50 p-1.5 rounded-md border border-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      Lateral Entry active: Diploma credentials will be required in Step 3.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Qualifications (10th, 12th & Conditional Diploma) */}
          {activeTab === 'qualification' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Secondary (Class 10) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    10
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Secondary Examination (Class 10 / Matriculation) <span className="text-rose-500">*</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Board of Examination</label>
                    <input
                      type="text"
                      name="class10Board"
                      value={formData.class10Board}
                      onChange={handleChange}
                      placeholder="e.g. CBSE / ICSE / State Board"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Passing Year</label>
                    <input
                      type="number"
                      name="class10Year"
                      value={formData.class10Year}
                      onChange={handleChange}
                      placeholder="2020"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Percentage / CGPA (%) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="class10Percentage"
                      value={formData.class10Percentage}
                      onChange={handleChange}
                      placeholder="e.g. 91.20"
                      className={`w-full px-3 py-1.5 rounded-lg text-sm border bg-white ${
                        errors.class10Percentage ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.class10Percentage && <p className="text-xs text-rose-500 mt-1">{errors.class10Percentage}</p>}
                  </div>
                </div>
              </div>

              {/* Conditional: Higher Secondary (Class 12) - Shown for Regular Entry */}
              {!isLateralEntry ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      12
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Senior Secondary (Class 12 / Higher Secondary) <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Board of Examination</label>
                      <input
                        type="text"
                        name="class12Board"
                        value={formData.class12Board}
                        onChange={handleChange}
                        placeholder="e.g. CBSE / State Board"
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Passing Year</label>
                      <input
                        type="number"
                        name="class12Year"
                        value={formData.class12Year}
                        onChange={handleChange}
                        placeholder="2022"
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Percentage (%) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="class12Percentage"
                        value={formData.class12Percentage}
                        onChange={handleChange}
                        placeholder="e.g. 88.50"
                        className={`w-full px-3 py-1.5 rounded-lg text-sm border bg-white ${
                          errors.class12Percentage ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.class12Percentage && <p className="text-xs text-rose-500 mt-1">{errors.class12Percentage}</p>}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Conditional: Diploma in Engineering / Polytechnic - Shown for Lateral Entry */}
              {isLateralEntry && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                        DIP
                      </div>
                      <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Polytechnic Diploma Qualifications (Lateral Entry Pathway) <span className="text-rose-500">*</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                      Required for Lateral Admission
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Diploma Institute / Polytechnic College <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="diplomaCollege"
                        value={formData.diplomaCollege}
                        onChange={handleChange}
                        placeholder="e.g. Pusa Institute of Technology"
                        className={`w-full px-3 py-1.5 rounded-lg text-sm border bg-white ${
                          errors.diplomaCollege ? 'border-rose-400' : 'border-amber-200'
                        }`}
                      />
                      {errors.diplomaCollege && <p className="text-xs text-rose-500 mt-1">{errors.diplomaCollege}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Diploma Specialization / Branch <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="diplomaSpecialization"
                        value={formData.diplomaSpecialization}
                        onChange={handleChange}
                        placeholder="e.g. Diploma in Computer Engineering"
                        className={`w-full px-3 py-1.5 rounded-lg text-sm border bg-white ${
                          errors.diplomaSpecialization ? 'border-rose-400' : 'border-amber-200'
                        }`}
                      />
                      {errors.diplomaSpecialization && <p className="text-xs text-rose-500 mt-1">{errors.diplomaSpecialization}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Completion Year</label>
                      <input
                        type="number"
                        name="diplomaYear"
                        value={formData.diplomaYear}
                        onChange={handleChange}
                        placeholder="2023"
                        className="w-full px-3 py-1.5 rounded-lg text-sm border border-amber-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Diploma Percentage / Aggregate (%) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="diplomaPercentage"
                        value={formData.diplomaPercentage}
                        onChange={handleChange}
                        placeholder="e.g. 86.40"
                        className={`w-full px-3 py-1.5 rounded-lg text-sm border bg-white ${
                          errors.diplomaPercentage ? 'border-rose-400' : 'border-amber-200'
                        }`}
                      />
                      {errors.diplomaPercentage && <p className="text-xs text-rose-500 mt-1">{errors.diplomaPercentage}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Form Error Banner if any */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <span className="font-bold">Please correct the highlighted fields:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.entries(errors).map(([k, err]) => (
                    <li key={k}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              * Indicates required institutional fields
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Enroll Student'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
