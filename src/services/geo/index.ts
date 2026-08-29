import { NearbyFeature, PoiCategory } from '@/types';
import { getCached, setCache } from '@/lib/cache';
import { CONFIG } from '@/config';
import { TrainService } from '@/services/train';

// ── Haversine Distance Helper ─────────────────────────────
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ── Regional Landmark Catalog ──────────────────────────────
interface KnownLandmark {
  id: string;
  name: string;
  category: PoiCategory;
  description: string;
  lat: number;
  lng: number;
}

const REGIONAL_LANDMARKS: KnownLandmark[] = [
  {
    id: 'chambal-river',
    name: 'Chambal River Bridge',
    category: 'RIVER',
    description: 'Picturesque Chambal River canyon, sanctuary for rare gharial crocodiles & river dolphins.',
    lat: 25.214,
    lng: 75.864,
  },
  {
    id: 'mukundra-hills',
    name: 'Mukundra Hills Tiger Reserve',
    category: 'MOUNTAIN',
    description: 'Vindhyan plateau tiger corridor with dense teak forests and ancient fort ruins.',
    lat: 24.815,
    lng: 75.922,
  },
  {
    id: 'darrah-pass',
    name: 'Darrah Pass Rail Tunnel',
    category: 'TUNNEL',
    description: 'Historic mountain railway pass connecting the Aravalli and Vindhya mountain ranges.',
    lat: 24.901,
    lng: 75.981,
  },
  {
    id: 'bhojtal-lake',
    name: 'Upper Lake (Bhojtal)',
    category: 'LAKE',
    description: 'Asia’s oldest man-made lake built by Raja Bhoj in 11th century, wetland bird habitat.',
    lat: 23.233,
    lng: 77.362,
  },
  {
    id: 'sanchi-stupa',
    name: 'Sanchi Stupa Complex',
    category: 'MONUMENT',
    description: 'UNESCO World Heritage Great Stupa dating to 3rd century BCE built by Emperor Ashoka.',
    lat: 23.479,
    lng: 77.74,
  },
  {
    id: 'ganga-river-varanasi',
    name: 'Ganga River Viaduct',
    category: 'BRIDGE',
    description: 'Iconic railway bridge spanning the sacred River Ganges near ancient Ghats of Kashi.',
    lat: 25.317,
    lng: 83.01,
  },
  {
    id: 'yamuna-expressway-bridge',
    name: 'Yamuna River Rail Bridge',
    category: 'BRIDGE',
    description: 'Major railway crossing over the Yamuna floodplain between Agra and Mathura.',
    lat: 27.18,
    lng: 78.02,
  },
  {
    id: 'tapi-river-surat',
    name: 'Tapi River Crossing',
    category: 'RIVER',
    description: 'Historic river crossing feeding the western industrial diamond and silk corridor.',
    lat: 21.198,
    lng: 72.831,
  },
  {
    id: 'borivali-national-park',
    name: 'Sanjay Gandhi National Park',
    category: 'CITY',
    description: 'Protected forest reserve nestled inside Mumbai metropolis with 2,000-year-old Kanheri Caves.',
    lat: 19.23,
    lng: 72.86,
  },
];

export class GeoService {
  static async getNearbyFeatures(journeyId: string): Promise<NearbyFeature[]> {
    const cacheKey = `nearby:${journeyId}`;
    const cached = getCached<NearbyFeature[]>(cacheKey);
    if (cached) return cached;

    try {
      // 1. Fetch live journey status to get current train telemetry location
      const status = await TrainService.getJourneyStatus(journeyId);
      const trainLat = status.location?.lat || status.currentStation?.station.latitude || 25.2138;
      const trainLng = status.location?.lng || status.currentStation?.station.longitude || 75.8648;

      const results: NearbyFeature[] = [];

      // 2. Query MapTiler Geocoding API if key available for real place reverse geocoding
      const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      if (maptilerKey) {
        try {
          const res = await fetch(
            `https://api.maptiler.com/geocoding/${trainLng},${trainLat}.json?key=${maptilerKey}`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const json = await res.json();
            const features = json.features || [];
            for (const f of features.slice(0, 2)) {
              if (f.text && f.place_name) {
                const fLat = f.center?.[1] || trainLat;
                const fLng = f.center?.[0] || trainLng;
                const dist = haversineDistanceKm(trainLat, trainLng, fLat, fLng);
                const isRiver = f.categories?.includes('river') || f.text.toLowerCase().includes('river');
                const isLake = f.categories?.includes('lake') || f.text.toLowerCase().includes('lake');
                results.push({
                  id: `mt-${f.id || Math.random()}`,
                  name: `${f.text} ${isRiver ? 'River' : isLake ? 'Lake' : 'Region'}`,
                  category: isRiver ? 'RIVER' : isLake ? 'LAKE' : 'ATTRACTION',
                  distanceFromTrainKm: Math.max(0.5, dist),
                  description: `Geographic feature along journey near ${f.place_name.split(',')[0]}.`,
                  latitude: fLat,
                  longitude: fLng,
                });
              }
            }
          }
        } catch (maptilerErr) {
          console.warn('MapTiler POI lookup warning:', maptilerErr);
        }
      }

      // 3. Compute distance to known regional landmarks and pick nearest 3
      const mappedLandmarks: NearbyFeature[] = REGIONAL_LANDMARKS.map((lm) => {
        const dist = haversineDistanceKm(trainLat, trainLng, lm.lat, lm.lng);
        return {
          id: lm.id,
          name: lm.name,
          category: lm.category,
          distanceFromTrainKm: dist,
          description: lm.description,
          latitude: lm.lat,
          longitude: lm.lng,
        };
      })
        .sort((a, b) => a.distanceFromTrainKm - b.distanceFromTrainKm)
        .slice(0, 3);

      // 4. Combine and deduplicate
      const combined = [...results, ...mappedLandmarks];
      const uniqueMap = new Map<string, NearbyFeature>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.name)) uniqueMap.set(item.name, item);
      });

      const finalFeatures = Array.from(uniqueMap.values())
        .sort((a, b) => a.distanceFromTrainKm - b.distanceFromTrainKm)
        .slice(0, 3);

      setCache(cacheKey, finalFeatures, CONFIG.cacheTTLs.poiSec);
      return finalFeatures;
    } catch (err) {
      console.warn('GeoService getNearbyFeatures error, returning catalog defaults:', err);
      const defaults: NearbyFeature[] = REGIONAL_LANDMARKS.slice(0, 3).map((lm) => ({
        id: lm.id,
        name: lm.name,
        category: lm.category,
        distanceFromTrainKm: 4.2,
        description: lm.description,
        latitude: lm.lat,
        longitude: lm.lng,
      }));
      setCache(cacheKey, defaults, CONFIG.cacheTTLs.poiSec);
      return defaults;
    }
  }
}
