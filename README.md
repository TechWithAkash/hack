<div align="center">

<br />

```
  ██████╗ ██████╗ ███████╗███╗   ███╗███████╗ ██████╗ ███╗   ██╗
 ██╔════╝██╔═══██╗██╔════╝████╗ ████║██╔════╝██╔═══██╗████╗  ██║
 ██║     ██║   ██║███████╗██╔████╔██║█████╗  ██║   ██║██╔██╗ ██║
 ██║     ██║   ██║╚════██║██║╚██╔╝██║██╔══╝  ██║   ██║██║╚██╗██║
 ╚██████╗╚██████╔╝███████║██║ ╚═╝ ██║███████╗╚██████╔╝██║ ╚████║
  ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
```

### **Satellite Data → Insight Engine → Climate Risk**

*"We don't just show you a map. We tell you exactly who is at risk, how much land is lost, and what the financial impact will be — all powered by the eye in the sky."*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://earthengine.google.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/CyberJarvis/Refactor_PS06/pulls)
[![Build Status](https://img.shields.io/badge/Build-Passing-22C55E?style=flat-square)](https://github.com/CyberJarvis/Refactor_PS06)
[![Problem Statement](https://img.shields.io/badge/PS--06-Climate_Risk_Intelligence-0D7377?style=flat-square)]()

</div>

---

## 🌍 What is COSMEON?

**COSMEON** is a full-stack **Climate Risk Intelligence Engine** built for **HackX 4.0 — Problem Statement PS-06**.

It addresses a critical gap in disaster management: Earth observation satellites generate **terabytes of raw imagery every day**, yet most of this data remains **inaccessible** to the people who need it most — governments, insurers, urban planners, and aid organizations.

COSMEON closes this gap by building an **automated pipeline** that transforms open satellite data (Sentinel-1 SAR, Sentinel-2 Optical, Landsat-8/9) into **structured, decision-ready climate risk insights** — complete with real-time dashboards, population exposure maps, confidence scores, and auto-generated PDF reports.

> **Zero mock data. Zero guesswork. 100% satellite truth.**

---

## 🚀 Live Demo & Features

### ✅ PS-06 Requirement Coverage

| Requirement | Status | Implementation |
|---|---|---|
| Satellite data ingestion (S1/S2/Landsat) | ✅ Complete | `cosmeon/pipeline/` + GEE API |
| Automated flood detection | ✅ Complete | VV-backscatter + NDWI thresholding |
| Change detection (pre/post event) | ✅ Complete | `detection.py` — temporal baseline comparison |
| Structured output (area stats, risk labels) | ✅ Complete | MongoDB + `/api/insights` endpoints |
| State table with timestamps & regions | ✅ Complete | `FloodEvent` schema in MongoDB |
| Detailed pipeline logs | ✅ Complete | `/logs` page + `ProcessingLog` collection |
| External data integration | ✅ Complete | Open-Meteo, CHIRPS, WorldPop, NASA FIRMS |
| Predictive risk forecasting | ✅ Complete | 7-day rainfall trend analysis |
| REST API for programmatic access | ✅ Complete | 15+ API routes under `/api/` |
| Interactive dashboard | ✅ Complete | Next.js real-time command center |
| Confidence scoring | ✅ Complete | Bayesian fusion model (0–100%) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COSMEON INTELLIGENCE ENGINE                     │
├────────────────┬──────────────────────────────┬─────────────────────┤
│  INGESTION     │     CORE PROCESSING           │   PRESENTATION      │
│  LAYER         │     ENGINE (Python)           │   LAYER (Next.js)   │
├────────────────┼──────────────────────────────┼─────────────────────┤
│                │                              │                     │
│ Sentinel-1 SAR │  ┌──────────────────────┐   │  ┌───────────────┐  │
│ Sentinel-2 OPT │  │  detection.py        │   │  │  Dashboard    │  │
│ Landsat 8 / 9  │  │  • VV-backscatter    │──▶│  │  /map         │  │
│ CHIRPS Rainfall│  │  • NDWI calculation  │   │  │  /districts   │  │
│ WorldPop DEM   │──▶  • Slope mask filter │   │  │  /studio      │  │
│ NASA FIRMS     │  └──────────────────────┘   │  │  /reports     │  │
│ Open-Meteo     │  ┌──────────────────────┐   │  │  /logs        │  │
│ JRC Water Base │  │  enrichment.py       │   │  └───────────────┘  │
│                │  │  • Population overlay│   │         ▲           │
│                │  │  • Agricultural NDVI │──▶│  REST API (15+ EP)  │
│                │  │  • Terrain analysis  │   │  /api/insights      │
│                │  └──────────────────────┘   │  /api/districts     │
│                │  ┌──────────────────────┐   │  /api/pipeline      │
│                │  │  scoring.py          │   │  /api/realtime      │
│                │  │  • Bayesian fusion   │──▶│                     │
│                │  │  • Risk tiering      │   │  MongoDB Atlas      │
│                │  │  • Confidence score  │   │  (Event Storage)    │
│                │  └──────────────────────┘   │                     │
└────────────────┴──────────────────────────────┴─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | Full-stack React framework with App Router |
| **TypeScript** | 5.9 | Type-safe development |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **Framer Motion** | 12.x | Premium UI animations |
| **Recharts** | 3.x | Real-time data visualization |
| **Leaflet + React-Leaflet** | 5.0 | Interactive geospatial maps |
| **Lucide React** | 0.575 | SVG icon system |
| **SWR** | 2.4 | Real-time data fetching with auto-refresh |
| **Next-Auth** | 4.x | Authentication |

### Backend & Processing
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Geospatial processing pipeline |
| **Google Earth Engine API** | Latest | Satellite imagery processing in the cloud |
| **Mongoose / MongoDB** | 9.2 | Event storage, state tables, pipeline logs |
| **Streamlit** | Latest | Internal tooling & studio interface |
| **Open-Meteo API** | Free | Live weather telemetry |
| **NASA FIRMS API** | — | Real-time thermal anomaly detection |

### Data Sources
| Dataset | Provider | Usage |
|---|---|---|
| **Sentinel-1 SAR** | ESA / Copernicus | Radar-based flood detection (cloud-piercing) |
| **Sentinel-2 MSI** | ESA / Copernicus | Optical validation & NDVI analysis |
| **Landsat-8 / 9** | NASA / USGS | Long-term historical baseline |
| **CHIRPS Rainfall** | UCSB | Precipitation-based risk modelling |
| **WorldPop 100m** | WorldPop | Population exposure estimation |
| **JRC Global Water** | EC / JRC | Historical water occurrence baseline |
| **Copernicus GLO-30 DEM** | Copernicus | Terrain slope masks |
| **Open-Meteo** | Open-Meteo | Live weather + 7-day forecast |

---

## 🧪 Core Processing Pipeline

### Step 1 — Satellite Ingestion
```python
# Sentinel-1 SAR collection — cloud-penetrating radar
s1 = (ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterDate(start, end)
      .filterBounds(aoi)
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
      .select('VV'))
```

### Step 2 — Flood Detection
```python
# Dual-pathway detection algorithm
sar_flood = pre_mean.subtract(post_mean).gt(threshold)  # Radar: VV backscatter drop
ndwi = green.subtract(nir).divide(green.add(nir))       # Optical: Normalized Difference Water Index
composite_flood = sar_flood.Or(ndwi.gt(0))             # Ensemble fusion
```

### Step 3 — False-Positive Filtering
```python
# Slope mask: removes mountain shadow artefacts
slope = ee.Terrain.slope(dem)
flood_clean = composite_flood.updateMask(slope.lt(5))  # Only flat terrain = true water
```

### Step 4 — Population Exposure
```python
# WorldPop overlay: count people in flood zone
exposed_pop = worldpop.updateMask(flood_clean).reduceRegion(
    reducer=ee.Reducer.sum(),
    geometry=aoi,
    scale=100,
    maxPixels=1e10
)
```

### Step 5 — Risk Scoring
```python
# Bayesian fusion confidence score
confidence = (sar_confidence * 0.5) + (optical_confidence * 0.3) + (rainfall_weight * 0.2)
risk_level = "CRITICAL" if score > 85 else "HIGH" if score > 65 else "MEDIUM" if score > 40 else "LOW"
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/`. The server auto-refreshes every 15–60 seconds.

### Insights
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/insights/latest` | Latest flood events with risk scores |
| `GET` | `/api/insights/summary` | Aggregate statistics + trend data |
| `GET` | `/api/insights/forecast` | 7-day predictive risk forecast |

### Districts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/districts` | All districts with current risk status |
| `GET` | `/api/districts/[id]` | Single district detail + event history |

### Pipeline
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/pipeline/trigger` | Trigger a new GEE satellite analysis |
| `POST` | `/api/pipeline/ingest` | Ingest processed results into MongoDB |
| `GET` | `/api/pipeline/logs` | Structured processing logs |

### Real-Time
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/realtime/ingest-weather` | Fetch & store live Open-Meteo data |
| `GET` | `/api/realtime/weather` | Current weather telemetry (30-min cache) |

### Studio
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/studio/run` | Run a custom GEE analysis with AOI config |

---

## 📁 Project Structure

```
cosmeon/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main dashboard (Overview)
│   ├── map/page.tsx              # Interactive regional map
│   ├── districts/page.tsx        # District Intelligence Registry
│   ├── reports/page.tsx          # Auto-generated PDF reports
│   ├── logs/page.tsx             # Pipeline telemetry console
│   ├── studio/
│   │   ├── spatial/page.tsx      # Geospatial Analysis Matrix
│   │   ├── risk/page.tsx         # Multi-factor Risk Analysis
│   │   ├── confidence/page.tsx   # Model Reliability & Scoring
│   │   ├── ai/page.tsx           # Generative AI insights
│   │   ├── pdf/page.tsx          # Assessment Report Generator
│   │   └── api/page.tsx          # REST API Explorer
│   └── api/                      # 15+ REST API routes
│
├── cosmeon/                      # Python Processing Engine
│   ├── pipeline/
│   │   └── runner.py             # Main GEE pipeline orchestrator
│   ├── core/
│   │   ├── detection.py          # SAR + Optical flood detection
│   │   ├── enrichment.py         # Population & terrain overlay
│   │   └── scoring.py            # Bayesian confidence scoring
│   ├── pdf_gen.py                # Auto-report PDF generation
│   ├── config.py                 # AOI & pipeline configuration
│   └── app.py                    # Streamlit internal UI
│
├── components/
│   ├── dashboard/
│   │   ├── StatsGrid.tsx         # Key metric cards
│   │   ├── DashboardCharts.tsx   # Radar + Donut + Line + Bar charts
│   │   ├── RiskTable.tsx         # Live event registry table
│   │   └── WeatherPanel.tsx      # Real-time precipitation dashboard
│   ├── layout/
│   │   ├── Navbar.tsx            # Top action bar + pipeline controls
│   │   └── Sidebar.tsx           # Navigation command center
│   ├── map/
│   │   └── FloodMap.tsx          # Leaflet-based interactive map
│   └── shared/
│       ├── RiskBadge.tsx         # Color-coded risk level badge
│       ├── ConfidenceBar.tsx     # Score visualization
│       └── DataSourceTag.tsx     # Sensor source label
│
├── lib/
│   ├── mongodb.ts                # Database connection singleton
│   ├── models/                   # Mongoose schemas
│   │   ├── District.ts           # District state table
│   │   ├── FloodEvent.ts         # Event + risk classification
│   │   └── ProcessingLog.ts      # Pipeline audit trail
│   ├── api/fetcher.ts            # SWR data fetcher
│   └── utils/
│       ├── formatters.ts         # Area, population, date formatters
│       └── riskClassifier.ts     # Risk level → color/config mapper
│
└── context/
    └── LanguageContext.tsx       # Google Translate integration
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **MongoDB Atlas** account
- **Google Earth Engine** service account
- **Open-Meteo** (free, no key needed)
- **NASA FIRMS** API key ([register here](https://firms.modaps.eosdis.nasa.gov/api/))

### 1. Clone the Repository
```bash
git clone https://github.com/CyberJarvis/Refactor_PS06.git
cd Refactor_PS06
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
pip install -r cosmeon/requirements.txt
```

### 4. Configure Environment
```bash
cp .env.sample .env.local
```

Fill in your `.env.local`:
```env
# Database
MONGODB_URI=mongodb+srv://...

# Google Earth Engine
GEE_PROJECT_ID=your-gee-project-id

# Pipeline Security
PIPELINE_SECRET=your-random-secret

# NASA Data
NASA_FIRM_MAP_KEY=your-firms-key
NASA_EARTHDATA_USERNAME=your-username
NASA_EARTHDATA_PASSWORD=your-password

# AOI (defaults to Assam, India)
AOI_NAME=assam_india
AOI_BBOX=[89.7, 24.8, 96.0, 28.2]
```

### 5. Seed District Data
```bash
node geo_seeder.js
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 7. (Optional) Run Python Pipeline
```bash
# Trigger a GEE analysis for Assam
python cosmeon/pipeline/runner.py --aoi assam_india --start 2024-07-01 --end 2024-09-30

# Or use the Streamlit UI
npm run streamlit
```

---

## 🎨 Dashboard Pages

| Page | URL | Description |
|---|---|---|
| **Overview** | `/` | Live KPI dashboard with radar, donut, & telemetry charts |
| **Regional Map** | `/map` | Interactive Leaflet map with flood polygon overlays |
| **Districts** | `/districts` | Intelligence registry for all monitored districts |
| **Spatial Insights** | `/studio/spatial` | Full-resolution GEE geospatial analysis matrix |
| **Risk Analysis** | `/studio/risk` | Multi-factor risk breakdown by district |
| **Model Reliability** | `/studio/confidence` | Confidence scoring & algorithm accuracy |
| **Generative AI** | `/studio/ai` | AI-powered natural language risk summaries |
| **Assessment Report** | `/studio/pdf` | Auto-generated stakeholder PDF reports |
| **Pipeline Logs** | `/logs` | Dark-terminal live pipeline audit trail |

---

## 📊 Data Models

### FloodEvent (Core State Table)
```typescript
{
  districtId:       ObjectId,       // Linked district
  riskLevel:        CRITICAL | HIGH | MEDIUM | LOW,
  riskScore:        0–100,          // Bayesian composite score
  floodAreaKm2:     number,         // Detected inundated area
  affectedPopEst:   number,         // WorldPop-derived exposure count
  detectionMethod:  S1|S2|L8|L9|ENSEMBLE,
  confidenceScore:  0–1,            // Algorithm certainty
  eventDate:        Date,
  changeFromPrevKm2: number,        // Delta vs. previous event
}
```

### ProcessingLog (Audit Trail)
```typescript
{
  runId:      string,               // UUID for pipeline run
  stage:      INIT | GEE | INGEST | DETECT | ENRICH | SCORE | OUTPUT,
  level:      INFO | WARN | ERROR,
  message:    string,
  durationMs: number,
  timestamp:  Date,
}
```

---

## 🔬 Detection Algorithms

### Algorithm 1 — SAR Flood Detection (Sentinel-1)
Detects **new water** by comparing the drop in **VV-polarization backscatter** between pre-event and post-event SAR passes. Water absorbs radar signals, creating a strong dB contrast vs. dry land.

```
Flood Detected IF: pre_VV_mean − post_VV_mean > threshold (−2.0 dB)
False Positive Removed IF: terrain_slope > 5° (mountain shadow)
```

### Algorithm 2 — NDWI Optical Detection (Sentinel-2)
Uses the **Normalized Difference Water Index** to isolate standing water in multi-spectral imagery.

```
NDWI = (Green − NIR) / (Green + NIR)
Flood Detected IF: NDWI > 0
Cloud Filtered IF: cloud_percentage > 30%
```

### Algorithm 3 — Ensemble Fusion
Combines both pathways using a weighted Bayesian model:

```
confidence = (SAR_confidence × 0.50) + (Optical_confidence × 0.30) + (Rainfall_weight × 0.20)
```

Radar is weighted highest because it works through clouds — especially critical in monsoon conditions.

---

## 🌏 Impact & Value Proposition

| Stakeholder | COSMEON's Value |
|---|---|
| 🏛️ **Governments** | Immediate situational awareness to route rescue teams into highest-need zones |
| 📋 **Insurers** | Verify flood events via satellite truth — eliminate manual inspection delays |
| 🏙️ **Urban Planners** | Identify high-risk flood plains using 20+ years of JRC historical water data |
| 🌾 **Agriculture** | Measure crop damage extent & recovery rate via long-term NDVI delta tracking |
| 🏥 **Aid Organizations** | Geo-targeted aid distribution based on exposed population density maps |

---

## 🗺️ Roadmap

- [x] Sentinel-1/2 flood detection pipeline
- [x] District-level risk scoring & classification
- [x] Real-time weather telemetry (Open-Meteo)
- [x] Interactive Leaflet geospatial maps
- [x] PDF assessment report generation
- [x] Pipeline audit logs (full trace)
- [x] REST API with 15+ endpoints
- [x] Multilingual support (Google Translate API)
- [ ] **7-day predictive flood forecasting** (CHIRPS + ML)
- [ ] **Infrastructure damage estimation** (building footprint overlay)
- [ ] **React Native mobile app** for field agents
- [ ] **Automated SMS/WhatsApp alerts** for CRITICAL events
- [ ] **Multi-country AOI expansion** (Bangladesh, Nepal)

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | ✅ | NextAuth.js session secret |
| `NEXTAUTH_URL` | ✅ | App base URL |
| `GEE_PROJECT_ID` | ✅ | Google Earth Engine project |
| `PIPELINE_SECRET` | ✅ | Shared secret for pipeline auth |
| `NASA_FIRM_MAP_KEY` | ⚡ Optional | NASA FIRMS thermal anomaly API |
| `NASA_EARTHDATA_USERNAME` | ⚡ Optional | NASA EarthData access |
| `NASA_EARTHDATA_PASSWORD` | ⚡ Optional | NASA EarthData access |
| `AOI_NAME` | ⚡ Optional | Area of interest name slug |
| `AOI_BBOX` | ⚡ Optional | Bounding box `[lon_min, lat_min, lon_max, lat_max]` |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👥 Team

Built with ❤️ for **HackX 4.0** — Problem Statement PS-06: *Satellite Data to Insight Engine for Climate Risk*

| Role | Responsibility |
|---|---|
| **Full-Stack Engineering** | Next.js 16 dashboard, REST APIs, MongoDB schemas |
| **Geospatial Processing** | GEE algorithms, SAR/Optical detection, enrichment |
| **Data Science** | Bayesian fusion model, confidence scoring, forecasting |
| **UI/UX Design** | Glassmorphic dashboard, charts, mobile responsiveness |

---

<div align="center">

**COSMEON** — *Turning the planet's biggest data stream into the world's fastest disaster response.*

[![Star on GitHub](https://img.shields.io/github/stars/CyberJarvis/Refactor_PS06?style=social)](https://github.com/CyberJarvis/Refactor_PS06)

</div>
