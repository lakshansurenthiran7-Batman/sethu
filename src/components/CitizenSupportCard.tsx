/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Heart,
  Users,
  Check,
  MessageSquare,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CitizenSupporter, User } from '../types.js';

interface CitizenSupportCardProps {
  challengeId: string;
  supportCount?: number;
  supporters?: CitizenSupporter[];
  currentUser: User;
  onSupport: (note?: string) => Promise<boolean>;
}

export const CitizenSupportCard: React.FC<CitizenSupportCardProps> = ({
  challengeId,
  supportCount = 0,
  supporters = [],
  currentUser,
  onSupport
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [showSupportersList, setShowSupportersList] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const hasSupported = supporters.some((s) => s.citizenId === currentUser.id);

  const handleSupportSubmit = async () => {
    if (hasSupported) return;
    setIsSubmitting(true);
    try {
      const ok = await onSupport(note.trim() || undefined);
      if (ok) {
        setFeedback('Your support and voice have been recorded!');
        setShowNoteInput(false);
        setNote('');
        setTimeout(() => setFeedback(null), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-rose-200 bg-linear-to-br from-rose-50/60 via-white to-pink-50/30 p-4 sm:p-5 space-y-3.5 shadow-xs">
      {/* Header and Support Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <span>Community Support &amp; Citizen Endorsements</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-100 text-rose-800">
                Phase 5
              </span>
            </h3>
            <p className="text-[11px] text-stone-600">
              <strong>{supportCount} citizens</strong> have officially endorsed that they face or observe this problem.
            </p>
          </div>
        </div>

        <div>
          {hasSupported ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>You endorsed this issue</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (showNoteInput) {
                    handleSupportSubmit();
                  } else {
                    setShowNoteInput(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>I Also Face This Problem (+1)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Optional Note Input Form */}
      {showNoteInput && !hasSupported && (
        <div className="p-3 rounded-lg bg-white border border-rose-200 space-y-2 animate-in fade-in">
          <label className="block text-[11px] font-semibold text-stone-700">
            Add your local observation or experience (Optional):
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., In our tola too, children are missing school due to this road erosion..."
            className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-hidden focus:border-rose-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNoteInput(false)}
              className="text-[11px] px-2.5 py-1 rounded text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSupportSubmit}
              className="text-xs px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Endorsement (+1)'}
            </button>
          </div>
        </div>
      )}

      {/* Supporters List Toggle & View */}
      {supporters.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSupportersList(!showSupportersList)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950 transition-colors"
          >
            <span>View {supporters.length} citizen endorsement comments</span>
            {showSupportersList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSupportersList && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 animate-in fade-in">
              {supporters.map((sup, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{sup.citizenName}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(sup.supportedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {sup.location && (
                    <div className="text-[11px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{sup.location}</span>
                    </div>
                  )}
                  {sup.note && (
                    <p className="text-[11px] text-stone-700 italic bg-stone-50 p-1.5 rounded border border-stone-100">
                      "{sup.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
