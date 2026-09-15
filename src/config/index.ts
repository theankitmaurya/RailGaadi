const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || 'j8D5JpK5enH8AyhkYfom';

// MapTiler Dataviz Dark (Official clean dark tiles with MapTiler API Key - 0 watermarks)
export const DARK_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'maptiler-dark': {
      type: 'raster' as const,
      tiles: [
        `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`,
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'maptiler-dark-layer',
      type: 'raster' as const,
      source: 'maptiler-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// MapTiler Dataviz Light (Official clean light tiles for light mode - 0 watermarks)
export const LIGHT_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'maptiler-light': {
      type: 'raster' as const,
      tiles: [
        `https://api.maptiler.com/maps/dataviz-light/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`,
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'maptiler-light-layer',
      type: 'raster' as const,
      source: 'maptiler-light',
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
    maptilerKey: MAPTILER_KEY,
    styleUrl: DARK_MAP_STYLE,
    defaultCenter: [78.9629, 20.5937] as [number, number],
    defaultZoom: 5,
  },
};
