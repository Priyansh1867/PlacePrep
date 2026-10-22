import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarPlus
} from 'lucide-react';
import { getLiveSessions, addLiveSession, rsvpLiveSession, getCurrentUser } from '../../services/storage';

const SESSION_CATEGORIES = [
  { id: 'all', label: 'All Live Sessions', icon: Video },
  { id: 'prep-webinar', label: 'Prep Webinars', icon: BookOpen, badge: 'Prep' },
  { id: 'alumni-talk', label: 'Alumni Talk Sessions', icon: GraduationCap, badge: 'Alumni' },
  { id: 'ppt', label: 'Pre-Placement Talks (PPT)', icon: Briefcase, badge: 'Corporate' }
];

const INITIAL_EXPANDED_SESSIONS = [
  {
    id: 'live-01',
    category: 'ppt',
    categoryLabel: 'Pre-Placement Talk (PPT)',
    companyName: 'HCLTech',
    title: 'HCLTech Campus Recruitment PPT & Role Overview',
    speaker: 'Mr. Arvind Saxena (Senior Director - Talent Acquisition)',
    date: '2026-10-25',
    time: '04:00 PM - 05:30 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/hcl-campus-ppt-2026',
    rsvpsCount: 248,
    agenda: 'Overview of HCLTech Engineering services, salary structure, round 1 syllabus, and live student Q&A.',
    targetBatches: ['2026', '2027', '2028']
  },
  {
    id: 'live-02',
    category: 'prep-webinar',
    categoryLabel: 'Prep Webinar',
    companyName: 'PlacePrep Masterclass',
    title: 'Cracking Graph & Dynamic Programming in 45-Minute Tech Rounds',
    speaker: 'Neha Sharma (Principal Software Architect & Competitive Programmer)',
    date: '2026-10-27',
    time: '06:00 PM - 07:30 PM',
    platform: 'Zoom',
    joinUrl: 'https://zoom.us/j/placeprep-dsa-masterclass',
    rsvpsCount: 312,
    agenda: 'Live problem solving: Topological sort, shortest path, and interval DP with interview edge-case testing.',
    targetBatches: ['2026', '2027', '2028', '2029']
  },
  {
    id: 'live-03',
    category: 'alumni-talk',
    categoryLabel: 'Alumni Talk Session',
    companyName: 'Alumni Mentorship Network',
    title: 'From College Tier-2 to Google & Amazon: The Unfiltered Roadmap',
    speaker: 'Aarav Singhal (SDE-2 at Google, Alumnus 2023)',
    date: '2026-10-30',
    time: '07:00 PM - 08:15 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/google-alumni-talk-2026',
    rsvpsCount: 420,
    agenda: 'How to build resume projects that stand out, handle behavioral STAR questions, and negotiate compensation.',
    targetBatches: ['2026', '2027', '2028']
  }
];

export default function LiveSessionsManager({ onNavigate }) {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_live_sessions_v2');
      if (saved) return JSON.parse(saved);
      const existing = getLiveSessions();
      if (existing && existing.length > 0) {
        // Map to ensure categories
        return existing.map((s, idx) => ({
          ...s,
          category: s.category || (idx % 3 === 0 ? 'ppt' : idx % 3 === 1 ? 'prep-webinar' : 'alumni-talk'),
          categoryLabel: s.categoryLabel || (s.title?.toLowerCase().includes('ppt') ? 'Pre-Placement Talk (PPT)' : s.title?.toLowerCase().includes('alumni') ? 'Alumni Talk Session' : 'Prep Webinar')
        }));
      }
      return INITIAL_EXPANDED_SESSIONS;
    } catch {
      return INITIAL_EXPANDED_SESSIONS;
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'prep-webinar',
    speaker: '',
    companyName: 'Campus Placement Cell',
    date: '2026-11-05',
    time: '05:00 PM - 06:15 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/new-session',
    agenda: '',
    targetBatches: '2026, 2027, 2028'
  });

  // Persist
  useEffect(() => {
    localStorage.setItem('placeprep_live_sessions_v2', JSON.stringify(sessions));
  }, [sessions]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.speaker.trim() || !form.joinUrl.trim()) {
      showToast('Please fill all mandatory fields (Title, Speaker, URL).');
      return;
    }

    const catLabels = {
      'prep-webinar': 'Prep Webinar',
      'alumni-talk': 'Alumni Talk Session',
      'ppt': 'Pre-Placement Talk (PPT)'
    };

    const newSession = {
      id: `session-${Date.now()}`,
      title: form.title,
      category: form.category,
      categoryLabel: catLabels[form.category] || 'Live Session',
      speaker: form.speaker,
      companyName: form.companyName || 'Placement Cell',
      date: form.date,
      time: form.time,
      platform: form.joinUrl.includes('zoom') ? 'Zoom' : 'Google Meet',
      joinUrl: form.joinUrl,
      agenda: form.agenda || 'Live interactive session for registered campus students.',
      targetBatches: form.targetBatches.split(',').map(s => s.trim()),
      rsvpsCount: 1,
      hasRsvpd: true
    };

    setSessions([newSession, ...sessions]);
    setIsScheduleModalOpen(false);
    setForm({
      title: '',
      category: 'prep-webinar',
      speaker: '',
      companyName: 'Campus Placement Cell',
      date: '2026-11-05',
      time: '05:00 PM - 06:15 PM',
      platform: 'Google Meet',
      joinUrl: 'https://meet.google.com/new-session',
      agenda: '',
      targetBatches: '2026, 2027, 2028'
    });
    showToast(`Live session "${newSession.title}" scheduled and added to calendar!`);
  };

  const handleRsvp = (id) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === id) {
          const nextCount = s.hasRsvpd ? s.rsvpsCount - 1 : s.rsvpsCount + 1;
          return { ...s, rsvpsCount: Math.max(0, nextCount), hasRsvpd: !s.hasRsvpd };
        }
        return s;
      })
    );
    showToast('RSVP status updated for session!');
  };

  const handleDeleteSession = (id) => {
    if (!window.confirm('Cancel and remove this scheduled session?')) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Session cancelled.');
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (s) => {
    const title = encodeURIComponent(s.title);
    const details = encodeURIComponent(`${s.agenda}\n\nJoin URL: ${s.joinUrl}\nSpeaker: ${s.speaker}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(s.joinUrl)}`;
  };

  // Filtered list
  const filteredSessions = sessions.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              Live Interactive Placement Learning
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Sessions & Workshop Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Schedule and join expert preparation webinars, inspiring alumni talk sessions, and pre-placement corporate talks (PPT) with one-click Google Meet and Zoom access.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 w-fit cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Live Session</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {SESSION_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by topic, speaker, or company..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Live Sessions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="md:col-span-3 p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
            <Video className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No sessions match your filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting "All Live Sessions" or schedule a new one.</p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const isPPT = session.category === 'ppt';
            const isAlumni = session.category === 'alumni-talk';

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Category & Platform Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      isPPT
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isAlumni
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {session.categoryLabel}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {session.platform || 'Google Meet'}
                    </span>
                  </div>

                  {/* Title & Host */}
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-snug">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Host: {session.companyName}
                    </p>
                  </div>

                  {/* Speaker Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                      {session.speaker.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Featured Speaker</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{session.speaker}</p>
                    </div>
                  </div>

                  {/* Agenda */}
                  <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                    "{session.agenda}"
                  </p>

                  {/* Date, Time & RSVPs */}
                  <div className="space-y-1.5 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date & Time:
                      </span>
                      <span className="font-bold text-slate-900">{session.date} • {session.time}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-emerald-600" /> Student RSVPs:
                      </span>
                      <span className="font-bold text-emerald-700">{session.rsvpsCount} Attending</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Join, Calendar & RSVP */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <a
                    href={session.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join on {session.platform || 'Google Meet / Zoom'}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRsvp(session.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        session.hasRsvpd
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${session.hasRsvpd ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{session.hasRsvpd ? 'RSVP Confirmed' : 'RSVP Now'}</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl(session)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-4 h-4 text-slate-600" />
                    </a>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Cancel this session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SCHEDULE LIVE SESSION MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 my-8 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  New Event Schedule
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Schedule Live Session / PPT
                </h3>
                <p className="text-xs text-slate-500">Broadcast webinars, alumni talks, or pre-placement corporate talks.</p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Session Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Masterclass on System Design & Microservices"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Session Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="prep-webinar">Prep Webinar</option>
                    <option value="alumni-talk">Alumni Talk Session</option>
                    <option value="ppt">Pre-Placement Talk (PPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Company / Sponsor</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. Amazon / DTU Placement Cell"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Speaker Name & Designation *</label>
                <input
                  type="text"
                  value={form.speaker}
                  onChange={e => setForm({ ...form, speaker: e.target.value })}
                  placeholder="e.g. Priya Nair (Staff Engineer at Google, Alumna '22)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Session Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Session Time *</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    placeholder="05:00 PM - 06:30 PM"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Google Meet / Zoom URL *</label>
                <input
                  type="url"
                  value={form.joinUrl}
                  onChange={e => setForm({ ...form, joinUrl: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc-def or https://zoom.us/j/12345"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Agenda & Session Overview</label>
                <textarea
                  rows={3}
                  value={form.agenda}
                  onChange={e => setForm({ ...form, agenda: e.target.value })}
                  placeholder="Outline key learning outcomes, Q&A format, and preparation requirements..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Session to Calendar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
