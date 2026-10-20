// PlacePrep AI - Team 2: Institute Support
// Bulk Data Import & Export Center with Real-time XLSX / CSV Parsing and Validation

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layers, 
  Check, 
  X
} from 'lucide-react';
import { 
  exportStudentsToXLSX, 
  exportStudentsToCSV, 
  downloadSampleTemplate, 
  parseImportFile 
} from '../../utils/excelImportExport';
import { 
  getAllStudents, 
  saveStudent 
} from '../../services/academicRecordsService';

export default function ImportExportCenterView({ onImportCompleted }) {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'export'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccessMessage, setCommitSuccessMessage] = useState(null);

  // Export filters
  const [exportBranch, setExportBranch] = useState('All');
  const [exportBatch, setExportBatch] = useState('All');
  const [exportFormat, setExportFormat] = useState('xlsx');

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setParseError('Please upload a valid Microsoft Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setParseError(null);
    setParseResult(null);
    setCommitSuccessMessage(null);

    const existingStudents = getAllStudents();
    const result = await parseImportFile(file, existingStudents);

    setIsProcessing(false);
    if (result.error) {
      setParseError(result.error);
    } else {
      setParseResult(result);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleCommitImport = () => {
    if (!parseResult || !parseResult.rows) return;
    const validRows = parseResult.rows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsCommitting(true);
    let insertedCount = 0;

    validRows.forEach(row => {
      const res = saveStudent(row.studentData);
      if (res.success) {
        insertedCount++;
      }
    });

    setIsCommitting(false);
    setCommitSuccessMessage(`Successfully imported and committed ${insertedCount} student records to PlacePrep AI.`);
    setParseResult(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (onImportCompleted) {
      onImportCompleted();
    }
  };

  const handleExport = () => {
    let students = getAllStudents();
    if (exportBranch !== 'All') {
      students = students.filter(s => s.branch === exportBranch);
    }
    if (exportBatch !== 'All') {
      students = students.filter(s => s.graduationBatch === exportBatch);
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `PlacePrep_Students_${exportBatch}_${timestamp}.${exportFormat}`;

    if (exportFormat === 'csv') {
      exportStudentsToCSV(students, filename);
    } else {
      exportStudentsToXLSX(students, filename);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Bulk Import & Data Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional spreadsheet pipeline for Excel (.xlsx) and CSV batch operations
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Data Export</span>
          </button>
        </div>
      </div>

      {/* COMMIT SUCCESS ALERT */}
      {commitSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{commitSuccessMessage}</span>
          </div>
          <button
            onClick={() => setCommitSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: BULK IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          
          {/* Instructions and Download Template Strip */}
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 p-5 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Need a pre-formatted template?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download the standardized PlacePrep template including required columns, regular entry, and lateral diploma samples.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadSampleTemplate('xlsx')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sample Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => downloadSampleTemplate('csv')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Sample CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : 'border-slate-300 hover:border-indigo-400 bg-white'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-100">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {selectedFile ? selectedFile.name : 'Choose a spreadsheet or drag and drop it here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv) up to 10MB
            </p>
            {isProcessing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-600 font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing and validating student records...</span>
              </div>
            )}
          </div>

          {/* Parsing Error */}
          {parseError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3 shadow-sm">
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">File Parsing Error:</strong> {parseError}
              </div>
            </div>
          )}

          {/* PREVIEW & VALIDATION SUMMARY */}
          {parseResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
              
              {/* Summary Cards */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Verification & Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review valid and invalid records before committing to the student database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    Total: {parseResult.summary.totalRows}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Valid: {parseResult.summary.validRows}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    Invalid: {parseResult.summary.invalidRows}
                  </span>
                </div>
              </div>

              {/* Rows Preview Table */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">University Reg</th>
                      <th className="py-2.5 px-3">Branch</th>
                      <th className="py-2.5 px-3">Admission</th>
                      <th className="py-2.5 px-3">Validation Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseResult.rows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/60'}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                          {row.rowNumber}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              <X className="w-3 h-3" /> Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {row.studentData.fullName || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {row.studentData.rollNumber || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {row.studentData.registrationNumber || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {row.studentData.branch || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            row.studentData.admissionType?.includes('Lateral') 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {row.studentData.admissionType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-rose-700">
                          {row.errors && row.errors.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {row.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-600 font-medium text-[11px]">Ready for ingestion</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Only rows marked <strong className="text-emerald-700">Valid</strong> ({parseResult.summary.validRows}) will be saved to storage.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setParseResult(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleCommitImport}
                    disabled={parseResult.summary.validRows === 0 || isCommitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit {parseResult.summary.validRows} Records</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATA EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Export Student Academic Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate formatted spreadsheets containing full student personal data, admission categories, academic percentages, and backlog status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
            {/* Filter by Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Branch</label>
              <select
                value={exportBranch}
                onChange={(e) => setExportBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
              </select>
            </div>

            {/* Filter by Batch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Graduation Batch</label>
              <select
                value={exportBatch}
                onChange={(e) => setExportBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white"
              >
                <option value="All">All Batches</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            {/* File Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Export File Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white"
              >
                <option value="xlsx">Microsoft Excel (.xlsx)</option>
                <option value="csv">Standard CSV (.csv)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleExport}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Export ({exportFormat.toUpperCase()})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
