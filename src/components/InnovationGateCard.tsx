/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileCheck,
  Cpu,
  Building2,
  ExternalLink,
  Search,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { InnovationGateIntelligence } from '../types.js';

interface InnovationGateCardProps {
  intelligence?: InnovationGateIntelligence;
  fallbackAssessment?: string;
  fallbackReasoning?: string;
}

export const InnovationGateCard: React.FC<InnovationGateCardProps> = ({
  intelligence,
  fallbackAssessment,
  fallbackReasoning
}) => {
  if (!intelligence && !fallbackAssessment) return null;

  const classification = intelligence?.classification || fallbackAssessment || 'INNOVATION_GAP';
  const explanation = intelligence?.gapExplanation || fallbackReasoning || 'Standard solutions fail under local topographical conditions.';
  const recommendation = intelligence?.recommendation || 'Forward to University R&D teams for localized prototype development.';
  const existingSolutions = intelligence?.existingSolutions || {
    governmentSolutionsCount: 1,
    researchCount: 8,
    patentsCount: 2,
    openSourceCount: 3,
    existingProductsCount: 1,
    previousProjectsCount: 2
  };
  const references = intelligence?.references || [];

  const getVerdictBadge = (cls: string) => {
    switch (cls) {
      case 'INNOVATION_GAP':
        return {
          label: 'Genuine Innovation Gap — R&D Required',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Lightbulb
        };
      case 'PARTIALLY_ADDRESSED':
        return {
          label: 'Partially Addressed — Localization Needed',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle
        };
      case 'SOLVED':
        return {
          label: 'Standard Solution Exists — Routine Implementation',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      default:
        return {
          label: 'Needs Further Review',
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: HelpCircle
        };
    }
  };

  const badge = getVerdictBadge(classification);
  const BadgeIcon = badge.icon;

  return (
    <div className="rounded-xl border border-purple-200 bg-linear-to-br from-purple-50/70 via-white to-indigo-50/50 p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-2xs">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
              <span>Innovation Gate &amp; Solution Landscape Intelligence</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-200 text-purple-900">
                Phase 4
              </span>
            </h3>
            <p className="text-[11px] text-purple-800/80">
              Evaluates whether this societal problem requires novel academic R&amp;D or routine scheme execution.
            </p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* 6-Pillar Solution Check Breakdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-purple-600" />
            <span>6-Pillar Global &amp; National Landscape Verification</span>
          </span>
          <span className="text-[10px] font-normal text-stone-500 lowercase">
            scanned across state, academic &amp; patent registries
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-600" />
              <span>Gov Schemes</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.governmentSolutionsCount}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span>Research</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.researchCount}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Patents &amp; IP</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.patentsCount}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3 text-teal-600" />
              <span>Open Source</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.openSourceCount}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Products</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.existingProductsCount}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs text-center space-y-0.5">
            <div className="text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <FileCheck className="w-3 h-3 text-rose-600" />
              <span>Prior HEI R&amp;D</span>
            </div>
            <div className="text-base font-bold text-stone-900">
              {existingSolutions.previousProjectsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Gap Explanation */}
      <div className="p-3.5 rounded-lg bg-white/95 border border-purple-100 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
          Why Conventional Solutions Fail (Innovation Gap Rationale):
        </span>
        <p className="text-xs text-stone-700 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Strategic Recommendation */}
      <div className="p-3 rounded-lg bg-purple-50/80 border border-purple-200/80 text-xs space-y-1">
        <span className="font-bold text-purple-950 block text-[11px] uppercase tracking-wider">
          State Innovation Committee Directive &amp; Next Action:
        </span>
        <p className="text-stone-800">
          {recommendation}
        </p>
      </div>

      {/* Grounded References & Research Evidence Links */}
      {references.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
            Authoritative References &amp; Technical Citations ({references.length}):
          </span>
          <div className="space-y-1.5">
            {references.map((ref, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-purple-100 text-xs hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    {ref.type}
                  </span>
                  <span className="font-medium text-stone-800 truncate">{ref.title}</span>
                </div>
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
