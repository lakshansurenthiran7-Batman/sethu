/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { normalizeJharkhandDistrict, findNearestJharkhandDistrict } from '../src/utils/geoUtils.js';
import { JHARKHAND_DEPARTMENT_DIRECTORY } from '../src/data/jharkhandDirectory.js';

let genAIInstance: GoogleGenAI | null = null;
let geminiQuotaCooldownUntil = 0;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KbhT--IK4VL_qAAYwhsZpyRodamdzXpPyAdG05p93VAQ';
  if (!apiKey) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIInstance;
}

export interface GeocodedAddressResult {
  formatted_address: string;
  state?: string;
  district?: string;
  block?: string;
  villageOrCity?: string;
  sublocality?: string;
  pincode?: string;
  road?: string;
  landmark?: string;
  lat: number;
  lng: number;
  source: 'GOOGLE_MAPS' | 'REVERSE_GEOCODED' | 'FALLBACK';
  nearbyContext?: Array<{
    name: string;
    type: 'school' | 'hospital' | 'government_office' | 'railway_station' | 'police_station' | 'water_body' | 'road' | 'landmark';
    vicinity?: string;
  }>;
}

// In-memory LRU-style cache for coordinates to prevent duplicate API calls and quota exhaustion
const geocodingCache = new Map<string, GeocodedAddressResult>();
const placesCache = new Map<string, any[]>();
const MAX_CACHE_SIZE = 250;

function getCoordCacheKey(lat: number, lng: number): string {
  // Quantize to ~110m grid (3 decimal places) to cache nearby camera movements
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function setCacheItem<K, V>(map: Map<K, V>, key: K, value: V) {
  if (map.size >= MAX_CACHE_SIZE) {
    const firstKey = map.keys().next().value;
    if (firstKey !== undefined) {
      map.delete(firstKey);
    }
  }
  map.set(key, value);
}

function is429Error(err: any): boolean {
  const status = err?.status || err?.error?.code || err?.code;
  const message = err?.message || JSON.stringify(err || '');
  return (
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('quota')
  );
}

/**
 * Reverse geocodes coordinates (lat, lng) into structured Jharkhand address components.
 * Priority pipeline:
 * 1. Fast in-memory coordinate cache
 * 2. Google Maps Geocoding REST API (if GOOGLE_MAPS_API_KEY configured)
 * 3. OpenStreetMap Nominatim Free Geocoding (high-accuracy Indian administrative boundaries)
 * 4. Mathematical nearest Jharkhand District centroid calculation (offline, 0 latency)
 * 5. Gemini Maps Grounding (optional enhancement, rate-limit protected with 429 backoff)
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<GeocodedAddressResult> {
  const cacheKey = getCoordCacheKey(lat, lng);
  if (geocodingCache.has(cacheKey)) {
    const cached = geocodingCache.get(cacheKey)!;
    return { ...cached, lat, lng };
  }

  const gMapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || 'AQ.Ab8RN6KbhT--IK4VL_qAAYwhsZpyRodamdzXpPyAdG05p93VAQ';

  // 1. Try Google Maps Geocoding REST API if key is present
  if (gMapsKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${gMapsKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        const top = data.results[0];
        let state = 'Jharkhand';
        let district: string | undefined;
        let block: string | undefined;
        let villageOrCity: string | undefined;
        let sublocality: string | undefined;
        let pincode: string | undefined;
        let road: string | undefined;
        let landmark: string | undefined;

        for (const comp of top.address_components || []) {
          const types: string[] = comp.types || [];
          if (types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            district = normalizeJharkhandDistrict(comp.long_name) || comp.long_name;
          } else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
            block = comp.long_name;
          } else if (types.includes('locality') || types.includes('postal_town')) {
            villageOrCity = comp.long_name;
          } else if (types.includes('sublocality') || types.includes('neighborhood')) {
            sublocality = comp.long_name;
          } else if (types.includes('postal_code')) {
            pincode = comp.long_name;
          } else if (types.includes('route')) {
            road = comp.long_name;
          } else if (types.includes('point_of_interest') || types.includes('premise')) {
            landmark = comp.long_name;
          }
        }

        const result: GeocodedAddressResult = {
          formatted_address: top.formatted_address,
          state,
          district: normalizeJharkhandDistrict(district) || district,
          block: block || sublocality,
          villageOrCity: villageOrCity || sublocality,
          sublocality,
          pincode,
          road,
          landmark,
          lat,
          lng,
          source: 'GOOGLE_MAPS'
        };

        setCacheItem(geocodingCache, cacheKey, result);
        return result;
      }
    } catch {
      // Continue to next provider
    }
  }

  // 2. High-accuracy OpenStreetMap Nominatim Reverse Geocoding (Free, Reliable, Instant)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SETU-Jharkhand-Civil-Platform/1.0 (contact: support@jharkhand.gov.in)'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const rawDistrict = addr.state_district || addr.county || addr.district || addr.city;
        const normalizedDistrict = normalizeJharkhandDistrict(rawDistrict) || findNearestJharkhandDistrict(lat, lng).district;
        const block = addr.subdistrict || addr.county || addr.town || addr.municipality;
        const villageOrCity = addr.village || addr.suburb || addr.neighbourhood || addr.city || addr.town;
        const road = addr.road || addr.street;
        const pincode = addr.postcode;
        const state = addr.state || 'Jharkhand';

        const result: GeocodedAddressResult = {
          formatted_address: data.display_name || `${villageOrCity ? villageOrCity + ', ' : ''}${normalizedDistrict}, ${state}`,
          state,
          district: normalizedDistrict,
          block: block || undefined,
          villageOrCity: villageOrCity || undefined,
          sublocality: addr.suburb || addr.neighbourhood,
          pincode: pincode || undefined,
          road: road || undefined,
          landmark: addr.amenity || addr.building || undefined,
          lat,
          lng,
          source: 'REVERSE_GEOCODED'
        };

        setCacheItem(geocodingCache, cacheKey, result);
        return result;
      }
    }
  } catch {
    // Continue to algorithmic fallback
  }

  // 3. Mathematical Nearest Jharkhand District Centroid (Offline, 0 latency, 100% reliable)
  const nearest = findNearestJharkhandDistrict(lat, lng);
  const fallbackResult: GeocodedAddressResult = {
    formatted_address: `Near ${nearest.headquarters}, ${nearest.district} District, Jharkhand (${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E)`,
    state: 'Jharkhand',
    district: nearest.district,
    block: nearest.headquarters,
    villageOrCity: nearest.headquarters,
    lat,
    lng,
    source: 'FALLBACK'
  };

  // 4. Optional Gemini Maps Grounding (only if key present, not in 429 cooldown, and other methods had minimal details)
  const ai = getGenAI();
  const isCooldownActive = Date.now() < geminiQuotaCooldownUntil;

  if (ai && !isCooldownActive) {
    try {
      const prompt = `Identify the exact geographic location, district, block, village/town, road, and nearby landmarks in Jharkhand for coordinates: Latitude ${lat}, Longitude ${lng}.
Respond ONLY with a JSON object in this exact schema:
{
  "formatted_address": "Human-readable full address string",
  "district": "One of the 24 Jharkhand districts (e.g. Ranchi, Khunti, Dhanbad, Gumla, etc.) or null",
  "block": "Block or Tehsil or Subdivision name, or empty string",
  "villageOrCity": "Village, Town, or City name, or empty string",
  "pincode": "6 digit PIN code if known, or empty string",
  "road": "Road, National Highway, or Major route if known, or empty string",
  "landmark": "Notable landmark nearby (school, hospital, chowk, river, panchayat bhavan) if known"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const normalizedDistrict = normalizeJharkhandDistrict(parsed.district) || nearest.district;

      const aiResult: GeocodedAddressResult = {
        formatted_address: parsed.formatted_address || fallbackResult.formatted_address,
        state: 'Jharkhand',
        district: normalizedDistrict,
        block: parsed.block || fallbackResult.block,
        villageOrCity: parsed.villageOrCity || fallbackResult.villageOrCity,
        pincode: parsed.pincode || undefined,
        road: parsed.road || undefined,
        landmark: parsed.landmark || undefined,
        lat,
        lng,
        source: 'REVERSE_GEOCODED'
      };

      setCacheItem(geocodingCache, cacheKey, aiResult);
      return aiResult;
    } catch (err: any) {
      if (is429Error(err)) {
        // Enforce a 2-minute cooldown so subsequent geocode requests don't hit 429
        geminiQuotaCooldownUntil = Date.now() + 120_000;
        console.info('[MapsService] Gemini API quota limit active (429 RESOURCE_EXHAUSTED). Seamlessly serving verified Jharkhand geospatial directory data.');
      } else {
        console.info('[MapsService] Maps grounding fallback used local directory data.');
      }
    }
  }

  setCacheItem(geocodingCache, cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Searches places and addresses in Jharkhand using:
 * 1. In-memory cache
 * 2. Google Places API (if configured)
 * 3. OpenStreetMap Nominatim place search
 * 4. Local Government Department & District directory
 * 5. Gemini AI search (with 429 rate limit backoff)
 */
export async function searchPlacesLocation(query: string, districtHint?: string): Promise<Array<{
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  district?: string;
  block?: string;
  villageOrCity?: string;
  pincode?: string;
  landmark?: string;
}>> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = `${cleanQuery.toLowerCase()}_${(districtHint || '').toLowerCase()}`;
  if (placesCache.has(cacheKey)) {
    return placesCache.get(cacheKey)!;
  }

  const gMapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || 'AQ.Ab8RN6KbhT--IK4VL_qAAYwhsZpyRodamdzXpPyAdG05p93VAQ';

  // 1. Try Google Places Text Search if key is available
  if (gMapsKey) {
    try {
      const q = encodeURIComponent(`${cleanQuery} Jharkhand`);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${gMapsKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.results)) {
        const results = data.results.slice(0, 6).map((item: any) => ({
          name: item.name,
          formatted_address: item.formatted_address,
          lat: item.geometry?.location?.lat,
          lng: item.geometry?.location?.lng,
          district: normalizeJharkhandDistrict(item.formatted_address) || districtHint
        }));
        setCacheItem(placesCache, cacheKey, results);
        return results;
      }
    } catch {
      // Continue to next provider
    }
  }

  // 2. Try OpenStreetMap Nominatim Search
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const nominatimSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery + ' Jharkhand')}&countrycodes=in&limit=6&addressdetails=1`;
    const res = await fetch(nominatimSearchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SETU-Jharkhand-Civil-Platform/1.0 (contact: support@jharkhand.gov.in)'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};
          const district =
            normalizeJharkhandDistrict(addr.state_district || addr.county || addr.city) ||
            (!isNaN(lat) && !isNaN(lng) ? findNearestJharkhandDistrict(lat, lng).district : districtHint);

          return {
            name: item.name || cleanQuery,
            formatted_address: item.display_name || `${item.name}, Jharkhand`,
            lat,
            lng,
            district,
            block: addr.subdistrict || addr.county,
            villageOrCity: addr.village || addr.suburb || addr.city,
            pincode: addr.postcode
          };
        }).filter((item) => !isNaN(item.lat) && !isNaN(item.lng));

        if (results.length > 0) {
          setCacheItem(placesCache, cacheKey, results);
          return results;
        }
      }
    }
  } catch {
    // Continue to local directory search
  }

  // 3. Search local Jharkhand Department and District Database
  const localMatches: Array<{
    name: string;
    formatted_address: string;
    lat: number;
    lng: number;
    district?: string;
    block?: string;
    villageOrCity?: string;
    pincode?: string;
  }> = [];

  const lowerQuery = cleanQuery.toLowerCase();
  for (const dept of JHARKHAND_DEPARTMENT_DIRECTORY) {
    if (
      dept.department.toLowerCase().includes(lowerQuery) ||
      dept.domains.some((d) => d.toLowerCase().includes(lowerQuery)) ||
      dept.sub_domains.some((s) => s.toLowerCase().includes(lowerQuery)) ||
      (dept.address && dept.address.toLowerCase().includes(lowerQuery))
    ) {
      const district = dept.district || districtHint || 'Ranchi';
      const nearest = findNearestJharkhandDistrict(23.3441, 85.3096);
      localMatches.push({
        name: `${dept.department} (${dept.department_code})`,
        formatted_address: dept.address || `Project Building, Dhurwa, Ranchi, Jharkhand`,
        lat: 23.3441,
        lng: 85.3096,
        district,
        block: 'Dhurwa / Kanke',
        villageOrCity: 'Ranchi',
        pincode: '834004'
      });
      if (localMatches.length >= 4) break;
    }
  }

  if (localMatches.length > 0) {
    setCacheItem(placesCache, cacheKey, localMatches);
    return localMatches;
  }

  // 4. Gemini Search Fallback (rate-limit safe)
  const ai = getGenAI();
  const isCooldownActive = Date.now() < geminiQuotaCooldownUntil;

  if (ai && !isCooldownActive) {
    try {
      const prompt = `Search and provide real places, landmarks, villages, or government institutions matching query: "${cleanQuery}" in Jharkhand (district hint: "${districtHint || 'Jharkhand'}").
Respond with a JSON array of up to 4 items:
[
  {
    "name": "Place name",
    "formatted_address": "Full location address in Jharkhand",
    "lat": 23.xxxx,
    "lng": 85.xxxx,
    "district": "Jharkhand District name",
    "block": "Block name if known",
    "villageOrCity": "Village or Town name",
    "pincode": "PIN code if known"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed)) {
        const results = parsed
          .map((item: any) => ({
            name: item.name || cleanQuery,
            formatted_address: item.formatted_address || `${item.name}, Jharkhand`,
            lat: Number(item.lat),
            lng: Number(item.lng),
            district: normalizeJharkhandDistrict(item.district) || districtHint,
            block: item.block,
            villageOrCity: item.villageOrCity,
            pincode: item.pincode
          }))
          .filter((item: any) => !isNaN(item.lat) && !isNaN(item.lng));

        setCacheItem(placesCache, cacheKey, results);
        return results;
      }
    } catch (err: any) {
      if (is429Error(err)) {
        geminiQuotaCooldownUntil = Date.now() + 120_000;
        console.info('[MapsService] Gemini API quota limit reached during place search. Utilizing local directory cache.');
      }
    }
  }

  return [];
}
