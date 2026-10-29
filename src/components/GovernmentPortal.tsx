/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  GitMerge,
  XCircle,
  FileText,
  Sparkles,
  MapPin,
  Users,
  Search,
  BookOpen,
  ArrowUpRight,
  Heart,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Challenge } from '../types.js';

interface GovernmentPortalProps {
  onSelectChallenge: (id: string) => void;
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({ onSelectChallenge }) => {
  const { challenges, departments, validateChallenge, currentUser, t } = useApp();

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [validationAction, setValidationAction] = useState<string>('ACCEPT_AI');
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>('');
  const [officerRemarks, setOfficerRemarks] = useState<string>('');
  const [duplicateTargetId, setDuplicateTargetId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'VALIDATED' | 'ALL'>('PENDING');

  // Filter challenges for review
  const pendingChallenges = challenges.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'PENDING_GOVT_VALIDATION'
  );
  const validatedChallenges = challenges.filter(
    (c) => c.status !== 'SUBMITTED' && c.status !== 'PENDING_GOVT_VALIDATION' && c.status !== 'REJECTED'
  );

  const displayedList =
    activeFilter === 'PENDING'
      ? pendingChallenges
      : activeFilter === 'VALIDATED'
      ? validatedChallenges
      : challenges;

  const handleOpenReview = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setValidationAction('ACCEPT_AI');
    setOfficerRemarks('');
    setDuplicateTargetId('');
    if (challenge.assignedDepartmentId) {
      setTargetDepartmentId(challenge.assignedDepartmentId);
    } else {
      setTargetDepartmentId(departments[0]?.id || '');
    }
  };

  const handleConfirmValidation = async () => {
    if (!selectedChallenge) return;
    setIsProcessing(true);

    try {
      const selectedDept = departments.find((d) => d.id === targetDepartmentId);
      const success = await validateChallenge(selectedChallenge.id, {
        action: validationAction,
        departmentId: targetDepartmentId,
        departmentName: selectedDept?.department,
        remarks: officerRemarks,
        duplicateTargetId
      });

      if (success) {
        setSelectedChallenge(null);
      } else {
        alert('Validation update failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating validation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Government Administrative Review &amp; Routing
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Official evaluation of crowdsourced societal problems &bull; Gatekeeper for University R&amp;D Matching &bull; State Innovation Council
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Pending Validation ({pendingChallenges.length})
          </button>
          <button
            onClick={() => setActiveFilter('VALIDATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'VALIDATED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Validated / In R&amp;D ({validatedChallenges.length})
          </button>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({challenges.length})
          </button>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Review Queue ({displayedList.length} Items)
          </span>
          <span className="text-xs text-stone-500">
            Active Reviewer: <span className="font-semibold text-stone-800">{currentUser.name}</span>
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {displayedList.map((c) => (
            <div
              key={c.id}
              className="p-5 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {c.location.district} &bull; {c.location.block || 'Block'} &bull; {c.location.villageOrCity || 'Village'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    {c.urgency}
                  </span>
                  <span className="text-[11px] font-medium text-stone-500">
                    {c.peopleAffected.toLocaleString()} people affected
                  </span>
                  {!!(c.supportCount || c.supporters?.length) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>{c.supportCount || c.supporters?.length} supported</span>
                    </span>
                  )}
                  {c.duplicateCluster && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                      <Layers className="w-3 h-3 text-amber-600" />
                      <span>Cluster ({c.duplicateCluster.reportsCount})</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-stone-900">{c.title}</h3>
                <p className="text-xs text-stone-600 line-clamp-2">{c.description}</p>

                {/* AI Analysis Summary Pill */}
                {c.aiAnalysis && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      AI Domain: <strong>{c.aiAnalysis.domain}</strong> ({c.aiAnalysis.confidence}% conf)
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                      Gate Assessment: <strong>{c.aiAnalysis.innovation_assessment.replace(/_/g, ' ')}</strong>
                    </span>

                    {c.assignedDepartmentName && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        Target Dept: {c.assignedDepartmentName}
                      </span>
                    )}
                  </div>
                )}

                {c.officerRemarks && (
                  <div className="text-xs text-stone-600 bg-stone-100/70 p-2 rounded-lg border-l-2 border-amber-500">
                    <span className="font-semibold text-stone-700">Official Remark:</span> {c.officerRemarks}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectChallenge(c.id)}
                  className="px-3 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleOpenReview(c)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Officer Action
                </button>
              </div>
            </div>
          ))}

          {displayedList.length === 0 && (
            <div className="p-12 text-center text-stone-500 text-xs">
              No challenges in this queue.
            </div>
          )}
        </div>
      </div>

      {/* Officer Validation Action Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Administrative Validation &amp; Routing Action
                  </h3>
                  <p className="text-xs text-stone-500">
                    Challenge {selectedChallenge.id} &bull; {selectedChallenge.location.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Problem Brief */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="font-bold text-sm text-stone-900">{selectedChallenge.title}</div>
                <p className="text-stone-600 leading-relaxed">{selectedChallenge.description}</p>
                <div className="text-[11px] text-stone-500 pt-1">
                  Reported by: <span className="font-semibold text-stone-700">{selectedChallenge.citizenName}</span> ({selectedChallenge.citizenPhone || 'Verified Citizen'}) &bull; Affected: {selectedChallenge.peopleAffected.toLocaleString()}
                </div>
              </div>

              {/* AI Classification & Innovation Gate Preview */}
              {selectedChallenge.aiAnalysis && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      SETU AI Analysis &amp; Innovation Gate Verdict
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-mono font-bold">
                      Confidence: {selectedChallenge.aiAnalysis.confidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                    <div>
                      <span className="font-semibold text-purple-950">Domain:</span> {selectedChallenge.aiAnalysis.domain}
                    </div>
                    <div>
                      <span className="font-semibold text-purple-950">Gate Assessment:</span> {selectedChallenge.aiAnalysis.innovation_assessment.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <p className="text-stone-700 italic text-[11px] bg-white/70 p-2.5 rounded-lg border border-purple-100">
                    "{selectedChallenge.aiAnalysis.reasoning_summary}"
                  </p>

                  <div className="text-[11px] text-purple-900">
                    <span className="font-bold">Required Disciplines:</span> {selectedChallenge.aiAnalysis.required_expertise.join(', ')}
                  </div>
                </div>
              )}

              {/* Action Selection */}
              <div className="space-y-2">
                <label className="font-bold text-stone-900 block">
                  Select Administrative Decision:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidationAction('ACCEPT_AI')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      validationAction === 'ACCEPT_AI'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Approve AI Classification</div>
                      <div className="text-[11px] text-stone-500 font-normal">Validate domain &amp; route to primary department</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidationAction('FORWARD_UNIVERSITY')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      validationAction === 'FORWARD_UNIVERSITY'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Forward for University R&amp;D</div>
                      <div className="text-[11px] text-stone-500 font-normal">Open for student/faculty prototype projects</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidationAction('CHANGE_DEPARTMENT')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      validationAction === 'CHANGE_DEPARTMENT'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Send className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Override Department Routing</div>
                      <div className="text-[11px] text-stone-500 font-normal">Select alternate department from official directory</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidationAction('MERGE_DUPLICATE')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      validationAction === 'MERGE_DUPLICATE'
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <GitMerge className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Flag / Merge Duplicate</div>
                      <div className="text-[11px] text-stone-500 font-normal">Consolidate with an existing challenge ID</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Department Directory Selector */}
              <div className="space-y-1">
                <label className="font-bold text-stone-900 block">
                  Assign Department (Authoritative Jharkhand Directory):
                </label>
                <select
                  value={targetDepartmentId}
                  onChange={(e) => setTargetDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.department_code}] {d.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duplicate Target ID (if merge selected) */}
              {validationAction === 'MERGE_DUPLICATE' && (
                <div className="space-y-1">
                  <label className="font-bold text-stone-900">Target Challenge ID to Merge Into</label>
                  <input
                    type="text"
                    value={duplicateTargetId}
                    onChange={(e) => setDuplicateTargetId(e.target.value)}
                    placeholder="e.g. SETU-JH-2026-00142"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  />
                </div>
              )}

              {/* Officer Remarks & Justification */}
              <div className="space-y-1">
                <label className="font-bold text-stone-900">
                  Officer Remarks &amp; Technical Directive
                </label>
                <textarea
                  rows={3}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  placeholder="Enter notes on field feasibility, specific university matching directives, or existing scheme alignment..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmValidation}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold shadow-xs transition-colors"
                >
                  {isProcessing ? (
                    <span>Submitting Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Administrative Sign-off</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
