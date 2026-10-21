import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`p-6 sm:p-8 text-center rounded-2xl bg-red-50/70 border border-red-200 space-y-3 flex flex-col items-center justify-center ${className}`}>
      <div className="w-11 h-11 rounded-2xl bg-red-100 text-[#DC2626] flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-red-950">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-red-700 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="pt-2">
          <Button size="sm" variant="danger" icon={RefreshCw} onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
}
