import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  Building,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  getHodDepartment,
  downloadFacultyImportTemplate,
  bulkImportDepartmentFaculty,
  getStoredDepartmentFaculty
} from '../../services/hodFacultyService';

export default function FacultyBulkImportModal({ isOpen, onClose, currentUser, onImportSuccess }) {
  const hodDepartment = getHodDepartment(currentUser);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'complete'
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Valid' | 'Invalid'
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSummary, setCommitSummary] = useState(null);
  const [parseError, setParseError] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    setSelectedFile(file);
    setParseError(null);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet);

      if (!rawRows || rawRows.length === 0) {
        throw new Error('Spreadsheet appears to be empty. Please check your data or use our sample template.');
      }

      // Existing department faculty to detect duplicates
      const existing = getStoredDepartmentFaculty(hodDepartment);
      const existingEmails = new Set(existing.map(f => (f.email || '').toLowerCase()));
      const existingIds = new Set(existing.map(f => (f.facultyId || '').toUpperCase()));

      const seenEmailsInFile = new Set();
      const seenIdsInFile = new Set();

      const validList = [];
      const invalidList = [];
      const processedAll = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2; // header is row 1
        const name = (row['Full Name'] || row.Name || row.name || '').toString().trim();
        const email = (row['Official Email'] || row['Email Address'] || row.Email || row.email || '').toString().trim().toLowerCase();
        const facultyId = (row['Faculty ID'] || row['Employee ID'] || row.facultyId || row.FacultyId || '').toString().trim().toUpperCase();
        const phone = (row['Mobile Number'] || row.Phone || row.phone || '').toString().trim();
        const designation = (row['Designation'] || row.designation || 'Assistant Professor').toString().trim();
        const specialization = (row['Specialization'] || row['Subject'] || row.specialization || '').toString().trim();
        const qualification = (row['Qualification'] || row.qualification || '').toString().trim();
        const joiningDate = (row['Joining Date'] || row.joiningDate || new Date().toISOString().slice(0, 10)).toString().trim();
        const status = (row['Status'] || row.status || 'ACTIVE').toString().trim().toUpperCase();

        const errors = [];
        if (!name) errors.push('Full Name is required');
        if (!email) errors.push('Official Email is required');
        else if (!email.includes('@') || !email.includes('.')) errors.push('Invalid email format');

        if (!facultyId) errors.push('Faculty ID is required');

        let isDuplicate = false;
        if (email) {
          if (seenEmailsInFile.has(email)) {
            errors.push('Duplicate email in this file');
            isDuplicate = true;
          } else if (existingEmails.has(email)) {
            errors.push('Email already registered in department');
            isDuplicate = true;
          } else {
            seenEmailsInFile.add(email);
          }
        }

        if (facultyId) {
          if (seenIdsInFile.has(facultyId)) {
            errors.push('Duplicate Faculty ID in this file');
            isDuplicate = true;
          } else if (existingIds.has(facultyId)) {
            errors.push('Faculty ID already exists in department');
            isDuplicate = true;
          } else {
            seenIdsInFile.add(facultyId);
          }
        }

        const parsedItem = {
          rowNumber: rowNum,
          name,
          email,
          facultyId,
          phone,
          designation,
          specialization,
          qualification,
          joiningDate,
          status,
          department: hodDepartment,
          isValid: errors.length === 0,
          isDuplicate,
          errors
        };

        processedAll.push(parsedItem);
        if (parsedItem.isValid) {
          validList.push(parsedItem);
        } else {
          invalidList.push(parsedItem);
        }
      });

      setParsedRows(processedAll);
      setValidRows(validList);
      setInvalidRows(invalidList);
      setStep('preview');
    } catch (err) {
      setParseError(err.message || 'Failed to read file. Please verify file format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommit = async () => {
    if (validRows.length === 0) return;
    setIsCommitting(true);

    try {
      const result = await bulkImportDepartmentFaculty(validRows, currentUser);
      setCommitSummary(result);
      setStep('complete');
      if (onImportSuccess) {
        onImportSuccess(result.successCount || validRows.length);
      }
    } catch (err) {
      setParseError(err.message || 'Failed to complete bulk ingestion.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setParsedRows([]);
    setValidRows([]);
    setInvalidRows([]);
    setCommitSummary(null);
    setParseError(null);
  };

  const filteredPreview = parsedRows.filter(r => {
    if (statusFilter === 'Valid') return r.isValid;
    if (statusFilter === 'Invalid') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Bulk Import Faculty</h3>
            <p className="text-xs text-slate-500">
              Department restricted bulk registration for {hodDepartment} faculty members (.xlsx, .csv).
            </p>
          </div>
        </div>

        {/* Department Lock Indicator */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">Target Department: {hodDepartment}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Auto-Assigned</span>
          </span>
        </div>

        {parseError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition ${
                dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                {isParsing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">
                {isParsing ? 'Parsing Faculty Roster...' : 'Drag and drop your spreadsheet here'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                Supports Microsoft Excel (.xlsx, .xls) and CSV files.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                Browse Files
              </button>
            </div>

            {/* Template Download Option */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Download Sample Faculty Template</h5>
                  <p className="text-[11px] text-slate-500">Pre-formatted columns with sample records.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadFacultyImportTemplate('csv')}
                  className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadFacultyImportTemplate('xlsx')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & VALIDATION */}
        {step === 'preview' && (
          <div className="space-y-4">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`p-3 rounded-2xl border text-center transition ${statusFilter === 'All' ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Rows</span>
                <span className="text-lg font-black text-slate-900">{parsedRows.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Valid')}
                className={`p-3 rounded-2xl border text-center transition ${statusFilter === 'Valid' ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className="text-[10px] font-bold text-emerald-600 block uppercase">Ready to Enroll</span>
                <span className="text-lg font-black text-emerald-700">{validRows.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Invalid')}
                className={`p-3 rounded-2xl border text-center transition ${statusFilter === 'Invalid' ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className="text-[10px] font-bold text-rose-600 block uppercase">Errors / Duplicates</span>
                <span className="text-lg font-black text-rose-700">{invalidRows.length}</span>
              </button>
            </div>

            {/* Rows Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-[11px] font-bold text-slate-500">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Faculty ID</th>
                    <th className="p-2.5">Designation</th>
                    <th className="p-2.5">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreview.map((r, i) => (
                    <tr key={i} className={r.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40 hover:bg-rose-50/70'}>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">#{r.rowNumber}</td>
                      <td className="p-2.5">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px]">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{r.name || '—'}</td>
                      <td className="p-2.5 font-mono text-slate-600 text-[11px]">{r.email || '—'}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800 text-[11px]">{r.facultyId || '—'}</td>
                      <td className="p-2.5 text-slate-600">{r.designation}</td>
                      <td className="p-2.5 text-rose-600 font-medium text-[11px]">
                        {r.errors.length > 0 ? r.errors.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Upload Different File
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={validRows.length === 0 || isCommitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-40 inline-flex items-center gap-2"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting Faculty...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Enroll {validRows.length} Valid Faculty Members</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETE SUMMARY */}
        {step === 'complete' && commitSummary && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Bulk Ingestion Complete!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Faculty members have been saved into the official {hodDepartment} department roster.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto my-4 text-left">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-700 block uppercase">Successfully Added</span>
                <span className="text-2xl font-black text-emerald-800">{commitSummary.successCount || 0}</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-extrabold text-rose-700 block uppercase">Rejected / Skipped</span>
                <span className="text-2xl font-black text-rose-800">{commitSummary.failureCount || 0}</span>
              </div>
            </div>

            {commitSummary.failed && commitSummary.failed.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs max-h-40 overflow-y-auto">
                <h5 className="font-bold text-rose-900 mb-2">Failed Record Details:</h5>
                <ul className="space-y-1 text-[11px] text-rose-700">
                  {commitSummary.failed.map((f, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-mono font-bold">Row {f.row}:</span>
                      <span>{f.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              Done & View Department Roster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
