import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { getCurrentUser } from '../../services/storage';
import { getRoleDefaultDashboard, getRoleDefaultDashboardLabel } from '../../utils/navigation';

export { getRoleDefaultDashboard, getRoleDefaultDashboardLabel };

/**
 * Reusable, accessible Back Navigation button for pages.
 * Supports:
 * - onBack callback (custom back behavior or history stack pop)
 * - onNavigate fallback (role-aware navigation when no history or direct URL entry)
 * - role-aware fallback destination calculation
 * - clean responsive design matching the PlacePrep UI system
 */
export const BackNavButton = ({
  onBack,
  onNavigate,
  to,
  label,
  showHomeFallback = true,
  className = '',
  currentUser: propUser = null
}) => {
  const currentUser = propUser || (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
  const fallbackDestination = to || getRoleDefaultDashboard(currentUser);
  const defaultLabel = label || `Back to ${getRoleDefaultDashboardLabel(currentUser)}`;

  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (typeof onNavigate === 'function') {
      onNavigate(fallbackDestination);
      return;
    }
    // Fallback if window history is available
    if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 mb-4 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={defaultLabel}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-slate-100 transition-all duration-150 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span>{defaultLabel}</span>
      </button>

      {showHomeFallback && onNavigate && fallbackDestination !== 'dashboard' && (
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          aria-label="Go to Main Home"
          title="Go to Main Home"
          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default BackNavButton;
