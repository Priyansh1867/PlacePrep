import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Users,
  Building,
  HelpCircle,
  UserCheck,
  Sparkles,
  Check
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';
import TimetableGrid from './TimetableGrid';

const REMEMBERED_FACULTY_MAP_KEY = 'placeprep_timetable_faculty_resolutions';

export default function ImportWizard({
  isOpen,
  onClose,
  onImportCommitted // (timetableId) => void
}) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Fix, 4: Commit

  // Step 1: Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [academicSession, setAcademicSession] = useState('2026-27');
  const [term, setTerm] = useState('ODD');
  const [departmentCode, setDepartmentCode] = useState('AI_DS');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Step 2 & 3: Job & Preview Data
  const [jobId, setJobId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewSection, setActivePreviewSection] = useState('');
  const [confirmBreaks, setConfirmBreaks] = useState(true);
  const [deptFaculty, setDeptFaculty] = useState([]);
  const [resolutions, setResolutions] = useState({
    facultyResolutions: {},
    breakPeriodIndices: [5],
    slotEdits: []
  });

  // Load department faculty for dropdown matching
  useEffect(() => {
    MasterTimetableApi.getFacultyProfiles(departmentCode)
      .then(res => setDeptFaculty(Array.isArray(res) ? res : (res?.content || [])))
      .catch(() => setDeptFaculty([]));
  }, [departmentCode]);

  // Step 4: Commit state
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState('');

  // Editing single slot in Fix step
  const [editingSlot, setEditingSlot] = useState(null);

  // Load remembered faculty mappings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_FACULTY_MAP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setResolutions(prev => ({
          ...prev,
          facultyResolutions: { ...parsed, ...prev.facultyResolutions }
        }));
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  // File drag & drop handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setUploadError('');
    if (!file) return;

    const name = file.name.toLowerCase();
    const validExts = ['.xlsx', '.xls', '.pdf'];
    const hasValidExt = validExts.some(ext => name.endsWith(ext));

    if (!hasValidExt) {
      setUploadError('Invalid file format. Please upload an Excel (.xlsx, .xls) or PDF (.pdf) timetable.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25 MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  // Step 1 -> Step 2: Upload and Preview
  const handleStartImport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError('');

    try {
      const res = await MasterTimetableApi.uploadImport(selectedFile, {
        academicSession,
        term,
        departmentCode
      });

      const parsedJobId = res.jobId || res.id;
      setJobId(parsedJobId);
      const prev = res.preview || res;
      setPreviewData(prev);

      // Pre-select first section
      if (prev.sections && prev.sections.length > 0) {
        setActivePreviewSection(prev.sections[0].name);
      }

      setStep(2);
    } catch (err) {
      setUploadError(err.message || 'Import preview failed. Please check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  // Step 2: Individual faculty resolution
  const handleResolveFacultyMember = (rawToken, shortCode, fullName) => {
    const updatedMap = {
      ...resolutions.facultyResolutions,
      [rawToken]: { shortCode, fullName, status: 'RESOLVED' }
    };
    setResolutions(prev => ({ ...prev, facultyResolutions: updatedMap }));

    try {
      localStorage.setItem(REMEMBERED_FACULTY_MAP_KEY, JSON.stringify(updatedMap));
    } catch {}

    setPreviewData(prev => {
      if (!prev?.faculty) return prev;
      const updatedList = prev.faculty.map(f => {
        if (f.rawNameOrCode?.trim().toLowerCase() === rawToken?.trim().toLowerCase()) {
          return {
            ...f,
            resolvedShortCode: shortCode,
            resolvedFullName: fullName,
            status: 'RESOLVED'
          };
        }
        return f;
      });
      const unres = updatedList.filter(f => f.status === 'UNRESOLVED').length;
      return {
        ...prev,
        faculty: updatedList,
        stats: { ...(prev.stats || {}), unresolvedFaculty: unres }
      };
    });
  };

  // Step 2: Auto-resolve all remaining unresolved faculty as guest/external instructors
  const handleAutoResolveAllFaculty = () => {
    if (!previewData?.faculty) return;
    const updatedMap = { ...resolutions.facultyResolutions };
    const updatedList = previewData.faculty.map(f => {
      if (f.status === 'UNRESOLVED' || f.status === 'AMBIGUOUS') {
        const token = (f.rawNameOrCode || 'FAC').trim();
        const shortCode = token;
        const fullName = `Faculty (${token})`;
        updatedMap[token] = { shortCode, fullName, status: 'RESOLVED' };
        return {
          ...f,
          resolvedShortCode: shortCode,
          resolvedFullName: fullName,
          status: 'RESOLVED'
        };
      }
      return f;
    });

    setResolutions(prev => ({ ...prev, facultyResolutions: updatedMap }));
    try {
      localStorage.setItem(REMEMBERED_FACULTY_MAP_KEY, JSON.stringify(updatedMap));
    } catch {}

    setPreviewData(prev => ({
      ...prev,
      faculty: updatedList,
      stats: { ...(prev.stats || {}), unresolvedFaculty: 0 }
    }));
  };

  // Step 3: Inline slot edit/delete in Fix step
  const handleDeleteParsedSlot = (slotIndex) => {
    if (!previewData?.slots) return;
    const updatedSlots = [...previewData.slots];
    updatedSlots.splice(slotIndex, 1);
    setPreviewData({ ...previewData, slots: updatedSlots });
  };

  const handleSaveEditedSlot = (e) => {
    e.preventDefault();
    if (!editingSlot || !previewData?.slots) return;

    // Elevate confidence to 1.0 since confirmed by user
    const confirmedSlot = { ...editingSlot, confidence: 1.0 };
    const updatedSlots = previewData.slots.map(s => (s.id === confirmedSlot.id ? confirmedSlot : s));
    setPreviewData({ ...previewData, slots: updatedSlots });
    setEditingSlot(null);
  };

  // Step 4: Final commit
  const handleCommit = async () => {
    if (!jobId) return;
    setIsCommitting(true);
    setCommitError('');

    try {
      // 1. Build typed array of FacultyResolutionDto
      const facultyList = [];
      const resMap = resolutions.facultyResolutions || {};

      Object.entries(resMap).forEach(([raw, data]) => {
        facultyList.push({
          rawNameOrCode: raw,
          resolvedShortCode: data.shortCode || raw,
          resolvedFullName: data.fullName || `Faculty (${raw})`,
          status: 'RESOLVED'
        });
      });

      if (previewData?.faculty) {
        previewData.faculty.forEach(f => {
          if (f.status === 'RESOLVED') {
            const alreadyInList = facultyList.some(x => x.rawNameOrCode?.toLowerCase() === f.rawNameOrCode?.toLowerCase());
            if (!alreadyInList) {
              facultyList.push({
                rawNameOrCode: f.rawNameOrCode,
                resolvedShortCode: f.resolvedShortCode || f.rawNameOrCode,
                resolvedFullName: f.resolvedFullName || `Faculty (${f.rawNameOrCode})`,
                status: 'RESOLVED'
              });
            }
          }
        });
      }

      if (facultyList.length > 0) {
        await MasterTimetableApi.saveImportResolutions(jobId, {
          facultyResolutions: facultyList,
          roomAliases: resolutions.roomAliases || {},
          periodOverrides: resolutions.periodOverrides || [],
          slotEdits: resolutions.slotEdits || [],
          slotRemovals: resolutions.slotRemovals || []
        });
      }

      // 2. Commit job as draft
      const result = await MasterTimetableApi.commitImport(jobId, replaceExisting);
      if (onImportCommitted) {
        const newTimetableId = Array.isArray(result) ? result[0]?.id : (result?.timetableId || result?.id);
        onImportCommitted(newTimetableId);
      }
      onClose();
    } catch (err) {
      setCommitError(err.message || 'Failed to commit timetable draft.');
    } finally {
      setIsCommitting(false);
    }
  };

  // Filter slots for active section preview
  const activeSectionSlots = previewData?.slots?.filter(s =>
    !activePreviewSection || s.sectionName === activePreviewSection
  ) || [];

  const unresolvedFaculty = (previewData?.faculty || []).filter(
    f => f.status === 'UNRESOLVED' || f.status === 'AMBIGUOUS'
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h2 id="import-wizard-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600" />
              <span>Import Timetable Wizard</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {[
                { num: 1, label: 'Upload' },
                { num: 2, label: 'Review & Map' },
                { num: 3, label: 'Fix & Verify' },
                { num: 4, label: 'Commit' }
              ].map(s => (
                <div key={s.num} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    step === s.num
                      ? 'bg-teal-700 text-white'
                      : step > s.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className={step === s.num ? 'font-bold text-slate-900' : 'text-slate-500'}>
                    {s.label}
                  </span>
                  {s.num < 4 && <span className="text-slate-300">/</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wizard"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-6">
              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Target Metadata selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
                    placeholder="2026-27"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="ODD">ODD Term (Sem III, V, VII)</option>
                    <option value="EVEN">EVEN Term (Sem IV, VI, VIII)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="AI_DS">AI & Data Science (AID)</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="ECE">Electronics & Communication</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                      {selectedFile.name.endsWith('.pdf') ? <FileText className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{selectedFile.name}</div>
                    <div className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing
                    </div>
                    <div className="text-xs font-semibold text-teal-700 mt-2">Click or drag another file to replace</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">Drag & drop your timetable file here</div>
                    <div className="text-xs text-slate-500">
                      Supports Excel workbooks (<strong>.xlsx, .xls</strong>) and PDF schedules (<strong>.pdf</strong>) up to 25 MB
                    </div>
                    <button
                      type="button"
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200"
                    >
                      Browse File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & MAP */}
          {step === 2 && previewData && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">Sections</div>
                  <div className="text-lg font-black text-slate-800">{previewData.sections?.length || 0}</div>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-center">
                  <div className="text-[11px] font-semibold text-teal-700">Parsed Slots</div>
                  <div className="text-lg font-black text-teal-900">{previewData.slots?.length || 0}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">Subjects</div>
                  <div className="text-lg font-black text-slate-800">{previewData.subjects?.length || 0}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">Faculty</div>
                  <div className="text-lg font-black text-slate-800">{previewData.faculty?.length || 0}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">Warnings</div>
                  <div className="text-lg font-black text-amber-700">{previewData.warnings?.length || 0}</div>
                </div>
              </div>

              {/* Warnings breakdown grouped by code */}
              {previewData.warnings && previewData.warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Parser Warnings ({previewData.warnings.length})</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                    {previewData.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-amber-950">
                        <span className="font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-[10px] uppercase">
                          {w.code}
                        </span>
                        <span>{w.message}</span>
                        {w.sheetName && <span className="text-amber-700">({w.sheetName}!{w.cellRef})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Break confirmation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Break Period Configuration</div>
                  <div className="text-[11px] text-slate-500">
                    Period 5 (12:30–1:30 PM) is designated as lunch recess.
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={confirmBreaks}
                    onChange={(e) => setConfirmBreaks(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Confirm Recess Break</span>
                </label>
              </div>

              {/* Faculty Mapping & Verification Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Faculty Mapping & Resolution ({previewData.faculty?.length || 0} Total)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {unresolvedFaculty.length > 0
                        ? `${unresolvedFaculty.length} instructor token(s) require resolution before draft commit.`
                        : 'All instructors successfully mapped to faculty profiles.'}
                    </div>
                  </div>

                  {unresolvedFaculty.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoResolveAllFaculty}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Auto-Resolve All as Guest Faculty</span>
                    </button>
                  )}
                </div>

                {unresolvedFaculty.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {unresolvedFaculty.map((f) => {
                      const token = f.rawNameOrCode;
                      const slotCount = (previewData.slots || []).filter(
                        s => s.facultyNames && s.facultyNames.some(fn => fn.toLowerCase() === token.toLowerCase())
                      ).length;

                      return (
                        <div
                          key={token}
                          className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                              {token}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                Token: <code className="text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{token}</code>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {slotCount} class period{slotCount !== 1 ? 's' : ''} assigned • {f.status}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              aria-label={`Assign faculty for token ${token}`}
                              className="text-xs rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-700 max-w-xs"
                              onChange={(e) => {
                                const profId = e.target.value;
                                if (!profId) return;
                                const prof = deptFaculty.find(p => String(p.id) === String(profId));
                                if (prof) {
                                  handleResolveFacultyMember(token, prof.shortCode, prof.fullName);
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="">Map to existing profile...</option>
                              {deptFaculty.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.fullName} ({p.shortCode})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleResolveFacultyMember(token, token, `Faculty (${token})`)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              As Guest
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      All {previewData.faculty?.length || 0} faculty members verified and ready.
                    </span>
                  </div>
                )}
              </div>

              {/* Section Preview Switcher & Grid Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Rendered Section Grids
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {previewData.sections?.map(s => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setActivePreviewSection(s.name)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          activePreviewSection === s.name
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Section {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <TimetableGrid
                    periods={previewData.periods || []}
                    slots={activeSectionSlots}
                    viewMode="section"
                    editable={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FIX & CONFIRM */}
          {step === 3 && previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Inline Slot Inspector ({previewData.slots?.length || 0} Slots)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify slots and confirm ambiguous alignments (slots below 0.6 confidence must be verified).
                  </p>
                </div>
              </div>

              {/* Slots Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Sec/Batch</th>
                      <th className="px-3 py-2">Day/Period</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Venue</th>
                      <th className="px-3 py-2">Confidence</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {previewData.slots?.map((s, idx) => {
                      const isLow = s.confidence !== undefined && s.confidence < 0.6;
                      return (
                        <tr key={s.id || idx} className={`hover:bg-slate-50 ${isLow ? 'bg-amber-50/50' : ''}`}>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            Sec {s.sectionName} {s.labGroupCode ? `(${s.labGroupCode})` : ''}
                          </td>
                          <td className="px-3 py-2">
                            Day {s.dayOfWeek}, P{s.startPeriod}{s.span > 1 ? `–P${s.startPeriod + s.span - 1}` : ''}
                          </td>
                          <td className="px-3 py-2 font-semibold">
                            {s.subjectCode ? `${s.subjectCode} • ` : ''}{s.subjectName}
                          </td>
                          <td className="px-3 py-2">{s.roomCode || '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {((s.confidence || 1.0) * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingSlot(s)}
                              className="text-teal-600 hover:text-teal-800 text-xs font-semibold"
                            >
                              Edit/Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParsedSlot(idx)}
                              className="text-rose-500 hover:text-rose-700 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modal for editing a single parsed slot */}
              {editingSlot && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
                  <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Confirm & Edit Parsed Slot</h4>
                    <form onSubmit={handleSaveEditedSlot} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                        <input
                          type="text"
                          value={editingSlot.subjectName || ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, subjectName: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Batch / Group</label>
                          <input
                            type="text"
                            placeholder="e.g. A1 or leave blank"
                            value={editingSlot.labGroupCode || ''}
                            onChange={(e) => setEditingSlot({ ...editingSlot, labGroupCode: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Room</label>
                          <input
                            type="text"
                            value={editingSlot.roomCode || ''}
                            onChange={(e) => setEditingSlot({ ...editingSlot, roomCode: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingSlot(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-bold bg-teal-700 text-white rounded-lg shadow-xs hover:bg-teal-800"
                        >
                          Confirm Slot (100% Confidence)
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: COMMIT */}
          {step === 4 && (
            <div className="space-y-5">
              {commitError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{commitError}</span>
                </div>
              )}

              {unresolvedFaculty.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5">
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{unresolvedFaculty.length} Unresolved Faculty Member(s)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoResolveAllFaculty}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-2xs flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Resolve All as Guest</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    All faculty tokens in the timetable must be mapped before creating drafts. Click above to auto-resolve all or return to Step 2 to map specific faculty.
                  </p>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-teal-50 border border-teal-200 space-y-3">
                <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span>Ready to Commit Timetable as DRAFT</span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  The parsed schedule for <strong>{academicSession} ({term} Term)</strong> will be created as a <strong>DRAFT</strong> version.
                  Nothing has been saved or modified in the database yet.
                </p>
              </div>

              {/* Replace existing checkbox */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Archive and replace existing active timetable for this session/semester
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      If checked, any existing draft or published timetable for {academicSession} ({departmentCode}) will be automatically archived.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              step === 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2.5">
            {step < 4 ? (
              <button
                type="button"
                disabled={step === 1 && (!selectedFile || isUploading)}
                onClick={() => {
                  if (step === 1) handleStartImport();
                  else setStep(s => Math.min(4, s + 1));
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
                  (step === 1 && (!selectedFile || isUploading))
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                {isUploading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{step === 1 ? 'Upload & Parse Preview' : 'Next Step'}</span>
                {!isUploading && <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                disabled={isCommitting}
                onClick={async () => {
                  if (unresolvedFaculty.length > 0) {
                    handleAutoResolveAllFaculty();
                  }
                  await handleCommit();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-md flex items-center gap-2"
              >
                {isCommitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Commit as DRAFT Timetable</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
