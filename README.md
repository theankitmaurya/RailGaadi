# 🚆 RailGaadi — Railway Intelligence & Journey Tracking Platform

> **Modern, data-rich railway intelligence platform designed for Indian Railways.** Live train telemetry tracking, interactive GIS map cartography, elevation profiles, station weather, dynamic travel companion highlights, and shareable journey links.

---

## 🌟 Key Features

- **🚆 Real-time Live Train Tracking**: Powered by the **RailRadar Enterprise API** — live train location telemetry, delay tracking in minutes, running speed (km/h), platform numbers, and station departure boards.
- **🗺️ Immersive Map Cartography**: Built with **MapLibre GL JS** and **CartoDB Dark/Light Matter** basemaps. Features triple-layer glow vectors for covered routes, dashed remaining paths, pulsing train markers, and custom zoom & reset-north controls.
- **⭐ Saved Trains & Recent Searches**: Quick-access starred trains and search history stored locally via `localStorage` with real-time UI synchronization.
- **🌔 Dual Theme System (Light & Dark Mode)**: Comprehensive CSS token system supporting smooth transitions between Premium White and Dark Cartography modes.
- **🏞️ Smart Travel Companion**: Dynamically discovers real rivers, mountain passes, wildlife reserves, bridges, and monuments within proximity of the train using **MapTiler Geocoding** and **Turf.js** spatial distance calculations.
- **📊 Journey Analytics**:
  - **Elevation Profiles**: Route elevation charts rendering peak altitudes along the track.
  - **Station Weather**: Live temperature, condition icons, humidity, wind speeds, and route-wide weather forecasts via **OpenWeather API**.
- **📱 100% Mobile & Tablet Responsive**: Optimized layout reflowing smoothly across all screen sizes from mobile phones to high-res desktop monitors.
- **🔗 Live Journey Sharing**: Generates shareable journey tokens with safety fallbacks for HTTP and restricted browser contexts.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Vanilla CSS Custom Properties, Glassmorphism |
| **Map & GIS** | MapLibre GL JS, Turf.js, CartoDB Tiles, MapTiler Geocoding |
| **Data Fetching** | TanStack React Query v5 |
| **Icons** | Lucide React |

---

## ⚙️ Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# MapTiler API Key (Geocoding & basemaps)
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here

# OpenWeather API Key (Station weather snapshots)
OPENWEATHER_API_KEY=your_openweather_key_here

# RailRadar API Key (Real-time Indian Railways tracking API)
RAILRADAR_API_KEY=your_railradar_key_here
```

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js 18+ and `npm` installed.

### 2. Installation

```bash
git clone https://github.com/your-username/railgaadi.git
cd railgaadi
npm install
```

### 3. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production

```bash
npm run build
npm run start
```

---

## 📂 Project Architecture

```
railgaadi/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/                # REST endpoints (/trains, /journeys, /shared)
│   │   ├── journey/[trainId]/  # Live journey tracking dashboard
│   │   ├── globals.css         # RailGaadi design system & theme tokens
│   │   ├── layout.tsx          # Root layout with Theme & Query providers
│   │   └── page.tsx            # Home page with hero, search, recents, & flagship trains
│   ├── components/
│   │   ├── analytics/          # ElevationChart, MetricCards
│   │   ├── layout/             # Header, Navigation
│   │   ├── map/                # JourneyMap (MapLibre GL integration)
│   │   ├── nearby/             # NearbyPlaces (Smart Travel Companion)
│   │   ├── providers/          # ThemeProvider & QueryProvider
│   │   ├── search/             # SearchInput, SearchCommand, RecentSearches, FavouriteTrains
│   │   ├── timeline/           # StationTimeline
│   │   ├── train/              # TrainHeader, JourneyProgress, CurrentStationCard, NextStationCard, ShareModal
│   │   ├── ui/                 # Reusable UI primitives (Button, Card, Modal, Badge)
│   │   └── weather/            # WeatherCard
│   ├── config/                 # Map styles, app constants, & cache TTLs
│   ├── hooks/                  # Custom React hooks (useJourneyStatus, useTrainRoute, useLocalStorage, useTheme)
│   ├── lib/                    # Geo math (Haversine), formatting, & cache utilities
│   ├── providers/              # RailRadar API provider & Mock fallbacks
│   ├── services/               # Train, Weather, & Geo services
│   └── types/                  # TypeScript interfaces & domain models
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/trains/search?q={query}` | Search trains by number or name |
| `GET` | `/api/trains/{trainId}/status` | Live train location, delay, & station status |
| `GET` | `/api/trains/{trainId}/route` | GeoJSON track geometry & station list |
| `GET` | `/api/journeys/{journeyId}/weather` | Weather snapshot along train route |
| `GET` | `/api/journeys/{journeyId}/elevation` | Route elevation profile points |
| `GET` | `/api/journeys/{journeyId}/nearby` | Nearby geographic highlights & landmarks |
| `POST`| `/api/journeys/share` | Generate shareable journey token link |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
