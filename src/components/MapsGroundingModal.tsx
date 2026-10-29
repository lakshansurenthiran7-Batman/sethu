/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Sparkles,
  ExternalLink,
  Compass,
  Building,
  GraduationCap,
  X,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GroundingMapSource, JHARKHAND_DISTRICTS } from '../types.js';
import { Map, AdvancedMarker, useApiIsLoaded } from '@vis.gl/react-google-maps';

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
  'West Singhbhum': { lat: 22.5634, lng: 85.8080 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Hazaribagh: { lat: 23.9925, lng: 85.3637 },
  Deoghar: { lat: 24.4826, lng: 86.7001 },
  Giridih: { lat: 24.1856, lng: 86.3079 },
  Ramgarh: { lat: 23.6300, lng: 85.5135 },
  Khunti: { lat: 23.0725, lng: 85.2792 },
  Gumla: { lat: 23.0428, lng: 84.5422 },
  Latehar: { lat: 23.7434, lng: 84.4988 },
  Palamu: { lat: 24.0416, lng: 84.0722 },
  Garhwa: { lat: 24.1612, lng: 83.8115 },
  Chatra: { lat: 24.2084, lng: 84.8718 },
  Koderma: { lat: 24.4674, lng: 85.5947 },
  Lohardaga: { lat: 23.4414, lng: 84.6826 },
  Simdega: { lat: 22.6174, lng: 84.5098 },
  'Seraikela Kharsawan': { lat: 22.7004, lng: 85.9287 },
  Jamtara: { lat: 23.9604, lng: 86.8028 },
  Dumka: { lat: 24.2691, lng: 87.2476 },
  Godda: { lat: 24.8267, lng: 87.2141 },
  Sahibganj: { lat: 25.2425, lng: 87.6433 },
  Pakur: { lat: 24.6340, lng: 87.8492 }
};

interface MapsGroundingModalProps {
  onClose: () => void;
  initialQuery?: string;
  initialDistrict?: string;
}

export const MapsGroundingModal: React.FC<MapsGroundingModalProps> = ({
  onClose,
  initialQuery = 'Water testing laboratories and district collectorate',
  initialDistrict = 'Ranchi'
}) => {
  const [district, setDistrict] = useState(initialDistrict);
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [mapsSources, setMapsSources] = useState<GroundingMapSource[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMapsApiLoaded = useApiIsLoaded();

  const quickPicks = [
    { label: 'BIT Mesra Ranchi Labs', q: 'Birsa Institute of Technology BIT Mesra campus and engineering labs Ranchi' },
    { label: 'IIT ISM Dhanbad Mining Center', q: 'IIT ISM Dhanbad campus mining and environmental engineering labs' },
    { label: 'NIT Jamshedpur R&D Center', q: 'National Institute of Technology NIT Jamshedpur engineering campus' },
    { label: 'State Water Testing Labs', q: 'Drinking water quality testing laboratory and PHED office' },
    { label: 'District Collectorate & BDO', q: 'District Collectorate and Deputy Commissioner office' }
  ];

  const handleSearch = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    setResultText(null);
    setMapsSources([]);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          district: district,
          latitude: 23.3441,
          longitude: 85.3096
        })
      });

      const data = await res.json();
      if (data.success) {
        setResultText(data.text);
        setMapsSources(data.mapsSources || []);
      } else {
        setErrorMessage(data.error || 'Failed to retrieve Google Maps grounded locations.');
      }
    } catch (err: any) {
      console.error('Maps grounding query error:', err);
      setErrorMessage('Unable to connect to Google Maps grounding service.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-100">
                  Google Maps Grounding &bull; Geo-Spatial Explorer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Live Google Maps grounding for Jharkhand public institutions, university labs, and district offices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Picks */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-1">
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                District:
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:ring-1 focus:ring-emerald-500"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Facility / Institution / Location Query:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. Drinking water quality lab, BIT Mesra, PHC Torpa, DC Office..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {isSearching ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Search Maps</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
            <span className="text-stone-500 font-semibold shrink-0">Quick Queries:</span>
            {quickPicks.map((pick, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(pick.q);
                  handleSearch(pick.q);
                }}
                className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 transition-colors shadow-2xs"
              >
                {pick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSearching && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-stone-500 text-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="font-semibold text-stone-700">
                Grounding with Google Maps Platform API via gemini-3.5-flash...
              </div>
              <p className="text-[11px] text-stone-400 max-w-sm">
                Retrieving verified geographical coordinates, addresses, and facility details for {district}.
              </p>
            </div>
          )}

          {!isSearching && resultText && (
            <div className="space-y-4">
              {/* Interactive Google Map Grounded Overview */}
              {isMapsApiLoaded && (
                <div className="w-full h-52 rounded-xl overflow-hidden border border-stone-200 shadow-xs relative">
                  <Map
                    style={{ width: '100%', height: '100%' }}
                    defaultCenter={DISTRICT_COORDS[district] || DISTRICT_COORDS['Ranchi']}
                    center={DISTRICT_COORDS[district] || DISTRICT_COORDS['Ranchi']}
                    zoom={12}
                    mapId="DEMO_MAP_ID"
                    gestureHandling="cooperative"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    <AdvancedMarker
                      position={DISTRICT_COORDS[district] || DISTRICT_COORDS['Ranchi']}
                      title={`${district} District Center`}
                    >
                      <div className="bg-emerald-600 text-white p-1.5 rounded-full shadow border-2 border-white flex items-center gap-1 text-[11px] font-bold px-2.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{district} &bull; Grounded Center</span>
                      </div>
                    </AdvancedMarker>
                  </Map>
                  <div className="absolute right-2 bottom-2 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded pointer-events-none font-medium">
                    Google Maps Platform &bull; Grounding Active
                  </div>
                </div>
              )}

              {/* Grounded Narrative Summary */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-stone-800 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Maps Grounded Analysis for {district}</span>
                </div>
                <div className="whitespace-pre-wrap">{resultText}</div>
              </div>

              {/* Extracted Google Maps Sources List (MANDATORY per SKILL.md) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Verified Google Maps Locations ({mapsSources.length})</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal">
                    Click to view direct live satellite map
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mapsSources.map((source, index) => (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-700">
                            {source.title}
                          </h4>
                          <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                        </div>

                        {source.reviewSnippets && source.reviewSnippets.length > 0 && (
                          <p className="text-[11px] text-stone-500 italic line-clamp-2">
                            "{source.reviewSnippets[0]}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
                        <span>Open in Google Maps &rarr;</span>
                        <span className="text-stone-400">Grounded Source #{index + 1}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isSearching && !resultText && !errorMessage && (
            <div className="py-12 text-center text-stone-400 text-xs space-y-2">
              <Compass className="w-8 h-8 mx-auto text-stone-300" />
              <div className="font-semibold text-stone-600">
                Explore Grounded Locations Across Jharkhand
              </div>
              <p className="max-w-md mx-auto text-[11px]">
                Search for engineering college laboratories, government departmental secretariats, or community test sites.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span>Grounded in Google Maps Platform &bull; Powered by gemini-3.5-flash</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
