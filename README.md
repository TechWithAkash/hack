<div align="center">

<br />

```
███╗   ██╗███████╗████████╗██████╗  █████╗     █████╗ ██╗
████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗   ██╔══██╗██║
██╔██╗ ██║█████╗     ██║   ██████╔╝███████║   ███████║██║
██║╚██╗██║██╔══╝     ██║   ██╔══██╗██╔══██║   ██╔══██║██║
██║ ╚████║███████╗   ██║   ██║  ██║██║  ██║   ██║  ██║██║
╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝  ╚═╝╚═╝
```

### **NETRA.AI — Near-Earth Environmental Telemetry & Regional Anomalies**

### **Satellite Data → Insight Engine → Climate Risk**

*"We don’t just show you a map. We tell you exactly who is at risk, how much land is lost, and what the financial impact will be — powered by the eye in the sky."*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://mongodb.com)
[![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-4285F4?style=for-the-badge\&logo=google\&logoColor=white)](https://earthengine.google.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/CyberJarvis/Refactor_PS06/pulls)
[![Build Status](https://img.shields.io/badge/Build-Passing-22C55E?style=flat-square)](https://github.com/CyberJarvis/Refactor_PS06)
[![Problem Statement](https://img.shields.io/badge/PS--06-Climate_Risk_Intelligence-0D7377?style=flat-square)]()

</div>

---

# 🌍 What is NETRA.AI?

**NETRA.AI (Near-Earth Environmental Telemetry & Regional Anomalies)** is a full-stack **Climate Risk Intelligence Engine** built for **HackX 4.0 — Problem Statement PS-06**.

Earth observation satellites generate terabytes of imagery every day. Yet most of that data never reaches the people who actually need it. Governments, insurers, planners, and aid organizations still rely on delayed field reports and fragmented datasets.

NETRA.AI closes this gap by building an **automated pipeline** that transforms open satellite data (Sentinel-1 SAR, Sentinel-2 Optical, Landsat-8/9) into **structured, decision-ready climate risk insights** — complete with real-time dashboards, population exposure maps, confidence scores, and auto-generated PDF reports.

No mock data. No manual interpretation. Just automated geospatial truth.

---

# 🚀 Core Capabilities

| Capability                                  | Status | Implementation               |
| ------------------------------------------- | ------ | ---------------------------- |
| Satellite ingestion (Sentinel-1/2, Landsat) | ✅      | Google Earth Engine pipeline |
| Automated flood detection                   | ✅      | VV backscatter + NDWI fusion |
| Pre/Post change detection                   | ✅      | Temporal baseline comparison |
| Population exposure estimation              | ✅      | WorldPop overlay             |
| Terrain false-positive filtering            | ✅      | DEM slope masking            |
| Risk scoring                                | ✅      | Bayesian weighted model      |
| 7-day rainfall trend integration            | ✅      | CHIRPS + Open-Meteo          |
| Structured state tables                     | ✅      | MongoDB schemas              |
| REST API (15+ endpoints)                    | ✅      | Next.js API routes           |
| Interactive dashboard                       | ✅      | Real-time KPI + maps         |
| Auto PDF reports                            | ✅      | Python-based generation      |
| Pipeline audit logs                         | ✅      | Full trace logging           |

---

# 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NETRA.AI INTELLIGENCE ENGINE                 │
├────────────────┬──────────────────────────────┬─────────────────────┤
│  INGESTION     │     CORE PROCESSING           │   PRESENTATION      │
│  LAYER         │     ENGINE (Python)           │   LAYER (Next.js)   │
├────────────────┼──────────────────────────────┼─────────────────────┤
│ Sentinel-1 SAR │ detection.py  → SAR analysis │ Dashboard + Maps    │
│ Sentinel-2 MSI │ enrichment.py → Population   │ District registry   │
│ Landsat 8 / 9  │ scoring.py    → Risk fusion  │ PDF reports         │
│ CHIRPS Rain    │                              │ REST APIs           │
│ WorldPop       │                              │ MongoDB Atlas       │
│ Open-Meteo     │                              │                     │
└────────────────┴──────────────────────────────┴─────────────────────┘
```

---

# 🧠 Detection Algorithms

## 1. SAR Flood Detection (Sentinel-1)

Water absorbs radar energy. When VV backscatter drops significantly between pre- and post-event scenes, new water is likely present.

```
Flood IF: pre_VV − post_VV > threshold
```

Slope filtering removes mountainous shadow artifacts.

---

## 2. Optical NDWI Detection (Sentinel-2)

```
NDWI = (Green − NIR) / (Green + NIR)
Flood IF: NDWI > 0
```

Cloud masking applied before evaluation.

---

## 3. Ensemble Risk Fusion

```
confidence =
    (SAR_confidence × 0.50) +
    (Optical_confidence × 0.30) +
    (Rainfall_weight × 0.20)
```

Radar has highest weight due to cloud independence during monsoon.

---

# 📡 API Overview

All endpoints prefixed with `/api`.

### Insights

* `GET /api/insights/latest`
* `GET /api/insights/summary`
* `GET /api/insights/forecast`

### Districts

* `GET /api/districts`
* `GET /api/districts/[id]`

### Pipeline

* `POST /api/pipeline/trigger`
* `POST /api/pipeline/ingest`
* `GET /api/pipeline/logs`

### Real-Time Weather

* `POST /api/realtime/ingest-weather`
* `GET /api/realtime/weather`

---

# 📁 Project Structure

```
netra_ai/
├── app/                      # Next.js App Router
├── components/               # UI components
├── lib/                      # MongoDB + utilities
├── netra_ai/                 # Python processing engine
│   ├── pipeline/
│   ├── core/
│   ├── pdf_gen.py
│   └── config.py
└── context/
```

---

# ⚙️ Getting Started

## Prerequisites

* Node.js ≥ 18
* Python ≥ 3.10
* MongoDB Atlas
* Google Earth Engine project
* NASA FIRMS API key

---

## 1. Clone

```bash
git clone https://github.com/CyberJarvis/Refactor_PS06.git
cd Refactor_PS06
```

---

## 2. Install Dependencies

```bash
npm install
pip install -r netra_ai/requirements.txt
```

---

## 3. Configure Environment

```bash
cp .env.sample .env.local
```

Fill:

```env
MONGODB_URI=
GEE_PROJECT_ID=
PIPELINE_SECRET=
NASA_FIRM_MAP_KEY=
AOI_NAME=assam_india
AOI_BBOX=[89.7,24.8,96.0,28.2]
```

---

## 4. Seed District Data

```bash
node geo_seeder.js
```

---

## 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔍 Core Data Model

### FloodEvent

```typescript
{
  districtId: ObjectId,
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  riskScore: number,
  floodAreaKm2: number,
  affectedPopEst: number,
  confidenceScore: number,
  eventDate: Date
}
```

---

# 🌏 Stakeholder Value

| Stakeholder    | Impact                        |
| -------------- | ----------------------------- |
| Governments    | Faster disaster routing       |
| Insurers       | Satellite-backed verification |
| Urban planners | Historical floodplain mapping |
| Agriculture    | NDVI-based crop impact        |
| Aid agencies   | Geo-targeted relief planning  |

---

# 🗺️ Roadmap

* [x] Flood detection pipeline
* [x] District-level scoring
* [x] Real-time weather integration
* [x] REST API layer
* [x] PDF report automation
* [ ] ML-based predictive forecasting
* [ ] Infrastructure damage mapping
* [ ] Multi-country expansion
* [ ] SMS alert system

---

# 🔒 Environment Variables

| Variable          | Required |
| ----------------- | -------- |
| MONGODB_URI       | ✅        |
| NEXTAUTH_SECRET   | ✅        |
| NEXTAUTH_URL      | ✅        |
| GEE_PROJECT_ID    | ✅        |
| PIPELINE_SECRET   | ✅        |
| NASA_FIRM_MAP_KEY | Optional |

---

# 🤝 Contributing

1. Fork
2. Create branch
3. Commit
4. Push
5. Open PR

---

# 📜 License

MIT License.

---

<div align="center">

### **NETRA.AI**

*Turning the planet’s largest data stream into actionable climate intelligence.*

</div>
