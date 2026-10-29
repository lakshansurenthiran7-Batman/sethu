/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface NotificationsModalProps {
  onClose: () => void;
  onSelectChallenge: (id: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  onClose,
  onSelectChallenge
}) => {
  const { notifications, markNotificationRead, currentUser } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Activity Notifications ({currentUser.role.replace(/_/g, ' ')})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition-colors space-y-1 ${
                n.read ? 'bg-white' : 'bg-emerald-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-stone-900">{n.title}</span>
                <span className="text-[10px] text-stone-400 shrink-0">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-stone-600 text-[11px] leading-relaxed">{n.message}</p>

              <div className="pt-2 flex items-center justify-between">
                {n.challengeId ? (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectChallenge(n.challengeId!);
                    }}
                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <span>View Challenge</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <div></div>
                )}

                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-[11px] text-stone-500 hover:text-stone-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-stone-400">
              No notifications for this role.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
