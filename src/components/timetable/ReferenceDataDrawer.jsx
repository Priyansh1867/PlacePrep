import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  User,
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function ReferenceDataDrawer({
  isOpen,
  onClose,
  timetableId: _timetableId,
  initialTab = 'subjects', // 'subjects', 'faculty', 'rooms', 'sections'
  departmentCode = 'AI_DS',
  onDataChanged
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Creation forms
  const [newSubject, setNewSubject] = useState({ rtuCode: '', shortCode: '', name: '', kind: 'THEORY', semester: 5 });
  const [newRoom, setNewRoom] = useState({ code: '', displayName: '', roomType: 'CLASSROOM', capacity: 60 });
  const [newFaculty, setNewFaculty] = useState({ shortCode: '', fullName: '', email: '', departmentCode });

  const loadAllReferenceData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [subs, facs, rms] = await Promise.all([
        MasterTimetableApi.getSubjects(departmentCode).catch(() => []),
        MasterTimetableApi.getFacultyProfiles(departmentCode).catch(() => []),
        MasterTimetableApi.getRooms().catch(() => [])
      ]);
      setSubjects(subs || []);
      setFacultyList(facs || []);
      setRooms(rms || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load reference data');
    } finally {
      setLoading(false);
    }
  }, [departmentCode]);

  useEffect(() => {
    if (!isOpen) return;
    loadAllReferenceData();
  }, [isOpen, loadAllReferenceData]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handlers for Subjects
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.shortCode) return;
    try {
      const created = await MasterTimetableApi.createSubject({
        ...newSubject,
        departmentCode,
        semester: Number(newSubject.semester)
      });
      setSubjects([...subjects, created]);
      setNewSubject({ rtuCode: '', shortCode: '', name: '', kind: 'THEORY', semester: 5 });
      showNotification('Subject created successfully.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject from the reference catalog?')) return;
    try {
      await MasterTimetableApi.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      showNotification('Subject deleted.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete subject');
    }
  };

  // Handlers for Rooms
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.code) return;
    try {
      const created = await MasterTimetableApi.createRoom({
        ...newRoom,
        capacity: Number(newRoom.capacity) || 60
      });
      setRooms([...rooms, created]);
      setNewRoom({ code: '', displayName: '', roomType: 'CLASSROOM', capacity: 60 });
      showNotification('Room created successfully.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room from the reference catalog?')) return;
    try {
      await MasterTimetableApi.deleteRoom(id);
      setRooms(rooms.filter(r => r.id !== id));
      showNotification('Room deleted.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete room');
    }
  };

  // Handlers for Faculty
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.fullName) return;
    try {
      const created = await MasterTimetableApi.createFacultyProfile({
        ...newFaculty,
        departmentCode
      });
      setFacultyList([...facultyList, created]);
      setNewFaculty({ shortCode: '', fullName: '', email: '', departmentCode });
      showNotification('Faculty profile added.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add faculty profile');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty profile?')) return;
    try {
      await MasterTimetableApi.deleteFacultyProfile(id);
      setFacultyList(facultyList.filter(f => f.id !== id));
      showNotification('Faculty profile removed.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete faculty profile');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h2 id="ref-drawer-title" className="text-base font-bold text-slate-900">
              Reference Data Catalogs
            </h2>
            <p className="text-xs text-slate-500">
              Manage subjects, rooms, faculty profiles and linking for {departmentCode}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-4 text-xs font-bold">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen, count: subjects.length },
            { id: 'faculty', label: 'Faculty Profiles', icon: User, count: facultyList.length },
            { id: 'rooms', label: 'Rooms & Labs', icon: Building, count: rooms.length }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
                  isSelected
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications */}
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

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="p-4 text-center text-xs text-slate-500">Loading reference catalog...</div>
          )}

          {/* TAB 1: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              {/* Add Subject Form */}
              <form onSubmit={handleCreateSubject} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add New Subject</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Compiler Design"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Short Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CD"
                      value={newSubject.shortCode}
                      onChange={(e) => setNewSubject({ ...newSubject, shortCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">RTU Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 5AID4-02"
                      value={newSubject.rtuCode}
                      onChange={(e) => setNewSubject({ ...newSubject, rtuCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kind</label>
                    <select
                      value={newSubject.kind}
                      onChange={(e) => setNewSubject({ ...newSubject, kind: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="THEORY">THEORY</option>
                      <option value="LAB">LAB</option>
                      <option value="MENTOR_MEETING">MENTOR</option>
                      <option value="FOUNDATION">FOUNDATION</option>
                      <option value="SEMINAR">SEMINAR</option>
                      <option value="TRAINING">TRAINING</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semester</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={newSubject.semester}
                      onChange={(e) => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </form>

              {/* Subjects Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Subject Name</th>
                      <th className="px-3 py-2.5">Kind</th>
                      <th className="px-3 py-2.5">Sem</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {subjects.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-900">{s.shortCode || s.rtuCode}</td>
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                            {s.kind}
                          </span>
                        </td>
                        <td className="px-3 py-2">Sem {s.semester}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(s.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            aria-label={`Delete subject ${s.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FACULTY PROFILES */}
          {activeTab === 'faculty' && (
            <div className="space-y-6">
              {/* Add Faculty Form */}
              <form onSubmit={handleCreateFaculty} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add Faculty Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ms. Ambika Bagri"
                      value={newFaculty.fullName}
                      onChange={(e) => setNewFaculty({ ...newFaculty, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Short Code</label>
                    <input
                      type="text"
                      placeholder="e.g. AB"
                      value={newFaculty.shortCode}
                      onChange={(e) => setNewFaculty({ ...newFaculty, shortCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. ambika@placeprep.com"
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Faculty Profile</span>
                  </button>
                </div>
              </form>

              {/* Faculty Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Faculty Name</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">User Account</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {facultyList.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-teal-800">{f.shortCode || '—'}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{f.fullName}</td>
                        <td className="px-3 py-2 text-slate-500">{f.email || '—'}</td>
                        <td className="px-3 py-2">
                          {f.userId ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Linked (ID {f.userId})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Unlinked</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteFaculty(f.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            aria-label={`Delete faculty ${f.fullName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Add Room Form */}
              <form onSubmit={handleCreateRoom} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add Room / Venue</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Room Code</label>
                    <input
                      type="text"
                      placeholder="e.g. DS11"
                      value={newRoom.code}
                      onChange={(e) => setNewRoom({ ...newRoom, code: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Lab 1"
                      value={newRoom.displayName}
                      onChange={(e) => setNewRoom({ ...newRoom, displayName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                    <select
                      value={newRoom.roomType}
                      onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="CLASSROOM">Classroom</option>
                      <option value="LAB">Laboratory</option>
                      <option value="SEMINAR_HALL">Seminar Hall</option>
                      <option value="AUDITORIUM">Auditorium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room</span>
                  </button>
                </div>
              </form>

              {/* Rooms Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Room Code</th>
                      <th className="px-3 py-2.5">Display Name</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Capacity</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {rooms.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-900">{r.code}</td>
                        <td className="px-3 py-2">{r.displayName || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                            {r.roomType}
                          </span>
                        </td>
                        <td className="px-3 py-2">{r.capacity || '—'} seats</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(r.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            aria-label={`Delete room ${r.code}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
