import React from 'react';
import LiveSessionsManager from '../components/sessions/LiveSessionsManager';

export default function LiveSessionsPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <LiveSessionsManager onNavigate={onNavigate} />
      </div>
    </div>
  );
}
