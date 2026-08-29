// Dark tile style – CartoDB Dark Matter (no API key needed)
// Bright electric-cyan completed route, muted grey remaining route
export const DARK_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Light tile style – CartoDB Positron (clean light for light mode)
export const LIGHT_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-light': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster' as const,
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const CONFIG = {
  appName: 'RailGaadi',
  appDescription: 'Modern Railway Intelligence & Journey Tracking Platform',
  version: '1.0.0',
  api: {
    searchDebounceMs: 300,
    statusPollIntervalMs: 30000,
    staleDataThresholdMs: 300000,
  },
  cacheTTLs: {
    trainSearchSec: 600,
    routeSec: 86400,
    weatherSec: 900,
    elevationSec: 86400 * 7,
    poiSec: 86400,
  },
  map: {
    maptilerKey: process.env.NEXT_PUBLIC_MAPTILER_KEY || '',
    styleUrl: DARK_MAP_STYLE,
    defaultCenter: [78.9629, 20.5937] as [number, number],
    defaultZoom: 5,
  },
};
