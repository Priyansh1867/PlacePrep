// PlacePrep AI - Reports Exporter Page
// Dedicated institutional report generation module for authorized Teachers, HODs, and TPOs.
// Supports Drive Eligibility List, Final Placed Students Report, and Monthly Attendance Summary Report
// with Excel (.xlsx) and CSV exports, formula injection protection, and live previews.

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  CheckSquare
} from 'lucide-react';
import {
  isUserAuthorizedForReports,
  exportDriveEligibilityList,
  exportFinalPlacedReport,
  exportMonthlyAttendanceReport,
  generateDriveEligibilityReportData,
  generateFinalPlacedReportData,
  generateMonthlyAttendanceReportData,
  getPlacementSummaryStats,
  MONTH_NAMES
} from '../services/reportsExporterService';
import { getUpcomingDrives, getCurrentUser } from '../services/storage';
import { getAllStudents } from '../services/academicRecordsService';

export default function ReportsExporterPage({ onNavigate }) {
  const currentUser = getCurrentUser();
  const isAuthorized = isUserAuthorizedForReports(currentUser);

  // Active Report Type: 'drive-eligibility' | 'final-placed' | 'monthly-attendance'
  const [activeReport, setActiveReport] = useState('drive-eligibility');
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState('');

  // 1. Drive Eligibility Filters
  const drives = useMemo(() => getUpcomingDrives(), []);
  const [selectedDriveId, setSelectedDriveId] = useState(drives[0]?.id || 'drv-hcl-2026');
  const [driveBranchFilter, setDriveBranchFilter] = useState('All');

  const selectedDrive = useMemo(() => {
    return drives.find(d => (d.id || d.driveId) === selectedDriveId) || drives[0];
  }, [drives, selectedDriveId]);

  // 2. Final Placed Students Filters
  const [placedCompanyFilter, setPlacedCompanyFilter] = useState('All');
  const [deduplicateStudents, setDeduplicateStudents] = useState(true);

  // 3. Monthly Attendance Filters
  const [attendanceMonth, setAttendanceMonth] = useState(10); // Default to October 2026
  const [attendanceYear, setAttendanceYear] = useState(2026);
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState('All');

  // Datasets
  const allStudents = useMemo(() => getAllStudents(), []);

  // Compute live data rows for active report
  const driveEligibilityRows = useMemo(() => {
    if (!selectedDrive) return [];
    let rows = generateDriveEligibilityReportData(selectedDrive, allStudents);
    if (driveBranchFilter !== 'All') {
      rows = rows.filter(r => r.Branch === driveBranchFilter);
    }
    return rows;
  }, [selectedDrive, allStudents, driveBranchFilter]);

  const placedRows = useMemo(() => {
    return generateFinalPlacedReportData(placedCompanyFilter, deduplicateStudents);
  }, [placedCompanyFilter, deduplicateStudents]);

  const placementStats = useMemo(() => {
    return getPlacementSummaryStats(placedRows);
  }, [placedRows]);

  const attendanceRows = useMemo(() => {
    return generateMonthlyAttendanceReportData(attendanceMonth, attendanceYear, attendanceDeptFilter);
  }, [attendanceMonth, attendanceYear, attendanceDeptFilter]);

  // Handle Downloads
  const handleExportDriveEligibility = () => {
    if (!selectedDrive) return;
    const res = exportDriveEligibilityList(selectedDrive, exportFormat, allStudents);
    setDownloadSuccessMsg(`Downloaded ${res.rowCount} eligible student records in ${res.filename}`);
    setTimeout(() => setDownloadSuccessMsg(''), 5000);
  };

  const handleExportFinalPlaced = () => {
    const res = exportFinalPlacedReport(placedCompanyFilter, exportFormat, deduplicateStudents);
    setDownloadSuccessMsg(`Downloaded ${res.rowCount} placed student records in ${res.filename}`);
    setTimeout(() => setDownloadSuccessMsg(''), 5000);
  };

  const handleExportAttendance = () => {
    const res = exportMonthlyAttendanceReport(attendanceMonth, attendanceYear, attendanceDeptFilter, exportFormat);
    setDownloadSuccessMsg(`Downloaded monthly attendance summary (${res.rowCount} rows) in ${res.filename}`);
    setTimeout(() => setDownloadSuccessMsg(''), 5000);
  };

  // Report navigation tabs
  const reportTabs = [
    {
      id: 'drive-eligibility',
      title: 'Drive Eligibility List',
      icon: Briefcase,
      badge: `${driveEligibilityRows.length} Eligible`,
      desc: 'Export students matching drive CGPA, batch, and branch criteria'
    },
    {
      id: 'final-placed',
      title: 'Final Placed Students',
      icon: Award,
      badge: `${placedRows.length} Placed`,
      desc: 'Official placement offers, recruiters, CTC packages, and dates'
    },
    {
      id: 'monthly-attendance',
      title: 'Monthly Attendance Summary',
      icon: Calendar,
      badge: `${attendanceRows.length} Roster`,
      desc: 'Decoupled Academic Class vs CRT Training attendance percentages'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#111439] via-[#1E2659] to-[#253275] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Reports & Analytics Exporter • Faculty, HOD, TPO Cell</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Institutional Reports Exporter
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
                Generate audit-ready Excel (.xlsx) and CSV reports for placement drives, verified selections, and monthly attendance cohorts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('gateway')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition cursor-pointer"
                >
                  Return to Gateway
                </button>
              )}
            </div>
          </div>
        </div>

        {downloadSuccessMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Authorization Gate */}
        {!isAuthorized ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Access Restricted to Authorized Personnel</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              You are logged in as <strong>{currentUser.name}</strong> ({currentUser.role?.toUpperCase() || 'STUDENT'}).
              Exporting university placement reports and attendance records requires Teacher, HOD, or TPO privileges.
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('auth-portal')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
              >
                Switch to Faculty / TPO Account
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Report Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeReport === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveReport(tab.id)}
                    className={`p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{tab.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tab.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* REPORT 1: DRIVE ELIGIBILITY LIST */}
            {activeReport === 'drive-eligibility' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Filter and Configuration Strip */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      <span>Drive Eligibility Verification & List Exporter</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Extracts verified students who meet all CGPA, active backlog, branch, and batch criteria for the selected drive.
                    </p>
                  </div>

                  {/* Format and Download Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportDriveEligibility}
                      disabled={driveEligibilityRows.length === 0}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report ({driveEligibilityRows.length})</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Placement Drive</label>
                    <select
                      value={selectedDriveId}
                      onChange={(e) => setSelectedDriveId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      {drives.map(d => (
                        <option key={d.id || d.driveId} value={d.id || d.driveId}>
                          {d.companyName} — {d.role || 'Drive'} ({d.ctc || 'CTC TBD'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Filter by Branch</label>
                    <select
                      value={driveBranchFilter}
                      onChange={(e) => setDriveBranchFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="All">All Eligible Branches</option>
                      <option value="Computer Science and Engineering">Computer Science & Engg</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics and Communication Engineering">ECE</option>
                      <option value="Electrical and Electronics Engineering">EEE</option>
                      <option value="Mechanical Engineering">Mechanical</option>
                      <option value="Civil Engineering">Civil</option>
                    </select>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drive Criteria</span>
                    <span className="font-extrabold text-slate-800 block mt-0.5">
                      Min CGPA: {selectedDrive?.minCgpa || 6.0} • Max Backlogs: {selectedDrive?.maxBacklogs ?? 0}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Eligible Batches</span>
                    <span className="font-extrabold text-indigo-600 block mt-0.5">
                      {selectedDrive?.eligibleBatches ? selectedDrive.eligibleBatches.join(', ') : '2026, 2027'}
                    </span>
                  </div>
                </div>

                {/* Live Preview Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-slate-800">
                      Eligible Candidates Preview ({driveEligibilityRows.length} matching students)
                    </h3>
                    <span className="text-slate-500">
                      Evaluated against {allStudents.length} registered students
                    </span>
                  </div>

                  {driveEligibilityRows.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No registered students meet the eligibility thresholds for this drive with the selected filters.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                          <tr>
                            <th className="py-2.5 px-3">University Roll Number</th>
                            <th className="py-2.5 px-3">Student Full Name</th>
                            <th className="py-2.5 px-3">CGPA</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-3">Graduation Batch</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {driveEligibilityRows.map((stu, i) => (
                            <tr key={i} className="hover:bg-slate-50 font-medium">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                                {stu['University Roll Number']}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {stu['Student Name']}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-600">
                                {stu['CGPA']}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {stu['Branch']}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {stu['Graduation Batch']}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3" /> Eligible
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* REPORT 2: FINAL PLACED STUDENTS REPORT */}
            {activeReport === 'final-placed' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Filter and Configuration Strip */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <span>Final Placed Students Report</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Official export of finalized campus recruitment selections, offer letters, compensation packages, and dates.
                    </p>
                  </div>

                  {/* Format and Download Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportFinalPlaced}
                      disabled={placedRows.length === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report ({placedRows.length})</span>
                    </button>
                  </div>
                </div>

                {/* Placement Metrics Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Total Placed</span>
                    <p className="text-xl font-black text-emerald-900 mt-1">{placementStats.totalOffers}</p>
                  </div>
                  <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-700">Recruiting Companies</span>
                    <p className="text-xl font-black text-indigo-900 mt-1">{placementStats.uniqueCompanies}</p>
                  </div>
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Average CTC</span>
                    <p className="text-xl font-black text-amber-900 mt-1">{placementStats.avgPackageLpa}</p>
                  </div>
                  <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-700">Highest Offer</span>
                    <p className="text-xl font-black text-purple-900 mt-1">{placementStats.highestPackageLpa}</p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Filter by Company</label>
                      <select
                        value={placedCompanyFilter}
                        onChange={(e) => setPlacedCompanyFilter(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="All">All Companies</option>
                        <option value="Deloitte">Deloitte</option>
                        <option value="HCLTech">HCLTech</option>
                        <option value="TCS">TCS</option>
                        <option value="Accenture">Accenture</option>
                        <option value="Infosys">Infosys</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="dedup"
                        checked={deduplicateStudents}
                        onChange={(e) => setDeduplicateStudents(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <label htmlFor="dedup" className="text-slate-600 font-medium">
                        Roll up multi-offers (Unique students placed)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Live Preview Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">
                    Placed Candidates Records ({placedRows.length} confirmed selections)
                  </h3>

                  {placedRows.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No placement records found matching the selected company filter.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                          <tr>
                            <th className="py-2.5 px-3">Student Name</th>
                            <th className="py-2.5 px-3">Company</th>
                            <th className="py-2.5 px-3">Package (CTC)</th>
                            <th className="py-2.5 px-3">Offer Date</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-3">Job Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {placedRows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 font-medium">
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {r['Student Name']}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {r['Company']}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-600">
                                {r['Package']}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {r['Offer Date']}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {r['Branch']}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {r['Job Role']}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* REPORT 3: MONTHLY ATTENDANCE SUMMARY REPORT */}
            {activeReport === 'monthly-attendance' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Filter and Configuration Strip */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>Monthly Attendance Summary Report</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comprehensive cohort report keeping Academic Class Attendance and CRT Training Attendance strictly separated.
                    </p>
                  </div>

                  {/* Format and Download Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportAttendance}
                      disabled={attendanceRows.length === 0}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report ({attendanceRows.length})</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Month</label>
                    <select
                      value={attendanceMonth}
                      onChange={(e) => setAttendanceMonth(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Year</label>
                    <select
                      value={attendanceYear}
                      onChange={(e) => setAttendanceYear(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Filter by Department</label>
                    <select
                      value={attendanceDeptFilter}
                      onChange={(e) => setAttendanceDeptFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="All">All Departments</option>
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="IT">IT (Information Technology)</option>
                      <option value="ECE">ECE (Electronics)</option>
                    </select>
                  </div>
                </div>

                {/* Decoupling Notice */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
                  <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Strict Module Decoupling:</strong> Classroom academic attendance and CRT training attendance are tracked independently. Their sessions and percentage ratios are never combined.
                  </span>
                </div>

                {/* Live Preview Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">
                    Cohort Roster Preview for {MONTH_NAMES[attendanceMonth - 1]} {attendanceYear} ({attendanceRows.length} students)
                  </h3>

                  {attendanceRows.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No attendance sessions or records recorded for {MONTH_NAMES[attendanceMonth - 1]} {attendanceYear}.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                          <tr>
                            <th className="py-2.5 px-3">Roll No</th>
                            <th className="py-2.5 px-3">Student Name</th>
                            <th className="py-2.5 px-3">Dept</th>
                            <th className="py-2.5 px-3 bg-blue-50/60 text-blue-900 text-center">Class Held</th>
                            <th className="py-2.5 px-3 bg-blue-50/60 text-blue-900 text-center">Class Attended</th>
                            <th className="py-2.5 px-3 bg-blue-50/60 text-blue-900 text-center">Class %</th>
                            <th className="py-2.5 px-3 bg-emerald-50/60 text-emerald-900 text-center">CRT Held</th>
                            <th className="py-2.5 px-3 bg-emerald-50/60 text-emerald-900 text-center">CRT Attended</th>
                            <th className="py-2.5 px-3 bg-emerald-50/60 text-emerald-900 text-center">CRT %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendanceRows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 font-medium">
                              <td className="py-2 px-3 font-mono font-bold text-slate-700">
                                {r['Student Roll Number']}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {r['Student Name']}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                {r['Department']}
                              </td>
                              
                              {/* Academic Columns */}
                              <td className="py-2 px-3 text-center bg-blue-50/20 font-mono text-slate-700">
                                {r['Academic Classes Held']}
                              </td>
                              <td className="py-2 px-3 text-center bg-blue-50/20 font-mono font-semibold text-slate-800">
                                {r['Academic Classes Attended']}
                              </td>
                              <td className="py-2 px-3 text-center bg-blue-50/20 font-mono font-extrabold text-blue-700">
                                {r['Academic Attendance %']}
                              </td>

                              {/* CRT Columns */}
                              <td className="py-2 px-3 text-center bg-emerald-50/20 font-mono text-slate-700">
                                {r['CRT Training Sessions Held']}
                              </td>
                              <td className="py-2 px-3 text-center bg-emerald-50/20 font-mono font-semibold text-slate-800">
                                {r['CRT Sessions Attended']}
                              </td>
                              <td className="py-2 px-3 text-center bg-emerald-50/20 font-mono font-extrabold text-emerald-700">
                                {r['CRT Attendance %']}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
