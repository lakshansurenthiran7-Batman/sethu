/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Camera,
  Bot,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Challenge } from '../types.js';
import { LiveCameraCapture, LiveCameraCaptureResult } from './LiveCameraCapture.js';
import { GeminiChatbotModal } from './GeminiChatbotModal.js';
import { MapsGroundingModal } from './MapsGroundingModal.js';
import { InnovationGateCard } from './InnovationGateCard.js';
import { DuplicateClusterCard } from './DuplicateClusterCard.js';
import { CitizenSupportCard } from './CitizenSupportCard.js';

interface ChallengeDetailModalProps {
  challengeId: string;
  onClose: () => void;
  onOpenProject?: (projectId: string) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challengeId,
  onClose,
  onOpenProject
}) => {
  const {
    challenges,
    projects,
    departments,
    currentUser,
    setCurrentView,
    supportChallenge,
    updateClusterStatus,
    setSelectedChallengeId
  } = useApp();

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return null;

  const associatedProject = projects.find((p) => p.challengeId === challenge.id);
  const assignedDepartment = departments.find((d) => d.id === challenge.assignedDepartmentId);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {challenge.id}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {challenge.category}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {challenge.urgency}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              {challenge.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Location & Reporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="space-y-1">
              <div className="text-stone-500 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical Geographic Location</span>
                </div>
                {challenge.location.locationConfirmed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Verified On-Ground</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-stone-900">
                {challenge.location.address || `${challenge.location.villageOrCity}, ${challenge.location.block ? challenge.location.block + ', ' : ''}${challenge.location.district}`}
              </div>
              <div className="text-stone-600 space-y-0.5">
                <div>
                  District: <strong>{challenge.location.district}</strong>, Jharkhand {challenge.location.block ? `• Block: ${challenge.location.block}` : ''}
                </div>
                {(challenge.location.road || challenge.location.landmark) && (
                  <div className="text-[11px] text-stone-500">
                    {challenge.location.road ? `Road: ${challenge.location.road} ` : ''}
                    {challenge.location.landmark ? `• Landmark: ${challenge.location.landmark}` : ''}
                  </div>
                )}
                {challenge.location.coordinates && (
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono pt-0.5">
                    <Compass className="w-3 h-3 text-emerald-600" />
                    <span>
                      {challenge.location.coordinates.lat.toFixed(5)}° N, {challenge.location.coordinates.lng.toFixed(5)}° E
                      {challenge.location.accuracyMeters ? ` (±${Math.round(challenge.location.accuracyMeters)}m)` : ''}
                    </span>
                    <span className="text-stone-400">
                      • {challenge.location.locationSource || 'Device GPS'} ({challenge.location.locationConfidence || 'HIGH'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-stone-200 sm:pl-3">
              <div className="text-stone-500 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>Citizen Impact &amp; Reporter</span>
              </div>
              <div className="font-bold text-stone-900">
                {challenge.peopleAffected.toLocaleString()} people affected
              </div>
              <div className="text-stone-600">
                Submitted by: <strong>{challenge.citizenName}</strong> ({new Date(challenge.createdAt).toLocaleDateString()})
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Problem Ground Reality Description
            </h3>
            <div className="p-4 rounded-xl bg-white border border-stone-200 leading-relaxed text-stone-700 text-xs whitespace-pre-wrap">
              {challenge.description}
            </div>
          </div>

          {/* Citizen Community Voice & Endorsement (+1) (Phase 5) */}
          <CitizenSupportCard
            challengeId={challenge.id}
            supportCount={challenge.supportCount || challenge.supporters?.length || 0}
            supporters={challenge.supporters}
            currentUser={currentUser}
            onSupport={(note) => supportChallenge(challenge.id, note)}
          />

          {/* Duplicate Detection & Multi-Report Spatial Clustering (Phase 6) */}
          <DuplicateClusterCard
            cluster={challenge.duplicateCluster}
            duplicateMatches={challenge.aiAnalysis?.duplicate_matches}
            duplicateCandidates={challenge.aiAnalysis?.duplicate_candidates}
            currentUser={currentUser}
            onUpdateClusterStatus={(status) => updateClusterStatus(challenge.id, status)}
            onSelectCandidate={(candId) => setSelectedChallengeId(candId)}
          />

          {/* Media Attachments Preview if available */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Field Evidence &amp; Visual Media ({challenge.media?.length || 0})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCameraActive(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>Capture Live Camera Proof</span>
              </button>
            </div>

            {challenge.media && challenge.media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.media.map((m) => {
                  const isLiveCamera =
                    m.name?.includes('Live Camera') ||
                    m.caption?.toLowerCase().includes('live camera') ||
                    m.caption?.toLowerCase().includes('verified');
                  return (
                    <div key={m.id} className="rounded-xl overflow-hidden border border-stone-200 relative group">
                      <img
                        src={m.url}
                        alt={m.caption || 'Field evidence'}
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover"
                      />
                      {isLiveCamera && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>LIVE CAMERA VERIFIED</span>
                        </div>
                      )}
                      {m.caption && (
                        <div className="p-2 bg-stone-50 text-[11px] text-stone-600 truncate border-t border-stone-200">
                          {m.caption}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-xs flex items-center justify-between">
                <span>No live visual evidence uploaded yet for this site.</span>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Activate Live Camera &rarr;
                </button>
              </div>
            )}
          </div>

          {/* SETU AI Problem Analysis & Innovation Gate */}
          {challenge.aiAnalysis && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/50 border border-purple-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-sm text-purple-950">
                    SETU AI Problem Analysis Engine &bull; {challenge.aiAnalysis.model_used}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                    Confidence: {challenge.aiAnalysis.confidence}%
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-purple-800 border border-purple-200">
                    Lang: {challenge.aiAnalysis.detected_language}
                  </span>
                </div>
              </div>

              {/* Problem Summarization (B) */}
              {challenge.aiAnalysis.problem_summary && (
                <div className="p-3 rounded-lg bg-white/90 border border-purple-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                    Distilled Problem Summary:
                  </span>
                  <p className="text-xs font-medium text-stone-800 leading-relaxed">
                    {challenge.aiAnalysis.problem_summary}
                  </p>
                </div>
              )}

              {/* Innovation Necessity Gate Box (Phase 4) */}
              <InnovationGateCard
                intelligence={challenge.innovationGate}
                fallbackAssessment={challenge.aiAnalysis.innovation_assessment}
                fallbackReasoning={challenge.aiAnalysis.reasoning_summary}
              />

              {/* Domain & Sub-domain (C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white/70 border border-purple-100">
                  <span className="font-semibold text-purple-950 block text-[11px]">Identified Domain:</span>
                  <span className="text-stone-800 font-medium">{challenge.aiAnalysis.domain}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/70 border border-purple-100">
                  <span className="font-semibold text-purple-950 block text-[11px]">Sub-Domain:</span>
                  <span className="text-stone-800 font-medium">{challenge.aiAnalysis.sub_domain}</span>
                </div>
              </div>

              {/* Duplicate Detection Alert (F) */}
              {challenge.aiAnalysis.duplicate_candidates && challenge.aiAnalysis.duplicate_candidates.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Potential Duplicate Challenge Candidates Detected ({challenge.aiAnalysis.duplicate_candidates.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.aiAnalysis.duplicate_candidates.map((cid) => (
                      <span key={cid} className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {cid}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Technical Disciplines (G) */}
              <div>
                <span className="font-semibold text-purple-950 block mb-1 text-xs">
                  Required Multidisciplinary Technical Disciplines:
                </span>
                <div className="flex flex-wrap gap-1">
                  {challenge.aiAnalysis.required_expertise.map((exp) => (
                    <span
                      key={exp}
                      className="text-[11px] px-2 py-0.5 rounded bg-white text-purple-900 border border-purple-200 font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Possible Departments & Official Database Contact Dossier (H) */}
              {challenge.aiAnalysis.department_contact_info && challenge.aiAnalysis.department_contact_info.length > 0 && (
                <div className="p-3 rounded-lg bg-white border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Government Department Identification &amp; Contact (Database Query):
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Authoritative State Registry
                    </span>
                  </div>
                  {challenge.aiAnalysis.department_contact_info.map((dept) => (
                    <div key={dept.departmentId} className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">{dept.department} ({dept.department_code})</span>
                        <span className="text-[10px] text-stone-500 font-mono">{dept.departmentId}</span>
                      </div>
                      {dept.officer_name && (
                        <div className="text-stone-700 text-[11px]">
                          <strong>Nodal Officer:</strong> {dept.officer_name} &bull; <span className="text-stone-600">{dept.designation}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600">
                        {dept.emails && dept.emails.length > 0 && (
                          <span><strong>Email:</strong> {dept.emails.join(', ')}</span>
                        )}
                        {dept.phone_numbers && dept.phone_numbers.length > 0 && (
                          <span><strong>Phone:</strong> {dept.phone_numbers.join(', ')}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500">{dept.address}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* University Capability Requirements & Matched HEIs (I) */}
              <div>
                <span className="font-semibold text-purple-950 block mb-1 text-xs">
                  Matched Academic Institutions (Higher Education Labs):
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {challenge.aiAnalysis.possible_universities.map((uni) => (
                    <span
                      key={uni}
                      className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold"
                    >
                      {uni}
                    </span>
                  ))}
                </div>
                {challenge.aiAnalysis.university_capability_requirements && challenge.aiAnalysis.university_capability_requirements.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                      Required University Lab &amp; Research Clusters:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {challenge.aiAnalysis.university_capability_requirements.map((cap) => (
                        <span key={cap} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Schemes Applicable */}
              {challenge.aiAnalysis.existing_schemes && challenge.aiAnalysis.existing_schemes.length > 0 && (
                <div>
                  <span className="font-semibold text-purple-950 block mb-1 text-xs">
                    Existing Government Schemes / Programs Applicable:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {challenge.aiAnalysis.existing_schemes.map((sch) => (
                      <span
                        key={sch}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {sch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Government Routing & Officer Sign-off */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Government Review &amp; Department Routing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-500">Current Status:</span>{' '}
                <span className="font-bold text-stone-900">{challenge.status.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-stone-500">Assigned Department:</span>{' '}
                <span className="font-bold text-emerald-800">
                  {assignedDepartment ? assignedDepartment.department : challenge.assignedDepartmentName || 'Department of Drinking Water & Sanitation'}
                </span>
              </div>
            </div>

            {challenge.officerRemarks && (
              <div className="p-2.5 rounded-lg bg-white border border-stone-200 text-stone-700 italic">
                <span className="font-semibold text-stone-900 not-italic">Officer Directive:</span>{' '}
                "{challenge.officerRemarks}"
              </div>
            )}
          </div>

          {/* Active Solution Project Workspace Link if exists */}
          {associatedProject && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Active University R&amp;D Solution: {associatedProject.id}</span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  Stage: {associatedProject.currentStage.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="font-bold text-sm text-stone-900">{associatedProject.title}</div>
              <p className="text-stone-600 leading-relaxed">{associatedProject.abstract}</p>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-stone-600">
                  Lead HEI: <strong>{associatedProject.universityName}</strong> ({associatedProject.members.length} members)
                </span>

                {onOpenProject && (
                  <button
                    onClick={() => {
                      onClose();
                      setCurrentView('UNIVERSITY');
                      onOpenProject(associatedProject.id);
                    }}
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    <span>Open Solution Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatbotOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors"
              >
                <Bot className="w-4 h-4 text-emerald-600" />
                <span>Consult SETU AI Liaison</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMapsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-300 transition-colors"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Ground in Google Maps</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Live Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <LiveCameraCapture
              districtHint={challenge.location.district}
              onCapture={(res) => {
                if (!challenge.media) challenge.media = [];
                challenge.media.push({
                  id: 'cam-' + Date.now(),
                  type: 'IMAGE',
                  url: res.dataUrl,
                  name: `Live Camera Evidence (${challenge.location.district})`,
                  caption: res.analysis?.observations || 'Live camera photo captured by field inspector',
                  uploadedAt: res.capturedAt
                });
                setIsCameraActive(false);
              }}
              onCancel={() => setIsCameraActive(false)}
            />
          </div>
        </div>
      )}

      {/* Embedded Gemini Chatbot in Challenge Context */}
      {isChatbotOpen && (
        <GeminiChatbotModal
          initialChallengeContext={{
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            district: challenge.location.district,
            domain: challenge.category
          }}
          onClose={() => setIsChatbotOpen(false)}
        />
      )}

      {/* Embedded Maps Grounding */}
      {isMapsModalOpen && (
        <MapsGroundingModal
          initialDistrict={challenge.location.district}
          initialQuery={`${challenge.category} offices and engineering testing laboratories in ${challenge.location.district}`}
          onClose={() => setIsMapsModalOpen(false)}
        />
      )}
    </div>
  );
};
