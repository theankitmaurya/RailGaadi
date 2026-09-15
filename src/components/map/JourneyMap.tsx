'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { JourneyStatus, TrainRoute } from '@/types';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from '@/config';
import { Locate, Maximize2, Minimize2, Compass, Layers, Sun, Moon, ZoomIn, ZoomOut } from 'lucide-react';
import { getPointAlongRoute } from '@/lib/geo';
import * as turf from '@turf/turf';

interface JourneyMapProps {
  status: JourneyStatus;
  route: TrainRoute;
  className?: string;
}

// ── Route colours ──────────────────────────────────────────
const ROUTE_COLORS = {
  completedCore:   '#38bdf8', // electric sky blue
  completedGlow:   '#0ea5e9', // slightly deeper glow
  remainingCore:   '#64748b', // cool slate
  remainingGlow:   '#475569',
};

// ── Control button component ─────────────────────────
function MapBtn({
  onClick,
  title,
  active = false,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border shadow-lg cursor-pointer transition-all duration-150 backdrop-blur-md ${
        active
          ? 'bg-sky-500 border-sky-400 text-white shadow-sky-500/40'
          : 'bg-black/60 border-white/10 text-white/80 hover:bg-black/80 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function JourneyMap({ status, route, className }: JourneyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [followMode, setFollowMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDarkMap, setIsDarkMap] = useState(true);

  const MapClass = (maplibregl as any).Map || (maplibregl as any).default;
  const MarkerClass = (maplibregl as any).Marker || (maplibregl as any).default?.Marker;

  // ── Helpers ──────────────────────────────────────────────
  const addRouteLayers = useCallback((map: maplibregl.Map) => {
    if (!route?.geometry?.coordinates?.length) return;

    const fullLine = turf.lineString(route.geometry.coordinates);
    const totalLengthKm = turf.length(fullLine, { units: 'kilometers' });
    const coveredKm = Math.min(Math.max(0, status.progress.distanceCoveredKm), totalLengthKm);

    // Fit to full route bounds on first load
    const bbox = turf.bbox(fullLine) as [number, number, number, number];
    map.fitBounds(bbox, { padding: { top: 50, bottom: 50, left: 40, right: 40 }, maxZoom: 8, duration: 1200 });

    let completedGeoJSON: any = { type: 'FeatureCollection', features: [] };
    if (coveredKm > 0.1) {
      try {
        completedGeoJSON = turf.lineSliceAlong(fullLine, 0, coveredKm, { units: 'kilometers' });
      } catch (e) {
        console.warn('lineSliceAlong error:', e);
      }
    }

    // ── Full (remaining) route ─────────────────────────────
    if (!map.getSource('full-route')) {
      map.addSource('full-route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: route.geometry },
      });
      map.addLayer({
        id: 'route-remaining-glow',
        type: 'line',
        source: 'full-route',
        paint: { 'line-color': ROUTE_COLORS.remainingGlow, 'line-width': 10, 'line-opacity': 0.25, 'line-blur': 4 },
      });
      map.addLayer({
        id: 'route-remaining-core',
        type: 'line',
        source: 'full-route',
        paint: { 'line-color': ROUTE_COLORS.remainingCore, 'line-width': 3, 'line-opacity': 0.7, 'line-dasharray': [4, 4] },
      });
    }

    // ── Completed route ────────────────────────────────────
    if (!map.getSource('completed-route')) {
      map.addSource('completed-route', { type: 'geojson', data: completedGeoJSON });
      map.addLayer({
        id: 'route-completed-glow-wide',
        type: 'line',
        source: 'completed-route',
        paint: { 'line-color': ROUTE_COLORS.completedGlow, 'line-width': 22, 'line-opacity': 0.12, 'line-blur': 10 },
      });
      map.addLayer({
        id: 'route-completed-glow',
        type: 'line',
        source: 'completed-route',
        paint: { 'line-color': ROUTE_COLORS.completedGlow, 'line-width': 10, 'line-opacity': 0.35, 'line-blur': 3 },
      });
      map.addLayer({
        id: 'route-completed-core',
        type: 'line',
        source: 'completed-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': ROUTE_COLORS.completedCore,
          'line-width': 5,
          'line-opacity': 1,
        },
      });
    }
  }, [route, status.progress.distanceCoveredKm]);

  // ── Map Init ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let targetLocation = status.location;
    if (!targetLocation && route?.geometry?.coordinates?.length) {
      const interp = getPointAlongRoute(route.geometry.coordinates, status.progress.distanceCoveredKm);
      if (interp) targetLocation = interp.location;
    }

    const initialCenter: [number, number] = targetLocation
      ? [targetLocation.lng, targetLocation.lat]
      : [78.9629, 20.5937];

    const map = new MapClass({
      container: mapContainerRef.current!,
      style: DARK_MAP_STYLE as any,
      center: initialCenter,
      zoom: targetLocation ? 6.5 : 5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsMapLoaded(true);
      map.resize();
      addRouteLayers(map);
    });

    map.on('dragstart', () => setFollowMode(false));
    map.on('wheel', () => setFollowMode(false));

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map style toggle (dark/light) ─────────────────────────
  const handleToggleMapStyle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const nextDark = !isDarkMap;
    setIsDarkMap(nextDark);
    setIsMapLoaded(false);
    trainMarkerRef.current?.remove();
    trainMarkerRef.current = null;
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];
    map.setStyle(nextDark ? (DARK_MAP_STYLE as any) : (LIGHT_MAP_STYLE as any));
    map.once('styledata', () => {
      setIsMapLoaded(true);
      addRouteLayers(map);
    });
  }, [isDarkMap, addRouteLayers]);

  // ── Station Markers ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !route?.stations?.length) return;

    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    route.stations.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'relative cursor-pointer group';

      const isCurrent = s.status === 'CURRENT';
      const isPassed  = s.status === 'PASSED';

      const dotBg   = isCurrent ? '#f43f5e' : isPassed ? '#38bdf8' : '#64748b';
      const dotRing = isCurrent ? 'rgba(244,63,94,0.4)' : isPassed ? 'rgba(56,189,248,0.3)' : 'transparent';
      const dotSize = isCurrent ? 14 : 10;

      el.innerHTML = `
        <div style="
          width:${dotSize}px; height:${dotSize}px;
          background:${dotBg};
          border-radius:50%;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 0 0 4px ${dotRing}, 0 2px 8px rgba(0,0,0,0.4);
          ${isCurrent ? 'animation: pulse 2s infinite;' : ''}
        "></div>
        <div class="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          style="background:rgba(10,14,25,0.97); border:1px solid rgba(56,189,248,0.35); border-radius:12px; padding:8px 12px; white-space:nowrap; box-shadow:0 8px 32px rgba(0,0,0,0.6);">
          <div style="color:#fff; font-weight:700; font-size:12px; font-family:inherit;">${s.station.name}</div>
          <div style="color:#38bdf8; font-size:10px; font-family:monospace; margin-top:2px;">${s.station.code} · ${Math.round(s.distanceFromOriginKm)} km</div>
        </div>
      `;

      const marker = new MarkerClass({ element: el })
        .setLngLat([s.station.longitude, s.station.latitude])
        .addTo(map);

      stationMarkersRef.current.push(marker);
    });
  }, [isMapLoaded, route, MarkerClass]);

  // ── Train Marker ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    let loc = status.location;
    if (!loc && route?.geometry?.coordinates?.length) {
      const interp = getPointAlongRoute(route.geometry.coordinates, status.progress.distanceCoveredKm);
      if (interp) loc = interp.location;
    }
    if (!loc) return;

    const lngLat: [number, number] = [loc.lng, loc.lat];

    if (!trainMarkerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="
            position:absolute;
            width:44px; height:44px;
            border-radius:50%;
            background:rgba(56,189,248,0.25);
            animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:relative; z-index:2;
            width:32px; height:32px;
            border-radius:50%;
            background:linear-gradient(135deg,#0c111d,#1e293b);
            border:2.5px solid #38bdf8;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 0 0 3px rgba(56,189,248,0.25), 0 4px 16px rgba(0,0,0,0.6);
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
        </div>
      `;
      trainMarkerRef.current = new MarkerClass({ element: el }).setLngLat(lngLat).addTo(map);
    } else {
      trainMarkerRef.current.setLngLat(lngLat);
    }

    if (followMode) {
      map.easeTo({ center: lngLat, zoom: 8, bearing: 0, pitch: 0, duration: 1000 });
    }
  }, [isMapLoaded, status, followMode, route, MarkerClass]);

  // ── Controls ──────────────────────────────────────────────
  const fitFullRoute = () => {
    const map = mapRef.current;
    if (!map || !route?.geometry?.coordinates?.length) return;
    const bbox = turf.bbox(turf.lineString(route.geometry.coordinates)) as [number, number, number, number];
    setFollowMode(false);
    map.fitBounds(bbox, { padding: { top: 50, bottom: 50, left: 40, right: 40 }, duration: 900 });
  };

  const resetNorth = () => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
  };

  const zoomIn  = () => mapRef.current?.zoomIn({ duration: 200 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 200 });

  const toggleFollowMode = () => {
    const next = !followMode;
    setFollowMode(next);
    if (next && status.location && mapRef.current) {
      mapRef.current.easeTo({ center: [status.location.lng, status.location.lat], zoom: 8, bearing: 0, pitch: 0, duration: 800 });
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) mapContainerRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen((v) => !v);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[360px] sm:min-h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl ${
        isDarkMap ? 'border-slate-800 bg-[#0c111d]' : 'border-slate-200 bg-slate-100'
      } ${className || ''}`}
    >
      {/* Map canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full min-h-[360px] sm:min-h-[480px] ${isDarkMap ? 'bg-[#0c111d]' : 'bg-slate-100'}`}
      />

      {/* ── Zoom buttons (top-right column) ───────────────── */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-1.5 sm:gap-2">
        <MapBtn onClick={zoomIn}  title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </MapBtn>
        <MapBtn onClick={zoomOut} title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </MapBtn>
        <div className="h-px bg-white/10 mx-1" />
        <MapBtn onClick={resetNorth} title="Reset North">
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </MapBtn>
        <MapBtn onClick={toggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </MapBtn>
      </div>

      {/* ── Bottom-left action buttons ─────────────────────── */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2">
        {/* Full Route Fit */}
        <button
          onClick={fitFullRoute}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer transition-all duration-150 backdrop-blur-md shadow-lg bg-black/70 border border-white/10 text-white/80 hover:bg-black/90 hover:text-white"
          title="Fit full route"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full Route</span>
        </button>

        {/* Follow Train */}
        <button
          onClick={toggleFollowMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer transition-all duration-150 backdrop-blur-md shadow-lg ${
            followMode
              ? 'bg-sky-500 text-white border border-sky-400 shadow-sky-500/40 ring-1 ring-sky-300'
              : 'bg-black/70 border border-white/10 text-white/80 hover:bg-black/90 hover:text-white'
          }`}
        >
          <Locate className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{followMode ? 'Following' : 'Follow'}</span>
        </button>

        {/* Dark / Light toggle */}
        <button
          onClick={handleToggleMapStyle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer transition-all duration-150 backdrop-blur-md shadow-lg bg-black/70 border border-white/10 text-white/80 hover:bg-black/90 hover:text-white"
          title="Toggle map style"
        >
          {isDarkMap ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
          <span className="hidden sm:inline">{isDarkMap ? 'Light Map' : 'Dark Map'}</span>
        </button>
      </div>

      {/* ── Legend ────────────────────────────────────────── */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 hidden xs:flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-[11px] shadow-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-4 sm:w-5 h-1.5 rounded-full" style={{ background: ROUTE_COLORS.completedCore, boxShadow: `0 0 6px ${ROUTE_COLORS.completedCore}` }} />
          <span className="text-white/70 font-medium">Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 sm:w-5 h-1 rounded-full" style={{ background: ROUTE_COLORS.remainingCore, borderStyle: 'dashed' }} />
          <span className="text-white/50 font-medium">Remaining</span>
        </div>
      </div>

      {/* CSS for train marker ping + pulse */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(244,63,94,0); }
        }
      `}</style>
    </div>
  );
}
