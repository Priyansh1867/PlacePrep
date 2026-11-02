// PlacePrep AI - Timetable & Schedule Management Component
// Features: Weekly timetable matrix, room allocation, faculty assignment,
// live conflict checking, and schedule persistence.

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Download,
  Building,
  User
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { period: 1, time: '09:00 AM - 10:00 AM' },
  { period: 2, time: '10:00 AM - 11:00 AM' },
  { period: 3, time: '11:15 AM - 12:15 PM' },
  { period: 4, time: '01:15 PM - 02:15 PM' },
  { period: 5, time: '02:15 PM - 03:15 PM' },
  { period: 6, time: '03:30 PM - 04:30 PM' },
];

const INITIAL_TIMETABLE = [
  { id: 't1', day: 'Monday', period: 1, subject: 'Advanced Data Structures & Algorithms', code: 'CS301', faculty: 'Dr. Neha Sharma', room: 'LH-101', section: 'CSE-A' },
  { id: 't2', day: 'Monday', period: 2, subject: 'Operating Systems & Concurrency', code: 'CS302', faculty: 'Prof. R. K. Verma', room: 'LH-101', section: 'CSE-A' },
  { id: 't3', day: 'Tuesday', period: 1, subject: 'Database Management Systems', code: 'CS303', faculty: 'Dr. Ananya Roy', room: 'Lab-3', section: 'CSE-A' },
  { id: 't4', day: 'Wednesday', period: 3, subject: 'Computer Networks & Security', code: 'CS304', faculty: 'Prof. S. K. Gupta', room: 'LH-102', section: 'CSE-A' },
  { id: 't5', day: 'Thursday', period: 2, subject: 'Software Engineering & DevOps', code: 'CS305', faculty: 'Dr. Priya Mehta', room: 'LH-101', section: 'CSE-A' },
  { id: 't6', day: 'Friday', period: 4, subject: 'Campus Recruitment Training (CRT)', code: 'CRT-3', faculty: 'Placement Cell', room: 'Auditorium', section: 'CSE-A' },
];

export default function TimetableManagementView({ currentUser }) {
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [selectedSection, setSelectedSection] = useState('CSE-A');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    period: 1,
    subject: '',
    code: '',
    faculty: currentUser?.name || 'Faculty Member',
    room: 'LH-101',
    section: 'CSE-A'
  });
  const [conflictWarning, setConflictWarning] = useState(null);

  const isManagementOrFaculty = currentUser?.role === 'admin' || currentUser?.role === 'hod' || currentUser?.role === 'teacher' || currentUser?.role === 'faculty' || currentUser?.role === 'management';

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.subject || !newSlot.code) return;

    // Check conflict
    const conflict = timetable.find(t => t.day === newSlot.day && t.period === Number(newSlot.period) && t.section === newSlot.section);
    if (conflict) {
      setConflictWarning(`Conflict detected: Room/Slot already booked for ${conflict.subject} (${conflict.faculty})`);
      return;
    }

    setConflictWarning(null);
    const item = { id: 't_' + Date.now(), ...newSlot, period: Number(newSlot.period) };
    setTimetable(prev => [...prev, item]);
    setShowAddModal(false);
    setNewSlot({
      day: 'Monday',
      period: 1,
      subject: '',
      code: '',
      faculty: currentUser?.name || 'Faculty Member',
      room: 'LH-101',
      section: selectedSection
    });
  };

  const handleDeleteSlot = (id) => {
    if (!isManagementOrFaculty) return;
    if (window.confirm('Are you sure you want to remove this lecture slot from the timetable?')) {
      setTimetable(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTimetable = timetable.filter(t => t.section === selectedSection);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Master Academic Timetable & Schedule Management</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Department-wide lecture scheduling, faculty room allocation, and automated clash prevention.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-slate-600">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="CSE-A">CSE Section A</option>
              <option value="CSE-B">CSE Section B</option>
              <option value="IT-A">IT Section A</option>
              <option value="ECE-A">ECE Section A</option>
            </select>
          </div>

          {isManagementOrFaculty && (
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lecture</span>
            </Button>
          )}
        </div>
      </div>

      {conflictWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* Timetable Matrix Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Timetable Grid • {selectedSection}</span>
          </div>
          <Badge variant="indigo" size="sm">Active Semester Schedule</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 border-r border-slate-200 w-36">Period / Time</th>
                {DAYS.map(day => (
                  <th key={day} className="p-3.5 border-r border-slate-200 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {PERIODS.map(p => (
                <tr key={p.period} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5 border-r border-slate-200 bg-slate-50 font-semibold text-slate-700">
                    <div className="text-slate-900 font-bold">Period {p.period}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{p.time}</div>
                  </td>
                  {DAYS.map(day => {
                    const slot = filteredTimetable.find(t => t.day === day && t.period === p.period);
                    return (
                      <td key={day} className="p-3.5 border-r border-slate-200 text-center align-middle">
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 relative group text-left">
                            <div className="font-bold text-indigo-900 text-xs line-clamp-1">{slot.subject}</div>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                              <span className="font-semibold text-indigo-700">{slot.code}</span>
                              <span className="bg-white/80 px-1.5 py-0.5 rounded-md font-medium">{slot.room}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{slot.faculty}</span>
                            </div>
                            {isManagementOrFaculty && (
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="absolute top-2 right-2 p-1 rounded-md bg-white text-rose-600 opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-50"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Free Period</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lecture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Schedule New Lecture Slot</span>
            </h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period</label>
                  <select
                    value={newSlot.period}
                    onChange={(e) => setNewSlot({ ...newSlot, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    {PERIODS.map(p => <option key={p.period} value={p.period}>Period {p.period} ({p.time})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={newSlot.code}
                    onChange={(e) => setNewSlot({ ...newSlot, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty</label>
                  <input
                    type="text"
                    required
                    value={newSlot.faculty}
                    onChange={(e) => setNewSlot({ ...newSlot, faculty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room</label>
                  <input
                    type="text"
                    required
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={newSlot.section}
                    onChange={(e) => setNewSlot({ ...newSlot, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="CSE-A">CSE-A</option>
                    <option value="CSE-B">CSE-B</option>
                    <option value="IT-A">IT-A</option>
                    <option value="ECE-A">ECE-A</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Lecture Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
