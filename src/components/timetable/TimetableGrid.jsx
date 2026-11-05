import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Move
} from 'lucide-react';
import {
  DAYS,
  DEFAULT_PERIODS,
  buildWeekGridModel
} from '../../utils/timetableGrid';
import SlotCard from './SlotCard';

export default function TimetableGrid({
  periods = DEFAULT_PERIODS,
  slots = [],
  viewMode = 'section',
  filterGroup = null,
  editable = false,
  highlight = null, // slot id or slot object to highlight
  onCellClick, // (dayOfWeek, periodIndex)
  onSlotClick, // (slot)
  onSlotMove, // (slot, targetDay, targetPeriod)
  onDeleteSlot,
  validateDropTarget // optional async or sync validator: (slot, targetDay, targetPeriod) => { valid, message }
}) {
  // Mobile day selector
  const [selectedMobileDay, setSelectedMobileDay] = useState(1);

  // Drag and Drop state
  const [draggingSlot, setDraggingSlot] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // { dayOfWeek, periodIndex }
  const [dropValidationResult, setDropValidationResult] = useState(null); // { valid: true/false, message: '' }

  // Non-drag "Move..." dialog state
  const [moveSlotTarget, setMoveSlotTarget] = useState(null);
  const [targetDay, setTargetDay] = useState(1);
  const [targetPeriod, setTargetPeriod] = useState(1);

  // Build weekly render model
  const weekModel = useMemo(() => {
    return buildWeekGridModel({
      periods,
      slots,
      viewMode,
      filterGroup,
      includeSaturday: true
    });
  }, [periods, slots, viewMode, filterGroup]);

  // Drag handlers
  const handleDragStart = (slot) => {
    setDraggingSlot(slot);
    setDropValidationResult(null);
  };

  const handleDragOver = async (e, dayOfWeek, period) => {
    if (!editable || !draggingSlot) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragOverCell?.dayOfWeek !== dayOfWeek || dragOverCell?.periodIndex !== period.periodIndex) {
      setDragOverCell({ dayOfWeek, periodIndex: period.periodIndex });

      if (period.isBreak) {
        setDropValidationResult({ valid: false, message: 'Cannot drop into break period.' });
        return;
      }

      if (validateDropTarget) {
        try {
          const res = await validateDropTarget(draggingSlot, dayOfWeek, period.periodIndex);
          setDropValidationResult(res);
        } catch {
          setDropValidationResult({ valid: true, message: '' });
        }
      } else {
        setDropValidationResult({ valid: true, message: '' });
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dayOfWeek, period) => {
    e.preventDefault();
    if (!editable || !draggingSlot) return;
    if (period.isBreak) return;

    if (onSlotMove) {
      onSlotMove(draggingSlot, dayOfWeek, period.periodIndex);
    }
    setDraggingSlot(null);
    setDragOverCell(null);
    setDropValidationResult(null);
  };

  const handleDragEnd = () => {
    setDraggingSlot(null);
    setDragOverCell(null);
    setDropValidationResult(null);
  };

  // Keyboard / Touch "Move..." handler
  const handleOpenMoveDialog = (slot) => {
    setMoveSlotTarget(slot);
    setTargetDay(slot.dayOfWeek || 1);
    setTargetPeriod(slot.startPeriod || 1);
  };

  const handleConfirmMove = () => {
    if (!moveSlotTarget || !onSlotMove) return;
    onSlotMove(moveSlotTarget, Number(targetDay), Number(targetPeriod));
    setMoveSlotTarget(null);
  };

  return (
    <div className="timetable-container relative">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 9pt;
          }
          nav, header, footer, aside, .no-print, button {
            display: none !important;
          }
          .timetable-container {
            width: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
          .timetable-table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 8pt !important;
          }
          .timetable-table th, .timetable-table td {
            border: 1px solid #94a3b8 !important;
            padding: 3px !important;
          }
        }
      `}</style>

      {/* Dragging validation status banner (floating aria-live notification) */}
      <div aria-live="polite" className="sr-only">
        {dragOverCell && dropValidationResult?.message}
      </div>

      {/* Desktop & Tablet Week Matrix (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="timetable-table w-full border-collapse text-left min-w-[900px]">
          {/* Table Header: Period Columns */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {/* Day Corner Header */}
              <th
                scope="col"
                className="sticky left-0 top-0 z-20 w-24 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100/90 border-r border-slate-200"
              >
                Day / Period
              </th>

              {/* Period Columns */}
              {weekModel.periods.map((p) => (
                <th
                  key={p.periodIndex}
                  scope="col"
                  className={`px-3 py-2.5 text-center text-xs border-r border-slate-200 ${
                    p.isBreak ? 'bg-slate-200/60 text-slate-500 font-medium' : 'text-slate-700 font-bold'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wide">{p.label || `P${p.periodIndex}`}</div>
                  {p.startTime && p.endTime && (
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                      {p.startTime}–{p.endTime}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: Days as Rows */}
          <tbody className="divide-y divide-slate-200">
            {weekModel.days.map((dayModel) => {
              const { dayOfWeek, dayMeta, hasParallelLanes, lanes } = dayModel;

              return lanes.map((lane, laneIdx) => {
                const isFirstLane = laneIdx === 0;

                return (
                  <tr key={`${dayOfWeek}-${laneIdx}`} className="hover:bg-slate-50/30 transition-colors">
                    {/* Sticky Day Column */}
                    {isFirstLane && (
                      <th
                        scope="row"
                        rowSpan={hasParallelLanes ? 2 : 1}
                        className="sticky left-0 z-10 w-24 px-4 py-3 bg-white border-r border-slate-200 font-bold text-slate-800 text-xs text-center align-middle shadow-xs"
                      >
                        <div className="text-sm font-black text-teal-800">{dayMeta.shortName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{dayMeta.name}</div>
                        {hasParallelLanes && (
                          <div className="mt-1 text-[9px] font-semibold text-teal-600 bg-teal-50 px-1 py-0.5 rounded border border-teal-200">
                            2 Batches
                          </div>
                        )}
                      </th>
                    )}

                    {/* Cells for this Lane */}
                    {lane.cells.map((cell, cIdx) => {
                      if (cell.type === 'BREAK') {
                        return (
                          <td
                            key={`break-${cell.periodIndex}`}
                            rowSpan={cell.laneSpan || 1}
                            className="bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_6px,#e2e8f0_6px,#e2e8f0_12px)] border-r border-slate-200 text-center text-[10px] font-medium text-slate-500 select-none p-1.5"
                            title="Recess / Break Period"
                          >
                            <span className="bg-white/80 px-1.5 py-0.5 rounded text-[10px] text-slate-600 shadow-2xs">
                              {cell.label}
                            </span>
                          </td>
                        );
                      }

                      if (cell.type === 'SLOT') {
                        const isThisDragOver =
                          dragOverCell?.dayOfWeek === dayOfWeek &&
                          dragOverCell?.periodIndex === cell.periodIndex;

                        return (
                          <td
                            key={`slot-${cell.slot.id || cIdx}`}
                            colSpan={cell.colSpan || 1}
                            rowSpan={cell.laneSpan || 1}
                            onDragOver={(e) => handleDragOver(e, dayOfWeek, { periodIndex: cell.periodIndex, isBreak: false })}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, dayOfWeek, { periodIndex: cell.periodIndex, isBreak: false })}
                            onClick={() => onSlotClick && onSlotClick(cell.slot)}
                            className={`p-1.5 border-r border-slate-200 align-top transition-colors ${
                              isThisDragOver
                                ? dropValidationResult?.valid
                                  ? 'bg-emerald-100/60 ring-2 ring-emerald-500'
                                  : 'bg-rose-100/60 ring-2 ring-rose-500'
                                : ''
                            }`}
                          >
                            <SlotCard
                              slot={cell.slot}
                              editable={editable}
                              isHighlighted={highlight && (highlight.id === cell.slot.id || highlight === cell.slot.id)}
                              isDragging={draggingSlot?.id === cell.slot.id}
                              onEdit={() => onSlotClick && onSlotClick(cell.slot)}
                              onDelete={() => onDeleteSlot && onDeleteSlot(cell.slot)}
                              onMoveClick={() => handleOpenMoveDialog(cell.slot)}
                              onDragStart={() => handleDragStart(cell.slot)}
                              onDragEnd={handleDragEnd}
                            />
                          </td>
                        );
                      }

                      // Empty Cell
                      const isThisDragOver =
                        dragOverCell?.dayOfWeek === dayOfWeek &&
                        dragOverCell?.periodIndex === cell.periodIndex;

                      return (
                        <td
                          key={`empty-${dayOfWeek}-${cell.periodIndex}-${laneIdx}`}
                          colSpan={cell.colSpan || 1}
                          rowSpan={cell.laneSpan || 1}
                          onDragOver={(e) => handleDragOver(e, dayOfWeek, cell.period)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, dayOfWeek, cell.period)}
                          onClick={() => editable && onCellClick && onCellClick(dayOfWeek, cell.periodIndex)}
                          className={`group/cell p-1.5 border-r border-slate-200 align-middle text-center min-h-[70px] transition-all ${
                            isThisDragOver
                              ? dropValidationResult?.valid
                                ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-400'
                                : 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-400'
                              : 'hover:bg-teal-50/40 cursor-pointer'
                          }`}
                        >
                          {isThisDragOver && dropValidationResult?.message && (
                            <div className={`text-[10px] font-semibold px-1 py-0.5 rounded shadow-xs mb-1 ${
                              dropValidationResult.valid ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                            }`}>
                              {dropValidationResult.message}
                            </div>
                          )}

                          {editable && !isThisDragOver && (
                            <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                                <Plus className="w-3 h-3" />
                                <span>Add Slot</span>
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Layout (< md): Day Tabs & Timeline Cards */}
      <div className="block md:hidden space-y-4">
        {/* Day Tab Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DAYS.map((d) => {
            const isSelected = selectedMobileDay === d.dayOfWeek;
            const daySlotsCount = slots.filter(s => Number(s.dayOfWeek) === d.dayOfWeek).length;

            return (
              <button
                key={d.dayOfWeek}
                type="button"
                onClick={() => setSelectedMobileDay(d.dayOfWeek)}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{d.shortName}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {daySlotsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Slots Timeline */}
        <div className="space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200">
          {(() => {
            const dayModel = weekModel.days.find(d => d.dayOfWeek === selectedMobileDay);
            const daySlots = slots
              .filter(s => Number(s.dayOfWeek) === selectedMobileDay)
              .sort((a, b) => (a.startPeriod || 0) - (b.startPeriod || 0));

            if (daySlots.length === 0) {
              return (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <div>No classes scheduled for {dayModel?.dayMeta.name || 'this day'}.</div>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => onCellClick && onCellClick(selectedMobileDay, 1)}
                      className="mt-3 inline-flex items-center gap-1.5 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-300 bg-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Slot</span>
                    </button>
                  )}
                </div>
              );
            }

            return daySlots.map((slot) => {
              const p = periods.find(per => per.periodIndex === slot.startPeriod);

              return (
                <div key={slot.id} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                    <span>
                      Period {slot.startPeriod}
                      {slot.span > 1 ? `–${slot.startPeriod + slot.span - 1}` : ''}
                      {p?.startTime && p?.endTime ? ` (${p.startTime}–${p.endTime})` : ''}
                    </span>
                    {slot.labGroupCode && (
                      <span className="text-teal-700 font-semibold">{slot.labGroupCode}</span>
                    )}
                  </div>
                  <SlotCard
                    slot={slot}
                    editable={editable}
                    isHighlighted={highlight && (highlight.id === slot.id || highlight === slot.id)}
                    onEdit={() => onSlotClick && onSlotClick(slot)}
                    onDelete={() => onDeleteSlot && onDeleteSlot(slot)}
                    onMoveClick={() => handleOpenMoveDialog(slot)}
                  />
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Accessible Non-Drag "Move Slot" Dialog */}
      {moveSlotTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Move className="w-5 h-5 text-teal-600" />
              <span>Move Slot</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select destination day and period for <strong>{moveSlotTarget.subjectName || moveSlotTarget.subjectCode}</strong>:
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Day</label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                >
                  {DAYS.map((d) => (
                    <option key={d.dayOfWeek} value={d.dayOfWeek}>
                      {d.name} ({d.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Start Period</label>
                <select
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                >
                  {periods.map((p) => (
                    <option key={p.periodIndex} value={p.periodIndex} disabled={p.isBreak}>
                      Period {p.periodIndex}: {p.label || `${p.startTime}-${p.endTime}`} {p.isBreak ? '(Break)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMoveSlotTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 shadow-xs"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
