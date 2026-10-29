/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Layers,
  MapPin,
  Users,
  Camera,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  Split,
  Percent,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { DuplicateClusterInfo, DuplicateCandidateMatch, User } from '../types.js';

interface DuplicateClusterCardProps {
  cluster?: DuplicateClusterInfo;
  duplicateMatches?: DuplicateCandidateMatch[];
  duplicateCandidates?: string[];
  currentUser: User;
  onUpdateClusterStatus?: (status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE') => Promise<boolean>;
  onSelectCandidate?: (candidateId: string) => void;
}

export const DuplicateClusterCard: React.FC<DuplicateClusterCardProps> = ({
  cluster,
  duplicateMatches = [],
  duplicateCandidates = [],
  currentUser,
  onUpdateClusterStatus,
  onSelectCandidate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const hasCluster = !!cluster;
  const hasCandidates = duplicateMatches.length > 0 || duplicateCandidates.length > 0;

  if (!hasCluster && !hasCandidates) return null;

  const isOfficer = currentUser.role === 'GOVERNMENT_OFFICER' || currentUser.role === 'PLATFORM_ADMIN';

  const handleStatusChange = async (status: 'PENDING_REVIEW' | 'MERGED' | 'SEPARATE') => {
    if (!onUpdateClusterStatus) return;
    setIsUpdating(true);
    try {
      const ok = await onUpdateClusterStatus(status);
      if (ok) {
        setUpdateMessage(`Cluster successfully updated to ${status.replace(/_/g, ' ')}`);
        setTimeout(() => setUpdateMessage(null), 4000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'MERGED':
        return {
          label: 'Unified Problem Cluster (Merged)',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: GitMerge
        };
      case 'SEPARATE':
        return {
          label: 'Classified as Distinct Issue',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Split
        };
      case 'PENDING_REVIEW':
      default:
        return {
          label: 'Clustering Pending Officer Review',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle
        };
    }
  };

  const badge = getStatusBadge(cluster?.status);
  const BadgeIcon = badge.icon;

  return (
    <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50/70 via-white to-orange-50/40 p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-600 text-white shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <span>Duplicate Detection &amp; Spatial Multi-Report Cluster</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-200 text-amber-900">
                Phase 6
              </span>
            </h3>
            <p className="text-[11px] text-amber-800/80">
              Correlates multiple citizen submissions from the same geographic zone into an authoritative master problem.
            </p>
          </div>
        </div>

        {cluster && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </div>
        )}
      </div>

      {/* Cluster Metrics if available */}
      {cluster && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <FileText className="w-3 h-3 text-amber-600" />
              <span>Merged Reports</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {cluster.reportsCount} citizen reports
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-emerald-600" />
              <span>Supporting Citizens</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {cluster.supportingCitizensCount} local voices
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Percent className="w-3 h-3 text-indigo-600" />
              <span>Semantic Match</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {cluster.semanticSimilarityPercent}%
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-rose-600" />
              <span>Spatial Overlap</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {cluster.locationOverlapPercent}% radius
            </div>
          </div>
        </div>
      )}

      {/* Candidate Matches */}
      {duplicateMatches.length > 0 ? (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 block">
            AI Identified Potential Similar Reports in Vicinity ({duplicateMatches.length}):
          </span>
          <div className="space-y-1.5">
            {duplicateMatches.map((match) => (
              <div
                key={match.challengeId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white border border-amber-100 gap-2 hover:border-amber-300 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {match.challengeId}
                    </span>
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {match.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">{match.reason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                    {match.similarityScore}% match
                  </span>
                  {onSelectCandidate && (
                    <button
                      type="button"
                      onClick={() => onSelectCandidate(match.challengeId)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline px-2 py-1"
                    >
                      Inspect &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : duplicateCandidates.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-600 font-medium">Similar IDs flagged by AI:</span>
          {duplicateCandidates.map((cid) => (
            <span
              key={cid}
              className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
            >
              {cid}
            </span>
          ))}
        </div>
      ) : null}

      {/* Officer Cluster Governance Actions */}
      {isOfficer && onUpdateClusterStatus && (
        <div className="pt-2 border-t border-amber-200/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Government Cluster Governance:</span>
            </span>
            {updateMessage && (
              <span className="text-[11px] font-semibold text-emerald-700 animate-in fade-in">
                {updateMessage}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isUpdating || cluster?.status === 'MERGED'}
              onClick={() => handleStatusChange('MERGED')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                cluster?.status === 'MERGED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-400'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Merge as Unified Cluster</span>
            </button>

            <button
              type="button"
              disabled={isUpdating || cluster?.status === 'SEPARATE'}
              onClick={() => handleStatusChange('SEPARATE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                cluster?.status === 'SEPARATE'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 cursor-default'
                  : 'bg-white hover:bg-blue-50 text-blue-800 border-blue-300 hover:border-blue-400'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Classify as Separate Issue</span>
            </button>

            <button
              type="button"
              disabled={isUpdating || cluster?.status === 'PENDING_REVIEW'}
              onClick={() => handleStatusChange('PENDING_REVIEW')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                cluster?.status === 'PENDING_REVIEW'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 cursor-default'
                  : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mark for Re-Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
