/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Layers,
  X,
  RotateCcw,
  Sparkles,
  Building,
  Compass,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import { DetailedLocationInfo, JHARKHAND_DISTRICTS } from '../types.js';
import { Map, AdvancedMarker, useApiIsLoaded } from '@vis.gl/react-google-maps';
import {
  calculateHaversineDistanceMeters,
  formatCoord,
  getGpsConfidenceCategory,
  findNearestJharkhandDistrict
} from '../utils/geoUtils.js';

export interface LocationPickerMapModalProps {
  initialLocation: DetailedLocationInfo;
  onConfirm: (confirmedLocation: DetailedLocationInfo) => void;
  onClose: () => void;
  title?: string;
  districtHint?: string;
}

type MapLayer = 'voyager' | 'dark' | 'osm';

export const LocationPickerMapModal: React.FC<LocationPickerMapModalProps> = ({
  initialLocation,
  onConfirm,
  onClose,
  title = 'Select & Confirm Problem Location',
  districtHint
}) => {
  // Original GPS captured on camera/device - NEVER OVERWRITTEN
  const originalGps = useMemo(() => {
    if (initialLocation.originalGpsLocation) {
      return initialLocation.originalGpsLocation;
    }
    if (initialLocation.lat !== undefined && initialLocation.lng !== undefined && initialLocation.source === 'GPS') {
      return {
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        accuracyMeters: initialLocation.accuracyMeters
      };
    }
    return null;
  }, [initialLocation]);

  // Selected Pin Coordinates
  const [pinLat, setPinLat] = useState<number | null>(initialLocation.lat ?? null);
  const [pinLng, setPinLng] = useState<number | null>(initialLocation.lng ?? null);
  const [pinAccuracy, setPinAccuracy] = useState<number | null>(initialLocation.accuracyMeters ?? null);

  // Address and administrative hierarchy
  const [district, setDistrict] = useState<string>(initialLocation.district || districtHint || '');
  const [block, setBlock] = useState<string>(initialLocation.block || '');
  const [villageOrCity, setVillageOrCity] = useState<string>(initialLocation.villageOrCity || '');
  const [address, setAddress] = useState<string>(initialLocation.address || '');
  const [landmark, setLandmark] = useState<string>(initialLocation.landmark || '');
  const [pincode, setPincode] = useState<string>(initialLocation.pincode || '');
  const [road, setRoad] = useState<string>(initialLocation.road || '');

  // GPS acquiring state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsUnavailable, setGpsUnavailable] = useState<boolean>(!initialLocation.lat && !initialLocation.lng);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Places Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);

  // Map viewport state (zoom and center)
  const isMapsApiLoaded = useApiIsLoaded();
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [zoom, setZoom] = useState<number>(pinLat && pinLng ? 15 : 12);
  const [layer, setLayer] = useState<MapLayer>('voyager');
  const [viewCenter, setViewCenter] = useState<{ lat: number; lng: number }>({
    lat: pinLat || 23.3441,
    lng: pinLng || 85.3096
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Haversine discrepancy calculation (> 100m)
  const distanceDiffMeters = useMemo(() => {
    if (originalGps?.lat !== undefined && originalGps?.lng !== undefined && pinLat !== null && pinLng !== null) {
      return calculateHaversineDistanceMeters(originalGps.lat, originalGps.lng, pinLat, pinLng);
    }
    return 0;
  }, [originalGps, pinLat, pinLng]);

  const hasSignificantDiscrepancy = distanceDiffMeters > 100;
  const [acknowledgedDiscrepancy, setAcknowledgedDiscrepancy] = useState<boolean>(false);

  // Geocode when a new point is selected
  const handleReverseGeocode = async (lat: number, lng: number, acc?: number | null) => {
    setIsGeocoding(true);
    try {
      const res = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      const data = await res.json();
      if (data.success) {
        if (data.district) setDistrict(data.district);
        if (data.block) setBlock(data.block);
        if (data.villageOrCity || data.sublocality) setVillageOrCity(data.villageOrCity || data.sublocality);
        if (data.formatted_address) setAddress(data.formatted_address);
        if (data.landmark) setLandmark(data.landmark);
        if (data.pincode) setPincode(data.pincode);
        if (data.road) setRoad(data.road);
      } else {
        // Fallback to nearest district centroid
        const nearest = findNearestJharkhandDistrict(lat, lng);
        setDistrict(nearest.district);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      const nearest = findNearestJharkhandDistrict(lat, lng);
      setDistrict(nearest.district);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Click on map to place or reposition pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const n = Math.pow(2, zoom);
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    const centerLatRad = (viewCenter.lat * Math.PI) / 180;
    const centerWorldX = ((viewCenter.lng + 180) / 360) * n * 256;
    const centerWorldY = ((1 - Math.asinh(Math.tan(centerLatRad)) / Math.PI) / 2) * n * 256;

    const targetWorldX = centerWorldX + (clickX - mapWidth / 2);
    const targetWorldY = centerWorldY + (clickY - mapHeight / 2);

    const targetLng = (targetWorldX / (256 * n)) * 360 - 180;
    const yNorm = 1 - (2 * targetWorldY) / (256 * n);
    const targetLat = (Math.atan(Math.sinh(yNorm * Math.PI)) * 180) / Math.PI;

    const clampedLat = Math.max(-85, Math.min(85, Number(targetLat.toFixed(6))));
    const clampedLng = Math.max(-180, Math.min(180, Number(targetLng.toFixed(6))));

    setPinLat(clampedLat);
    setPinLng(clampedLng);
    setPinAccuracy(10);
    setGpsUnavailable(false);
    setAcknowledgedDiscrepancy(false);

    handleReverseGeocode(clampedLat, clampedLng, 10);
  };

  // "Use Current GPS" action
  const handleAcquireCurrentGps = () => {
    setIsLocating(true);
    setGpsUnavailable(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 12;

          setPinLat(lat);
          setPinLng(lng);
          setPinAccuracy(acc);
          setViewCenter({ lat, lng });
          setZoom(16);
          setIsLocating(false);
          setAcknowledgedDiscrepancy(false);

          handleReverseGeocode(lat, lng, acc);
        },
        (err) => {
          console.warn('GPS location request failed or denied:', err);
          setIsLocating(false);
          setGpsUnavailable(true);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setGpsUnavailable(true);
    }
  };

  // Search Places / Villages / Landmarks
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const res = await fetch(
        `/api/maps/places?q=${encodeURIComponent(searchQuery)}&district=${encodeURIComponent(district || '')}`
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
    const lat = place.lat !== undefined ? Number(place.lat) : viewCenter.lat;
    const lng = place.lng !== undefined ? Number(place.lng) : viewCenter.lng;

    setPinLat(lat);
    setPinLng(lng);
    setPinAccuracy(20);
    setViewCenter({ lat, lng });
    setZoom(16);
    setGpsUnavailable(false);
    setAcknowledgedDiscrepancy(false);

    if (place.district) setDistrict(place.district);
    if (place.block) setBlock(place.block);
    if (place.villageOrCity || place.name) setVillageOrCity(place.villageOrCity || place.name);
    if (place.formatted_address) setAddress(place.formatted_address);
    if (place.name) setLandmark(place.name);

    setSearchResults([]);
    setSearchQuery('');
  };

  // Revert back to captured GPS
  const handleRevertToCapturedGps = () => {
    if (originalGps?.lat !== undefined && originalGps?.lng !== undefined) {
      setPinLat(originalGps.lat);
      setPinLng(originalGps.lng);
      setPinAccuracy(originalGps.accuracyMeters || 15);
      setViewCenter({ lat: originalGps.lat, lng: originalGps.lng });
      setZoom(16);
      setAcknowledgedDiscrepancy(false);
      handleReverseGeocode(originalGps.lat, originalGps.lng, originalGps.accuracyMeters);
    }
  };

  // Save and confirm
  const handleConfirmLocation = () => {
    if (pinLat === null || pinLng === null) {
      alert('Please select or search for the problem location on the map before confirming.');
      return;
    }

    const now = new Date().toISOString();
    const confirmedInfo: DetailedLocationInfo = {
      ...initialLocation,
      lat: pinLat,
      lng: pinLng,
      latitude: pinLat,
      longitude: pinLng,
      accuracyMeters: pinAccuracy || 15,
      gpsAccuracy: pinAccuracy || 15,
      originalLatitude: originalGps?.lat,
      originalLongitude: originalGps?.lng,
      originalGpsAccuracy: originalGps?.accuracyMeters,
      originalGpsLocation: originalGps || undefined,
      confirmedLocation: {
        lat: pinLat,
        lng: pinLng,
        district: district || 'Ranchi',
        block: block || undefined,
        villageOrCity: villageOrCity || undefined,
        address: address || `${villageOrCity ? villageOrCity + ', ' : ''}${block ? block + ', ' : ''}${district}, Jharkhand`,
        landmark: landmark || undefined,
        pincode: pincode || undefined,
        source: 'USER_CONFIRMED',
        confirmedAt: now
      },
      district: district || 'Ranchi',
      block: block || undefined,
      villageOrCity: villageOrCity || undefined,
      address: address || `${villageOrCity ? villageOrCity + ', ' : ''}${block ? block + ', ' : ''}${district}, Jharkhand`,
      landmark: landmark || undefined,
      pincode: pincode || undefined,
      road: road || undefined,
      source: 'GOOGLE_MAPS',
      locationSource: 'GOOGLE_MAPS',
      confidence: 'USER_CONFIRMED',
      locationConfidence: 'USER_CONFIRMED',
      confirmed: true,
      locationConfirmed: true,
      confirmedAt: now,
      locationConfirmedAt: now,
      diffFromGpsMeters: distanceDiffMeters,
      gpsUnavailable
    };

    onConfirm(confirmedInfo);
    onClose();
  };

  // Render Slippy tiles for viewport
  const tiles = useMemo(() => {
    const validLat = Math.max(-85, Math.min(85, viewCenter.lat));
    const validLng = Math.max(-180, Math.min(180, viewCenter.lng));

    const n = Math.pow(2, zoom);
    const x = ((validLng + 180) / 360) * n;
    const latRad = (validLat * Math.PI) / 180;
    const y = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    const getTileUrl = (tx: number, ty: number, z: number, l: MapLayer) => {
      if (l === 'dark') {
        return `https://a.basemaps.cartocdn.com/dark_all/${z}/${tx}/${ty}.png`;
      }
      if (l === 'osm') {
        return `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
      }
      return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${tx}/${ty}.png`;
    };

    const tileList: Array<{
      key: string;
      tx: number;
      ty: number;
      leftPercent: number;
      topPercent: number;
      url: string;
    }> = [];

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const tx = tileX + dx;
        const ty = tileY + dy;
        if (tx >= 0 && tx < n && ty >= 0 && ty < n) {
          tileList.push({
            key: `${zoom}-${tx}-${ty}-${layer}`,
            tx,
            ty,
            leftPercent: (dx - (x - tileX)) * 256,
            topPercent: (dy - (y - tileY)) * 256,
            url: getTileUrl(tx, ty, zoom, layer)
          });
        }
      }
    }

    return tileList;
  }, [viewCenter, zoom, layer]);

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  Phase 1 Intelligence
                </span>
              </h2>
              <div className="text-[11px] text-stone-500">
                Location Priority: 1. User-Confirmed &bull; 2. High-Accuracy GPS &bull; 3. Google Maps Selected &bull; 4. AI Suggested
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Unavailable Warning Banner */}
        {gpsUnavailable && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Precise GPS unavailable. Select the problem location on the map.</span>
            </div>
            <button
              type="button"
              onClick={handleAcquireCurrentGps}
              className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] shrink-0 flex items-center gap-1 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry GPS</span>
            </button>
          </div>
        )}

        {/* Significant Discrepancy (>100m) Banner */}
        {hasSignificantDiscrepancy && (
          <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-300 text-amber-950 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Distance discrepancy alert:</strong> Selected location differs from captured GPS by approximately{' '}
                <strong>{distanceDiffMeters.toLocaleString()} meters</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRevertToCapturedGps}
                className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-semibold"
              >
                Revert to Captured GPS
              </button>
              <button
                type="button"
                onClick={() => setAcknowledgedDiscrepancy(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  acknowledgedDiscrepancy
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {acknowledgedDiscrepancy ? 'Discrepancy Acknowledged ✓' : 'Confirm Selected Location'}
              </button>
            </div>
          </div>
        )}

        {/* Search & Map Toolbar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Places Search */}
          <div className="flex-1 min-w-[260px] relative">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
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
                  placeholder="Search village, panchayat, block, road, or landmark..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs text-stone-900 focus:outline-emerald-600"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPlaces}
                disabled={isSearchingPlaces || !searchQuery.trim()}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs disabled:opacity-50 shrink-0"
              >
                {isSearchingPlaces ? 'Searching...' : 'Search Place'}
              </button>
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-stone-300 bg-white shadow-xl divide-y divide-stone-100">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPlace(res)}
                    className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs flex items-start gap-2 transition-colors"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">{res.name}</div>
                      <div className="text-[10px] text-stone-500">{res.formatted_address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions: Use Current GPS & Layers */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAcquireCurrentGps}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-2xs transition-colors disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Use Current GPS'}</span>
            </button>

            {/* Map Type Switcher / Layers */}
            {isMapsApiLoaded ? (
              <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setGoogleMapType('roadmap')}
                  className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                    googleMapType === 'roadmap'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Map
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleMapType('hybrid')}
                  className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                    googleMapType === 'hybrid'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleMapType('terrain')}
                  className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                    googleMapType === 'terrain'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Terrain
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLayer((prev) => (prev === 'voyager' ? 'dark' : prev === 'dark' ? 'osm' : 'voyager'));
                }}
                className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 text-xs"
                title="Toggle Map Tile Layer"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Map Viewport Area */}
        {isMapsApiLoaded ? (
          <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] w-full bg-stone-200 overflow-hidden select-none">
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={{ lat: pinLat || 23.3441, lng: pinLng || 85.3096 }}
              center={{ lat: viewCenter.lat, lng: viewCenter.lng }}
              zoom={zoom}
              onCameraChanged={(ev) => {
                if (ev.detail.center) {
                  setViewCenter(ev.detail.center);
                }
                if (typeof ev.detail.zoom === 'number') {
                  setZoom(ev.detail.zoom);
                }
              }}
              onClick={(ev) => {
                if (ev.detail.latLng) {
                  const newLat = Number(ev.detail.latLng.lat.toFixed(6));
                  const newLng = Number(ev.detail.latLng.lng.toFixed(6));
                  setPinLat(newLat);
                  setPinLng(newLng);
                  setViewCenter({ lat: newLat, lng: newLng });
                  handleReverseGeocode(newLat, newLng, null);
                }
              }}
              mapId="DEMO_MAP_ID"
              mapTypeId={googleMapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              {/* Selected Problem Pin (Draggable) */}
              {pinLat !== null && pinLng !== null && (
                <AdvancedMarker
                  position={{ lat: pinLat, lng: pinLng }}
                  draggable={true}
                  onDragEnd={(ev) => {
                    if (ev.latLng) {
                      const newLat = Number(ev.latLng.lat().toFixed(6));
                      const newLng = Number(ev.latLng.lng().toFixed(6));
                      setPinLat(newLat);
                      setPinLng(newLng);
                      setViewCenter({ lat: newLat, lng: newLng });
                      handleReverseGeocode(newLat, newLng, null);
                    }
                  }}
                  title="Selected Problem Location (Click or drag to position)"
                >
                  <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
                    <div className="bg-rose-600 text-white p-2 rounded-full shadow-xl border-2 border-white ring-2 ring-rose-500/50 transform group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 fill-rose-600 text-white" />
                    </div>
                    <div className="text-[10px] font-bold bg-stone-900/90 text-white px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-white/20">
                      Problem Site (Drag to adjust)
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Original Device GPS Pin */}
              {originalGps?.lat !== undefined &&
                originalGps?.lng !== undefined &&
                hasSignificantDiscrepancy && (
                  <AdvancedMarker
                    position={{ lat: originalGps.lat, lng: originalGps.lng }}
                    title="Original Camera Captured GPS"
                  >
                    <div className="relative flex flex-col items-center opacity-85">
                      <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                        <Compass className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-[9px] font-semibold bg-blue-900/90 text-white px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap border border-white/20">
                        Camera GPS ({Math.round(distanceDiffMeters)}m away)
                      </div>
                    </div>
                  </AdvancedMarker>
                )}
            </Map>

            {/* Google Maps Attribution & Live Indicator Banner */}
            <div className="absolute left-3 bottom-3 z-10 pointer-events-none bg-stone-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">Google Maps Platform Active</span>
              <span className="text-stone-400">&bull; Click anywhere on map to reposition pin</span>
            </div>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className="relative flex-1 min-h-[300px] bg-stone-200 overflow-hidden cursor-crosshair select-none"
          >
            {/* Tiles Layer */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                {tiles.map((t) => (
                  <img
                    key={t.key}
                    src={t.url}
                    alt="map tile"
                    referrerPolicy="no-referrer"
                    className="absolute w-[256px] h-[256px] object-cover"
                    style={{
                      left: `calc(50% + ${t.leftPercent}px)`,
                      top: `calc(50% + ${t.topPercent}px)`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pin Marker (Center/Selected) */}
            {pinLat !== null && pinLng !== null && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center animate-bounce duration-300"
                style={{
                  // Calculate position relative to center
                  transform: (() => {
                    const n = Math.pow(2, zoom);
                    const centerLatRad = (viewCenter.lat * Math.PI) / 180;
                    const centerWorldX = ((viewCenter.lng + 180) / 360) * n * 256;
                    const centerWorldY = ((1 - Math.asinh(Math.tan(centerLatRad)) / Math.PI) / 2) * n * 256;

                    const pinLatRad = (pinLat * Math.PI) / 180;
                    const pinWorldX = ((pinLng + 180) / 360) * n * 256;
                    const pinWorldY = ((1 - Math.asinh(Math.tan(pinLatRad)) / Math.PI) / 2) * n * 256;

                    const dx = pinWorldX - centerWorldX;
                    const dy = pinWorldY - centerWorldY;

                    return `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px))`;
                  })()
                }}
              >
                <div className="bg-rose-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5 fill-rose-600 text-white" />
                </div>
                <div className="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] -mt-0.5"></div>
              </div>
            )}

            {/* Original Captured GPS Marker (if different from selected) */}
            {originalGps?.lat !== undefined &&
              originalGps?.lng !== undefined &&
              hasSignificantDiscrepancy && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 flex flex-col items-center opacity-85"
                  style={{
                    transform: (() => {
                      const n = Math.pow(2, zoom);
                      const centerLatRad = (viewCenter.lat * Math.PI) / 180;
                      const centerWorldX = ((viewCenter.lng + 180) / 360) * n * 256;
                      const centerWorldY = ((1 - Math.asinh(Math.tan(centerLatRad)) / Math.PI) / 2) * n * 256;

                      const origLatRad = (originalGps.lat * Math.PI) / 180;
                      const origWorldX = ((originalGps.lng + 180) / 360) * n * 256;
                      const origWorldY = ((1 - Math.asinh(Math.tan(origLatRad)) / Math.PI) / 2) * n * 256;

                      const dx = origWorldX - centerWorldX;
                      const dy = origWorldY - centerWorldY;

                      return `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px))`;
                    })()
                  }}
                >
                  <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border border-white flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>Captured Device GPS</span>
                  </div>
                  <div className="w-2 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
                </div>
              )}

            {/* Zoom In / Out Controls Overlay */}
            <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1 shadow-md rounded-lg overflow-hidden border border-stone-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((z) => Math.min(18, z + 1));
                }}
                className="p-2 bg-white hover:bg-stone-100 text-stone-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((z) => Math.max(10, z - 1));
                }}
                className="p-2 bg-white hover:bg-stone-100 text-stone-800 transition-colors border-t border-stone-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Click instruction floating badge */}
            <div className="absolute left-3 bottom-3 z-20 bg-stone-900/85 text-white px-2.5 py-1 rounded-lg text-[11px] backdrop-blur-xs flex items-center gap-1.5 shadow-md pointer-events-none">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span>Click or drag pin anywhere on map to select exact spot</span>
            </div>
          </div>
        )}

        {/* Bottom Details & Confirmation Form */}
        <div className="p-4 bg-white border-t border-stone-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-0.5">District (Jharkhand)</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 font-semibold text-stone-900"
              >
                <option value="">Select District</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-0.5">Block / Tehsil</label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g. Torpa Block"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-0.5">Village / Locality</label>
              <input
                type="text"
                value={villageOrCity}
                onChange={(e) => setVillageOrCity(e.target.value)}
                placeholder="e.g. Dorma Village"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-0.5">Full Resolved Address / Landmark</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Government Middle School, Dorma Gram Panchayat, Torpa, Khunti"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-0.5">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 835227"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* Readout of Coordinates and Priority Rule */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
            <div className="flex items-center gap-3">
              <span className="font-mono">
                Lat: <strong>{pinLat ? formatCoord(pinLat) : '—'}° N</strong>, Lng:{' '}
                <strong>{pinLng ? formatCoord(pinLng) : '—'}° E</strong>
              </span>
              {originalGps && (
                <span className="text-stone-400">
                  (Captured GPS: {formatCoord(originalGps.lat)}, {formatCoord(originalGps.lng)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Problem Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
