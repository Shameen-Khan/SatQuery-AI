<div align="center">

# 🛰️ SatQuery AI
### *"Talk to Earth."*

An enterprise-grade Earth Observation intelligence workspace and spectral analytics studio.  
Ingest satellite scenes, calculate biophysical vegetation indices (NDVI, VARI, GLI), inspect real-time NASA GIBS satellite overlays, and query Earth observation data with cryptographic SHA-256 provenance auditing.

---

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![NASA EOSDIS](https://img.shields.io/badge/NASA-GIBS%20%26%20Images-E03C31?style=for-the-badge&logo=nasa&logoColor=white)](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs)
[![Vitest](https://img.shields.io/badge/Tests-32%20Passed-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Workflow](#-guided-6-step-workflow) • [Architecture](#-architecture) • [Quickstart](#-quickstart-guide) • [Spectral Math](#-remote-sensing--spectral-math) • [API Reference](#-api-endpoints)

---

</div>

## 🌟 Overview

**SatQuery AI** transforms raw orbital data into actionable geospatial intelligence. Designed for environmental researchers, agricultural planners, disaster-response teams, and remote sensing analysts, it bridges conversational AI with rigorous optical physics and authenticated Earth observation archives.

Unlike generic chat tools, SatQuery AI enforces **scientific discipline**: direct physical observations are strictly distinguished from qualitative inferences, RGB photos are never misrepresented as calibrated multispectral data, and every ingested granule is anchored with a deterministic **SHA-256 cryptographic provenance hash**.

---

## ⚡ Key Features

| Capability | Technical Details |
|---|---|
| **🔬 Analysis Studio** | Guided 6-step wizard: geocoded location search, preset landmark selection, observation date slider, real-time spectral calculation, and multi-format export. |
| **💬 Conversational AI** | Multi-turn conversational interface powered by **OpenAI GPT-4o** multimodal vision with an integrated fallback **SatQuery-EO-Kernel** rule engine. |
| **🌍 Real-Time Map Overlays** | Interactive Leaflet canvas rendering official **NASA GIBS WMTS tiles** (MODIS Terra True Color, VIIRS Night Lights, False Color Bands 7-2-1, AIRS Carbon Monoxide). |
| **🌱 Spectral Index Engine** | Real remote sensing math: **NDVI** ($(\text{NIR} - \text{Red}) / (\text{NIR} + \text{Red})$), **VARI**, and **GLI** with zero-denominator safeguards and boundary clamping. |
| **🏛️ NASA Imagery Archive** | Direct REST interface to `images-api.nasa.gov` with automated Earth Observation vs deep-space classification and one-click chat attachment. |
| **🛡️ Cryptographic Lineage** | SHA-256 checksums computed on upload; signed URLs for private storage; full audit modals with Ground Sample Distance (GSD) notes. |
| **💾 Zero-Config Persistence** | Dual-tier persistence: local file-backed store (`data/local-conversations.json`) out of the box, with seamless upgrade to **Supabase PostgreSQL & RLS**. |
| **📊 Multi-Format Export** | One-click export of analysis runs, land cover breakdowns, and chat transcripts to **CSV**, **JSON**, or formatted **Markdown**. |

---

## 🧭 Guided 6-Step Workflow

SatQuery AI streamlines complex remote sensing operations into an intuitive six-step cycle:

```
[ STEP 1: TARGET ] ──► [ STEP 2: SOURCE & TYPE ] ──► [ STEP 3: RUN ]
Location / Coordinates   GIBS Overlays / Spectral Type   Trigger Computation
                                                                │
[ STEP 6: EXPORT ] ◄── [ STEP 5: RESULTS ]       ◄── [ STEP 4: MONITOR ]
CSV / JSON / Markdown    NDVI / Fractions / Summary      Progress Bar (0-100%)
```

1. **Step 1: Enter Location or Coordinates**: Enter any city or geographic landmark (e.g., *"Suez Canal"*, *"Amazon Rainforest"*, *"Nile Delta"*) via OpenStreetMap Nominatim geocoding, or supply exact latitude/longitude coordinates (`30.044, 32.348`).
2. **Step 2: Select Satellite Data Source & Analysis Type**: Choose from daily orbital passes (MODIS Terra 250m, VIIRS Night Lights 750m, False Color 7-2-1) and pick an analytical focus (Vegetation Health, Land Cover, Water Bodies, Cloud Obscuration).
3. **Step 3: Run Analysis**: Initiate parallel sensor telemetry retrieval and spectral index processing.
4. **Step 4: Task Progress Tracking**: Monitor live execution stages (swath resolution ➔ radiance retrieval ➔ spectral index computation).
5. **Step 5: View Results & Visual Explanations**: Inspect computed vegetation indices, estimated optical land cover fractions (Vegetation %, Water %, Bare Soil %, Cloud/Shadow %), and structured observations.
6. **Step 6: Export & Audit**: Download comprehensive tabular reports (**CSV**), machine-readable schemas (**JSON**), research briefings (**Markdown**), or transfer the analysis directly into the **AI Chat**.

---

## 📐 Remote Sensing & Spectral Math

SatQuery AI upholds strict scientific transparency:

### 1. Normalized Difference Vegetation Index (NDVI)
$$\text{NDVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}}$$
* Requires calibrated Near-Infrared ($\rho_{\text{NIR}}$) and Red ($\rho_{\text{Red}}$) surface reflectance (e.g., Copernicus Sentinel-2 Band 8 / Band 4 or USGS Landsat 8/9 Band 5 / Band 4).
* Denominator safeguards prevent division-by-zero crashes ($|\rho_{\text{NIR}} + \rho_{\text{Red}}| < 10^{-6}$), clamping outputs strictly within $[-1.0, +1.0]$.

### 2. Visible Atmospherically Resistant Index (VARI)
$$\text{VARI} = \frac{\text{Green} - \text{Red}}{\text{Green} + \text{Red} - \text{Blue}}$$
* *Standard visible-spectrum proxy*: When only optical RGB imagery is available without an NIR channel, SatQuery AI computes VARI instead of fabricating radiometric NDVI.

### 3. Green Leaf Index (GLI)
$$\text{GLI} = \frac{2 \times \text{Green} - \text{Red} - \text{Blue}}{2 \times \text{Green} + \text{Red} + \text{Blue}}$$
* Measures green photosynthetic biomass fraction against exposed soil and urban impervious surfaces.

---

## 🏗️ Architecture

```
SatQuery AI Architecture
├── Presentation Layer (Next.js 14 App Router, React 18, Tailwind CSS)
│   ├── (auth): Real Supabase Auth (Sign In, Sign Up, Password Recovery)
│   ├── (workspace)/studio: 6-Step Satellite Intelligence Studio & Spectral Dashboard
│   ├── (workspace)/chat: Multimodal conversation workspace with SHA-256 provenance
│   ├── (workspace)/library: Live NASA Image & Video Library explorer with EO classifier
│   ├── (workspace)/map: Interactive Leaflet Map with Geocoding, NASA GIBS Overlays & AOI Picker
│   ├── (workspace)/saved: Bookmarked imagery catalogue
│   └── (workspace)/settings: External service diagnostics, privacy controls & retention
├── API Layer (Server-Side Next.js Route Handlers)
│   ├── /api/analysis/process: Spectral indices (NDVI/VARI/GLI), land cover fractions, statistics
│   ├── /api/geospatial/geocode: Location name search (OSM Nominatim) & coordinate validator
│   ├── /api/chat: Zod validation, sliding-window rate limiter, OpenAI vision, DB persist
│   ├── /api/uploads: File validation, SHA-256 hash generation, private Supabase Storage
│   ├── /api/conversations: CRUD with Row Level Security checks & local fallback
│   ├── /api/library/nasa: Public REST search proxy for NASA Earth assets
│   ├── /api/map/layers: NASA GIBS tile configurations & basemap providers
│   └── /api/health: System diagnostics and credential status check
└── Persistence & Security Layer
    ├── Local File Database: Automatic zero-config fallback (data/local-conversations.json)
    ├── Supabase Auth: Session handling, JWT verification, cookie management via @supabase/ssr
    ├── PostgreSQL: Row Level Security (RLS) on all user-owned tables
    └── Supabase Storage: Private bucket `satellite-images` with short-lived signed URLs
```

---

## 🚀 Quickstart Guide

### Prerequisites
* **Operating System**: Windows 11 / 10 (64-bit), macOS, or Linux
* **Runtime**: Node.js v20.x or v24.x LTS (Recommended: `v24.19.0`)
* **Package Manager**: npm v10+

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shameen-Khan/SatQuery-AI.git
   cd SatQuery-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local

   # macOS / Linux
   cp .env.example .env.local
   ```
   *(Note: The application is immediately operational out of the box in zero-config mode with NASA GIBS overlays and local file persistence!)*

4. **Launch development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project REST URL | Optional (activates cloud PostgreSQL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | Optional (activates cloud Auth/Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Server-Only Admin Key | Optional |
| `OPENAI_API_KEY` | OpenAI API Key for GPT-4o vision inference | Optional (activates live LLM vision) |
| `OPENAI_MODEL` | Vision model identifier | Defaults to `gpt-4o` |
| `NASA_API_KEY` | NASA Open API Key | Defaults to public `DEMO_KEY` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key for optional satellite basemap | Optional |

---

## 🧪 Verification & Quality Assurance

SatQuery AI includes a test suite covering input validation, path-traversal defenses, spectral math, NASA API parsing, and cryptographic provenance:

```powershell
# Run automated unit and integration tests (32 tests across 6 test suites)
npm run test

# Run TypeScript strict type-checking
npm run typecheck

# Run ESLint code quality rules
npm run lint

# Run optimized production build
npm run build
```

---

## 🌐 Supported Earth Observation Providers

| Provider | Data Source | Resolution | Revisit / Latency | Key Required? |
|---|---|---|---|---|
| **NASA GIBS / EOSDIS** | MODIS Terra, VIIRS DNB, False Color 7-2-1 | 250m - 750m | Daily (~3 hr NRT latency) | **None** (Public OGC WMTS) |
| **NASA Image Archive** | Earth Observation Mission Photography | Variable | 1958 - Present | **None** (Public REST API) |
| **OpenStreetMap** | Nominatim Geocoding & Base Cartography | Global | Real-time | **None** (Standard User-Agent) |
| **Esri World Imagery** | High-Resolution Orthophoto Mosaic | Sub-meter | Composite | **None** (Visualization) |
| **ESA Copernicus** | Sentinel-2 MSI Level-2A BOA Reflectance | 10m, 20m, 60m | 5-day revisit rate | CDSE OAuth2 (for raw granules) |
| **USGS / NASA** | Landsat 8/9 OLI/TIRS Surface Reflectance | 15m - 30m | 16-day revisit rate | USGS EROS M2M token |

---

## 🔒 Security & Privacy Posture

* **Zero Credential Exposure**: Client bundles never expose `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
* **Path Traversal Mitigation**: File upload endpoints enforce filename sanitization, rejecting `..`, `/`, and `\` injection attempts.
* **Row Level Security (RLS)**: PostgreSQL tables enforce `auth.uid() = user_id`, guaranteeing cross-tenant isolation.
* **Private Storage Buckets**: Uploaded scenes are stored in private Supabase Storage buckets, accessed exclusively through short-lived signed URLs.
* **Rate Limiting**: In-memory sliding-window token bucket throttles repetitive automated submissions.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
<sub>Engineered with precision for planetary observation. Developed by <a href="https://github.com/Shameen-Khan">Shameen Khan</a>.</sub>
</div>
