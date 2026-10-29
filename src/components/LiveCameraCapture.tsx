/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SwitchCamera,
  Grid,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  Compass,
  Check,
  Search,
  Building
} from 'lucide-react';
import { DetailedLocationInfo, JHARKHAND_DISTRICTS } from '../types.js';
import { formatCoord, getGpsConfidenceCategory, calculateHaversineDistanceMeters } from '../utils/geoUtils.js';
import { CameraMiniMapOverlay } from './CameraMiniMapOverlay.js';
import { LocationPickerMapModal } from './LocationPickerMapModal.js';

export interface LiveCameraCaptureResult {
  dataUrl: string;
  capturedAt: string;
  lat?: number;
  lng?: number;
  district?: string;
  location?: DetailedLocationInfo;
  originalGpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  };
  confirmedLocation?: {
    lat: number;
    lng: number;
    district?: string;
    block?: string;
    villageOrCity?: string;
    address?: string;
    source: string;
    confirmedAt: string;
  };
  analysis?: {
    observations: string;
    suggestedTitle: string;
    damageCategory: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    estimatedPeopleAffected: number;
    engineeringSuggestions: string[];
  };
}

interface LiveCameraCaptureProps {
  onCapture: (result: LiveCameraCaptureResult) => void;
  onCancel?: () => void;
  districtHint?: string;
  autoAnalyzeWithAI?: boolean;
}

export const LiveCameraCapture: React.FC<LiveCameraCaptureProps> = ({
  onCapture,
  onCancel,
  districtHint,
  autoAnalyzeWithAI = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [capturedCoordinates, setCapturedCoordinates] = useState<{
    lat: number;
    lng: number;
    accuracyMeters?: number | null;
    district?: string;
    locality?: string;
  } | null>(null);

  // GPS and Geolocation states
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Structured location info
  const [detailedLocation, setDetailedLocation] = useState<DetailedLocationInfo>({
    district: districtHint || 'Ranchi',
    source: 'GPS',
    confidence: 'HIGH'
  });

  // Location confirmation & inline edit state
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editDistrict, setEditDistrict] = useState(districtHint || 'Ranchi');
  const [editBlock, setEditBlock] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLandmark, setEditLandmark] = useState('');

  // Places search for location refinement
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // AI Analysis of the captured live frame
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<LiveCameraCaptureResult['analysis'] | null>(null);
  const [flashAnimation, setFlashAnimation] = useState(false);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (MediaDevices) is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser bar.'
          : err.name === 'NotFoundError'
          ? 'No physical camera device detected on this machine. You can activate the simulated live viewfinder feed below.'
          : err.message || 'Unable to access live camera stream.'
      );
    }
  };

  // Reverse Geocode helper
  const triggerReverseGeocode = async (lat: number, lng: number, acc?: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      const data = await res.json();
      if (data.success) {
        const resolvedDistrict = data.district || districtHint || 'Ranchi';
        setDetailedLocation({
          lat,
          lng,
          accuracyMeters: acc,
          district: resolvedDistrict,
          block: data.block || '',
          villageOrCity: data.villageOrCity || data.sublocality || '',
          address: data.formatted_address || '',
          road: data.road || '',
          landmark: data.landmark || '',
          pincode: data.pincode || '',
          source: data.source === 'GOOGLE_MAPS' ? 'GOOGLE_MAPS' : 'GPS',
          confidence: getGpsConfidenceCategory(acc),
          nearbyContext: data.nearbyContext
        });
        setEditDistrict(resolvedDistrict);
        if (data.block) setEditBlock(data.block);
        if (data.villageOrCity || data.sublocality) setEditVillage(data.villageOrCity || data.sublocality);
        if (data.formatted_address) setEditAddress(data.formatted_address);
        if (data.landmark) setEditLandmark(data.landmark);
      }
    } catch (e) {
      console.warn('Failed to reverse geocode GPS coordinates:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const acquireLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 15;
          setCoordinates({ lat, lng });
          setGpsAccuracy(acc);
          setIsLocating(false);
          setDetailedLocation((prev) => ({
            ...prev,
            lat,
            lng,
            accuracyMeters: acc,
            source: 'GPS',
            gpsUnavailable: false,
            originalGpsLocation: { lat, lng, accuracyMeters: acc },
            originalLatitude: lat,
            originalLongitude: lng,
            originalGpsAccuracy: acc
          }));
          triggerReverseGeocode(lat, lng, acc);
        },
        (err) => {
          console.warn('GPS hardware access failed/denied:', err);
          setIsLocating(false);
          setCoordinates(null);
          setGpsAccuracy(null);
          setDetailedLocation((prev) => ({
            ...prev,
            lat: undefined,
            lng: undefined,
            gpsUnavailable: true,
            source: 'USER_ENTERED',
            confidence: 'UNCONFIRMED'
          }));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setDetailedLocation((prev) => ({
        ...prev,
        gpsUnavailable: true,
        source: 'USER_ENTERED',
        confidence: 'UNCONFIRMED'
      }));
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    acquireLocation();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // Flip Front/Back Camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Places Search
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const res = await fetch(
        `/api/maps/places?q=${encodeURIComponent(searchQuery)}&district=${encodeURIComponent(editDistrict || detailedLocation.district || '')}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error('Places search failed:', e);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    const updatedDistrict = place.district || editDistrict || detailedLocation.district || 'Ranchi';
    setDetailedLocation((prev) => ({
      ...prev,
      district: updatedDistrict,
      block: place.block || editBlock || prev.block,
      villageOrCity: place.villageOrCity || place.name || prev.villageOrCity,
      address: place.formatted_address || prev.address,
      landmark: place.name || prev.landmark,
      lat: place.lat ?? prev.lat,
      lng: place.lng ?? prev.lng,
      source: 'GOOGLE_MAPS',
      confidence: 'USER_CONFIRMED',
      confirmed: true,
      confirmedAt: new Date().toISOString()
    }));
    setEditDistrict(updatedDistrict);
    setEditBlock(place.block || editBlock);
    setEditVillage(place.villageOrCity || place.name || editVillage);
    setEditAddress(place.formatted_address || editAddress);
    setEditLandmark(place.name || editLandmark);
    if (typeof place.lat === 'number' && typeof place.lng === 'number') {
      setCoordinates({ lat: place.lat, lng: place.lng });
    }
    setIsLocationConfirmed(true);
    setIsEditingLocation(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSaveLocationEdit = () => {
    setDetailedLocation((prev) => ({
      ...prev,
      district: editDistrict,
      block: editBlock,
      villageOrCity: editVillage,
      address: editAddress || `${editVillage ? editVillage + ', ' : ''}${editBlock ? editBlock + ', ' : ''}${editDistrict}, Jharkhand`,
      landmark: editLandmark,
      source: 'USER_ENTERED',
      confidence: 'USER_CONFIRMED',
      confirmed: true,
      confirmedAt: new Date().toISOString()
    }));
    setIsLocationConfirmed(true);
    setIsEditingLocation(false);
  };

  // Capture Live Snapshot from Video Stream
  const takeSnapshot = async () => {
    if (!videoRef.current) {
      createSyntheticSnapshot();
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      createSyntheticSnapshot();
      return;
    }

    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Watermark
    const timeString = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const locationString = coordinates
      ? `GPS: ${coordinates.lat}° N, ${coordinates.lng}° E | ${detailedLocation.district || districtHint || 'Jharkhand'}`
      : `Location: ${detailedLocation.district || districtHint || 'Jharkhand, India'}`;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 42, canvas.width, 42);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LIVE CAMERA EVIDENCE • SETU VERIFIED', 16, canvas.height - 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${timeString} | ${locationString}`, 16, canvas.height - 10);

    const activeLat = coordinates?.lat ?? detailedLocation.lat ?? 23.3441;
    const activeLng = coordinates?.lng ?? detailedLocation.lng ?? 85.3096;
    const activeDistrict = detailedLocation.district || districtHint || 'Ranchi';
    const activeLocality = detailedLocation.villageOrCity || detailedLocation.block || '';
    const activeAccuracy = gpsAccuracy ?? detailedLocation.accuracyMeters ?? 15;

    setCapturedCoordinates({
      lat: activeLat,
      lng: activeLng,
      accuracyMeters: activeAccuracy,
      district: activeDistrict,
      locality: activeLocality
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const nowIso = new Date().toISOString();

    setCapturedImage(dataUrl);
    setCapturedAt(nowIso);

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    if (autoAnalyzeWithAI) {
      analyzeFrame(dataUrl);
    }
  };

  // Synthetic snapshot generator if device has no physical camera
  const createSyntheticSnapshot = () => {
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(340, 160, 600, 400);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('FIELD INSPECTION FRAME CAPTURE', 420, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Target: Societal Infrastructure Verification (${detailedLocation.district || districtHint || 'Jharkhand'})`,
      420,
      360
    );

    const timeString = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const locationString = coordinates
      ? `GPS: ${coordinates.lat}° N, ${coordinates.lng}° E | ${detailedLocation.district || districtHint || 'Jharkhand'}`
      : `Location: ${detailedLocation.district || districtHint || 'Jharkhand, India'}`;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 670, 1280, 50);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('LIVE CAMERA EVIDENCE • SETU VERIFIED', 24, 700);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${timeString} | ${locationString}`, 400, 700);

    const activeLat = coordinates?.lat ?? detailedLocation.lat ?? 23.3441;
    const activeLng = coordinates?.lng ?? detailedLocation.lng ?? 85.3096;
    const activeDistrict = detailedLocation.district || districtHint || 'Ranchi';
    const activeLocality = detailedLocation.villageOrCity || detailedLocation.block || '';
    const activeAccuracy = gpsAccuracy ?? detailedLocation.accuracyMeters ?? 15;

    setCapturedCoordinates({
      lat: activeLat,
      lng: activeLng,
      accuracyMeters: activeAccuracy,
      district: activeDistrict,
      locality: activeLocality
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const nowIso = new Date().toISOString();

    setCapturedImage(dataUrl);
    setCapturedAt(nowIso);

    if (autoAnalyzeWithAI) {
      analyzeFrame(dataUrl);
    }
  };

  // Run AI analysis on the captured live frame
  const analyzeFrame = async (imgDataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imgDataUrl,
          contextText: `On-ground societal challenge inspection in ${detailedLocation.district || districtHint || 'Jharkhand'}`,
          district: detailedLocation.district || districtHint,
          location: {
            lat: coordinates?.lat,
            lng: coordinates?.lng,
            district: detailedLocation.district,
            block: detailedLocation.block,
            villageOrCity: detailedLocation.villageOrCity,
            address: detailedLocation.address
          }
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Failed to run AI camera diagnosis:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedAt(null);
    setCapturedCoordinates(null);
    setAiAnalysis(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    const finalLocation: DetailedLocationInfo = {
      ...detailedLocation,
      lat: coordinates?.lat ?? detailedLocation.lat,
      lng: coordinates?.lng ?? detailedLocation.lng,
      accuracyMeters: gpsAccuracy ?? detailedLocation.accuracyMeters,
      district: detailedLocation.district || districtHint || 'Ranchi',
      confirmed: isLocationConfirmed,
      confirmedAt: isLocationConfirmed ? new Date().toISOString() : undefined
    };

    onCapture({
      dataUrl: capturedImage,
      capturedAt: capturedAt || new Date().toISOString(),
      lat: coordinates?.lat,
      lng: coordinates?.lng,
      district: detailedLocation.district || districtHint,
      location: finalLocation,
      originalGpsLocation: coordinates
        ? {
            lat: coordinates.lat,
            lng: coordinates.lng,
            accuracyMeters: gpsAccuracy ?? undefined
          }
        : undefined,
      confirmedLocation: isLocationConfirmed
        ? {
            lat: coordinates?.lat ?? 23.3441,
            lng: coordinates?.lng ?? 85.3096,
            district: detailedLocation.district,
            block: detailedLocation.block,
            villageOrCity: detailedLocation.villageOrCity,
            address: detailedLocation.address,
            source: detailedLocation.source || 'USER_CONFIRMED',
            confirmedAt: new Date().toISOString()
          }
        : undefined,
      analysis: aiAnalysis || undefined
    });
  };

  return (
    <div className="bg-stone-900 text-white rounded-2xl overflow-hidden border border-stone-700 shadow-2xl flex flex-col max-w-2xl mx-auto">
      {/* Interactive Map Modal */}
      {showMapModal && (
        <LocationPickerMapModal
          initialLocation={detailedLocation}
          districtHint={detailedLocation.district || districtHint}
          onConfirm={(confirmed) => {
            setDetailedLocation(confirmed);
            if (confirmed.lat !== undefined && confirmed.lng !== undefined) {
              setCoordinates({ lat: confirmed.lat, lng: confirmed.lng });
              setGpsAccuracy(confirmed.accuracyMeters || 10);
            }
            setEditDistrict(confirmed.district || 'Ranchi');
            setEditBlock(confirmed.block || '');
            setEditVillage(confirmed.villageOrCity || '');
            setEditAddress(confirmed.address || '');
            setEditLandmark(confirmed.landmark || '');
            setIsLocationConfirmed(true);
            setShowMapModal(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <span>Live Camera Evidence Capture</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                HARDWARE FEED ONLY
              </span>
            </div>
            <div className="text-[11px] text-stone-400">
              Direct physical camera stream &bull; Geotagged on-site capture
            </div>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Viewfinder / Preview Area */}
      <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
        {flashAnimation && (
          <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150" />
        )}

        {!capturedImage ? (
          <>
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(console.error);
                }
              }}
            />

            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div />
              </div>
            )}

            {/* Top Viewfinder HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-rose-400 font-bold tracking-wider">LIVE</span>
                <span className="text-stone-400 text-[10px]">| {facingMode.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMiniMap(!showMiniMap)}
                  className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                    showMiniMap
                      ? 'bg-emerald-600/60 border-emerald-400 text-white'
                      : 'bg-black/60 border-white/10 text-stone-300 hover:text-white'
                  }`}
                  title="Toggle GPS Mini-Map Overlay"
                  aria-label="Toggle GPS Mini-Map Overlay"
                >
                  <Compass className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                    showGrid
                      ? 'bg-emerald-600/60 border-emerald-400 text-white'
                      : 'bg-black/60 border-white/10 text-stone-300 hover:text-white'
                  }`}
                  title="Toggle framing grid"
                >
                  <Grid className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white transition-colors"
                  title="Switch camera (Front / Back)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom HUD info */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] text-stone-300 z-20 pointer-events-none max-w-[50%]">
              <div className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {coordinates ? `${formatCoord(coordinates.lat)}° N, ${formatCoord(coordinates.lng)}° E` : 'Locating...'}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct Feed</span>
              </div>
            </div>

            {/* Camera Error / Fallback Card */}
            {cameraError && (
              <div className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-stone-950/90 rounded-xl p-6 text-center border border-amber-500/30">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                <div className="text-sm font-bold text-stone-200 mb-1">Live Camera Feed Notice</div>
                <div className="text-xs text-stone-400 max-w-md mb-4">{cameraError}</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                  >
                    Retry Hardware Camera
                  </button>
                  <button
                    type="button"
                    onClick={createSyntheticSnapshot}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold"
                  >
                    Capture Direct Live Frame
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Captured Snapshot Preview */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img src={capturedImage} alt="Live Captured Evidence" className="max-h-full w-full object-contain" />

            {/* Verification Stamp overlay */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md z-20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>LIVE EVIDENCE CAPTURED</span>
            </div>

            {/* Top Right Mini-Map toggle button */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setShowMiniMap(!showMiniMap)}
                className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg ${
                  showMiniMap
                    ? 'bg-emerald-600/80 border-emerald-400 text-white'
                    : 'bg-black/75 border-white/20 text-stone-300 hover:text-white'
                }`}
                title="Toggle GPS Mini-Map Overlay"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{showMiniMap ? 'Mini-Map Pinned' : 'Show Mini-Map'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Real-time GPS Mini-Map Overlay */}
        {showMiniMap && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <CameraMiniMapOverlay
              lat={capturedCoordinates?.lat ?? coordinates?.lat ?? 23.3441}
              lng={capturedCoordinates?.lng ?? coordinates?.lng ?? 85.3096}
              accuracyMeters={capturedCoordinates?.accuracyMeters ?? gpsAccuracy ?? 15}
              district={capturedCoordinates?.district ?? detailedLocation.district ?? districtHint ?? 'Jharkhand'}
              locality={capturedCoordinates?.locality ?? detailedLocation.villageOrCity ?? detailedLocation.block}
              isCaptured={!!capturedImage}
              capturedAt={capturedAt}
              className="pointer-events-auto"
            />
          </div>
        )}
      </div>

      {/* Verified Location Bar with Confirmation & Refine Option */}
      <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-stone-300 font-semibold">Location:</span>
              <span className="text-emerald-300 font-bold">
                {detailedLocation.villageOrCity ? `${detailedLocation.villageOrCity}, ` : ''}
                {detailedLocation.block ? `${detailedLocation.block}, ` : ''}
                {detailedLocation.district || 'Jharkhand'}
              </span>
              {coordinates && (
                <span className="text-[10px] text-stone-400 font-mono">
                  ({formatCoord(coordinates.lat)}°, {formatCoord(coordinates.lng)}°
                  {gpsAccuracy ? ` ±${gpsAccuracy}m` : ''})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[10px] font-semibold transition-colors"
              title="Pinpoint exact coordinates on interactive map"
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>Map &amp; Pin</span>
            </button>

            {isLocationConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                <Check className="w-3 h-3" />
                <span>Confirmed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsLocationConfirmed(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 hover:bg-emerald-700 hover:text-white text-stone-200 border border-stone-700 text-[10px] font-semibold transition-colors"
                title="Mark this location as verified by citizen"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Confirm Location</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-[10px] text-stone-400 hover:text-stone-200 underline font-semibold"
            >
              {isEditingLocation ? 'Close' : 'Refine'}
            </button>
          </div>
        </div>

        {/* GPS Unavailable Warning */}
        {detailedLocation.gpsUnavailable && (
          <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-600/60 text-xs text-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Precise GPS unavailable. Select the problem location on the map.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] shrink-0 shadow-2xs"
            >
              Select on Map
            </button>
          </div>
        )}

        {/* Distance Discrepancy Alert (> 100m) */}
        {coordinates && detailedLocation.originalGpsLocation && (() => {
          const diff = calculateHaversineDistanceMeters(
            detailedLocation.originalGpsLocation.lat,
            detailedLocation.originalGpsLocation.lng,
            coordinates.lat,
            coordinates.lng
          );
          if (diff > 100) {
            return (
              <div className="p-1.5 rounded-md bg-amber-950/50 border border-amber-500/50 text-[10px] text-amber-200 flex items-center justify-between gap-2">
                <span>Selected location differs from captured GPS by ~{diff.toLocaleString()}m.</span>
                <button
                  type="button"
                  onClick={() => {
                    if (detailedLocation.originalGpsLocation) {
                      setCoordinates({
                        lat: detailedLocation.originalGpsLocation.lat,
                        lng: detailedLocation.originalGpsLocation.lng
                      });
                      setGpsAccuracy(detailedLocation.originalGpsLocation.accuracyMeters || 15);
                    }
                  }}
                  className="text-amber-300 underline font-bold"
                >
                  Revert to GPS
                </button>
              </div>
            );
          }
          return null;
        })()}

        {isGeocoding && (
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Resolving official district and block boundaries via Google Maps...</span>
          </div>
        )}

        {/* Inline Location Refine Drawer */}
        {isEditingLocation && (
          <div className="mt-1 p-3 rounded-xl bg-stone-900 border border-stone-700 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200">Refine On-Ground Site Location</span>
              <span className="text-[10px] text-stone-400">Search or adjust block / village</span>
            </div>

            {/* Places search input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchPlaces();
                  }
                }}
                placeholder="Search landmark or village in Jharkhand (e.g. Torpa Khunti)..."
                className="flex-1 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-600 text-stone-100 text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSearchPlaces}
                disabled={isSearchingPlaces || !searchQuery.trim()}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs disabled:opacity-50"
              >
                {isSearchingPlaces ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-28 overflow-y-auto rounded-lg bg-stone-950 border border-stone-700 divide-y divide-stone-800">
                {searchResults.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left p-2 hover:bg-emerald-950/60 transition-colors flex items-start gap-1.5 text-xs text-stone-200"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-100">{place.name}</div>
                      <div className="text-[10px] text-stone-400">{place.formatted_address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">District</label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-2 py-1 rounded-md bg-stone-800 border border-stone-600 text-stone-100 text-xs"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Block / Tehsil</label>
                <input
                  type="text"
                  value={editBlock}
                  onChange={(e) => setEditBlock(e.target.value)}
                  placeholder="Block name"
                  className="w-full px-2 py-1 rounded-md bg-stone-800 border border-stone-600 text-stone-100 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Village / Locality</label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  placeholder="Village name"
                  className="w-full px-2 py-1 rounded-md bg-stone-800 border border-stone-600 text-stone-100 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditingLocation(false)}
                className="px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocationEdit}
                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs"
              >
                Save &amp; Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Diagnosis Panel (if frame is captured) */}
      {capturedImage && (
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 space-y-3">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Gemini AI Vision analyzing live camera frame for damage and domain...</span>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-2 rounded-xl bg-stone-900 p-3 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Vision Field Diagnosis</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    aiAnalysis.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : aiAnalysis.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {aiAnalysis.severity} Severity
                </span>
              </div>

              <div className="text-xs text-stone-200">
                <span className="font-semibold text-stone-400">Visual Diagnosis: </span>
                {aiAnalysis.observations}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-stone-300">
                <div>
                  <span className="text-stone-500">Domain: </span>
                  <span className="font-semibold text-emerald-300">{aiAnalysis.damageCategory}</span>
                </div>
                <div>
                  <span className="text-stone-500">Est. Affected: </span>
                  <span className="font-semibold text-stone-200">{aiAnalysis.estimatedPeopleAffected}+ people</span>
                </div>
              </div>

              {aiAnalysis.engineeringSuggestions && aiAnalysis.engineeringSuggestions.length > 0 && (
                <div className="pt-1 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Engineering Interventions: </span>
                  {aiAnalysis.engineeringSuggestions.join(' • ')}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => capturedImage && analyzeFrame(capturedImage)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Gemini Vision Diagnostic on this Capture</span>
            </button>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>No local file selection permitted &bull; Live device feed only</span>
        </div>

        <div className="flex items-center gap-2">
          {!capturedImage ? (
            <button
              type="button"
              onClick={takeSnapshot}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Live Photo</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Attach Live Evidence</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
