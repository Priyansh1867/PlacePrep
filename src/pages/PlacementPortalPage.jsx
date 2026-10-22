import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  FileText,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  Download,
  ExternalLink,
  Code2,
  Video,
  Bell,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckSquare,
  Plus
} from 'lucide-react';
import {
  getCurrentUser,
  getGraduationBatch,
  getUpcomingDrives,
  getEligibilityMatrix,
  getLiveSessions,
  addLiveSession,
  rsvpLiveSession,
  getOffCampusCompanies,
  getPushNotifications,
  broadcastPushNotification,
  getFeedbackLoop,
  addFeedbackLoopEntry
} from '../services/storage';
import PortalModuleCards from '../components/PortalModuleCards';
import LiveSessionsManager from '../components/sessions/LiveSessionsManager';
import PlacementDebriefSystem from '../components/feedback/PlacementDebriefSystem';
import UserProfileMenu from '../components/UserProfileMenu';

export default function PlacementPortalPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const [activeTab, setActiveTab] = useState('drives');
  // 'drives', 'eligibility-criteria', 'live-sessions', 'shortlisted', 'internships', 'feedback-loop', 'off-campus', 'push-notifications'

  const currentUser = getCurrentUser();
  const [drives, setDrives] = useState(getUpcomingDrives());
  const [eligibilityMatrix, setEligibilityMatrix] = useState(getEligibilityMatrix());
  const [liveSessions, setLiveSessions] = useState(getLiveSessions());
  const [offCampus, setOffCampus] = useState(getOffCampusCompanies());
  const [notifications, setNotifications] = useState(getPushNotifications());
  const [feedbackLoop, setFeedbackLoop] = useState(getFeedbackLoop());

  // Push notification form modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    category: 'Drive Update',
    priority: 'High',
    targetAudience: 'All Final & Pre-Final Students'
  });
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState('');

  // Live session create modal state
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveForm, setLiveForm] = useState({
    companyName: 'HCLTech',
    title: '',
    speaker: '',
    date: '2026-10-25',
    time: '04:00 PM - 05:30 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/campus-live-session',
    agenda: ''
  });
  const [liveSuccessMsg, setLiveSuccessMsg] = useState('');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    const updated = broadcastPushNotification(broadcastForm);
    setNotifications(updated);
    setIsBroadcastModalOpen(false);
    setBroadcastForm({
      title: '',
      message: '',
      category: 'Drive Update',
      priority: 'High',
      targetAudience: 'All Final & Pre-Final Students'
    });
    setBroadcastSuccessMsg('Push notification broadcasted successfully across student & faculty portals!');
    setTimeout(() => setBroadcastSuccessMsg(''), 5000);
  };

  const handleCreateLiveSession = (e) => {
    e.preventDefault();
    if (!liveForm.title || !liveForm.speaker) return;

    const newSession = {
      id: `live-${Date.now()}`,
      ...liveForm,
      rsvpsCount: 0,
      isLiveNow: false,
      status: 'Scheduled'
    };

    const updated = addLiveSession(newSession);
    setLiveSessions(updated);
    setIsLiveModalOpen(false);
    setLiveSuccessMsg(`Live Session "${liveForm.title}" scheduled and published to student calendars!`);
    setTimeout(() => setLiveSuccessMsg(''), 5000);
  };

  const navTabs = [
    { id: 'drives', label: 'Upcoming Drives', icon: Briefcase, badge: `${drives.length}` },
    { id: 'eligibility-criteria', label: 'Company Eligibility Criteria', icon: CheckSquare },
    { id: 'live-sessions', label: 'Live Sessions & PPTs', icon: Video, badge: `${liveSessions.length}` },
    { id: 'shortlisted', label: 'Shortlisted Students', icon: Users, badge: 'Pipeline' },
    { id: 'internships', label: 'Internship Details', icon: Award, roles: ['tpo', 'coordinator', 'director'] },
    { id: 'feedback-loop', label: 'Feedback (TPO ↔ Company)', icon: MessageSquare },
    { id: 'off-campus', label: 'Off-Campus (Final Year)', icon: ExternalLink, roles: ['tpo', 'coordinator', 'director'] },
    { id: 'push-notifications', label: 'Push Notifications', icon: Bell, badge: `${notifications.length}`, roles: ['tpo', 'coordinator', 'director'] }
  ];
  const visibleNavTabs = navTabs.filter((tab) => !tab.roles || tab.roles.includes(currentUser.role || 'tpo'));

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#111439] via-[#0E2829] to-[#162740] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Placement Portal • HR, Director, TPO, Placement Coordinator</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Corporate Hiring & Placement Control Center
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-2xl">
                Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role?.toUpperCase() || 'TPO OFFICER'}) • Placement Season 2026-2027
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Broadcast Push Alert</span>
              </button>
              <button
                onClick={() => onNavigate('gateway')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Switch Portal</span>
              </button>
              <UserProfileMenu onNavigate={onNavigate} theme="dark" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/60 text-xs">
            <div>
              <span className="text-emerald-300 block">Upcoming Drives:</span>
              <span className="font-black text-base text-white">{drives.length} Companies Scheduled</span>
            </div>
            <div>
              <span className="text-emerald-300 block">Live PPT Sessions:</span>
              <span className="font-black text-base text-emerald-400">{liveSessions.length} Corporate Webinars</span>
            </div>
            <div>
              <span className="text-emerald-300 block">Shortlisted Candidates:</span>
              <span className="font-black text-base text-amber-300">142 In Active Pipeline</span>
            </div>
            <div>
              <span className="text-emerald-300 block">TPO-Company Loops:</span>
              <span className="font-black text-base text-white">{feedbackLoop.length} Reviews Logged</span>
            </div>
          </div>
        </div>

        {broadcastSuccessMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{broadcastSuccessMsg}</span>
          </div>
        )}
        {liveSuccessMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{liveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Image-first role-aware workspace cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <PortalModuleCards items={visibleNavTabs} activeId={activeTab} onSelect={setActiveTab} tone="emerald" />
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto">
        
        {/* TAB 1: UPCOMING DRIVES / PLACEMENT */}
        {activeTab === 'drives' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Active Campus Recruitment Drives Management</h3>
                <p className="text-xs text-slate-500">Corporate drive schedule, packages, eligibility parameters, and stages.</p>
              </div>
              <button
                onClick={() => onNavigate('drives')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <span>Full Drives Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map(drive => (
                <div
                  key={drive.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-xs text-slate-900">{drive.companyName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {drive.status || 'Verified Drive'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{drive.role}</h4>
                    <p className="text-xs font-bold text-emerald-600 mb-4">Package: {drive.ctc}</p>

                    <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-slate-500">
                        <span>Drive Date:</span>
                        <span className="font-semibold text-slate-800">{drive.driveDate}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Venue:</span>
                        <span className="font-semibold text-slate-800">{drive.venue || 'Campus Auditorium & Labs'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Eligible Batches:</span>
                        <span className="font-semibold text-slate-800">{drive.eligibleBatches?.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectCompany && onSelectCompany({ id: drive.companyId, name: drive.companyName })}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition"
                    >
                      Company Hub
                    </button>
                    <button
                      onClick={() => onNavigate('workflow')}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                    >
                      Shortlists
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY-WISE ELIGIBILITY CRITERIA MATRIX */}
        {activeTab === 'eligibility-criteria' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">Company-Wise Eligibility Criteria Matrix</h3>
              <p className="text-xs text-slate-500 mb-6">Official cutoff thresholds mandated by corporate recruiting partners.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Min 10th %</th>
                      <th className="p-3">Min 12th %</th>
                      <th className="p-3">Min CGPA</th>
                      <th className="p-3">Active Backlogs</th>
                      <th className="p-3">Gap Years</th>
                      <th className="p-3">Bond Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibilityMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-bold text-slate-900">{item.companyName}</td>
                        <td className="p-3 font-semibold text-slate-700">{item.role}</td>
                        <td className="p-3">{item.min10th}%</td>
                        <td className="p-3">{item.min12th}%</td>
                        <td className="p-3 font-bold text-emerald-600">{item.minCgpa} CGPA</td>
                        <td className="p-3 font-semibold text-slate-700">{item.maxActiveBacklogs === 0 ? 'Zero Backlogs' : `${item.maxActiveBacklogs} allowed`}</td>
                        <td className="p-3">{item.gapYearsAllowed} year(s)</td>
                        <td className="p-3 text-slate-500">{item.bondPeriod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE SESSIONS & WORKSHOP MANAGER */}
        {activeTab === 'live-sessions' && (
          <div className="space-y-6">
            <LiveSessionsManager onNavigate={onNavigate} />
          </div>
        )}

        {/* TAB 4: SHORTLISTED STUDENTS */}
        {activeTab === 'shortlisted' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Candidate Shortlisting & Selection Workflow Engine</h3>
                <p className="text-xs text-slate-500 mt-1">Multi-round candidate advancement, elimination tracking, and evaluator scoring sheets.</p>
              </div>

              <button
                onClick={() => onNavigate('workflow')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <span>Open Full Selection Workflow</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: INTERNSHIP DETAILS */}
        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">Corporate Internship & PPO Analytics</h3>
              <p className="text-xs text-slate-500 mb-6">Monitoring summer & winter internships, stipend payouts, and full-time conversion rates.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Active Interns:</span>
                  <span className="text-3xl font-black text-indigo-600">86 Students</span>
                  <p className="text-xs text-slate-500 mt-2">Engaged in Microsoft, Goldman Sachs, Amazon, and DRDO internships.</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Average Stipend:</span>
                  <span className="text-3xl font-black text-emerald-600">₹68,500 / mo</span>
                  <p className="text-xs text-slate-500 mt-2">Highest stipend recorded: ₹1,25,000 / mo (Microsoft).</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">PPO Conversion Rate:</span>
                  <span className="text-3xl font-black text-purple-600">82.4%</span>
                  <p className="text-xs text-slate-500 mt-2">71 students converted summer internships into full-time pre-placement offers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PLACEMENT FEEDBACK & DEBRIEF SYSTEM */}
        {activeTab === 'feedback-loop' && (
          <div className="space-y-6">
            <PlacementDebriefSystem />
          </div>
        )}

        {/* TAB 7: OFF-CAMPUS (FINAL YEAR) */}
        {activeTab === 'off-campus' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">Off-Campus Companies Management</h3>
              <p className="text-xs text-slate-500 mb-6">Verified national drives published strictly for final year graduating batches.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offCampus.map(comp => (
                  <div key={comp.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">{comp.companyName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Final Year Only
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{comp.role}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-2">{comp.ctc}</p>
                      <p className="text-xs text-slate-500 mb-3">{comp.description}</p>
                    </div>

                    <a
                      href={comp.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs text-center hover:bg-slate-900 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Recruiter Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PUSH NOTIFICATIONS BROADCAST CENTER */}
        {activeTab === 'push-notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Push Notifications Broadcasting Center</h3>
                  <p className="text-xs text-slate-500 mt-1">Dispatch high-priority announcements, test links, and drive updates to student and faculty portals.</p>
                </div>
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>New Broadcast</span>
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                        notif.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{notif.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {notif.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">Target: {notif.targetAudience}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BROADCAST PUSH NOTIFICATION MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Broadcast Instant Push Notification</h3>
            <p className="text-xs text-slate-500 mb-4">Send real-time alerts to registered student devices and email notifications.</p>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. TCS Digital Coding Round Link Active"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notification Message *</label>
                <textarea
                  rows="3"
                  required
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Provide test instructions, meeting URL, or eligibility alert..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All Final & Pre-Final Students">All Final & Pre-Final Students</option>
                    <option value="Final Year Only (2025/2026)">Final Year Only (2025/2026)</option>
                    <option value="Shortlisted Candidates">Shortlisted Candidates Only</option>
                    <option value="Department Faculty">Faculty & HODs</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE LIVE SESSION MODAL */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Schedule Pre-Placement Talk / Live Session</h3>
            <p className="text-xs text-slate-500 mb-4">Set up a corporate briefing webinar for student placement registration.</p>

            <form onSubmit={handleCreateLiveSession} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={liveForm.companyName}
                    onChange={(e) => setLiveForm({ ...liveForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Speaker Name & Title *</label>
                  <input
                    type="text"
                    required
                    value={liveForm.speaker}
                    onChange={(e) => setLiveForm({ ...liveForm, speaker: e.target.value })}
                    placeholder="Mr. Arvind Saxena (Talent Lead)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={liveForm.title}
                  onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                  placeholder="HCLTech Pre-Placement Talk & Q&A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={liveForm.date}
                    onChange={(e) => setLiveForm({ ...liveForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={liveForm.time}
                    onChange={(e) => setLiveForm({ ...liveForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting URL (Google Meet / Zoom) *</label>
                <input
                  type="url"
                  required
                  value={liveForm.joinUrl}
                  onChange={(e) => setLiveForm({ ...liveForm, joinUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Agenda / Brief</label>
                <textarea
                  rows="2"
                  value={liveForm.agenda}
                  onChange={(e) => setLiveForm({ ...liveForm, agenda: e.target.value })}
                  placeholder="Topics to be covered in this pre-placement talk..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLiveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Publish Live Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
