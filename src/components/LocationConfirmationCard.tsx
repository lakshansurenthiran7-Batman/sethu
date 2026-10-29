/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Search,
  Navigation,
  Compass,
  Building,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldCheck,
  Info
} from 'lucide-react';
import { DetailedLocationInfo, JHARKHAND_DISTRICTS } from '../types.js';
import { getGpsConfidenceCategory, formatCoord, calculateHaversineDistanceMeters } from '../utils/geoUtils.js';
import { LocationPickerMapModal } from './LocationPickerMapModal.js';

interface LocationConfirmationCardProps {
  location: DetailedLocationInfo;
  onConfirm: (confirmedLocation: DetailedLocationInfo) => void;
  onUpdate: (updatedLocation: DetailedLocationInfo) => void;
  onRetryGps?: () => void;
  isGeocoding?: boolean;
}

export const LocationConfirmationCard: React.FC<LocationConfirmationCardProps> = ({
  location,
  onConfirm,
  onUpdate,
  onRetryGps,
  isGeocoding = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const [editDistrict, setEditDistrict] = useState(location.district || 'Ranchi');
  const [editBlock, setEditBlock] = useState(location.block || '');
  const [editVillage, setEditVillage] = useState(location.villageOrCity || '');
  const [editAddress, setEditAddress] = useState(location.address || '');
  const [editRoad, setEditRoad] = useState(location.road || '');
  const [editLandmark, setEditLandmark] = useState(location.landmark || '');
  const [editPincode, setEditPincode] = useState(location.pincode || '');

  // Places search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Original captured GPS (evidence integrity)
  const originalGps = useMemo(() => {
    if (location.originalGpsLocation) return location.originalGpsLocation;
    if (location.originalLatitude !== undefined && location.originalLongitude !== undefined) {
      return {
        lat: location.originalLatitude,
        lng: location.originalLongitude,
        accuracyMeters: location.originalGpsAccuracy
      };
    }
    if (location.lat !== undefined && location.lng !== undefined && location.source === 'GPS') {
      return {
        lat: location.lat,
        lng: location.lng,
        accuracyMeters: location.accuracyMeters
      };
    }
    return null;
  }, [location]);

  // Haversine distance calculation (>100m)
  const distanceDiffMeters = useMemo(() => {
    if (originalGps?.lat !== undefined && originalGps?.lng !== undefined && location.lat !== undefined && location.lng !== undefined) {
      return calculateHaversineDistanceMeters(originalGps.lat, originalGps.lng, location.lat, location.lng);
    }
    return 0;
  }, [originalGps, location.lat, location.lng]);

  const hasSignificantDiscrepancy = distanceDiffMeters > 100;
  const isGpsUnavailable = location.gpsUnavailable || (!location.lat && !location.lng);

  const confidence = location.confidence || getGpsConfidenceCategory(location.accuracyMeters);

  const handleSaveEdit = () => {
    const now = new Date().toISOString();
    const updated: DetailedLocationInfo = {
      ...location,
      district: editDistrict,
      block: editBlock,
      villageOrCity: editVillage,
      address: editAddress || `${editVillage ? editVillage + ', ' : ''}${editBlock ? editBlock + ', ' : ''}${editDistrict}, Jharkhand`,
      road: editRoad,
      landmark: editLandmark,
      pincode: editPincode,
      source: 'USER_ENTERED',
      locationSource: 'USER_ENTERED',
      confidence: 'USER_CONFIRMED',
      locationConfidence: 'USER_CONFIRMED',
      confirmed: true,
      locationConfirmed: true,
      confirmedAt: now,
      locationConfirmedAt: now,
      originalGpsLocation: originalGps || undefined,
      confirmedLocation: {
        lat: location.lat || 23.3441,
        lng: location.lng || 85.3096,
        district: editDistrict,
        block: editBlock || undefined,
        villageOrCity: editVillage || undefined,
        address: editAddress || `${editVillage ? editVillage + ', ' : ''}${editBlock ? editBlock + ', ' : ''}${editDistrict}, Jharkhand`,
        landmark: editLandmark || undefined,
        pincode: editPincode || undefined,
        source: 'USER_CONFIRMED',
        confirmedAt: now
      }
    };
    onUpdate(updated);
    setIsEditing(false);
  };

  const handleSearchPlace = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/maps/places?q=${encodeURIComponent(searchQuery)}&district=${encodeURIComponent(editDistrict || location.district || '')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error('Places search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (place: any) => {
    const now = new Date().toISOString();
    const updated: DetailedLocationInfo = {
      ...location,
      district: place.district || editDistrict || location.district,
      block: place.block || editBlock || location.block,
      villageOrCity: place.villageOrCity || place.name || location.villageOrCity,
      address: place.formatted_address || location.address,
      landmark: place.name || location.landmark,
      lat: place.lat ?? location.lat,
      lng: place.lng ?? location.lng,
      latitude: place.lat ?? location.lat,
      longitude: place.lng ?? location.lng,
      source: 'GOOGLE_MAPS',
      locationSource: 'GOOGLE_MAPS',
      confidence: 'USER_CONFIRMED',
      locationConfidence: 'USER_CONFIRMED',
      confirmed: true,
      locationConfirmed: true,
      confirmedAt: now,
      locationConfirmedAt: now,
      originalGpsLocation: originalGps || undefined,
      confirmedLocation: {
        lat: place.lat ?? location.lat ?? 23.3441,
        lng: place.lng ?? location.lng ?? 85.3096,
        district: place.district || editDistrict || location.district,
        block: place.block || editBlock || location.block,
        villageOrCity: place.villageOrCity || place.name || location.villageOrCity,
        address: place.formatted_address || location.address,
        landmark: place.name || location.landmark,
        source: 'GOOGLE_MAPS',
        confirmedAt: now
      }
    };
    onUpdate(updated);
    setEditDistrict(updated.district || 'Ranchi');
    setEditBlock(updated.block || '');
    setEditVillage(updated.villageOrCity || '');
    setEditAddress(updated.address || '');
    setEditLandmark(updated.landmark || '');
    setSearchResults([]);
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleRevertToCapturedGps = () => {
    if (originalGps?.lat !== undefined && originalGps?.lng !== undefined) {
      const now = new Date().toISOString();
      const updated: DetailedLocationInfo = {
        ...location,
        lat: originalGps.lat,
        lng: originalGps.lng,
        latitude: originalGps.lat,
        longitude: originalGps.lng,
        accuracyMeters: originalGps.accuracyMeters,
        gpsAccuracy: originalGps.accuracyMeters,
        source: 'GPS',
        locationSource: 'GPS',
        confidence: getGpsConfidenceCategory(originalGps.accuracyMeters),
        diffFromGpsMeters: 0,
        confirmed: true,
        confirmedAt: now
      };
      onUpdate(updated);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-3">
      {/* Interactive Map Modal */}
      {showMapModal && (
        <LocationPickerMapModal
          initialLocation={location}
          districtHint={location.district}
          onConfirm={(confirmed) => {
            onUpdate(confirmed);
            onConfirm(confirmed);
            setShowMapModal(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span>Verified On-Site Location</span>
              {location.confirmed ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>User Confirmed (Priority #1)</span>
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Please Verify &amp; Confirm</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500">
              Source: {location.source || 'Device Hardware GPS'} &bull; Confidence:{' '}
              <strong className={confidence === 'HIGH' || confidence === 'USER_CONFIRMED' ? 'text-emerald-700' : 'text-amber-700'}>
                {confidence}
              </strong>
              {location.accuracyMeters ? ` (±${Math.round(location.accuracyMeters)}m)` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
          >
            <Compass className="w-3 h-3 text-emerald-700" />
            <span>Open Map &amp; Pin</span>
          </button>

          {onRetryGps && (
            <button
              type="button"
              onClick={onRetryGps}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              title="Refresh GPS from device"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-stone-600" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </button>
        </div>
      </div>

      {/* GPS Unavailable Banner */}
      {isGpsUnavailable && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Precise GPS unavailable. Select the problem location on the map.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0 shadow-2xs"
          >
            Select on Map
          </button>
        </div>
      )}

      {/* Distance Discrepancy Alert (> 100m) */}
      {hasSignificantDiscrepancy && (
        <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Selected location differs from captured GPS by approximately{' '}
              <strong>{distanceDiffMeters.toLocaleString()} meters</strong>.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRevertToCapturedGps}
              className="px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-medium"
            >
              Revert to GPS
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date().toISOString();
                onConfirm({
                  ...location,
                  confirmed: true,
                  confidence: 'USER_CONFIRMED',
                  confirmedAt: now,
                  locationConfirmed: true,
                  locationConfirmedAt: now
                });
              }}
              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-[11px] font-bold"
            >
              Confirm Selected Anyway
            </button>
          </div>
        </div>
      )}

      {isGeocoding && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
          <span>Reverse geocoding coordinates with Google Maps to resolve district, block &amp; landmarks...</span>
        </div>
      )}

      {/* Main Address Display or Inline Edit Mode */}
      {!isEditing ? (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
            <div className="font-semibold text-stone-900">
              {location.address ||
                `${location.villageOrCity || 'Locality'}, ${location.block ? location.block + ', ' : ''}${location.district || 'Jharkhand'}`}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-600 pt-1">
              <div>
                <span className="text-stone-400">District: </span>
                <strong className="text-stone-800">{location.district || 'Unspecified'}</strong>
              </div>
              <div>
                <span className="text-stone-400">Block/Tehsil: </span>
                <strong className="text-stone-800">{location.block || '—'}</strong>
              </div>
              <div>
                <span className="text-stone-400">Village/Town: </span>
                <strong className="text-stone-800">{location.villageOrCity || '—'}</strong>
              </div>
            </div>

            {(location.road || location.landmark || location.pincode) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                {location.road && (
                  <span>
                    Road: <strong className="text-stone-700">{location.road}</strong>
                  </span>
                )}
                {location.landmark && (
                  <span>
                    Landmark: <strong className="text-stone-700">{location.landmark}</strong>
                  </span>
                )}
                {location.pincode && (
                  <span>
                    PIN: <strong className="text-stone-700">{location.pincode}</strong>
                  </span>
                )}
              </div>
            )}

            {location.lat !== undefined && location.lng !== undefined && (
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono pt-1">
                <Compass className="w-3 h-3 text-stone-400" />
                <span>
                  Lat: {formatCoord(location.lat)}°, Lng: {formatCoord(location.lng)}°
                </span>
                {originalGps && (
                  <span className="text-stone-400">
                    &bull; Hardware GPS: {formatCoord(originalGps.lat)}°, {formatCoord(originalGps.lng)}°
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button if not yet confirmed */}
          {!location.confirmed && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-stone-500">
                Priority: User-confirmed location is locked and never overwritten by AI.
              </span>
              <button
                type="button"
                onClick={() => {
                  const now = new Date().toISOString();
                  onConfirm({
                    ...location,
                    confirmed: true,
                    confidence: 'USER_CONFIRMED',
                    locationConfidence: 'USER_CONFIRMED',
                    locationConfirmed: true,
                    confirmedAt: now,
                    locationConfirmedAt: now,
                    originalGpsLocation: originalGps || undefined,
                    confirmedLocation: {
                      lat: location.lat || 23.3441,
                      lng: location.lng || 85.3096,
                      district: location.district || 'Ranchi',
                      block: location.block,
                      villageOrCity: location.villageOrCity,
                      address: location.address,
                      landmark: location.landmark,
                      pincode: location.pincode,
                      source: location.source || 'USER_CONFIRMED',
                      confirmedAt: now
                    }
                  });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs shadow-2xs transition-colors shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm This Location</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3 text-xs p-3 rounded-lg bg-stone-50 border border-stone-300">
          <div className="font-bold text-stone-800 flex items-center justify-between">
            <span>Refine Location Details</span>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>Use Interactive Pin Map</span>
            </button>
          </div>

          {/* Quick Places Search */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
              <Search className="w-3 h-3 text-emerald-600" />
              <span>Search Village / Panchayat / Landmark in Jharkhand</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchPlace();
                  }
                }}
                placeholder="e.g. Torpa Block, Khunti or BIT Mesra Ranchi"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleSearchPlace}
                disabled={isSearching || !searchQuery.trim()}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-1.5 max-h-36 overflow-y-auto rounded-lg border border-stone-300 bg-white divide-y divide-stone-100 shadow-sm">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2 hover:bg-emerald-50 transition-colors flex items-start gap-2 text-xs"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">{res.name}</div>
                      <div className="text-[10px] text-stone-500 leading-tight">{res.formatted_address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual input fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-stone-700">
                District <span className="text-rose-500">*</span>
              </label>
              <select
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700">Block / Tehsil</label>
              <input
                type="text"
                value={editBlock}
                onChange={(e) => setEditBlock(e.target.value)}
                placeholder="e.g. Torpa"
                className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700">Village / Habitation</label>
              <input
                type="text"
                value={editVillage}
                onChange={(e) => setEditVillage(e.target.value)}
                placeholder="e.g. Dorma Gram Panchayat"
                className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700">Landmark / Road</label>
              <input
                type="text"
                value={editLandmark}
                onChange={(e) => setEditLandmark(e.target.value)}
                placeholder="e.g. Near Government Primary School"
                className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700">Full Address Description</label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="e.g. Dorma Village, Torpa Block, Khunti District, Jharkhand"
              className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-1 px-3.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Confirm Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

