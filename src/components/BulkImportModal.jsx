// PlacePrep AI - Bulk Student Registration Modal
// Full-featured spreadsheet upload (.xlsx, .csv), real-time row-by-row validation,
// in-file and database duplicate detection, error reporting, and safe batch ingestion.

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
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck
} from 'lucide-react';
import {
  downloadStudentTemplate,
  parseStudentSpreadsheet,
  downloadImportErrorReport,
  commitStudentImport,
  isUserAuthorizedForImport
} from '../services/studentRegistrationService';
import { getAllStudents, syncAcademicRecordsWithDatabase } from '../services/academicRecordsService';
import { AuthApi } from '../services/api';
import { getCurrentUser } from '../services/storage';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const currentUser = getCurrentUser();
  const isAuthorized = isUserAuthorizedForImport(currentUser);

  // Workflow state: 'upload' | 'preview' | 'confirm' | 'complete'
  const [step, setStep] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Valid' | 'Invalid' | 'Duplicate'

  // Commit state
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSummary, setCommitSummary] = useState(null);

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

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setParseError('Please upload a valid Microsoft Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);

    const existingStudents = getAllStudents();
    const result = await parseStudentSpreadsheet(file, existingStudents);

    setIsParsing(false);
    if (result.error) {
      setParseError(result.error);
    } else {
      setParseResult(result);
      setStep('preview');
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || !parseResult.rows) return;
    const eligibleRows = parseResult.rows.filter(r => r.status === 'Valid');
    if (eligibleRows.length === 0) return;

    setIsCommitting(true);
    // 1. Commit to local storage & records
    const result = commitStudentImport(eligibleRows, currentUser);

    // 2. Commit to remote database via bulk-register endpoint
    try {
      const dbPayload = eligibleRows.map(r => ({
        name: r.fullName,
        fullName: r.fullName,
        email: r.email,
        rollNumber: r.rollNumber,
        studentId: r.rollNumber,
        branch: r.branch,
        college: r.collegeName || 'Delhi Technological University (DTU)',
        graduationBatch: r.graduationBatch || '2026',
        cgpa: r.cgpa ? parseFloat(r.cgpa) : null,
        tenthPercentage: r.tenthPercentage ? parseFloat(r.tenthPercentage) : null,
        twelfthPercentage: r.twelfthPercentage ? parseFloat(r.twelfthPercentage) : null
      }));
      await AuthApi.bulkRegisterStudents(dbPayload);
    } catch (dbErr) {
      console.warn('Backend bulk register failed, falling back to sync:', dbErr);
    }

    // 3. Trigger full academic records database sync
    try {
      await syncAcademicRecordsWithDatabase();
    } catch (syncErr) {
      console.warn('Sync academic records with database failed:', syncErr);
    }

    setIsCommitting(false);

    setCommitSummary({
      importedCount: result.importedCount,
      skippedCount: parseResult.summary.totalRows - result.importedCount,
      errors: result.errors
    });
    setStep('complete');

    if (onImportSuccess) {
      onImportSuccess(result.importedCount);
    }
  };

  const handleResetModal = () => {
    setStep('upload');
    setSelectedFile(null);
    setParseResult(null);
    setParseError(null);
    setCommitSummary(null);
    setStatusFilter('All');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter preview table rows
  const visibleRows = parseResult?.rows.filter(r => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Student Bulk Registration
              </h3>
              <p className="text-xs text-slate-500">
                Institutional spreadsheet pipeline for Excel (.xlsx) and CSV batch student enrollment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Authorization Check */}
          {!isAuthorized && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Unauthorized Operation</span>
              </div>
              <p>
                Bulk student registration is strictly restricted to authorized Teachers, HODs, TPO Officers, and Placement Coordinators. Current role ({currentUser.role || 'STUDENT'}) does not have import privileges.
              </p>
            </div>
          )}

          {isAuthorized && (
            <>
              {/* STEP 1: UPLOAD & TEMPLATE */}
              {step === 'upload' && (
                <div className="space-y-6">
                  {/* Template Download Strip */}
                  <div className="bg-gradient-to-r from-indigo-50/50 via-slate-50 to-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-indigo-600" />
                        Download Official Student Template
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Includes required columns (Name, College Email, Roll No, Batch, Branch, CGPA) and sample records.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadStudentTemplate('xlsx')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 shadow-xs flex items-center gap-1.5 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Excel Template (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadStudentTemplate('csv')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>CSV Template (.csv)</span>
                      </button>
                    </div>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50/60'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-indigo-200">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">
                      Choose an Excel (.xlsx) or CSV (.csv) spreadsheet, or drag and drop
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Max file size: 10MB. Safe parsing with formula execution prevention.
                    </p>

                    {isParsing && (
                      <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying worksheet headers and evaluating row constraints...</span>
                      </div>
                    )}
                  </div>

                  {/* Parsing Error */}
                  {parseError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">File Ingestion Error:</strong> {parseError}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PREVIEW & IN-DEPTH VALIDATION */}
              {step === 'preview' && parseResult && (
                <div className="space-y-4">
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Total Rows</span>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{parseResult.summary.totalRows}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-bold uppercase text-emerald-700">Valid</span>
                      <p className="text-lg font-black text-emerald-800 mt-0.5">{parseResult.summary.validRows}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                      <span className="text-[10px] font-bold uppercase text-rose-700">Invalid</span>
                      <p className="text-lg font-black text-rose-800 mt-0.5">{parseResult.summary.invalidRows}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                      <span className="text-[10px] font-bold uppercase text-amber-700">Duplicates</span>
                      <p className="text-lg font-black text-amber-800 mt-0.5">{parseResult.summary.duplicateRows}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase text-indigo-700">Eligible</span>
                      <p className="text-lg font-black text-indigo-800 mt-0.5">{parseResult.summary.eligibleRows}</p>
                    </div>
                  </div>

                  {/* Filter & Action Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                      {['All', 'Valid', 'Invalid', 'Duplicate'].map(filter => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            statusFilter === filter
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {(parseResult.summary.invalidRows > 0 || parseResult.summary.duplicateRows > 0) && (
                      <button
                        type="button"
                        onClick={() => downloadImportErrorReport(parseResult.rows, 'csv')}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Skipped Rows Report</span>
                      </button>
                    )}
                  </div>

                  {/* Rows Preview Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Row #</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3">Roll Number</th>
                          <th className="py-2.5 px-3">Student Full Name</th>
                          <th className="py-2.5 px-3">Branch</th>
                          <th className="py-2.5 px-3">Batch</th>
                          <th className="py-2.5 px-3">CGPA</th>
                          <th className="py-2.5 px-3">Issue / Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {visibleRows.map((row) => (
                          <tr
                            key={row.rowNumber}
                            className={`hover:bg-slate-50 ${
                              row.status === 'Invalid'
                                ? 'bg-rose-50/40'
                                : row.status === 'Duplicate'
                                ? 'bg-amber-50/40'
                                : ''
                            }`}
                          >
                            <td className="py-2 px-3 font-mono text-slate-500 font-bold">
                              {row.rowNumber}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {row.status === 'Valid' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <Check className="w-3 h-3" /> Valid
                                </span>
                              ) : row.status === 'Duplicate' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <AlertTriangle className="w-3 h-3" /> Duplicate
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  <X className="w-3 h-3" /> Invalid
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                              {row.rollNumber}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {row.studentName}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {row.branch}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {row.cleanData?.graduationBatch || '-'}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              {row.cgpa}
                            </td>
                            <td className="py-2 px-3 text-[11px]">
                              {row.status === 'Valid' ? (
                                <span className="text-emerald-600 font-medium">Ready to import</span>
                              ) : (
                                <span className={row.status === 'Duplicate' ? 'text-amber-800' : 'text-rose-700'}>
                                  {row.issue}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION STEP */}
              {step === 'confirm' && parseResult && (
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-xs border border-indigo-200">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    Confirm Student Batch Registration
                  </h4>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto">
                    You are about to ingest <strong className="text-indigo-700">{parseResult.summary.eligibleRows} valid student profiles</strong> into PlacePrep AI.
                    Invalid records ({parseResult.summary.invalidRows}) and duplicate records ({parseResult.summary.duplicateRows}) will be safely skipped.
                  </p>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">File Ingested:</span>
                      <span className="font-bold text-slate-800">{selectedFile?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Eligible Records to Save:</span>
                      <span className="font-extrabold text-emerald-600">{parseResult.summary.eligibleRows} Students</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Records to Skip:</span>
                      <span className="font-bold text-rose-600">{parseResult.summary.invalidRows + parseResult.summary.duplicateRows} Rows</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: COMPLETION FEEDBACK */}
              {step === 'complete' && commitSummary && (
                <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">
                    Bulk Import Completed Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Successfully enrolled <strong className="text-emerald-700">{commitSummary.importedCount} student records</strong> into university academic records, class attendance rosters, and placement eligibility checks.
                  </p>

                  {commitSummary.skippedCount > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs max-w-md mx-auto">
                      {commitSummary.skippedCount} invalid or duplicate rows were skipped to maintain data integrity.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            {step === 'preview' && (
              <button
                type="button"
                onClick={handleResetModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Upload Different File</span>
              </button>
            )}
            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Preview</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              {step === 'complete' ? 'Close Window' : 'Cancel'}
            </button>

            {isAuthorized && step === 'preview' && (
              <button
                type="button"
                onClick={() => setStep('confirm')}
                disabled={parseResult?.summary.eligibleRows === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Import ({parseResult?.summary.eligibleRows})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isAuthorized && step === 'confirm' && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isCommitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Records...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Ingest {parseResult?.summary.eligibleRows} Records</span>
                  </>
                )}
              </button>
            )}

            {step === 'complete' && (
              <button
                type="button"
                onClick={() => {
                  handleResetModal();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Done
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
