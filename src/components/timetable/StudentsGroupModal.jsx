import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Users,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function StudentsGroupModal({
  isOpen,
  onClose,
  timetableId,
  sections: _sections = []
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'import'
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const fileInputRef = useRef(null);

  // Inline edit state
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupCode, setEditGroupCode] = useState('');

  const loadStudentGroups = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await MasterTimetableApi.getStudentGroups(timetableId);
      setStudentGroups(data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load student groups.');
    } finally {
      setLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    if (!isOpen || !timetableId) return;
    loadStudentGroups();
  }, [isOpen, timetableId, loadStudentGroups]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFileSelected = async (file) => {
    if (!file) return;
    setImportFile(file);
    setIsUploading(true);
    setErrorMsg('');

    try {
      const preview = await MasterTimetableApi.uploadStudentGroups(timetableId, file);
      setImportPreview(preview);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse student groups file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importPreview?.validRows) return;
    setIsCommitting(true);
    setErrorMsg('');

    try {
      await MasterTimetableApi.commitStudentGroups({
        timetableId,
        rows: importPreview.validRows
      });
      showNotification('Student group assignments committed successfully.');
      setImportPreview(null);
      setImportFile(null);
      setActiveTab('list');
      loadStudentGroups();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to commit student groups.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleUpdateStudentGroup = async (group) => {
    try {
      await MasterTimetableApi.updateStudentGroup(group.id, {
        labGroupCode: editGroupCode
      });
      setStudentGroups(studentGroups.map(g => g.id === group.id ? { ...g, labGroupCode: editGroupCode } : g));
      setEditingGroupId(null);
      showNotification(`Updated student ${group.rollNo || group.studentName}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update student group.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-groups-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-teal-600" />
            <div>
              <h2 id="student-groups-title" className="text-base font-bold text-slate-900">
                Student Section & Lab Group Rosters
              </h2>
              <p className="text-xs text-slate-500">
                Assign students by Roll Number to Section & Lab Group (A1/A2) for timetable resolution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 gap-4 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Assigned Students ({studentGroups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'import'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Roster (CSV / Excel)</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                  <div>Loading student assignments...</div>
                </div>
              ) : studentGroups.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <div>No student group assignments found. Upload a roster via the upload tab.</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="px-3.5 py-2.5">Roll No</th>
                        <th className="px-3.5 py-2.5">Student Name</th>
                        <th className="px-3.5 py-2.5">Section</th>
                        <th className="px-3.5 py-2.5">Lab Group</th>
                        <th className="px-3.5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {studentGroups.map(g => {
                        const isEditing = editingGroupId === g.id;
                        return (
                          <tr key={g.id} className="hover:bg-slate-50">
                            <td className="px-3.5 py-2 font-bold text-slate-900">{g.rollNo || '—'}</td>
                            <td className="px-3.5 py-2">{g.studentName || 'Student'}</td>
                            <td className="px-3.5 py-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                Section {g.sectionName || 'A'}
                              </span>
                            </td>
                            <td className="px-3.5 py-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editGroupCode}
                                  onChange={(e) => setEditGroupCode(e.target.value)}
                                  className="w-20 px-2 py-0.5 border border-teal-400 rounded text-xs font-bold text-teal-800"
                                  autoFocus
                                />
                              ) : g.labGroupCode ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                                  {g.labGroupCode}
                                </span>
                              ) : (
                                <span className="text-amber-600 text-[11px] font-medium">Unassigned</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2 text-right">
                              {isEditing ? (
                                <div className="space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStudentGroup(g)}
                                    className="px-2 py-0.5 bg-teal-700 text-white text-[10px] font-bold rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingGroupId(null)}
                                    className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGroupId(g.id);
                                    setEditGroupCode(g.labGroupCode || '');
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-teal-700"
                                  title="Edit lab group"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/30 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900">
                  {importFile ? importFile.name : 'Click or drop Student Group roster here'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  CSV or Excel columns: <strong>RollNo, Section, LabGroup</strong> (e.g. 23EBKCS001, A, A1)
                </div>
              </div>

              {isUploading && (
                <div className="text-center text-xs text-slate-500 py-4">
                  <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-1" />
                  <div>Parsing roster and verifying students...</div>
                </div>
              )}

              {/* Preview */}
              {importPreview && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Roster Preview ({importPreview.totalRows || 0} Rows)</span>
                    <span className="text-emerald-700 font-bold">
                      {importPreview.validRows?.length || 0} Matched Students
                    </span>
                  </div>

                  {importPreview.unmatchedRows && importPreview.unmatchedRows.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>{importPreview.unmatchedRows.length} Unmatched Roll Numbers:</span>
                      </div>
                      <div className="text-[11px] text-amber-800">
                        {importPreview.unmatchedRows.slice(0, 5).join(', ')}
                        {importPreview.unmatchedRows.length > 5 ? '...' : ''}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isCommitting || !importPreview.validRows?.length}
                      onClick={handleCommitImport}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-2"
                    >
                      {isCommitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>Commit {importPreview.validRows?.length || 0} Student Group Assignments</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
