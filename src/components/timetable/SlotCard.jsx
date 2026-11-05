import React, { useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Users,
  Compass,
  Presentation,
  Briefcase,
  Calendar,
  MapPin,
  User,
  Clock,
  MoreVertical,
  AlertTriangle,
  Move,
  Edit2,
  Trash2
} from 'lucide-react';
import { getSlotKindMeta, formatTimeRange } from '../../utils/timetableGrid';

const KIND_ICONS = {
  BookOpen,
  FlaskConical,
  Users,
  Compass,
  Presentation,
  Briefcase,
  Calendar
};

export default function SlotCard({
  slot,
  editable = false,
  isHighlighted = false,
  isDragging = false,
  onEdit,
  onDelete,
  onMoveClick,
  onDragStart,
  onDragEnd
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (!slot) return null;

  const kindMeta = getSlotKindMeta(slot.slotKind);
  const IconComponent = KIND_ICONS[kindMeta.iconName] || BookOpen;

  const hasLowConfidence = slot.confidence !== undefined && slot.confidence !== null && slot.confidence < 0.6;
  const groupCode = slot.labGroupCode;
  const facultyDisplay = (slot.facultyNames && slot.facultyNames.length > 0)
    ? slot.facultyNames.join(', ')
    : (slot.facultyShortCode || '');
  const roomDisplay = slot.roomCode || '';
  const timeDisplay = formatTimeRange(slot.customStart, slot.customEnd);

  const handleDragStart = (e) => {
    if (!editable) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(slot));
    if (onDragStart) onDragStart(slot);
  };

  return (
    <div
      role="article"
      aria-label={`${kindMeta.label}: ${slot.subjectName || slot.subjectCode || 'Slot'}, Period ${slot.startPeriod}, Span ${slot.span || 1}`}
      draggable={editable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border p-2.5 transition-all duration-150 select-none ${kindMeta.bgClass} ${kindMeta.borderClass} ${kindMeta.textClass} ${
        isHighlighted ? 'ring-2 ring-teal-500 ring-offset-1 shadow-md' : 'shadow-2xs hover:shadow-xs'
      } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${slot.isCancelled ? 'line-through opacity-60 bg-slate-100 border-slate-300' : ''}`}
    >
      {/* Top row: Slot Kind badge & Menu */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${kindMeta.badgeClass}`}
          title={kindMeta.label}
        >
          <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{kindMeta.shortLabel}</span>
        </span>

        {/* Group chip for Labs or Batches */}
        {groupCode && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300"
            title={`Lab Group / Batch: ${groupCode}`}
          >
            {groupCode}
          </span>
        )}

        {/* Low confidence warning */}
        {hasLowConfidence && (
          <span
            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300"
            title={`Confidence: ${(slot.confidence * 100).toFixed(0)}% (Ambiguous group alignment)`}
          >
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            <span>{(slot.confidence * 100).toFixed(0)}%</span>
          </span>
        )}

        {/* Actions menu for editable grid */}
        {editable && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Slot actions menu"
              aria-expanded={showMenu}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(slot);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Slot</span>
                    </button>
                  )}
                  {onMoveClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onMoveClick(slot);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50"
                    >
                      <Move className="w-3.5 h-3.5 text-slate-500" />
                      <span>Move...</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(slot);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subject Title & Code */}
      <div className="font-bold text-xs leading-snug line-clamp-2" title={slot.subjectName || slot.subjectCode}>
        {slot.subjectCode ? `${slot.subjectCode}: ` : ''}
        {slot.subjectName || 'Academic Slot'}
      </div>

      {/* Meta chips: Room & Faculty */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-600 font-medium">
        {roomDisplay && (
          <span className="inline-flex items-center gap-1" title={`Room: ${roomDisplay}`}>
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-slate-700">{roomDisplay}</span>
          </span>
        )}

        {facultyDisplay && (
          <span className="inline-flex items-center gap-1 truncate max-w-[150px]" title={`Faculty: ${facultyDisplay}`}>
            <User className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{facultyDisplay}</span>
          </span>
        )}

        {timeDisplay && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500" title={`Time: ${timeDisplay}`}>
            <Clock className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
            <span>{timeDisplay}</span>
          </span>
        )}
      </div>

      {/* Cancellation / Override banner */}
      {slot.overrideNotice && (
        <div className="mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
          {slot.overrideNotice}
        </div>
      )}

      {/* Multi-period span indicator */}
      {slot.span > 1 && (
        <div className="mt-1 text-[10px] text-slate-500 font-medium">
          Spans {slot.span} periods (P{slot.startPeriod}–P{slot.startPeriod + slot.span - 1})
        </div>
      )}
    </div>
  );
}
