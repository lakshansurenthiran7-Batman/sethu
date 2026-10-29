/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Official 24 Jharkhand Districts as mandated
 */
export const JHARKHAND_DISTRICTS_CANONICAL = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Seraikela-Kharsawan',
  'Simdega',
  'West Singhbhum'
] as const;

export type JharkhandDistrictName = typeof JHARKHAND_DISTRICTS_CANONICAL[number];

/**
 * Normalizes any variations in Jharkhand district names
 * E.g., 'Ranchi District' -> 'Ranchi', 'Saraikela Kharsawan' -> 'Seraikela-Kharsawan',
 * 'East Singhbhum (Jamshedpur)' -> 'East Singhbhum'
 */
export function normalizeJharkhandDistrict(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();

  for (const d of JHARKHAND_DISTRICTS_CANONICAL) {
    const dLower = d.toLowerCase();
    if (lower === dLower) return d;
    // Strip "district" or punctuation
    const withoutSuffix = lower.replace(/\s+district$/i, '').replace(/[\(\)-]/g, ' ').trim();
    const dWithoutSuffix = dLower.replace(/[\(\)-]/g, ' ').trim();
    if (withoutSuffix === dWithoutSuffix) return d;
  }

  // Common aliases
  if (lower.includes('seraikela') || lower.includes('saraikela')) {
    return 'Seraikela-Kharsawan';
  }
  if (lower.includes('east singhbhum') || lower.includes('jamshedpur')) {
    return 'East Singhbhum';
  }
  if (lower.includes('west singhbhum') || lower.includes('chaibasa')) {
    return 'West Singhbhum';
  }
  if (lower.includes('ranchi')) {
    return 'Ranchi';
  }
  if (lower.includes('dhanbad')) {
    return 'Dhanbad';
  }
  if (lower.includes('bokaro')) {
    return 'Bokaro';
  }
  if (lower.includes('deoghar')) {
    return 'Deoghar';
  }
  if (lower.includes('dumka')) {
    return 'Dumka';
  }
  if (lower.includes('hazaribagh') || lower.includes('hazaribag')) {
    return 'Hazaribagh';
  }
  if (lower.includes('giridih')) {
    return 'Giridih';
  }
  if (lower.includes('palamu') || lower.includes('daltonganj') || lower.includes('medininagar')) {
    return 'Palamu';
  }
  if (lower.includes('khunti')) {
    return 'Khunti';
  }
  if (lower.includes('gumla')) {
    return 'Gumla';
  }
  if (lower.includes('godda')) {
    return 'Godda';
  }
  if (lower.includes('garhwa')) {
    return 'Garhwa';
  }
  if (lower.includes('chatra')) {
    return 'Chatra';
  }
  if (lower.includes('jamtara')) {
    return 'Jamtara';
  }
  if (lower.includes('koderma')) {
    return 'Koderma';
  }
  if (lower.includes('latehar')) {
    return 'Latehar';
  }
  if (lower.includes('lohardaga')) {
    return 'Lohardaga';
  }
  if (lower.includes('pakur')) {
    return 'Pakur';
  }
  if (lower.includes('ramgarh')) {
    return 'Ramgarh';
  }
  if (lower.includes('sahibganj') || lower.includes('sahebganj')) {
    return 'Sahibganj';
  }
  if (lower.includes('simdega')) {
    return 'Simdega';
  }

  return null;
}

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * GPS Accuracy categorizer
 */
export function getGpsConfidenceCategory(accuracyMeters?: number | null): 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' {
  if (accuracyMeters === undefined || accuracyMeters === null) return 'LOW';
  if (accuracyMeters <= 20) return 'HIGH';
  if (accuracyMeters <= 50) return 'GOOD';
  if (accuracyMeters <= 100) return 'MODERATE';
  return 'LOW';
}

/**
 * Formats a coordinate cleanly to 6 decimal places (approx. 10 cm precision)
 */
export function formatCoord(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '';
  return Number(val.toFixed(6)).toString();
}

/**
 * Centroid coordinates and headquarters of all 24 Jharkhand districts
 */
export const JHARKHAND_DISTRICT_CENTROIDS: Record<
  JharkhandDistrictName,
  { lat: number; lng: number; headquarters: string; division: string }
> = {
  Bokaro: { lat: 23.6693, lng: 86.1511, headquarters: 'Bokaro Steel City', division: 'North Chotanagpur' },
  Chatra: { lat: 24.2092, lng: 84.8711, headquarters: 'Chatra', division: 'North Chotanagpur' },
  Deoghar: { lat: 24.4826, lng: 86.7001, headquarters: 'Deoghar', division: 'Santhal Pargana' },
  Dhanbad: { lat: 23.7957, lng: 86.4304, headquarters: 'Dhanbad', division: 'North Chotanagpur' },
  Dumka: { lat: 24.2676, lng: 87.2471, headquarters: 'Dumka', division: 'Santhal Pargana' },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029, headquarters: 'Jamshedpur', division: 'Kolhan' },
  Garhwa: { lat: 24.1610, lng: 83.8080, headquarters: 'Garhwa', division: 'Palamu' },
  Giridih: { lat: 24.1860, lng: 86.3006, headquarters: 'Giridih', division: 'North Chotanagpur' },
  Godda: { lat: 24.8273, lng: 87.2140, headquarters: 'Godda', division: 'Santhal Pargana' },
  Gumla: { lat: 23.0435, lng: 84.5422, headquarters: 'Gumla', division: 'South Chotanagpur' },
  Hazaribagh: { lat: 23.9937, lng: 85.3623, headquarters: 'Hazaribagh', division: 'North Chotanagpur' },
  Jamtara: { lat: 23.9595, lng: 86.8016, headquarters: 'Jamtara', division: 'Santhal Pargana' },
  Khunti: { lat: 23.0734, lng: 85.2796, headquarters: 'Khunti', division: 'South Chotanagpur' },
  Koderma: { lat: 24.4674, lng: 85.5938, headquarters: 'Koderma', division: 'North Chotanagpur' },
  Latehar: { lat: 23.7441, lng: 84.5028, headquarters: 'Latehar', division: 'Palamu' },
  Lohardaga: { lat: 23.4357, lng: 84.6800, headquarters: 'Lohardaga', division: 'South Chotanagpur' },
  Pakur: { lat: 24.6336, lng: 87.8492, headquarters: 'Pakur', division: 'Santhal Pargana' },
  Palamu: { lat: 24.0384, lng: 84.0729, headquarters: 'Medininagar', division: 'Palamu' },
  Ramgarh: { lat: 23.6332, lng: 85.5149, headquarters: 'Ramgarh', division: 'North Chotanagpur' },
  Ranchi: { lat: 23.3441, lng: 85.3096, headquarters: 'Ranchi', division: 'South Chotanagpur' },
  Sahibganj: { lat: 25.2425, lng: 87.6416, headquarters: 'Sahibganj', division: 'Santhal Pargana' },
  'Seraikela-Kharsawan': { lat: 22.7006, lng: 85.9317, headquarters: 'Seraikela', division: 'Kolhan' },
  Simdega: { lat: 22.6152, lng: 84.5064, headquarters: 'Simdega', division: 'South Chotanagpur' },
  'West Singhbhum': { lat: 22.5539, lng: 85.8078, headquarters: 'Chaibasa', division: 'Kolhan' }
};

/**
 * Mathematically finds the nearest official Jharkhand district for any GPS coordinates
 */
export function findNearestJharkhandDistrict(
  lat: number,
  lng: number
): { district: JharkhandDistrictName; distanceKm: number; headquarters: string; division: string } {
  let nearestDistrict: JharkhandDistrictName = 'Ranchi';
  let minDistanceMeters = Infinity;

  for (const districtName of JHARKHAND_DISTRICTS_CANONICAL) {
    const centroid = JHARKHAND_DISTRICT_CENTROIDS[districtName];
    const dist = calculateHaversineDistanceMeters(lat, lng, centroid.lat, centroid.lng);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestDistrict = districtName;
    }
  }

  const nearestData = JHARKHAND_DISTRICT_CENTROIDS[nearestDistrict];
  return {
    district: nearestDistrict,
    distanceKm: Math.round(minDistanceMeters / 1000),
    headquarters: nearestData.headquarters,
    division: nearestData.division
  };
}
