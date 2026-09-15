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

// ── Pan-India Rail Corridor Landmark Catalog ───────────────
interface RailLandmark {
  id: string;
  name: string;
  category: PoiCategory;
  description: string;
  lat: number;
  lng: number;
  nearStations: string[];
}

const RAIL_LANDMARKS: RailLandmark[] = [
  // ── Western Trunk Corridor (Mumbai – Surat – Vadodara – Ratlam – Kota – Delhi)
  {
    id: 'sanjay-gandhi-np',
    name: 'Sanjay Gandhi National Park',
    category: 'CITY',
    description: 'Protected teak forest nestled inside Mumbai with 2,000-year-old Buddhist Kanheri Caves.',
    lat: 19.22,
    lng: 72.86,
    nearStations: ['MMCT', 'BVI', 'BDTS', 'DR'],
  },
  {
    id: 'vaitarna-river',
    name: 'Vaitarna River Estuary',
    category: 'RIVER',
    description: 'Expansive coastal tidal estuary bridge crossing along the Arabian Sea coastline.',
    lat: 19.52,
    lng: 72.85,
    nearStations: ['VR', 'PLG', 'DRD', 'BVI'],
  },
  {
    id: 'tapi-river-surat',
    name: 'Tapi River Crossing',
    category: 'RIVER',
    description: 'Historic river crossing feeding the western industrial diamond and textile corridor near Surat.',
    lat: 21.198,
    lng: 72.831,
    nearStations: ['ST', 'UDN', 'NVS'],
  },
  {
    id: 'narmada-river',
    name: 'Narmada River Rail Viaduct',
    category: 'BRIDGE',
    description: 'Iconic double-track bridge spanning the sacred Narmada river between Bharuch and Ankleshwar.',
    lat: 21.71,
    lng: 72.99,
    nearStations: ['BH', 'AKV', 'BRC'],
  },
  {
    id: 'mahi-river',
    name: 'Mahi River Rail Bridge',
    category: 'BRIDGE',
    description: 'Scenic river bridge crossing the deep gorge of River Mahi between Vadodara and Anand.',
    lat: 22.48,
    lng: 73.08,
    nearStations: ['BRC', 'ANND'],
  },
  {
    id: 'sabarmati-river',
    name: 'Sabarmati Riverfront Bridge',
    category: 'RIVER',
    description: 'Historic rail bridge over the Sabarmati river leading to Ahmedabad Junction.',
    lat: 23.03,
    lng: 72.58,
    nearStations: ['ADI', 'SBT'],
  },
  {
    id: 'darrah-pass',
    name: 'Mukundra Hills & Darrah Pass',
    category: 'MOUNTAIN',
    description: 'Vindhyan tiger reserve corridor and mountain rail pass connecting Rajasthan to Malwa plateau.',
    lat: 24.815,
    lng: 75.922,
    nearStations: ['KOTA', 'RMA', 'BWM'],
  },
  {
    id: 'chambal-river',
    name: 'Chambal River Bridge',
    category: 'RIVER',
    description: 'Picturesque Chambal River canyon, sanctuary for rare gharial crocodiles & river dolphins near Kota.',
    lat: 25.214,
    lng: 75.864,
    nearStations: ['KOTA', 'GGC', 'SWM'],
  },
  {
    id: 'ranthambore-corridor',
    name: 'Ranthambore Tiger Corridor',
    category: 'ATTRACTION',
    description: 'Historic Aravalli-Vindhya forested rail corridor flanking the renowned tiger reserve.',
    lat: 26.01,
    lng: 76.35,
    nearStations: ['SWM', 'GGC'],
  },
  {
    id: 'yamuna-mathura',
    name: 'Yamuna River Rail Crossing',
    category: 'BRIDGE',
    description: 'Major railway crossing over the Yamuna floodplain connecting the sacred lands of Braj Bhoomi.',
    lat: 27.49,
    lng: 77.68,
    nearStations: ['MTJ', 'AGC', 'FDB'],
  },

  // ── Northern & Gangetic Corridor (Delhi – Kanpur – Prayagraj – Varanasi – Patna – Howrah)
  {
    id: 'yamuna-delhi',
    name: 'Yamuna River Bridge (Old Delhi)',
    category: 'BRIDGE',
    description: 'Historic double-deck steel truss bridge spanning the Yamuna river connecting Delhi to northern plains.',
    lat: 28.66,
    lng: 77.24,
    nearStations: ['NDLS', 'DLI', 'GZB', 'NZM'],
  },
  {
    id: 'ganga-kanpur',
    name: 'Ganga River Rail Bridge (Kanpur)',
    category: 'BRIDGE',
    description: 'Major double-track rail crossing over the holy River Ganges connecting Kanpur Central.',
    lat: 26.48,
    lng: 80.35,
    nearStations: ['CNB', 'CPB', 'ON'],
  },
  {
    id: 'sangam-prayagraj',
    name: 'Triveni Sangam & Curzon Rail Bridge',
    category: 'RIVER',
    description: 'Sacred confluence of Ganga, Yamuna & Saraswati with the monumental Curzon Rail Bridge at Prayagraj.',
    lat: 25.43,
    lng: 81.85,
    nearStations: ['PRYJ', 'NYN', 'SJT', 'ALD'],
  },
  {
    id: 'ganga-varanasi',
    name: 'Ganga Rail Viaduct (Malviya Bridge)',
    category: 'BRIDGE',
    description: 'Iconic double-deck rail bridge spanning River Ganges overlooking the ancient ghats of Kashi.',
    lat: 25.32,
    lng: 83.03,
    nearStations: ['BSB', 'DDU', 'BCY'],
  },
  {
    id: 'vindhya-chandauli',
    name: 'Chandraprabha & Vindhyan Range',
    category: 'MOUNTAIN',
    description: 'Scenic rocky foothills of Vindhya range traversed by the Grand Chord railway line.',
    lat: 25.04,
    lng: 83.21,
    nearStations: ['DDU', 'MZP', 'CAR'],
  },
  {
    id: 'son-river',
    name: 'Son River Rail Bridge',
    category: 'BRIDGE',
    description: 'Among the longest railway bridges in India (3.06 km) across the wide sandy Son riverbed.',
    lat: 24.91,
    lng: 84.18,
    nearStations: ['DOS', 'SSM', 'GAYA'],
  },
  {
    id: 'digha-patna-bridge',
    name: 'Digha–Sonpur Ganga Rail Bridge',
    category: 'BRIDGE',
    description: 'Monumental 4.5 km rail-cum-road bridge across the River Ganges linking Patna to northern Bihar.',
    lat: 25.65,
    lng: 85.11,
    nearStations: ['PNBE', 'PPTA', 'SEE', 'HJP'],
  },
  {
    id: 'parasnath-hills',
    name: 'Parasnath (Shikharji) Range',
    category: 'MOUNTAIN',
    description: 'Highest mountain peak in Jharkhand (1,365m), prominent scenic mountain along the Grand Chord line.',
    lat: 23.96,
    lng: 86.13,
    nearStations: ['PNME', 'GMO', 'DHN'],
  },
  {
    id: 'damodar-valley',
    name: 'Damodar River Industrial Valley',
    category: 'RIVER',
    description: 'Lifeline river of the eastern mineral heartland passing Durgapur steel city and Asansol coal belt.',
    lat: 23.51,
    lng: 87.29,
    nearStations: ['ASN', 'DGR', 'BWN'],
  },
  {
    id: 'hooghly-river',
    name: 'Hooghly River & Howrah Bridge',
    category: 'RIVER',
    description: 'The legendary river distributary of Ganges flowing past Kolkata and Howrah terminus.',
    lat: 22.58,
    lng: 88.35,
    nearStations: ['HWH', 'SDAH', 'KOAA'],
  },

  // ── Central & Southern Corridor (Delhi – Agra – Gwalior – Jhansi – Bhopal – Nagpur – Chennai / Bengaluru)
  {
    id: 'taj-yamuna-view',
    name: 'Yamuna River & Taj Heritage View',
    category: 'MONUMENT',
    description: 'Scenic rail approach to Agra Cantt crossing the Yamuna river floodplain near the Taj Mahal.',
    lat: 27.18,
    lng: 78.02,
    nearStations: ['AGC', 'AF', 'MTJ'],
  },
  {
    id: 'gwalior-fort-ridge',
    name: 'Gwalior Gopachal Hill Ridge',
    category: 'MONUMENT',
    description: 'Imposing 100m high sandstone fortress ridge dominating the Central Railway corridor.',
    lat: 26.23,
    lng: 78.17,
    nearStations: ['GWL'],
  },
  {
    id: 'betwa-river',
    name: 'Betwa River Rail Bridge',
    category: 'RIVER',
    description: 'Picturesque rocky river crossing near historic Orchha palaces and Jhansi railway junction.',
    lat: 25.45,
    lng: 78.58,
    nearStations: ['VGLJ', 'ORC', 'BAB'],
  },
  {
    id: 'bhojtal-bhopal',
    name: 'Upper Lake (Bhojtal) & Vindhyan Ridge',
    category: 'LAKE',
    description: 'Asia’s oldest man-made lake built in 11th century, wetland bird habitat at the gateway to Bhopal.',
    lat: 23.233,
    lng: 77.362,
    nearStations: ['BPL', 'RKMP', 'HBJ'],
  },
  {
    id: 'narmada-hoshangabad',
    name: 'Narmada River Crossing (Narmadapuram)',
    category: 'RIVER',
    description: 'Revered river crossing flanked by Vindhya and Satpura mountain ranges near Itarsi Junction.',
    lat: 22.75,
    lng: 77.72,
    nearStations: ['ET', 'NDPM', 'HBD'],
  },
  {
    id: 'satpura-ghats',
    name: 'Satpura Mountain Ghat Section',
    category: 'MOUNTAIN',
    description: 'Dramatic mountain railway incline with sharp curves and rock cuttings across the Satpura range.',
    lat: 21.89,
    lng: 77.92,
    nearStations: ['ET', 'BZU', 'AMLA'],
  },
  {
    id: 'pench-corridor',
    name: 'Pench & Tadoba Forest Belt',
    category: 'ATTRACTION',
    description: 'Dense teak forest reserve corridor connecting central India’s celebrated tiger reserves.',
    lat: 20.91,
    lng: 79.15,
    nearStations: ['NGP', 'WR', 'BPQ'],
  },
  {
    id: 'godavari-bridge',
    name: 'Godavari Arch Rail Bridge',
    category: 'BRIDGE',
    description: 'Famous 2.7 km bowstring-girder railway arch bridge across the majestic Godavari river.',
    lat: 17.01,
    lng: 81.77,
    nearStations: ['RJY', 'BZA', 'EE'],
  },
  {
    id: 'krishna-river',
    name: 'Krishna River Rail Bridge',
    category: 'BRIDGE',
    description: 'Major railway crossing over the sacred Krishna river at Vijayawada Junction with view of Kanaka Durga hill.',
    lat: 16.51,
    lng: 80.62,
    nearStations: ['BZA', 'GNT'],
  },
  {
    id: 'pulicat-lake',
    name: 'Pulicat Lake & Bird Sanctuary',
    category: 'LAKE',
    description: 'Second largest brackish water lagoon in India, flamingo wintering wetland flanking the eastern railway line.',
    lat: 13.62,
    lng: 80.12,
    nearStations: ['SPE', 'GDR', 'MAS'],
  },

  // ── Southern Corridor (Bengaluru – Chennai – Kerala – Tamil Nadu)
  {
    id: 'palar-river',
    name: 'Palar River Valley & Javadi Hills',
    category: 'RIVER',
    description: 'Ancient river valley flanked by the Eastern Ghats connecting Jolarpettai and Katpadi (Vellore).',
    lat: 12.92,
    lng: 79.13,
    nearStations: ['KPD', 'JTJ', 'AJJ', 'MAS'],
  },
  {
    id: 'coimbatore-gap',
    name: 'Western Ghats Palakkad Gap',
    category: 'MOUNTAIN',
    description: 'Major low mountain pass (30 km wide) in the Western Ghats connecting Tamil Nadu plains with lush Kerala.',
    lat: 10.79,
    lng: 76.65,
    nearStations: ['CBE', 'PGT', 'TUP'],
  },
  {
    id: 'periyar-river',
    name: 'Periyar River Rail Crossing',
    category: 'RIVER',
    description: 'Longest river in Kerala, scenic tropical crossing near Aluva and Kochi gateway.',
    lat: 10.11,
    lng: 76.35,
    nearStations: ['AWY', 'ERN', 'ERS'],
  },
  {
    id: 'vembanad-lake',
    name: 'Vembanad Backwaters Rail Bridge',
    category: 'LAKE',
    description: 'India’s longest railway bridge (4.62 km) built across the tranquil Vembanad lagoon at Kochi.',
    lat: 9.98,
    lng: 76.26,
    nearStations: ['ERS', 'ERN', 'ALLP'],
  },
  {
    id: 'cauvery-river',
    name: 'Kaveri (Cauvery) River Viaduct',
    category: 'RIVER',
    description: 'Sacred river delta crossing near Srirangam island and Tiruchirappalli Rock Fort.',
    lat: 10.86,
    lng: 78.69,
    nearStations: ['TPJ', 'ED', 'KRR'],
  },
  {
    id: 'pamban-bridge',
    name: 'Pamban Ocean Rail Bridge',
    category: 'BRIDGE',
    description: 'India’s most famous sea bridge (2.06 km) with a Scherzer rolling lift cantilever span across Palk Strait.',
    lat: 9.28,
    lng: 79.21,
    nearStations: ['RMD', 'MMM', 'RMM'],
  },

  // ── Konkan Railway Corridor (Mumbai – Goa – Mangaluru)
  {
    id: 'khandala-bhor-ghat',
    name: 'Bhor Ghat Mountain Incline',
    category: 'GHAT',
    description: 'Dramatic mountain pass cutting through the Sahyadri range with steep grades, viaducts, and waterfalls.',
    lat: 18.76,
    lng: 73.37,
    nearStations: ['KJT', 'LNL', 'PUNE'],
  },
  {
    id: 'panval-viaduct',
    name: 'Panval Nadi Rail Viaduct',
    category: 'BRIDGE',
    description: 'Tallest railway viaduct in India (64m high) spanning a lush valley near Ratnagiri.',
    lat: 16.98,
    lng: 73.32,
    nearStations: ['RN', 'CHI', 'KUDL'],
  },
  {
    id: 'karbude-tunnel',
    name: 'Karbude Rail Tunnel',
    category: 'TUNNEL',
    description: 'Longest rail tunnel on the Konkan Railway (6.5 km) piercing the granite core of the Western Ghats.',
    lat: 17.15,
    lng: 73.36,
    nearStations: ['RN', 'CHI'],
  },
  {
    id: 'dudhsagar-falls',
    name: 'Dudhsagar Falls & Braganza Ghats',
    category: 'ATTRACTION',
    description: 'Spectacular 310m four-tiered white waterfall cascading beneath the mountain railway arches.',
    lat: 15.31,
    lng: 74.31,
    nearStations: ['MAO', 'QLM', 'CLR'],
  },
  {
    id: 'sharavati-bridge',
    name: 'Sharavati River Ocean Estuary Bridge',
    category: 'BRIDGE',
    description: 'Panoramic 2.06 km rail bridge crossing the Arabian Sea estuary at Honnavar, Karnataka.',
    lat: 14.28,
    lng: 74.45,
    nearStations: ['HNA', 'KT', 'BTJL'],
  },

  // ── Himalayan & North-Western Corridor (Punjab – Haryana – J&K – Uttarakhand)
  {
    id: 'beas-river',
    name: 'Beas River Rail Bridge',
    category: 'RIVER',
    description: 'Glacial Himalayan river crossing connecting Jalandhar and the holy city of Amritsar.',
    lat: 31.51,
    lng: 75.31,
    nearStations: ['BEAS', 'ASR', 'JUC'],
  },
  {
    id: 'sutlej-river',
    name: 'Sutlej River Viaduct',
    category: 'BRIDGE',
    description: 'Historic railway bridge over the Sutlej river connecting Ludhiana and Phillaur in Punjab.',
    lat: 30.99,
    lng: 75.82,
    nearStations: ['LDH', 'PHR', 'UMB'],
  },
  {
    id: 'shivalik-kalka',
    name: 'Shivalik Foothills & Valley View',
    category: 'MOUNTAIN',
    description: 'Picturesque pine-forested foothills of the Himalayas at the gateway to Kalka and Shimla.',
    lat: 30.83,
    lng: 76.93,
    nearStations: ['KLK', 'CDG', 'UMB'],
  },
  {
    id: 'ganga-haridwar',
    name: 'Ganga Canal & Shivalik Gateway',
    category: 'RIVER',
    description: 'Sacred Himalayan river emergence along the foothills into the pilgrimage city of Haridwar.',
    lat: 29.95,
    lng: 78.16,
    nearStations: ['HW', 'RK', 'DDN'],
  },
  {
    id: 'chenab-bridge',
    name: 'Chenab Rail Arch Bridge',
    category: 'BRIDGE',
    description: 'World’s highest railway arch bridge (359m above riverbed) spanning the rugged Chenab gorge in J&K.',
    lat: 33.15,
    lng: 74.88,
    nearStations: ['JAT', 'SVDK', 'UHP'],
  },
  {
    id: 'pir-panjal-tunnel',
    name: 'Pir Panjal Railway Tunnel (T-80)',
    category: 'TUNNEL',
    description: 'India’s longest transportation railway tunnel (11.2 km) boring through the Pir Panjal mountain range.',
    lat: 33.52,
    lng: 75.19,
    nearStations: ['BAHL', 'QG', 'SINA'],
  },

  // ── Eastern & North-Eastern Corridor (Odisha – Assam – Bengal)
  {
    id: 'mahanadi-river',
    name: 'Mahanadi Rail Bridge',
    category: 'BRIDGE',
    description: 'Imposing 2.1 km railway bridge spanning the mighty Mahanadi river near Cuttack and Bhubaneswar.',
    lat: 20.52,
    lng: 85.89,
    nearStations: ['CTC', 'BBS'],
  },
  {
    id: 'chilika-lake',
    name: 'Chilika Lake Scenic Shoreline',
    category: 'LAKE',
    description: 'Breathtaking coastal rail section tracing the blue waters and migratory bird colonies of Chilika lagoon.',
    lat: 19.53,
    lng: 85.18,
    nearStations: ['BALU', 'RBA', 'BAM'],
  },
  {
    id: 'saraighat-brahmaputra',
    name: 'Saraighat Bridge (Brahmaputra)',
    category: 'BRIDGE',
    description: 'First rail-cum-road bridge constructed over the massive Brahmaputra river at Guwahati gateway.',
    lat: 26.13,
    lng: 91.68,
    nearStations: ['GHY', 'KYQ', 'RNY'],
  },
  {
    id: 'bogibeel-bridge',
    name: 'Bogibeel Rail-cum-Road Bridge',
    category: 'BRIDGE',
    description: 'Longest combined rail and road bridge in India (4.94 km) across the fierce Brahmaputra in Assam.',
    lat: 27.41,
    lng: 94.81,
    nearStations: ['DBRG', 'DMV', 'TSK'],
  },
  {
    id: 'kaziranga-belt',
    name: 'Kaziranga Forest & Mikir Hills',
    category: 'ATTRACTION',
    description: 'World-famous one-horned rhino sanctuary corridor flanked by the Mikir Hills along the Assam trunk line.',
    lat: 26.57,
    lng: 93.17,
    nearStations: ['FKG', 'JTTN', 'LMG'],
  },
];

export class GeoService {
  static async getNearbyFeatures(journeyId: string): Promise<NearbyFeature[]> {
    const cacheKey = `nearby:v3:${journeyId}`;
    const cached = getCached<NearbyFeature[]>(cacheKey);
    if (cached) return cached;

    try {
      // 1. Fetch live journey status & full route stations in parallel
      const [status, route] = await Promise.all([
        TrainService.getJourneyStatus(journeyId),
        TrainService.getRoute(journeyId),
      ]);

      // 2. Determine accurate real-time train telemetry position
      let trainLat = status.location?.lat;
      let trainLng = status.location?.lng;

      if (!trainLat || !trainLng) {
        trainLat = status.currentStation?.station.latitude;
        trainLng = status.currentStation?.station.longitude;
      }

      if ((!trainLat || !trainLng) && route.stations?.length) {
        const currentOrNext =
          route.stations.find((s) => s.status === 'CURRENT') ||
          route.stations.find((s) => s.status === 'UPCOMING') ||
          route.stations[0];
        if (currentOrNext?.station.latitude && currentOrNext?.station.longitude) {
          trainLat = currentOrNext.station.latitude;
          trainLng = currentOrNext.station.longitude;
        }
      }

      if ((!trainLat || !trainLng) && route.geometry?.coordinates?.length) {
        const coords = route.geometry.coordinates;
        const pct = Math.max(0, Math.min(1, (status.progress?.percentage || 0) / 100));
        const idx = Math.min(coords.length - 1, Math.floor(pct * coords.length));
        trainLng = coords[idx][0];
        trainLat = coords[idx][1];
      }

      // Safe fallback coordinates (Delhi if completely unavailable)
      const lat = trainLat && trainLat > 0 ? trainLat : 28.6139;
      const lng = trainLng && trainLng > 0 ? trainLng : 77.209;

      // 3. Extract all stations along this train's actual route
      const routeStations = route.stations || [];
      const routeStationCodes = new Set(routeStations.map((s) => s.station.code.toUpperCase()));

      // 4. Find all landmarks strictly associated with this train's route
      const matchedLandmarks = RAIL_LANDMARKS.filter((lm) => {
        // A: Explicit station match on route
        const hasCodeMatch = lm.nearStations.some((code) => routeStationCodes.has(code));
        if (hasCodeMatch) return true;

        // B: Geographically close to any station on this train's route (within 45 km)
        return routeStations.some(
          (st) =>
            st.station.latitude > 0 &&
            haversineDistanceKm(st.station.latitude, st.station.longitude, lm.lat, lm.lng) <= 45
        );
      });

      // 5. If specific landmarks matched this route, sort by distance from train's live location
      let candidateFeatures: NearbyFeature[] = [];

      if (matchedLandmarks.length > 0) {
        candidateFeatures = matchedLandmarks.map((lm) => {
          const dist = haversineDistanceKm(lat, lng, lm.lat, lm.lng);
          return {
            id: lm.id,
            name: lm.name,
            category: lm.category,
            distanceFromTrainKm: Math.round(Math.max(1, dist)),
            description: lm.description,
            latitude: lm.lat,
            longitude: lm.lng,
          };
        });
      } else {
        // Fallback: Dynamically generate highlights from key junction stations on this route
        const keyStops = routeStations.filter((s) => s.station.latitude > 0).slice(0, 5);
        candidateFeatures = keyStops.map((s) => {
          const dist = haversineDistanceKm(lat, lng, s.station.latitude, s.station.longitude);
          return {
            id: `stn-${s.station.code}`,
            name: `${s.station.name} Rail Corridor`,
            category: 'CITY' as PoiCategory,
            distanceFromTrainKm: Math.round(Math.max(1, dist)),
            description: `Scenic railway division connecting ${s.station.name} along your scheduled journey.`,
            latitude: s.station.latitude,
            longitude: s.station.longitude,
          };
        });
      }

      // Sort by proximity to current train location
      const sorted = candidateFeatures
        .sort((a, b) => a.distanceFromTrainKm - b.distanceFromTrainKm)
        .slice(0, 3);

      setCache(cacheKey, sorted, 60); // 1 minute cache for live telemetry updates
      return sorted;
    } catch (err) {
      console.warn('GeoService getNearbyFeatures error, returning safe defaults:', err);
      const defaults: NearbyFeature[] = RAIL_LANDMARKS.slice(0, 3).map((lm) => ({
        id: lm.id,
        name: lm.name,
        category: lm.category,
        distanceFromTrainKm: 5.0,
        description: lm.description,
        latitude: lm.lat,
        longitude: lm.lng,
      }));
      return defaults;
    }
  }
}

