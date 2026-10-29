/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Camera,
  Mic,
  FileText,
  Building,
  HelpCircle,
  ShieldCheck,
  Zap,
  Bot,
  Compass,
  RotateCcw,
  Check,
  Heart,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Challenge, JHARKHAND_DISTRICTS, DetailedLocationInfo } from '../types.js';
import { LiveCameraCapture, LiveCameraCaptureResult } from './LiveCameraCapture.js';
import { LocationConfirmationCard } from './LocationConfirmationCard.js';
import { LocationPickerMapModal } from './LocationPickerMapModal.js';
import { AudioRecorderButton } from './AudioRecorderButton.js';
import { GeminiChatbotModal } from './GeminiChatbotModal.js';
import { MapsGroundingModal } from './MapsGroundingModal.js';

interface CitizenPortalProps {
  onSelectChallenge: (id: string) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ onSelectChallenge }) => {
  const { challenges, createChallenge, currentUser, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Camera & Modals State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [liveCameraEvidence, setLiveCameraEvidence] = useState<LiveCameraCaptureResult | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<DetailedLocationInfo | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water & Sanitation');
  const [district, setDistrict] = useState('Khunti');
  const [block, setBlock] = useState('Torpa');
  const [village, setVillage] = useState('');
  const [peopleAffected, setPeopleAffected] = useState('1000');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Pre-fill templates for fast testing of SIH problem statements
  const applyTemplate = (type: string) => {
    if (type === 'water') {
      setTitle('Village drinking water well dry and women walking 3 km daily');
      setDescription('Two hand-pumps in our village have run completely dry and the single open well is muddy and contaminated with heavy iron. 350 tribal families must walk 3 km daily to collect muddy water from a pit.');
      setCategory('Water & Sanitation');
      setDistrict('Khunti');
      setBlock('Torpa');
      setVillage('Dorma Gram Panchayat');
      setPeopleAffected('1750');
      setUrgency('HIGH');
    } else if (type === 'solar') {
      setTitle('Erratic grid electricity cutting off school computer lab and digital learning');
      setDescription('Tribal residential high school gets only 2 hours of power per day. 40 computers and smart classrooms cannot function. Diesel fuel costs are unaffordable for the school.');
      setCategory('Energy & Education');
      setDistrict('Latehar');
      setBlock('Mahuadanr');
      setVillage('Orsa Village');
      setPeopleAffected('650');
      setUrgency('MEDIUM');
    } else if (type === 'road') {
      setTitle('Rural culvert collapse cutting off village road during monsoon floods');
      setDescription('Seasonal hill stream washed away the bridge culvert. 3 villages are cut off from primary healthcare and school during heavy rain.');
      setCategory('Roads & Infrastructure');
      setDistrict('Dumka');
      setBlock('Shikaripara');
      setVillage('Banjhi Village');
      setPeopleAffected('2400');
      setUrgency('HIGH');
    }
  };

  // Real-time duplicate check as user types title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (val.length > 8) {
      const words = val.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const match = challenges.find((c) => {
        const text = `${c.title} ${c.description}`.toLowerCase();
        let count = 0;
        words.forEach((w) => {
          if (text.includes(w)) count++;
        });
        return count >= 2;
      });
      if (match) {
        setDuplicateWarning(`Potential duplicate detected: "${match.title}" (${match.id})`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out challenge title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const mediaList = liveCameraEvidence
        ? [
            {
              id: 'cam-' + Date.now(),
              type: 'IMAGE' as const,
              url: liveCameraEvidence.dataUrl,
              name: `Live Camera Evidence (${liveCameraEvidence.district || district})`,
              caption:
                liveCameraEvidence.analysis?.observations ||
                'Verified on-ground live camera capture by citizen',
              uploadedAt: liveCameraEvidence.capturedAt
            }
          ]
        : [];

      const activeLoc = liveCameraEvidence?.location || pickedLocation;

      const created = await createChallenge({
        title,
        description,
        category,
        district: activeLoc?.district || district,
        block: activeLoc?.block || block,
        villageOrCity: activeLoc?.villageOrCity || village || 'Local Habitation',
        address: activeLoc?.address || `${village ? village + ', ' : ''}${block ? block + ', ' : ''}${district}, Jharkhand`,
        road: activeLoc?.road,
        landmark: activeLoc?.landmark,
        pincode: activeLoc?.pincode,
        coordinates: activeLoc?.lat !== undefined && activeLoc?.lng !== undefined
          ? { lat: activeLoc.lat, lng: activeLoc.lng }
          : liveCameraEvidence?.lat && liveCameraEvidence?.lng
          ? { lat: liveCameraEvidence.lat, lng: liveCameraEvidence.lng }
          : undefined,
        accuracyMeters: activeLoc?.accuracyMeters,
        locationSource: activeLoc?.source || (liveCameraEvidence?.lat ? 'GPS' : 'USER_ENTERED'),
        locationConfidence: activeLoc?.confidence || (liveCameraEvidence?.lat ? 'HIGH' : 'LOW'),
        locationConfirmed: activeLoc?.confirmed ?? true,
        locationConfirmedAt: activeLoc?.confirmedAt || new Date().toISOString(),
        originalGpsLocation: liveCameraEvidence?.originalGpsLocation || activeLoc?.originalGpsLocation,
        confirmedLocation: activeLoc?.confirmedLocation || (activeLoc ? {
          lat: activeLoc.lat || 23.3441,
          lng: activeLoc.lng || 85.3096,
          district: activeLoc.district || district,
          block: activeLoc.block || block,
          villageOrCity: activeLoc.villageOrCity || village,
          address: activeLoc.address,
          source: activeLoc.source || 'USER_CONFIRMED',
          confirmedAt: new Date().toISOString()
        } : undefined),
        peopleAffected: Number(peopleAffected) || 100,
        urgency,
        additionalInfo,
        media: mediaList
      });

      if (created) {
        setIsSubmitModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setLiveCameraEvidence(null);
        setPickedLocation(null);
        setDuplicateWarning(null);
        // Open details to see instant AI analysis
        onSelectChallenge(created.id);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered challenges
  const filteredChallenges = challenges.filter((c) => {
    if (selectedDistrict !== 'ALL' && c.location.district !== selectedDistrict) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${c.id} ${c.title} ${c.description} ${c.location.district} ${c.category} ${c.aiAnalysis?.domain || ''}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">Critical Priority</span>;
      case 'HIGH':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">High Priority</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">Medium</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PILOT_DEPLOYED' || status === 'IMPACT_VERIFIED' || status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Solution Deployed</span>
        </span>
      );
    }
    if (status === 'PROTOTYPE_READY' || status === 'TESTING_IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Prototype in Lab</span>
        </span>
      );
    }
    if (status === 'UNIVERSITY_MATCHED' || status === 'PROJECT_PROPOSED' || status === 'PROJECT_APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
          <Building className="w-3.5 h-3.5 text-cyan-600" />
          <span>University R&D Active</span>
        </span>
      );
    }
    if (status === 'GOVT_VALIDATED' || status === 'DEPARTMENT_ROUTED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Validated by Govt</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
        <Clock className="w-3.5 h-3.5 text-stone-500" />
        <span>Awaiting Review</span>
      </span>
    );
  };

  const getInnovationGateBadge = (assessment?: string) => {
    if (!assessment) return null;
    if (assessment === 'INNOVATION_GAP') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200" title="Genuine technical/engineering research gap requiring university R&D">
          Gate: Innovation Gap (University R&D)
        </span>
      );
    }
    if (assessment === 'IMPLEMENTATION_GAP') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200" title="Scheme exists; execution/monitoring improvement needed">
          Gate: Implementation Gap
        </span>
      );
    }
    if (assessment === 'EXISTING_SOLUTION') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200" title="Existing government scheme or technology directly applicable">
          Gate: Existing Scheme Applicable
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Banner with Clear Purpose */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Not a Grievance Portal &bull; Societal Problem-to-Innovation Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Crowdsource Real Societal Challenges in Jharkhand
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Report grassroot challenges in drinking water, rural infrastructure, solar power, healthcare, and education. SETU analyzes each challenge via AI, validates it through Government Departments, and matches it with top universities (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad) and industry partners to develop working prototypes and field-deployed solutions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow-md transition-all hover:shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Report a Societal Challenge</span>
            </button>

            <button
              onClick={() => setIsChatbotOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all backdrop-blur-xs"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>SETU AI Assistant</span>
            </button>

            <button
              onClick={() => setIsMapsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all backdrop-blur-xs"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>Google Maps Grounding</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-300 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Link to 31 State Departments &amp; HEI R&amp;D Labs</span>
            </div>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-6 text-9xl font-black text-white/5 select-none pointer-events-none">
          SETU
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges by village, district, problem keyword, or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span>District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden"
              >
                <option value="ALL">All 24 Districts</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PENDING_GOVT_VALIDATION">Pending Govt Validation</option>
                <option value="GOVT_VALIDATED">Govt Validated</option>
                <option value="UNIVERSITY_MATCHED">University Matched</option>
                <option value="PROTOTYPE_READY">Prototype Ready</option>
                <option value="PILOT_DEPLOYED">Pilot Deployed</option>
                <option value="IMPACT_VERIFIED">Impact Verified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectChallenge(c.id)}
            className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-stone-500">
                      {c.id}
                    </span>
                    {getUrgencyBadge(c.urgency)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {c.location.villageOrCity || c.location.block || c.location.address || 'Jharkhand'}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(c.status)}</div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {c.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* AI & Innovation Gate Badges */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {getInnovationGateBadge(c.aiAnalysis?.innovation_assessment)}
                {c.aiAnalysis?.domain && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                    Domain: {c.aiAnalysis.domain}
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{c.peopleAffected.toLocaleString()} affected</span>
                </div>
                {!!(c.supportCount || c.supporters?.length) && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{c.supportCount || c.supporters?.length}</span>
                  </span>
                )}
                {c.duplicateCluster && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Layers className="w-3 h-3 text-amber-600" />
                    <span>Cluster ({c.duplicateCluster.reportsCount})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Inspect Solution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-stone-300">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-800">No challenges match your query</h3>
          <p className="text-xs text-stone-500 mt-1">Try resetting your search query or filters.</p>
        </div>
      )}

      {/* Interactive Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Report a Societal Challenge in Jharkhand
                </h3>
                <p className="text-xs text-stone-500">
                  Submissions are automatically routed to government departments and matched with university R&amp;D teams.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100"
              >
                &times;
              </button>
            </div>

            {/* Quick Templates for SIH Demo */}
            <div className="px-5 pt-3 pb-2 bg-stone-50 border-b border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Load SIH 2026 Test Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('water')}
                  className="px-2.5 py-1 rounded bg-white text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  Scenario 1: Drinking Water (Khunti)
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('solar')}
                  className="px-2.5 py-1 rounded bg-white text-indigo-800 border border-indigo-200 text-xs font-semibold hover:bg-indigo-50 transition-colors shadow-2xs"
                >
                  Scenario 2: Tribal School Power (Latehar)
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('road')}
                  className="px-2.5 py-1 rounded bg-white text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-50 transition-colors shadow-2xs"
                >
                  Scenario 3: Road Erosion (Dumka)
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Duplicate Check Warning */}
              {duplicateWarning && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Warning:</span> {duplicateWarning}
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      You can still proceed if this is a distinct physical site or additional evidence.
                    </div>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-800">
                  Challenge Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Village drinking water well dry and women walking 3 km daily"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Description Input with Voice Recorder */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-800">
                    Detailed Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <AudioRecorderButton
                    onTranscribe={(txt) => {
                      setDescription((prev) => (prev ? `${prev} ${txt}` : txt));
                    }}
                    promptHint="Transcribe citizen problem description in Hindi, Santhali, or English"
                    buttonLabel="Record Voice (gemini-3.5-transcribe)"
                  />
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the physical reality, who is affected, past failures, and health/economic consequences..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* LIVE CAMERA VISUAL EVIDENCE (STRICTLY HARDWARE CAMERA ONLY, NO LOCAL FILE SELECTION) */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Live Camera Physical Evidence</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Direct Feed Only
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Local File Selection Disabled
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 leading-normal">
                  To ensure authentic ground-truth reporting and prevent fake stock uploads, SETU requires
                  capturing photographic evidence <strong>directly from your device's live camera</strong>.
                </p>

                {liveCameraEvidence ? (
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={liveCameraEvidence.dataUrl}
                          alt="Live Camera Snapshot"
                          className="w-16 h-16 rounded-lg object-cover border border-emerald-400 shadow-2xs shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-emerald-950">
                              Live Camera Evidence Verified
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="text-[11px] text-stone-600">
                            Captured: {new Date(liveCameraEvidence.capturedAt).toLocaleTimeString()} &bull;{' '}
                            {liveCameraEvidence.lat && liveCameraEvidence.lng
                              ? `GPS: ${liveCameraEvidence.lat}°, ${liveCameraEvidence.lng}°`
                              : `${district}, Jharkhand`}
                          </div>
                          {liveCameraEvidence.analysis && (
                            <div className="text-[11px] text-emerald-800 font-medium">
                              AI Vision: {liveCameraEvidence.analysis.damageCategory} (
                              {liveCameraEvidence.analysis.severity} Severity)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsCameraActive(true)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        >
                          Retake Live
                        </button>
                        {liveCameraEvidence.analysis && (
                          <button
                            type="button"
                            onClick={() => {
                              if (liveCameraEvidence.analysis?.suggestedTitle) {
                                setTitle(liveCameraEvidence.analysis.suggestedTitle);
                              }
                              if (liveCameraEvidence.analysis?.damageCategory) {
                                setCategory(liveCameraEvidence.analysis.damageCategory);
                              }
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors"
                            title="Auto-fill Title and Category from Vision AI diagnosis"
                          >
                            Apply AI Suggestion
                          </button>
                        )}
                      </div>
                    </div>

                    {liveCameraEvidence.analysis?.observations && (
                      <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <span className="font-semibold text-stone-700">Diagnosis: </span>
                        {liveCameraEvidence.analysis.observations}
                      </div>
                    )}

                    {/* Geocoded & Verified Site Location Confirmation */}
                    {liveCameraEvidence.location && (
                      <div className="pt-2 border-t border-stone-200">
                        <LocationConfirmationCard
                          location={liveCameraEvidence.location}
                          onConfirm={(confirmed) => {
                            setLiveCameraEvidence((prev) =>
                              prev ? { ...prev, location: confirmed } : null
                            );
                            if (confirmed.district) setDistrict(confirmed.district);
                            if (confirmed.block) setBlock(confirmed.block);
                            if (confirmed.villageOrCity) setVillage(confirmed.villageOrCity);
                          }}
                          onUpdate={(updated) => {
                            setLiveCameraEvidence((prev) =>
                              prev ? { ...prev, location: updated } : null
                            );
                            if (updated.district) setDistrict(updated.district);
                            if (updated.block) setBlock(updated.block);
                            if (updated.villageOrCity) setVillage(updated.villageOrCity);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200">
                    <div className="text-xs text-stone-600">
                      Take an immediate on-site camera snapshot of the problem
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCameraActive(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-2xs transition-colors shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Open Live Camera</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Category & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-800">Category / Domain</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="Water & Sanitation">Water &amp; Sanitation</option>
                    <option value="Agriculture & Irrigation">Agriculture &amp; Irrigation</option>
                    <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                    <option value="Energy & Education">Energy &amp; Education</option>
                    <option value="Health & Medical">Health &amp; Medical</option>
                    <option value="Urban Waste & Sanitation">Urban Waste &amp; Sanitation</option>
                    <option value="Disaster Management & Flood">Disaster Management &amp; Flood</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-800">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                      title="Open interactive satellite & street map to pin coordinates"
                    >
                      <Compass className="w-3 h-3 text-emerald-600" />
                      <span>Pin on Map</span>
                    </button>
                  </div>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    required
                  >
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Map Picked Badge */}
              {pickedLocation && (
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950">Pinned Map Location:</span>{' '}
                      <span className="text-emerald-800 font-medium">
                        {pickedLocation.address || `${pickedLocation.villageOrCity || ''}, ${pickedLocation.block || ''}, ${pickedLocation.district}`}
                      </span>
                      {pickedLocation.lat && pickedLocation.lng && (
                        <span className="ml-1.5 text-[10px] text-stone-500 font-mono">
                          ({pickedLocation.lat.toFixed(4)}°, {pickedLocation.lng.toFixed(4)}°)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-[11px] font-bold text-emerald-700 underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Block & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-800">Block / Tehsil</label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Torpa / Shikaripara / Mahuadanr"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-800">Village / Habitation / Ward</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Dorma Gram Panchayat"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              {/* People Affected & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-800">Estimated People Affected</label>
                  <input
                    type="number"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-800">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? (
                    <span>Running AI Engine...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit &amp; Trigger AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal (Strictly Hardware Feed, No file picker) */}
      {isCameraActive && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <LiveCameraCapture
              districtHint={district}
              onCapture={(res) => {
                setLiveCameraEvidence(res);
                if (res.location) {
                  if (res.location.district) setDistrict(res.location.district);
                  if (res.location.block) setBlock(res.location.block);
                  if (res.location.villageOrCity) setVillage(res.location.villageOrCity);
                } else if (res.district) {
                  setDistrict(res.district);
                }
                setIsCameraActive(false);
              }}
              onCancel={() => setIsCameraActive(false)}
            />
          </div>
        </div>
      )}

      {/* Gemini Chatbot Modal */}
      {isChatbotOpen && (
        <GeminiChatbotModal onClose={() => setIsChatbotOpen(false)} />
      )}

      {/* Google Maps Grounding Modal */}
      {isMapsModalOpen && (
        <MapsGroundingModal
          initialDistrict={selectedDistrict !== 'ALL' ? selectedDistrict : 'Ranchi'}
          onClose={() => setIsMapsModalOpen(false)}
        />
      )}

      {/* Interactive Map Picker Modal */}
      {isLocationPickerOpen && (
        <LocationPickerMapModal
          initialLocation={
            pickedLocation ||
            (liveCameraEvidence?.location
              ? liveCameraEvidence.location
              : { district, block, villageOrCity: village })
          }
          districtHint={district}
          onConfirm={(confirmed) => {
            setPickedLocation(confirmed);
            if (confirmed.district) setDistrict(confirmed.district);
            if (confirmed.block) setBlock(confirmed.block);
            if (confirmed.villageOrCity) setVillage(confirmed.villageOrCity);
            if (liveCameraEvidence) {
              setLiveCameraEvidence((prev) => (prev ? { ...prev, location: confirmed } : null));
            }
            setIsLocationPickerOpen(false);
          }}
          onClose={() => setIsLocationPickerOpen(false)}
        />
      )}
    </div>
  );
};
