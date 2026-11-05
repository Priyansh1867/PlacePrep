import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  RefreshCw,
  Send
} from 'lucide-react';
import { TimetableViewApi, MasterTimetableApi } from '../../services/api';

export default function PeerSwapsPanel({ currentUser, isHod = false, mySlots = [] }) {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Propose Swap Modal State
  const [showModal, setShowModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [targetFacultySlots, setTargetFacultySlots] = useState([]);
  const [loadingTargetSlots, setLoadingTargetSlots] = useState(false);

  const [swapForm, setSwapForm] = useState({
    requesterSlotId: mySlots[0]?.id || '',
    requesterDate: new Date().toISOString().split('T')[0],
    targetFacultyId: '',
    targetSlotId: '',
    targetDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadOverrides = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await TimetableViewApi.listOverrides();
      setOverrides(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      setError(err.message || 'Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverrides();
    // Load faculty for selection
    setLoadingFaculty(true);
    MasterTimetableApi.getFacultyProfiles()
      .then(res => setFacultyList(Array.isArray(res) ? res : (res?.content || [])))
      .catch(() => setFacultyList([]))
      .finally(() => setLoadingFaculty(false));
  }, [loadOverrides]);

  // When target faculty changes in swap modal, fetch their slots
  const handleTargetFacultyChange = async (targetId) => {
    setSwapForm(prev => ({ ...prev, targetFacultyId: targetId, targetSlotId: '' }));
    if (!targetId) {
      setTargetFacultySlots([]);
      return;
    }
    setLoadingTargetSlots(true);
    try {
      const grid = await TimetableViewApi.getFacultyGrid(targetId);
      setTargetFacultySlots(grid?.slots || []);
    } catch {
      setTargetFacultySlots([]);
    } finally {
      setLoadingTargetSlots(false);
    }
  };

  const handleProposeSwap = async (e) => {
    e.preventDefault();
    if (!swapForm.requesterSlotId || !swapForm.targetFacultyId || !swapForm.targetSlotId) {
      setModalError('Please select both your slot and your colleague’s slot');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      await TimetableViewApi.proposePeerSwap({
        requesterSlotId: Number(swapForm.requesterSlotId),
        requesterDate: swapForm.requesterDate,
        targetFacultyId: Number(swapForm.targetFacultyId),
        targetSlotId: Number(swapForm.targetSlotId),
        targetDate: swapForm.targetDate,
        reason: swapForm.reason.trim() || 'Peer slot exchange'
      });
      setSuccess('Peer swap request proposed! Waiting for your colleague to accept.');
      setShowModal(false);
      loadOverrides();
    } catch (err) {
      setModalError(err.message || 'Failed to propose swap');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await TimetableViewApi.acceptPeerSwap(id);
      setSuccess('Swap accepted! Forwarded to HOD for final approval.');
      loadOverrides();
    } catch (err) {
      alert('Failed to accept swap: ' + (err.message || 'Server error'));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for declining this swap proposal (optional):') || '';
    try {
      await TimetableViewApi.rejectPeerSwap(id, reason);
      loadOverrides();
    } catch (err) {
      alert('Failed to decline swap: ' + (err.message || 'Server error'));
    }
  };

  const handleHodApprove = async (id) => {
    try {
      await TimetableViewApi.approveOverride(id);
      setSuccess('Peer swap approved atomically for both faculty members!');
      loadOverrides();
    } catch (err) {
      alert('Failed to approve swap: ' + (err.message || 'Server error'));
    }
  };

  // Filter overrides for peer swaps
  const safeOverrides = Array.isArray(overrides) ? overrides : [];
  const peerSwapOverrides = safeOverrides.filter(o => o.kind === 'PEER_SWAP' || o.peerOverrideId != null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-teal-600" />
            <span>Peer Slot Exchange & Swaps</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Propose mutual class exchanges with colleagues for specific dates. Requires mutual faculty acceptance followed by HOD approval to commit atomically.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOverrides}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!isHod && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Propose Peer Swap</span>
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess('')} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Swaps List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs font-medium">Loading peer swap requests...</span>
          </div>
        ) : peerSwapOverrides.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Peer Swaps Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active or pending slot swaps recorded. Faculty members can propose mutual class exchanges using the button above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {peerSwapOverrides.map(swap => {
              const isPendingPeer = swap.status === 'PENDING' && !swap.peerAccepted;
              const isPendingHod = swap.status === 'PENDING' && swap.peerAccepted;
              const isApproved = swap.status === 'APPROVED';
              const isRejected = swap.status === 'REJECTED';

              return (
                <div key={swap.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                        Peer Swap #{swap.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : isPendingHod
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isApproved ? 'Approved by HOD' : isRejected ? 'Rejected' : isPendingHod ? 'Awaiting HOD Final Approval' : 'Awaiting Colleague Acceptance'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Date: {swap.overrideDate}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <span>Reason: <span className="font-normal text-slate-600">{swap.reason || 'Mutual slot exchange'}</span></span>
                    </div>

                    {swap.substituteFacultyName && (
                      <div className="text-[11px] text-slate-600">
                        Exchange Partner: <span className="font-bold text-slate-900">{swap.substituteFacultyName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions depending on role and status */}
                  <div className="flex items-center gap-2">
                    {/* Colleague acceptance if pending peer */}
                    {!isHod && isPendingPeer && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(swap.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Swap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(swap.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* HOD final approval */}
                    {isHod && isPendingHod && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleHodApprove(swap.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Both Slots</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(swap.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Propose Swap Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                <span>Propose Peer Slot Swap</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposeSwap} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Section 1: My Slot */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="font-bold text-slate-800">1. Select Your Slot to Give Up</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Class Slot</label>
                    <select
                      value={swapForm.requesterSlotId}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, requesterSlotId: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                      required
                    >
                      <option value="">-- Choose Slot --</option>
                      {mySlots.map(s => (
                        <option key={s.id} value={s.id}>
                          Day {s.dayOfWeek} P{s.startPeriod} • {s.subjectCode} (Sec {s.sectionName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">For Date</label>
                    <input
                      type="date"
                      value={swapForm.requesterDate}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, requesterDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                      required
                    >
                    </input>
                  </div>
                </div>
              </div>

              {/* Section 2: Colleague's Slot */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-2.5">
                <div className="font-bold text-indigo-950">2. Select Colleague's Slot to Take Over</div>
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-900 mb-1">Target Faculty</label>
                  <select
                    value={swapForm.targetFacultyId}
                    onChange={(e) => handleTargetFacultyChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                    required
                  >
                    <option value="">-- Choose Colleague --</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.fullName || f.shortCode} ({f.departmentCode || 'Dept'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 mb-1">Their Class Slot</label>
                    <select
                      value={swapForm.targetSlotId}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, targetSlotId: e.target.value }))}
                      disabled={loadingTargetSlots || !swapForm.targetFacultyId}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 font-medium disabled:opacity-50"
                      required
                    >
                      <option value="">
                        {loadingTargetSlots ? 'Loading slots...' : '-- Choose Target Slot --'}
                      </option>
                      {targetFacultySlots.map(s => (
                        <option key={s.id} value={s.id}>
                          Day {s.dayOfWeek} P{s.startPeriod} • {s.subjectCode} (Sec {s.sectionName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 mb-1">For Date</label>
                    <input
                      type="date"
                      value={swapForm.targetDate}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Swap</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Attending academic conference, compensating lab evaluation"
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-2"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

