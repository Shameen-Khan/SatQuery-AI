# SatQuery AI • "Talk to Earth."

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?logo=supabase)](https://supabase.com/)
[![NASA GIBS](https://img.shields.io/badge/NASA-GIBS%20%26%20Images-E03C31?logo=nasa)](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs)

SatQuery AI is a modern Earth Observation AI workspace and spectral intelligence studio. Users can inspect any location on Earth, search authentic NASA mission imagery, analyze satellite WMTS overlays via Leaflet, calculate vegetation health metrics (NDVI / VARI / GLI), ingest custom Sentinel-2 and Landsat scenes, and maintain cryptographically audited conversations with SHA-256 provenance tracking.

---

## 1. Product Architecture Overview

```
SatQuery AI Architecture
├── Presentation Layer (Next.js App Router, React 18, Tailwind CSS)
│   ├── (auth): Real Supabase Auth (Sign In, Sign Up, Password Recovery)
│   ├── (workspace)/studio: Guided 6-Step Satellite Intelligence Studio & Spectral Dashboard
│   ├── (workspace)/chat: Multimodal conversation interface with provenance inspector
│   ├── (workspace)/library: Live NASA Image & Video Library explorer with EO classifier
│   ├── (workspace)/map: Interactive Leaflet Map with Geocoding, NASA GIBS Overlays & AOI Picker
│   ├── (workspace)/saved: Bookmarked imagery catalogue
│   └── (workspace)/settings: Diagnostics, audit policies, and privacy retention
├── API Layer (Server-Side Next.js Route Handlers)
│   ├── /api/analysis/process: Spectral indices (NDVI/VARI/GLI), land cover fractions, statistics
│   ├── /api/geospatial/geocode: Location name search (OpenStreetMap Nominatim) & coordinate validator
│   ├── /api/chat: Zod validation, rate limiter, OpenAI vision analysis, local/PostgreSQL persistence
│   ├── /api/uploads: File validation, SHA-256 hash generation, private Supabase Storage
│   ├── /api/conversations: CRUD with Row Level Security ownership checks & local file fallback
│   ├── /api/library/nasa: Public REST search for NASA Earth assets
│   ├── /api/map/layers: NASA GIBS tile configurations & basemap providers
│   └── /api/health: Diagnostics and credential status check
└── Persistence & Security Layer
    ├── Local File Database: Automatic zero-config fallback (data/local-conversations.json)
    ├── Supabase Auth: Session handling, JWT verification, cookie management via @supabase/ssr
    ├── PostgreSQL: Row Level Security (RLS) on all user-owned tables
    └── Supabase Storage: Private bucket `satellite-images` with signed URLs
```

---

## 2. Guided 6-Step Workflow (Analysis Studio)

SatQuery AI provides an intuitive, step-by-step workflow:

* **STEP 1: Enter Location or Coordinates** — Type a place name (e.g., *"Suez Canal"*, *"Amazon Rainforest"*, *"Nile Delta"*) or enter exact latitude/longitude coordinates (e.g. `30.044, 31.235`). Notable Earth targets are available as one-click presets.
* **STEP 2: Select Data Source & Analysis Type** — Choose from daily NASA GIBS optical layers (MODIS Terra True Color, VIIRS Night Lights, False Color Bands 7-2-1) and pick an analysis type (Vegetation Health, Land Cover, Water Bodies, Cloud Obscuration).
* **STEP 3: Run Analysis** — Click *"Run Analysis"* to trigger live spectral calculation.
* **STEP 4: Progress Indicator** — Monitor task progress (telemetry resolution ➔ sensor radiance retrieval ➔ spectral index calculation).
* **STEP 5: Results & Explanations** — Review calculated metrics (NDVI / VARI / GLI), land cover percentage breakdowns (vegetation, water, soil, cloud), and remote sensing summaries.
* **STEP 6: Export Results** — Export reports instantly to **CSV**, **JSON**, or **Markdown**, or open directly into the conversational **AI Chat**.

---

## 3. Remote Sensing & Vegetation Indices

SatQuery AI implements scientifically rigorous formulas:

* **NDVI (Normalized Difference Vegetation Index)**:
  $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$$
  *Requires calibrated Near-Infrared (NIR) data (e.g. Sentinel-2 Band 8 or Landsat Band 5).*
* **VARI (Visible Atmospherically Resistant Index)**:
  $$\text{VARI} = \frac{\text{Green} - \text{Red}}{\text{Green} + \text{Red} - \text{Blue}}$$
  *Standard scientifically validated visible-spectrum proxy for RGB imagery when NIR bands are absent.*
* **GLI (Green Leaf Index)**:
  $$\text{GLI} = \frac{2 \times \text{Green} - \text{Red} - \text{Blue}}{2 \times \text{Green} + \text{Red} + \text{Blue}}$$

> **Scientific Honesty**: The system strictly informs users that uncalibrated RGB images cannot yield true radiometric NDVI, preventing misleading conclusions while computing standard visible vegetation proxies.

---

## 4. Prerequisites for Windows 11

- **OS**: Windows 11 (or Windows 10 64-bit)
- **Shell**: Windows PowerShell or PowerShell 7 (`pwsh`)
- **Node.js**: v20.x or v24.x LTS (Recommended: v24.19.0)
- **Package Manager**: npm v10+ (Included with Node.js)
- **Git**: Git for Windows

---

## 5. Quick-Start Commands (Windows PowerShell)

```powershell
# 1. Navigate to the project directory
cd C:\Users\KiTE\.gemini\antigravity\scratch\satquery-ai

# 2. Copy the environment file template
Copy-Item .env.example .env.local

# 3. Start the Next.js development server
npm run dev
```

Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 6. Running Tests & Quality Verification

```powershell
# Run the complete automated test suite (32 tests across 6 test suites)
npm run test

# Run TypeScript strict type-checking (0 errors)
npm run typecheck

# Run ESLint code quality checks (0 warnings, 0 errors)
npm run lint

# Run optimized production build
npm run build
```

---

## 7. Connecting Live Supabase & OpenAI (Optional)

SatQuery AI runs out-of-the-box in local zero-config mode with local file persistence (`data/local-conversations.json`), public NASA imagery, and Leaflet GIBS layers.

To enable user accounts, PostgreSQL RLS, and live GPT-4o vision inference:

1. Open `.env.local` in VS Code.
2. Set your **OpenAI API Key**:
   ```env
   OPENAI_API_KEY=sk-proj-your-key-here
   OPENAI_MODEL=gpt-4o
   ```
3. Set your **Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the SQL migration in `supabase/migrations/20261029000000_init_satquery.sql` in the Supabase SQL Editor.
5. Restart the server (`npm run dev`).

---

## 8. Supported Data Sources & Licenses

| Provider | Data Source | Latency / Coverage | Key Required? |
|---|---|---|---|
| **NASA GIBS** | MODIS Terra, VIIRS DNB, False Color 7-2-1 | Daily synoptic, ~3hr near-real-time | None (Public OGC WMTS) |
| **NASA Image Archive** | Earth Observation Missions, Space Station | 1958 - Present | None (Public REST API) |
| **OpenStreetMap** | Nominatim Geocoding & Cartography | Global address & landmark search | None (Fair-use user agent) |
| **Esri World Imagery** | Commercial High-Res Satellite Composite | Global mosaic | None (Client visualization) |
| **Copernicus Sentinel-2** | MSI Level-2A BOA (via custom upload or API) | 5-day revisit, 10m Ground Sample Distance | CDSE OAuth2 (for direct raw granules) |
| **USGS Landsat 8/9** | OLI / TIRS Level-2 Surface Reflectance | 16-day revisit, 30m resolution | USGS EROS M2M token |
