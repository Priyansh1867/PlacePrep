import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'Try adjusting your search filters or check back later.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 space-y-3 flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
