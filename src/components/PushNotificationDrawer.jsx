import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Trash2,
  Check
} from 'lucide-react';
import { getPushNotifications, markNotificationAsRead } from '../services/storage';

export default function PushNotificationDrawer({ isOpen, onClose, onNavigate }) {
  const [notifications, setNotifications] = useState(getPushNotifications());

  useEffect(() => {
    const handleBroadcast = (e) => {
      setNotifications(prev => [e.detail, ...prev]);
    };
    window.addEventListener('push-notification-broadcast', handleBroadcast);
    return () => window.removeEventListener('push-notification-broadcast', handleBroadcast);
  }, []);

  const handleMarkRead = (id) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Campus Push Notifications</h3>
              <p className="text-[11px] text-slate-500">Real-time alerts from TPO & Placement Cell</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-indigo-600 font-bold hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No active push notifications</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition relative ${
                  notif.read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-indigo-50/50 border-indigo-200 text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                    notif.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {notif.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                </div>

                <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  {notif.actionRoute && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate(notif.actionRoute);
                      }}
                      className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 ml-auto"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-400">
            Push notifications powered by PlacePrep Broadcast Engine
          </p>
        </div>

      </div>
    </div>
  );
}
