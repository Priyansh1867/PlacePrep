import React, { useState, useEffect, useRef } from 'react';
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
  ScanFace,
  Lock,
  Unlock,
  Building2,
  ArrowRight,
  Eye,
  Upload
} from 'lucide-react';
import { StudentAttendanceApi, ManagementApi } from '../../services/api';
import { getCurrentUser, getFullStudentProfile } from '../../services/storage';

export default function StudentGpsAttendanceWidget({
  onAttendanceMarked,
  sessionTitle = 'Regular Classroom & CRT Attendance Session',
  sessionType = 'CLASS'
}) {
  const [currentUser] = useState(() => getCurrentUser() || {});
  const [studentProfile, setStudentProfile] = useState(() => getFullStudentProfile() || {});

  // Steps: 1 = Geofence Check, 2 = Photo Capture & Face Verification, 3 = Marked Present
  const [currentStep, setCurrentStep] = useState(1);

  // Geofence state
  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [gpsResult, setGpsResult] = useState(null);
  const [gpsError, setGpsError] = useState('');

  // Camera & Face Verification state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const [faceError, setFaceError] = useState('');

  // Attendance Result state
  const [attendanceResult, setAttendanceResult] = useState(null);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setFaceError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setFaceError(
        'Unable to access camera. Please allow camera permissions in your browser or upload a clear selfie.'
      );
    }
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
          const res = await StudentAttendanceApi.verifyLocation(lat, lon);
          setGpsResult({
            ...res,
            studentLat: lat,
            studentLon: lon,
          });

          if (res.withinGeofence) {
            setCurrentStep(2);
            startCamera();
          } else {
            setGpsError(
              `Geofence Check Failed: You are ${res.distanceMeters}m away from the institute. Attendance is ONLY permitted within the 100-meter campus perimeter.`
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
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // ─── STEP 2: PHOTO CAPTURE & FACE VERIFICATION ────────────────────────────
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);
    stopCamera();

    // Trigger face identity match with profile photo
    processFaceVerification(photoDataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCapturedPhoto(dataUrl);
      stopCamera();
      processFaceVerification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processFaceVerification = async (photoData) => {
    setIsVerifyingFace(true);
    setFaceError('');
    setFaceResult(null);

    try {
      // 1. Verify face identity against registered student profile photo
      const verifyRes = await StudentAttendanceApi.verifyFace(photoData);

      if (!verifyRes.verified) {
        setFaceError(
          'Facial verification mismatch: The captured photo does not match the registered student profile photo. Please try again with clear lighting.'
        );
        setIsVerifyingFace(false);
        return;
      }

      setFaceResult(verifyRes);

      // 2. Mark Attendance on Backend with GPS coordinates + Face Verification Proof
      const markPayload = {
        latitude: gpsResult.studentLat,
        longitude: gpsResult.studentLon,
        photo: photoData,
        faceVerified: true,
        sessionType,
      };

      const markRes = await StudentAttendanceApi.markAttendance(markPayload);

      const finalRecord = {
        ...markRes,
        photoUrl: photoData,
        matchScore: verifyRes.matchScore,
        studentName: currentUser.name || 'Priyansh Jain',
        rollNumber: currentUser.rollNumber || '22CS0101',
        markedTime: new Date().toLocaleTimeString(),
      };

      setAttendanceResult(finalRecord);
      setCurrentStep(3);

      // Notify parent or dispatch event so tables update
      if (onAttendanceMarked) onAttendanceMarked(finalRecord);
      window.dispatchEvent(new CustomEvent('student-attendance-marked', { detail: finalRecord }));
    } catch (err) {
      setFaceError(err.message || 'Face verification service error. Please re-capture.');
    } finally {
      setIsVerifyingFace(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setFaceResult(null);
    setFaceError('');
    startCamera();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
      
      {/* ─── Top Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
            <ScanFace className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 text-base">
                GPS Geofence & Facial Identity Attendance
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
                100m Geofence Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Session: <strong className="text-slate-800">{sessionTitle}</strong>
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentStep === 1
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : gpsResult?.withinGeofence
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {gpsResult?.withinGeofence ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            ) : (
              <MapPin className="w-3.5 h-3.5" />
            )}
            <span>1. 100m Geofence</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentStep === 2
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : currentStep === 3
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {currentStep === 3 ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>2. Photo Face Match</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentStep === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Present</span>
          </div>
        </div>
      </div>

      {/* ─── STEP 1: GEOFENCE REQUIREMENT NOTICE & CHECK ────────────── */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Mandatory Campus Geofencing Rule (Fixed 100m)
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Per college attendance policy, attendance can <strong>ONLY</strong> be marked when you are physically
                  located inside the institute campus (distance &le; 100 meters). Proxy or off-campus marking is
                  permanently blocked.
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
                <span>GPS coordinates calculated server-side using Haversine formula</span>
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
        </div>
      )}

      {/* ─── STEP 2: CAMERA & PROFILE PHOTO MATCHING ─────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Geofence Verified Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold block">
                  Campus Geofence Passed: {gpsResult?.distanceMeters}m from Institute Center
                </span>
                <span className="text-[11px] text-emerald-700">
                  You are within the 100m boundary. Next: Click photo to verify your face identity with your profile photo.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase">
              Eligible
            </span>
          </div>

          {/* Camera & Profile Photo Comparison Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Registered Student Profile Photo & Identity */}
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Registered Profile Identity
              </span>

              {/* Profile Photo Display */}
              <div className="relative mx-auto w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gradient-to-tr from-indigo-500 via-violet-500 to-teal-400 flex items-center justify-center">
                {studentProfile.basicDetails?.profilePhoto ? (
                  <img
                    src={studentProfile.basicDetails.profilePhoto}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
                    <span className="text-3xl font-black">
                      {currentUser.name
                        ? currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                        : 'PJ'}
                    </span>
                    <span className="text-[10px] text-teal-300 font-bold uppercase mt-1">
                      Reference Photo
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow-xs">
                  Original
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {currentUser.name || 'Priyansh Jain'}
                </h4>
                <p className="text-[11px] font-mono text-slate-500">
                  Roll: {currentUser.rollNumber || '22CS0101'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {currentUser.branch || 'CSE'} • Batch {currentUser.graduationBatch || '2028'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                <ScanFace className="w-3.5 h-3.5 text-indigo-600" />
                <span>Facial Match Threshold: <strong>80%+ Match</strong></span>
              </div>
            </div>

            {/* Right: Live Camera Stream & Capture */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Live Camera Capture (Look into camera)
              </span>

              {/* Viewport */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-300 shadow-inner flex items-center justify-center">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured selfie" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    
                    {/* Face Oval Alignment Guide */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-teal-400/80 shadow-[0_0_20px_rgba(20,184,166,0.3)] flex flex-col items-center justify-between p-3 animate-pulse">
                          <span className="text-[10px] font-bold text-teal-300 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-xs">
                            Align Face Here
                          </span>
                          <span className="text-[9px] text-teal-200 bg-slate-950/70 px-2 py-0.5 rounded-full">
                            Anti-Spoof Active
                          </span>
                        </div>
                      </div>
                    )}

                    {!cameraActive && (
                      <div className="text-center p-6 text-slate-400">
                        <Camera className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs font-semibold">Camera is initializing...</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Enable Webcam
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Verification progress or error */}
              {isVerifyingFace && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Comparing captured selfie with registered profile photo...</span>
                </div>
              )}

              {faceError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{faceError}</span>
                </div>
              )}

              {/* Capture / Retake Actions */}
              <div className="flex items-center gap-3 pt-1">
                {capturedPhoto ? (
                  <button
                    type="button"
                    onClick={handleRetake}
                    disabled={isVerifyingFace}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={!cameraActive || isVerifyingFace}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Click Photo & Verify Identity</span>
                    </button>

                    <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0" title="Upload selfie if no camera">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: ATTENDANCE CONFIRMED (PRESENT) ─────────────────── */}
      {currentStep === 3 && attendanceResult && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  ✓ Geofence + Face Verified
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Attendance Marked: PRESENT
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Identity match confirmed with profile photo • Geofence distance: {attendanceResult.distanceMeters}m
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end text-center sm:text-right shrink-0">
              <span className="text-xs font-semibold text-emerald-100">Logged At</span>
              <span className="text-lg font-black font-mono">{attendanceResult.markedTime}</span>
              <span className="text-[10px] text-emerald-200">
                Verified: {attendanceResult.studentName} ({attendanceResult.rollNumber})
              </span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-teal-600" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">100m Geofence</span>
                <span className="font-extrabold text-slate-800">{attendanceResult.distanceMeters}m from Institute</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <ScanFace className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Biometric Face Match</span>
                <span className="font-extrabold text-emerald-600">{attendanceResult.matchScore}% Match Confirmed</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Status</span>
                <span className="font-extrabold text-emerald-700">PRESENT Recorded</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
