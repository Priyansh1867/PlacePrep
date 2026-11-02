import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Building,
  GraduationCap
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function StudentMasterTimetableView({ currentUser }) {
  const [activeTimetable, setActiveTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabularData, setTabularData] = useState(null);
  const [loadingTabular, setLoadingTabular] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const branch = currentUser?.branch || 'CSE';
  const semester = currentUser?.semester || 'Semester 5';
  const section = currentUser?.section || 'All Sections';

  const fetchStudentTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MasterTimetableApi.getStudentActiveTimetable({
        branch,
        semester,
        section
      });

      if (res && res.hasActiveTimetable && res.timetable) {
        setActiveTimetable(res.timetable);
        // If Excel or CSV, fetch tabular preview
        const fname = res.timetable.fileName ? res.timetable.fileName.toLowerCase() : '';
        if (fname.endsWith('.xlsx') || fname.endsWith('.xls') || fname.endsWith('.csv')) {
          setLoadingTabular(true);
          try {
            const tableRes = await MasterTimetableApi.getPreviewData(res.timetable.id);
            if (tableRes && tableRes.rows) setTabularData(tableRes);
          } catch (e) {
            console.warn('Tabular fetch error:', e);
          } finally {
            setLoadingTabular(false);
          }
        }
      } else {
        setActiveTimetable(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to load master timetable.');
      setActiveTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentTimetable();
  }, [branch, semester, section]);

  const getFormatIcon = (fileName = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      return <ImageIcon className="w-5 h-5 text-sky-500" />;
    }
    return <FileText className="w-5 h-5 text-indigo-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Retrieving official academic timetable…</p>
      </div>
    );
  }

  if (!activeTimetable) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">No Published Timetable Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Institute management has not published an official master timetable for{' '}
            <strong className="text-slate-700">{branch} ({semester})</strong> yet. Any newly published schedules will automatically appear here.
          </p>
        </div>
        <button
          onClick={fetchStudentTimetable}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 animate-in fade-in duration-200 text-slate-900 ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/80 p-4 backdrop-blur-xs flex flex-col justify-center' : ''
    }`}>
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            {getFormatIcon(activeTimetable.fileName)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Official Published Schedule
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Version {activeTimetable.version || 1}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">{activeTimetable.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTimetable.department} • {activeTimetable.academicSession} • {activeTimetable.section || 'All Sections'}
              {activeTimetable.effectiveStartDate && ` • Effective: ${activeTimetable.effectiveStartDate}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href={MasterTimetableApi.getFileUrl(activeTimetable.id)}
            download={activeTimetable.fileName || 'Master_Timetable.pdf'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewer Card */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col ${
        isFullscreen ? 'flex-1 max-h-[85vh]' : 'h-[620px]'
      }`}>
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-auto flex items-center justify-center">
          {tabularData && tabularData.rows && tabularData.rows.length > 0 ? (
            /* Spreadsheet tabular preview */
            <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Official Class Schedule Sheet</span>
                </span>
                <span className="text-slate-400">{tabularData.rowCount} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    {tabularData.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx === 0 ? 'bg-indigo-50 font-bold border-b border-indigo-100 text-indigo-900' : 'hover:bg-slate-50 border-b border-slate-100'}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 border-r border-slate-100 text-slate-700 whitespace-nowrap">
                            {cell || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTimetable.fileName && (activeTimetable.fileName.toLowerCase().endsWith('.png') || activeTimetable.fileName.toLowerCase().endsWith('.jpg') || activeTimetable.fileName.toLowerCase().endsWith('.jpeg') || activeTimetable.fileName.toLowerCase().endsWith('.webp')) ? (
            /* Image viewer */
            <img
              src={MasterTimetableApi.getFileUrl(activeTimetable.id)}
              alt={activeTimetable.title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-md"
            />
          ) : (
            /* PDF iframe viewer */
            <iframe
              src={MasterTimetableApi.getFileUrl(activeTimetable.id)}
              title={activeTimetable.title}
              className="w-full h-full rounded-2xl border border-slate-200 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
