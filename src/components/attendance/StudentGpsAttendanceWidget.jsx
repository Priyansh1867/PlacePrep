import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Navigation,
  AlertTriangle,
  Camera,
  RefreshCw,
  UserCheck,
  Check,
  Sparkles,
  Lock,
  Unlock,
  Building2,
  ArrowRight,
  ArrowLeft,
  Eye,
  BookOpen,
  Calendar,
  Clock,
  Award,
  History,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  CheckSquare,
  QrCode,
  Scan,
  Zap
} from 'lucide-react';
import { StudentAttendanceApi } from '../../services/api';
import jsQR from 'jsqr';
import { getCurrentUser, getFullStudentProfile } from '../../services/storage';

export default function StudentGpsAttendanceWidget({
  onAttendanceMarked,
  sessionTitle = 'Regular Classroom & Academic Attendance',
  sessionType = 'CLASS'
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const [studentProfile, setStudentProfile] = useState(() => getFullStudentProfile() || {});

  // Navigation & Sub-views:
  // 'dashboard' = all subject cards
  // 'subject-detail' = lectures list for selected subject
  // 'mark-active' = 3-step geofence & face marking for chosen lecture
  // 'history' = full attendance history log
  const [activeView, setActiveView] = useState('dashboard');

  // Loaded Data from Database Backend
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [loadingSubjectDetails, setLoadingSubjectDetails] = useState(false);

  // Active Lecture targeted for attendance
  const [activeLecture, setActiveLecture] = useState(null);

  // Attendance History from DB
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Institute Geofence Status
  const [instituteStatus, setInstituteStatus] = useState(null);

  // Active Marking Steps: 1 = Geofence Check, 2 = Dynamic QR Code Scan, 3 = Confirmed
  const [markingStep, setMarkingStep] = useState(1);
  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [gpsResult, setGpsResult] = useState(null);
  const [gpsError, setGpsError] = useState('');

  // Camera & Dynamic QR Scanner
  const [cameraActive, setCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Final Attendance Record from Server
  const [attendanceResult, setAttendanceResult] = useState(null);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);
  const qrAnimFrameRef = useRef(null);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [qrError, setQrError] = useState('');
  const [manualQrInput, setManualQrInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Load Enrolled Subjects & Geofence Status on mount
  useEffect(() => {
    loadSubjectsData();
    loadGeofenceStatus();
  }, []);

  const loadGeofenceStatus = async () => {
    try {
      const res = await StudentAttendanceApi.getStatus();
      setInstituteStatus(res);
    } catch (e) {
      console.warn('Could not fetch institute status:', e);
    }
  };

  const loadSubjectsData = async () => {
    setLoadingSubjects(true);
    try {
      const res = await StudentAttendanceApi.getEnrolledSubjects(currentUser.email);
      setSubjects(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Error loading enrolled subjects from backend:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadSubjectDetails = async (code) => {
    setSelectedSubjectCode(code);
    setLoadingSubjectDetails(true);
    try {
      const res = await StudentAttendanceApi.getSubjectDetails(code, currentUser.email);
      setSubjectDetails(res);
      setActiveView('subject-detail');
    } catch (err) {
      console.error('Failed to load subject details:', err);
    } finally {
      setLoadingSubjectDetails(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await StudentAttendanceApi.getAttendanceHistory(currentUser.email);
      setAttendanceHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Could not load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Clean up camera on unmount or view change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);



  const stopCamera = () => {
    isScanningRef.current = false;
    if (qrAnimFrameRef.current) {
      cancelAnimationFrame(qrAnimFrameRef.current);
      qrAnimFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsScanningQr(false);
  };

  const startCamera = async () => {
    setQrError('');
    setIsSubmitting(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);
      setIsScanningQr(true);
      isScanningRef.current = true;
      runQrScanLoop();
    } catch (err) {
      console.warn('QR camera error:', err);
      setQrError('Camera access unavailable. You can enter the unique session code manually below.');
      setShowManualInput(true);
    }
  };

  const runQrScanLoop = () => {
    if (!isScanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && video.readyState >= 2 && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code && code.data && code.data.trim().length > 0) {
          isScanningRef.current = false;
          processQrSubmission(code.data.trim());
          return;
        }
      }
    }
    qrAnimFrameRef.current = requestAnimationFrame(runQrScanLoop);
  };

  const processQrSubmission = async (qrToken) => {
    setIsSubmitting(true);
    setQrError('');
    try {
      const payload = {
        sessionId: activeLecture?.sessionId || 1,
        qrToken: qrToken,
        studentEmail: currentUser.email || 'priyansh.jain@example.edu',
        latitude: gpsResult.studentLat,
        longitude: gpsResult.studentLon,
        gpsAccuracy: gpsResult.gpsAccuracy
      };

      const record = await StudentAttendanceApi.scanQrAttendance(payload);
      stopCamera();
      setAttendanceResult(record);
      setMarkingStep(3);

      loadSubjectsData();
      if (selectedSubjectCode) {
        loadSubjectDetails(selectedSubjectCode);
      }

      if (onAttendanceMarked) onAttendanceMarked(record);
      window.dispatchEvent(new CustomEvent('student-attendance-marked', { detail: record }));
    } catch (err) {
      setQrError(err.message || 'QR code verification failed. Code may have rotated. Please scan the current code.');
      setTimeout(() => {
        if (isScanningQr || !isScanningRef.current) {
          isScanningRef.current = true;
          runQrScanLoop();
        }
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start marking attendance for a specific lecture session
  const handleInitiateMarking = (lecture, subject) => {
    setActiveLecture({
      ...lecture,
      subjectCode: subject.code || subject.subjectCode,
      subjectName: subject.name || subject.subjectName,
      facultyName: subject.facultyName
    });
    setMarkingStep(1);
    setGpsResult(null);
    setGpsError('');
    setQrError('');
    setAttendanceResult(null);
    setActiveView('mark-active');
  };

  // ─── STEP 1: GEOFENCE VERIFICATION ─────────────────────────────────────────
  const handleVerifyGeofence = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsVerifyingGps(true);
    setGpsError('');
    setGpsResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 10.0;

          const res = await StudentAttendanceApi.verifyLocation(lat, lon);
          const enrichedResult = {
            ...res,
            studentLat: lat,
            studentLon: lon,
            gpsAccuracy: accuracy
          };
          setGpsResult(enrichedResult);

          if (res.withinGeofence) {
            setMarkingStep(2);
            startCamera();
          } else {
            setGpsError(
              `Geofence Check Failed: You are ${res.distanceMeters}m away from the campus center. Attendance can ONLY be marked within 100 meters.`
            );
          }
        } catch (err) {
          setGpsError(err.message || 'Server geofence verification failed.');
        } finally {
          setIsVerifyingGps(false);
        }
      },
      (geoErr) => {
        setIsVerifyingGps(false);
        let msg = 'Could not retrieve device location.';
        if (geoErr.code === 1) {
          msg = 'Location permission denied. Please allow GPS location in browser settings.';
        } else if (geoErr.code === 2) {
          msg = 'Location unavailable. Ensure GPS is enabled.';
        } else if (geoErr.code === 3) {
          msg = 'Location request timed out. Please retry.';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Summary Metrics across all subjects
  const overallMetrics = useMemo(() => {
    if (!subjects.length) return { totalHeld: 0, totalAttended: 0, overallPct: 100, shortageSubjects: 0 };
    let totalHeld = 0;
    let totalAttended = 0;
    let shortageSubjects = 0;
    subjects.forEach((s) => {
      totalHeld += s.totalApplicableLectures || 0;
      totalAttended += s.lecturesAttended || 0;
      if (s.isShortage) shortageSubjects++;
    });
    const overallPct = totalHeld > 0 ? Math.round((totalAttended * 100.0 / totalHeld) * 10.0) / 10.0 : 100.0;
    return { totalHeld, totalAttended, overallPct, shortageSubjects };
  }, [subjects]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
      
      {/* ─── Top Header & Global Status Bar ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 text-base sm:text-lg">
                Subject-Wise Geofencing Attendance
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
                100m Geofence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforced for <strong className="text-slate-800">{currentUser.name || 'Priyansh Jain'}</strong> • {currentUser.branch || 'CSE'} Sem 6 • Roll: {currentUser.rollNumber || '22CS0101'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'dashboard' || activeView === 'subject-detail'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Subjects</span>
          </button>

          <button
            onClick={() => {
              setActiveView('history');
              loadHistory();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Attendance History</span>
          </button>

          <button
            onClick={loadSubjectsData}
            title="Refresh from Database"
            className="p-2 text-slate-500 hover:text-slate-900 transition rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSubjects ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Metric Summary Ribbon ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Enrolled Subjects</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{subjects.length}</span>
          <span className="text-[11px] text-slate-500">Academic Semester 6</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">Overall Attendance</span>
          <span className="text-xl font-black text-teal-900 mt-1 block">{overallMetrics.overallPct}%</span>
          <span className="text-[11px] text-teal-700 font-medium">
            {overallMetrics.totalAttended} / {overallMetrics.totalHeld} Lectures Attended
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          overallMetrics.shortageSubjects > 0
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Eligibility Status</span>
          <span className="text-xl font-black mt-1 block">
            {overallMetrics.shortageSubjects > 0 ? `${overallMetrics.shortageSubjects} Shortage` : 'All Eligible'}
          </span>
          <span className="text-[11px] font-medium block">Threshold: &ge; 75.0%</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900">
          <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Campus Geofence</span>
          <span className="text-xl font-black mt-1 block truncate">
            {instituteStatus?.instituteName ? instituteStatus.instituteName.split(' ')[0] : 'DTU'}
          </span>
          <span className="text-[11px] font-medium block text-indigo-700">Strict 100m Radius</span>
        </div>
      </div>

      {/* ─── VIEW 1: SUBJECTS DASHBOARD GRID ─────────────────────────── */}
      {activeView === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Your Academic Subjects & Attendance
              </h3>
              <p className="text-xs text-slate-500">
                Select a subject to view lecture breakdown or mark attendance for an open lecture.
              </p>
            </div>
            {subjects.some((s) => s.hasOpenSession) && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Attendance Session Open Now</span>
              </span>
            )}
          </div>

          {loadingSubjects ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="text-xs font-semibold">Retrieving real-time attendance records from database...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">No enrolled subjects found</p>
              <p className="text-xs text-slate-500 mt-1">Please verify your department and semester enrollment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((sub) => {
                const isShortage = sub.isShortage || sub.attendancePercentage < 75.0;
                return (
                  <div
                    key={sub.subjectCode}
                    className={`rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
                      isShortage
                        ? 'border-amber-300 bg-gradient-to-b from-white to-amber-50/30 hover:border-amber-400 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Code & Status */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-[11px] font-black">
                          {sub.subjectCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isShortage
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {sub.attendanceStatus || (isShortage ? 'Attendance Shortage' : 'Eligible')}
                        </span>
                      </div>

                      {/* Subject Name & Faculty */}
                      <h4 className="font-black text-slate-900 text-sm mt-3 line-clamp-1" title={sub.subjectName}>
                        {sub.subjectName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Faculty: <strong className="text-slate-700">{sub.facultyName || 'Department Faculty'}</strong>
                      </p>

                      {/* Attendance Percentage Progress */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-slate-500 text-[11px] font-semibold">Attendance</span>
                          <span className={`font-black text-sm ${isShortage ? 'text-rose-600' : 'text-teal-700'}`}>
                            {sub.attendancePercentage}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isShortage ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, sub.attendancePercentage))}%` }}
                          />
                        </div>
                      </div>

                      {/* Lecture Numbers Breakdown */}
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total</span>
                          <span className="text-xs font-black text-slate-800">{sub.totalApplicableLectures}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[9px] font-bold text-emerald-700 uppercase block">Attended</span>
                          <span className="text-xs font-black text-emerald-800">{sub.lecturesAttended}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                          <span className="text-[9px] font-bold text-rose-700 uppercase block">Missed</span>
                          <span className="text-xs font-black text-rose-800">{sub.lecturesMissed}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      {sub.hasOpenSession && sub.nextOpenSession ? (
                        <button
                          type="button"
                          onClick={() => handleInitiateMarking(sub.nextOpenSession, sub)}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Mark Lecture {sub.nextOpenSession.lectureNumber || ''} (Open Now)</span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => loadSubjectDetails(sub.subjectCode)}
                        className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Lecture Schedule & Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW 2: SUBJECT DETAILS & LECTURES LIST ─────────────────── */}
      {activeView === 'subject-detail' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Subjects</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              {subjectDetails?.subjectCode}
            </span>
          </div>

          {loadingSubjectDetails ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="text-xs font-semibold">Loading lectures and attendance records...</p>
            </div>
          ) : subjectDetails ? (
            <div className="space-y-6">
              {/* Subject Detail Header Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-mono text-[10px] font-black">
                      {subjectDetails.subjectCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Credits: {subjectDetails.credits} • Sem {subjectDetails.semester}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {subjectDetails.subjectName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Faculty Instructor: <strong>{subjectDetails.facultyName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs self-stretch md:self-auto justify-around">
                  <div className="text-center px-3 border-r border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Percentage</span>
                    <span className={`text-xl font-black ${subjectDetails.isShortage ? 'text-rose-600' : 'text-teal-700'}`}>
                      {subjectDetails.attendancePercentage}%
                    </span>
                  </div>
                  <div className="text-center px-3 border-r border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Attended</span>
                    <span className="text-xl font-black text-slate-800">
                      {subjectDetails.lecturesAttended} / {subjectDetails.totalApplicableLectures}
                    </span>
                  </div>
                  <div className="text-center px-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                    <span
                      className={`text-xs font-black px-2 py-1 rounded-md block mt-1 ${
                        subjectDetails.isShortage ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {subjectDetails.attendanceStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lecture List Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Scheduled Lectures & Attendance History
                  </h4>
                  <span className="text-xs text-slate-500">
                    {subjectDetails.lectures?.length || 0} Total Lectures
                  </span>
                </div>

                <div className="space-y-3">
                  {subjectDetails.lectures?.map((lec) => {
                    const isPresent = lec.studentStatus === 'PRESENT' || lec.studentStatus === 'LATE';
                    const isAbsent = lec.studentStatus === 'ABSENT';
                    const isOpen = lec.canMark;

                    return (
                      <div
                        key={lec.sessionId}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isOpen
                            ? 'bg-teal-50/50 border-teal-300 shadow-xs'
                            : isPresent
                            ? 'bg-white border-slate-200'
                            : isAbsent
                            ? 'bg-rose-50/30 border-rose-200'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : isAbsent
                                ? 'bg-rose-100 text-rose-800'
                                : isOpen
                                ? 'bg-teal-600 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            L{lec.lectureNumber || lec.periodNumber || '•'}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-900 text-sm">
                                {lec.lectureTitle || `Lecture ${lec.lectureNumber}`}
                              </h5>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                                {lec.startTime} - {lec.endTime}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                              <span>Date: <strong>{lec.sessionDate}</strong></span>
                              <span>Faculty: <strong>{lec.facultyName}</strong></span>
                              {lec.distanceMeters !== null && lec.distanceMeters !== undefined && (
                                <span className="text-teal-700">Distance: {lec.distanceMeters}m from center</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Status & Mark Action */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {isOpen ? (
                            <button
                              type="button"
                              onClick={() => handleInitiateMarking(lec, subjectDetails)}
                              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Mark Attendance Now</span>
                            </button>
                          ) : isPresent ? (
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Present ({lec.markedAt?.slice(11, 16) || 'Recorded'})</span>
                            </div>
                          ) : isAbsent ? (
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Absent</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100">
                              {lec.sessionStatus || 'Scheduled'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ─── VIEW 3: ACTIVE LECTURE ATTENDANCE MARKING (3 STEPS) ──────── */}
      {activeView === 'mark-active' && activeLecture && (
        <div className="space-y-6">
          {/* Header Bar identifying the Lecture */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 block">
                Target Lecture Session
              </span>
              <h3 className="font-black text-base mt-0.5">
                {activeLecture.subjectName} ({activeLecture.subjectCode})
              </h3>
              <p className="text-xs text-teal-100 mt-0.5">
                Lecture {activeLecture.lectureNumber || ''}: <strong>{activeLecture.lectureTitle}</strong> • {activeLecture.startTime} - {activeLecture.endTime}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveView('subject-detail');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition self-start sm:self-auto cursor-pointer"
            >
              Cancel / Change Lecture
            </button>
          </div>

          {/* 3-Step Wizard Indicator */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                markingStep === 1
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : gpsResult?.withinGeofence
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {gpsResult?.withinGeofence ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <MapPin className="w-3.5 h-3.5" />}
              <span>1. 100m Geofence</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                markingStep === 2
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : markingStep === 3
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {markingStep === 3 ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <QrCode className="w-3.5 h-3.5" />}
              <span>2. Dynamic QR Scan</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                markingStep === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Saved in Database</span>
            </div>
          </div>

          {/* Step 1: Geofence Verification */}
          {markingStep === 1 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Mandatory 100-Meter Geofence Verification
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Attendance can only be marked when physically located on campus (&le; 100m from configured college center).
                    The browser will acquire your coordinates and verify them server-side using the Haversine distance formula.
                  </p>
                </div>
              </div>

              {gpsError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  <span>Configured Campus: {instituteStatus?.instituteName || 'College Campus'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyGeofence}
                  disabled={isVerifyingGps}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingGps ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying GPS Distance...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Verify Geofence Location</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Dynamic QR Code Scanner (Anti-Screenshot) */}
          {markingStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block">
                      Geofence Verified: {gpsResult?.distanceMeters}m from Campus Center
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Within allowed 100m boundary. Next: Scan the live dynamic QR code displayed on the faculty screen.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase">
                  Within 100m
                </span>
              </div>

              {/* Dynamic QR Scanner Viewfinder Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Anti-Cheat & Lecture Details */}
                <div className="md:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Session Authentication
                  </span>

                  <div className="relative mx-auto w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gradient-to-tr from-slate-900 via-indigo-900 to-teal-800 flex flex-col items-center justify-center text-white p-3">
                    <QrCode className="w-12 h-12 text-teal-300 mb-1 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">
                      Dynamic QR Active
                    </span>
                    <span className="text-[8px] text-indigo-200 text-center mt-0.5">
                      Rotates on Every Scan
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {activeLecture?.lectureTitle || 'Lecture Session'}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Subject: {selectedSubjectCode}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Faculty: {activeLecture?.facultyName || 'Department Faculty'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900 font-medium text-left">
                    ⚡ <strong>Anti-Cheat Active:</strong> The QR code rotates immediately upon each student's scan. Screenshots or photos cannot be shared.
                  </div>
                </div>

                {/* Right: Camera Scanner */}
                <div className="md:col-span-7 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Live QR Camera Viewfinder
                  </span>

                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-400 shadow-inner flex items-center justify-center">
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

                    {cameraActive && isScanningQr && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-48 h-48 border-2 border-indigo-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-teal-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-teal-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-teal-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-teal-400 rounded-br-lg" />
                          <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Point at Faculty QR
                          </span>
                        </div>
                      </div>
                    )}

                    {!cameraActive && (
                      <div className="text-center p-6 text-slate-400">
                        <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs font-semibold">Camera is paused</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md transition"
                        >
                          Enable QR Camera
                        </button>
                      </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {isSubmitting && (
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                      <span>Verifying live dynamic QR code and recording attendance...</span>
                    </div>
                  )}

                  {qrError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span>{qrError}</span>
                        <span className="block text-[11px] text-rose-600 font-normal">
                          Point your camera at the newly updated QR code on the faculty screen. The scanner will retry automatically!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Manual Code Input Fallback */}
                  <div className="pt-2 border-t border-slate-100">
                    {!showManualInput ? (
                      <button
                        type="button"
                        onClick={() => setShowManualInput(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <Scan className="w-3.5 h-3.5" />
                        <span>Can't use camera? Enter session code manually</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Enter QR Code Token displayed on faculty screen:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualQrInput}
                            onChange={(e) => setManualQrInput(e.target.value)}
                            placeholder="e.g. PP-ATT-..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (manualQrInput.trim()) {
                                processQrSubmission(manualQrInput.trim());
                              }
                            }}
                            disabled={isSubmitting || !manualQrInput.trim()}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {markingStep === 3 && attendanceResult && (
            <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-50/80 to-teal-50/40 border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Attendance Confirmed & Saved!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Your attendance for <strong>{activeLecture.subjectName}</strong> ({activeLecture.subjectCode}) has been
                  authoritatively recorded in the database.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border border-emerald-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Lecture:</span>
                  <span className="font-bold text-slate-800">
                    L{activeLecture.lectureNumber || ''} — {activeLecture.lectureTitle}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Marked Status:</span>
                  <span className="font-black text-emerald-700 uppercase">PRESENT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Recorded At:</span>
                  <span className="font-mono text-slate-800">{attendanceResult.markedAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Geofence Distance:</span>
                  <span className="font-bold text-teal-700">{attendanceResult.distanceMeters || 0}m (&le; 100m)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Verification Method:</span>
                  <span className="font-bold text-indigo-700">{attendanceResult.verificationMethod || '100M_GEOFENCE_AND_DYNAMIC_QR'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => loadSubjectDetails(activeLecture.subjectCode)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  View Subject Lectures
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW 4: FULL ATTENDANCE HISTORY LOG ─────────────────────── */}
      {activeView === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Your Complete Lecture Attendance History
              </h3>
              <p className="text-xs text-slate-500">
                Audited attendance records saved in the backend database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by subject or topic..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={loadHistory}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="text-xs font-semibold">Retrieving attendance logs from database...</p>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <History className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">No attendance history records found</p>
              <p className="text-xs text-slate-500 mt-1">Mark attendance for an open lecture to see your audit trail.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Lecture</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Geofence Distance</th>
                    <th className="px-4 py-3">Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceHistory
                    .filter((h) => {
                      if (!historySearch) return true;
                      const q = historySearch.toLowerCase();
                      return (
                        (h.subjectName && h.subjectName.toLowerCase().includes(q)) ||
                        (h.subjectCode && h.subjectCode.toLowerCase().includes(q)) ||
                        (h.lectureTitle && h.lectureTitle.toLowerCase().includes(q))
                      );
                    })
                    .map((h, idx) => (
                      <tr key={h.recordId || idx} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          L{h.lectureNumber || '•'} — {h.lectureTitle || 'Class Session'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{h.subjectName || h.subjectCode}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{h.subjectCode}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {h.sessionDate} • {h.startTime || 'Period'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {h.status || 'PRESENT'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-teal-700">
                          {h.distanceMeters !== null && h.distanceMeters !== undefined ? `${h.distanceMeters}m` : '< 100m'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {h.recordedAt}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
