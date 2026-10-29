/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  ShieldCheck,
  Crosshair,
  Navigation
} from 'lucide-react';
import { formatCoord } from '../utils/geoUtils.js';

export interface CameraMiniMapOverlayProps {
  lat: number;
  lng: number;
  accuracyMeters?: number | null;
  district?: string;
  locality?: string;
  isCaptured?: boolean;
  capturedAt?: string | null;
  className?: string;
}

type MapLayerType = 'voyager' | 'dark' | 'osm';

export const CameraMiniMapOverlay: React.FC<CameraMiniMapOverlayProps> = ({
  lat,
  lng,
  accuracyMeters = 15,
  district,
  locality,
  isCaptured = false,
  capturedAt,
  className = ''
}) => {
  const [zoom, setZoom] = useState(15);
  const [layer, setLayer] = useState<MapLayerType>('voyager');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState<Record<string, boolean>>({});

  // Clamp zoom between 11 (district/state view) and 18 (building level)
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(18, prev + 1));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(11, prev - 1));
  };

  const toggleLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayer((prev) => {
      if (prev === 'voyager') return 'dark';
      if (prev === 'dark') return 'osm';
      return 'voyager';
    });
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => !prev);
    if (!isMinimized) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Dimensions of the mini-map viewport
  const mapWidth = isExpanded ? 280 : 200;
  const mapHeight = isExpanded ? 190 : 130;

  // Calculate Mercator tile coordinates & offsets so (lat, lng) is dead-center
  const { tiles, centerTileKey, accuracyRadiusPx } = useMemo(() => {
    const validLat = typeof lat === 'number' && !isNaN(lat) ? Math.max(-85, Math.min(85, lat)) : 23.3441;
    const validLng = typeof lng === 'number' && !isNaN(lng) ? Math.max(-180, Math.min(180, lng)) : 85.3096;

    const n = Math.pow(2, zoom);
    const x = ((validLng + 180) / 360) * n;
    const latRad = (validLat * Math.PI) / 180;
    const y = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    // Calculate approximate meters per pixel for accuracy circle overlay
    // C = 40075016.686 meters, meters/pixel = C * cos(lat) / (256 * 2^zoom)
    const metersPerPixel = (156543.03392 * Math.cos(latRad)) / n;
    const accMeters = accuracyMeters && accuracyMeters > 0 ? accuracyMeters : 15;
    const calculatedRadius = Math.max(8, Math.min(mapWidth / 2 - 10, accMeters / metersPerPixel));

    // Get layer URL template
    const getTileUrl = (tx: number, ty: number, z: number, l: MapLayerType) => {
      if (l === 'dark') {
        return `https://a.basemaps.cartocdn.com/dark_all/${z}/${tx}/${ty}.png`;
      }
      if (l === 'osm') {
        return `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
      }
      // default voyager (high-contrast street & terrain)
      return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${tx}/${ty}.png`;
    };

    const tileList: Array<{
      key: string;
      tx: number;
      ty: number;
      left: number;
      top: number;
      url: string;
    }> = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tx = tileX + dx;
        const ty = tileY + dy;
        if (tx >= 0 && tx < n && ty >= 0 && ty < n) {
          const left = mapWidth / 2 + (dx - (x - tileX)) * 256;
          const top = mapHeight / 2 + (dy - (y - tileY)) * 256;
          const key = `${zoom}-${tx}-${ty}-${layer}`;
          tileList.push({
            key,
            tx,
            ty,
            left,
            top,
            url: getTileUrl(tx, ty, zoom, layer)
          });
        }
      }
    }

    return {
      tiles: tileList,
      centerTileKey: `${zoom}-${tileX}-${tileY}-${layer}`,
      accuracyRadiusPx: calculatedRadius
    };
  }, [lat, lng, zoom, layer, mapWidth, mapHeight, accuracyMeters]);

  // Collapsed / Minimized Pill View
  if (isMinimized) {
    return (
      <div
        className={`pointer-events-auto transition-all duration-200 select-none ${className}`}
        id="camera-mini-map-collapsed"
      >
        <button
          type="button"
          onClick={toggleMinimize}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 border border-emerald-500/40 text-stone-200 text-xs shadow-xl backdrop-blur-md transition-transform hover:scale-105"
          title="Expand GPS Mini-Map overlay"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3 h-3 rounded-full bg-emerald-500/60 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-emerald-400 relative z-10" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] font-bold text-emerald-300">
              {isCaptured ? 'FRAME GPS PINNED' : 'LIVE GPS PIN'}
            </span>
            <span className="text-[11px] font-mono text-stone-300">
              {formatCoord(lat)}°, {formatCoord(lng)}°
            </span>
          </div>
          <Maximize2 className="w-3 h-3 text-stone-400 ml-1 hover:text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-auto select-none rounded-xl overflow-hidden border border-emerald-500/35 bg-stone-950/90 shadow-2xl backdrop-blur-md transition-all duration-200 flex flex-col ${className}`}
      style={{ width: `${mapWidth}px` }}
      id="camera-mini-map-overlay"
    >
      {/* Mini-Map Header Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-900/95 border-b border-stone-800 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500/60 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-emerald-400 relative z-10" />
          </div>
          <div className="truncate">
            <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400">
              {isCaptured ? 'Frame GPS Pin' : 'Live Mini-Map'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 text-stone-300">
          <button
            type="button"
            onClick={toggleLayer}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-emerald-300 transition-colors"
            title={`Layer: ${layer.toUpperCase()} (Click to toggle)`}
            aria-label="Toggle map layer style"
          >
            <Layers className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 18}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 11}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={toggleExpand}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            title={isExpanded ? 'Shrink' : 'Enlarge'}
            aria-label={isExpanded ? 'Shrink mini-map' : 'Enlarge mini-map'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={toggleMinimize}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-rose-300 transition-colors"
            title="Minimize to pill"
            aria-label="Minimize mini-map"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Map Display Viewport */}
      <div
        className="relative overflow-hidden bg-stone-900 cursor-crosshair"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {/* Radar / Tactical Grid Background Fallback */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-stone-900 via-stone-950 to-black">
          <svg className="w-full h-full opacity-25" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
            {/* Concentric radar range rings */}
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={mapHeight * 0.2} fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2,2" />
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={mapHeight * 0.38} fill="none" stroke="#10b981" strokeWidth="0.8" />
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={mapHeight * 0.48} fill="none" stroke="#10b981" strokeWidth="0.6" strokeDasharray="3,3" />
            {/* Crosshair axis */}
            <line x1={0} y1={mapHeight / 2} x2={mapWidth} y2={mapHeight / 2} stroke="#10b981" strokeWidth="0.6" strokeDasharray="2,4" />
            <line x1={mapWidth / 2} y1={0} x2={mapWidth / 2} y2={mapHeight} stroke="#10b981" strokeWidth="0.6" strokeDasharray="2,4" />
          </svg>
        </div>

        {/* Slippy Tile Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {tiles.map((t) => (
            <img
              key={t.key}
              src={t.url}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute w-[256px] h-[256px] max-w-none transition-opacity duration-300"
              style={{
                left: `${t.left}px`,
                top: `${t.top}px`,
                filter: layer === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'contrast(1.05)'
              }}
              onLoad={() => setTilesLoaded((prev) => ({ ...prev, [t.key]: true }))}
              onError={(e) => {
                // Hide broken image placeholder, fallback radar grid will show cleanly
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ))}
        </div>

        {/* North Compass Arrow badge */}
        <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-stone-300 pointer-events-none">
          <Navigation className="w-2.5 h-2.5 text-rose-400 rotate-[-45deg]" />
          <span className="font-bold text-stone-200">N</span>
        </div>

        {/* Zoom Level Indicator badge */}
        <div className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-emerald-300 pointer-events-none">
          Z:{zoom}
        </div>

        {/* GPS Accuracy Uncertainty Radius Circle */}
        <div
          className="absolute z-15 pointer-events-none rounded-full border border-emerald-400/40 bg-emerald-500/10 transition-all duration-300"
          style={{
            width: `${accuracyRadiusPx * 2}px`,
            height: `${accuracyRadiusPx * 2}px`,
            left: `${mapWidth / 2 - accuracyRadiusPx}px`,
            top: `${mapHeight / 2 - accuracyRadiusPx}px`
          }}
        />

        {/* Center Target Crosshairs */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${mapWidth / 2}px`,
            top: `${mapHeight / 2}px`
          }}
        >
          {/* Subtle crosshairs */}
          <div className="absolute w-6 h-[1px] bg-emerald-400/60 -left-3 top-0" />
          <div className="absolute h-6 w-[1px] bg-emerald-400/60 left-0 -top-3" />
        </div>

        {/* Pinned GPS Marker Pointing Directly to Center */}
        <div
          className="absolute z-25 pointer-events-none flex flex-col items-center"
          style={{
            left: `${mapWidth / 2}px`,
            top: `${mapHeight / 2}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Sonar Beacon pulse */}
            <span className="absolute -bottom-1 w-4 h-4 rounded-full bg-emerald-400/50 animate-ping" />
            <span className="absolute -bottom-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />

            {/* Custom high-contrast Pin marker */}
            <div className="p-1 rounded-full bg-emerald-600 border border-white text-white shadow-lg drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Map Footer: Precise Coordinates & Pinned Locality */}
      <div className="p-2 bg-stone-950 border-t border-stone-800 flex flex-col gap-1 text-[10px]">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Crosshair className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>
              {formatCoord(lat)}° N, {formatCoord(lng)}° E
            </span>
          </div>
          {accuracyMeters && (
            <span className="text-stone-400 text-[9px]">±{accuracyMeters}m</span>
          )}
        </div>

        <div className="flex items-center justify-between text-stone-300 text-[10px] leading-tight">
          <span className="truncate max-w-[70%] font-medium">
            {locality ? `${locality}, ` : ''}
            <span className="text-emerald-300 font-semibold">{district || 'Jharkhand'}</span>
          </span>
          <span className="text-[9px] text-stone-400 shrink-0 font-mono">
            {isCaptured ? 'Captured' : 'Real-time'}
          </span>
        </div>
      </div>
    </div>
  );
};
