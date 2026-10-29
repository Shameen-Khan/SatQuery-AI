"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Search,
  Compass,
  Layers,
  Sparkles,
  Calendar,
  Activity,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileSpreadsheet,
  FileCode,
  FileText,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Globe2,
} from "lucide-react";
import { GibsLayer, AreaOfInterest } from "@/types";
import { NASA_GIBS_LAYERS, BASEMAP_PROVIDERS, getDefaultGibsDate } from "@/lib/nasa/gibs";
import { AnalysisRunResult } from "@/lib/geospatial/analysis";

const DynamicInteractiveMap = dynamic(() => import("../map/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-200 text-slate-400 gap-3">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs">Initializing Satellite Map Workspace...</span>
    </div>
  ),
});

interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  description: string;
}

const NOTABLE_EO_TARGETS: LocationPreset[] = [
  { name: "Suez Canal, Egypt", lat: 30.608, lng: 32.348, zoom: 10, description: "Key global maritime choke-point & desert landscape" },
  { name: "Amazon Rainforest Basin", lat: -3.465, lng: -62.215, zoom: 8, description: "Dense canopy chlorophyll & dendritic river network" },
  { name: "Nile Delta, Egypt", lat: 30.85, lng: 31.2, zoom: 8, description: "Vibrant irrigated cropland surrounded by arid desert" },
  { name: "Grand Canyon, USA", lat: 36.107, lng: -112.113, zoom: 10, description: "Deep geological erosion & exposed rock strata" },
  { name: "Richat Structure (Eye of Sahara)", lat: 21.127, lng: -11.401, zoom: 10, description: "Concentric circular dome geological anomaly" },
  { name: "Great Barrier Reef, Australia", lat: -18.287, lng: 147.699, zoom: 8, description: "Marine coral reef reflectance in coastal waters" },
];

export function AnalysisStudio() {
  const router = useRouter();

  // Step 1: Location & Target
  const [locationQuery, setLocationQuery] = useState("Suez Canal, Egypt");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number; name: string }>({
    lat: 30.608,
    lng: 32.348,
    name: "Suez Canal, Egypt",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Step 2: Data Source & Analysis Type
  const [selectedLayer, setSelectedLayer] = useState<GibsLayer>(NASA_GIBS_LAYERS[0]);
  const [selectedBasemap, setSelectedBasemap] = useState(BASEMAP_PROVIDERS[1]); // Esri Satellite
  const [obsDate, setObsDate] = useState(getDefaultGibsDate());
  const [analysisType, setAnalysisType] = useState<"vegetation_ndvi" | "land_cover" | "water_bodies" | "cloud_shadow" | "general_survey">("vegetation_ndvi");

  // Step 3 & 4: Progress & State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisRunResult | null>(null);

  // First-time guide modal
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Map state
  const [cursorCoords, setCursorCoords] = useState({ lat: 30.608, lng: 32.348, zoom: 8 });

  // Handle Location Search
  const handleGeocodeSearch = async (queryText?: string) => {
    const q = (queryText || locationQuery).trim();
    if (!q) return;

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const res = await fetch(`/api/geospatial/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        setLocationCoords({
          lat: first.lat,
          lng: first.lng,
          name: first.displayName.split(",")[0],
        });
      } else {
        setGeocodeError(data.warning || "Location not found. Try entering coordinates directly (e.g. 30.044, 31.235).");
      }
    } catch {
      setGeocodeError("Could not reach geocoding service. You can type latitude, longitude coordinates directly.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectPreset = (preset: LocationPreset) => {
    setLocationQuery(preset.name);
    setLocationCoords({ lat: preset.lat, lng: preset.lng, name: preset.name });
    setGeocodeError(null);
  };

  // Run Real Analysis Workflow (Steps 3, 4, 5)
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setProgressPct(15);
    setProgressStage("Resolving geographic bounding box & satellite swath...");

    // Simulated authentic progress stages
    const timer1 = setTimeout(() => {
      setProgressPct(45);
      setProgressStage("Retrieving sensor layer metadata & optical radiance...");
    }, 400);

    const timer2 = setTimeout(() => {
      setProgressPct(75);
      setProgressStage("Calculating spectral indices (NDVI / VARI / GLI) & land cover...");
    }, 800);

    try {
      const res = await fetch("/api/analysis/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisType,
          dataSource: `${selectedLayer.title} (${selectedLayer.category})`,
          observationDate: obsDate,
          location: locationCoords,
          hasMultispectralData: false, // Optical RGB tile
        }),
      });

      const data = await res.json();

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setProgressPct(100);
      setProgressStage("Analysis complete!");
      setAnalysisResult(data.result);
    } catch (err: any) {
      setGeocodeError(err.message || "Failed to execute analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial Run on load
  useEffect(() => {
    handleRunAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Export handlers (Step 6)
  const exportCSV = () => {
    if (!analysisResult) return;
    const rows = [
      ["SatQuery AI - Earth Observation Spectral Analysis Report"],
      ["Date", analysisResult.timestamp],
      ["Target Location", analysisResult.location?.name || ""],
      ["Latitude", String(analysisResult.location?.lat || "")],
      ["Longitude", String(analysisResult.location?.lng || "")],
      ["Data Source", analysisResult.dataSource],
      ["Analysis Type", analysisResult.analysisType],
      [],
      ["Metric Name", "Value", "Unit", "Interpretation", "Formula"],
      ...analysisResult.metrics.map((m) => [
        `"${m.metricName}"`,
        String(m.value),
        `"${m.unit}"`,
        `"${m.interpretation}"`,
        `"${m.scientificFormula}"`,
      ]),
      [],
      ["Land Cover Fraction", "Percentage"],
      ["Vegetation", `${analysisResult.landCoverFractions.vegetationPct}%`],
      ["Water Bodies", `${analysisResult.landCoverFractions.waterPct}%`],
      ["Bare Soil & Urban", `${analysisResult.landCoverFractions.bareSoilUrbanPct}%`],
      ["Cloud & Snow", `${analysisResult.landCoverFractions.cloudSnowPct}%`],
      [],
      ["Executive Summary", `"${analysisResult.summary}"`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `satquery-analysis-${analysisResult.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!analysisResult) return;
    const jsonStr = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-analysis-${analysisResult.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    if (!analysisResult) return;
    const lines = [
      `# 🛰️ SatQuery AI Spectral Analysis Report`,
      `**Target**: ${analysisResult.location?.name || "Target Area"} (${analysisResult.location?.lat}°N, ${analysisResult.location?.lng}°E)`,
      `**Data Source**: ${analysisResult.dataSource}`,
      `**Timestamp**: ${new Date(analysisResult.timestamp).toLocaleString()}`,
      "",
      `### Summary`,
      analysisResult.summary,
      "",
      `### Spectral Metrics`,
      ...analysisResult.metrics.map(
        (m) => `- **${m.metricName}**: \`${m.value} ${m.unit}\` (${m.interpretation})\n  *Formula: \`${m.scientificFormula}\`*`
      ),
      "",
      `### Land Cover Fractions`,
      `- Vegetation: **${analysisResult.landCoverFractions.vegetationPct}%**`,
      `- Water Bodies: **${analysisResult.landCoverFractions.waterPct}%**`,
      `- Bare Soil / Urban: **${analysisResult.landCoverFractions.bareSoilUrbanPct}%**`,
      `- Cloud / Snow: **${analysisResult.landCoverFractions.cloudSnowPct}%**`,
      "",
      `### Scientific Remote Sensing Notes`,
      ...analysisResult.scientificNotes.map((n) => `- ${n}`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-analysis-${analysisResult.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInAIChat = () => {
    const promptText = `Analyze the satellite scene at ${locationCoords.name} (Coordinates: ${locationCoords.lat.toFixed(4)}, ${locationCoords.lng.toFixed(4)}) with data source ${selectedLayer.title}.`;
    router.push(`/chat?aoi=${encodeURIComponent(JSON.stringify({ type: "Point", coordinates: [locationCoords.lat, locationCoords.lng], label: locationCoords.name }))}`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header & Search Bar */}
      <header className="h-16 border-b border-border bg-surface-100/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-sm sm:text-base">Satellite Intelligence Studio</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Guided 6-Step Workflow
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-slate-300 hover:text-white hover:bg-surface-50 text-xs transition"
          >
            <HelpCircle size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">First-Time Guide</span>
          </button>

          <button
            onClick={openInAIChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-glow transition"
          >
            <Sparkles size={13} />
            <span>Open in AI Chat</span>
          </button>
        </div>
      </header>

      {/* Main Studio Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Interactive Map & Step 1, 2, 3 Wizard */}
        <div className="w-full lg:w-7/12 flex flex-col border-r border-border overflow-y-auto">
          {/* STEP 1 & 2 Workflow Box */}
          <div className="p-4 bg-surface-100/70 border-b border-border space-y-3">
            {/* Step 1: Location Search */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} /> STEP 1: Enter Location or Coordinates
                </span>
                <span className="text-[11px] text-slate-400">
                  Selected: <strong>{locationCoords.lat.toFixed(3)}°N, {locationCoords.lng.toFixed(3)}°E</strong>
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGeocodeSearch()}
                    placeholder="Search city, region (e.g. Suez Canal) or lat, lng (30.044, 31.235)..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-200 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <button
                  onClick={() => handleGeocodeSearch()}
                  disabled={isGeocoding}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition disabled:opacity-50"
                >
                  {isGeocoding ? "Locating..." : "Locate"}
                </button>
              </div>

              {/* Notable Earth Observation Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex-shrink-0">Notable:</span>
                {NOTABLE_EO_TARGETS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleSelectPreset(t)}
                    className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] bg-surface-200 border border-border text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
                  >
                    {t.name.split(",")[0]}
                  </button>
                ))}
              </div>

              {geocodeError && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  <span>{geocodeError}</span>
                </div>
              )}
            </div>

            {/* Step 2: Select Data Source & Analysis Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Layers size={12} className="text-cyan-400" /> STEP 2A: Satellite Data Source
                </label>
                <select
                  value={selectedLayer.id}
                  onChange={(e) => {
                    const l = NASA_GIBS_LAYERS.find((x) => x.id === e.target.value);
                    if (l) setSelectedLayer(l);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface-200 border border-border text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  {NASA_GIBS_LAYERS.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.title} ({layer.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Activity size={12} className="text-cyan-400" /> STEP 2B: Analysis Type
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface-200 border border-border text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="vegetation_ndvi">Vegetation Health & NDVI / VARI Index</option>
                  <option value="land_cover">Land Cover & Canopy Distribution</option>
                  <option value="water_bodies">Hydrology & Water Body Extraction</option>
                  <option value="cloud_shadow">Cloud Obscuration & Terrain Shadows</option>
                  <option value="general_survey">Comprehensive Regional Survey</option>
                </select>
              </div>
            </div>

            {/* Step 3: Run Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Calendar size={13} className="text-cyan-400" />
                <span>Date:</span>
                <input
                  type="date"
                  value={obsDate}
                  max={getDefaultGibsDate()}
                  onChange={(e) => setObsDate(e.target.value)}
                  className="px-2 py-0.5 rounded bg-surface-200 border border-border text-slate-200 text-[11px] focus:outline-none"
                />
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-glow transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing {progressPct}%...</span>
                  </>
                ) : (
                  <>
                    <span>STEP 3: Run Analysis</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Task Progress Bar (STEP 4) */}
            {isAnalyzing && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-surface-300 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-cyan-300">
                  <span>{progressStage}</span>
                  <span className="font-mono">{progressPct}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map Canvas */}
          <div className="flex-1 relative min-h-[350px]">
            <DynamicInteractiveMap
              basemapUrl={selectedBasemap.url}
              basemapAttribution={selectedBasemap.attribution}
              selectedGibsLayer={selectedLayer}
              gibsDate={obsDate}
              overlayOpacity={0.85}
              onCoordinatesChange={setCursorCoords}
              onSelectAoi={(aoi) => {
                if (
                  aoi.type === "Point" &&
                  Array.isArray(aoi.coordinates) &&
                  typeof aoi.coordinates[0] === "number" &&
                  typeof aoi.coordinates[1] === "number"
                ) {
                  setLocationCoords({
                    lat: aoi.coordinates[0],
                    lng: aoi.coordinates[1],
                    name: aoi.label || "Pinned Point",
                  });
                }
              }}
            />

            {/* Map coordinate badge */}
            <div className="absolute bottom-3 left-3 z-[400] px-3 py-1 rounded-xl bg-surface-100/90 backdrop-blur-md border border-border shadow text-[10px] font-mono text-slate-300 flex items-center gap-2">
              <Compass size={12} className="text-cyan-400" />
              <span>Cursor: {cursorCoords.lat}°N, {cursorCoords.lng}°E</span>
            </div>
          </div>
        </div>

        {/* Right Column: STEP 5 & 6 Analysis Results Panel & Exports */}
        <div className="w-full lg:w-5/12 flex flex-col bg-surface-100/40 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                STEP 5: Analysis Results & Metrics
              </span>
              <h2 className="text-sm font-semibold text-white">
                {locationCoords.name}
              </h2>
            </div>

            {/* STEP 6 Export Controls */}
            {analysisResult && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={exportCSV}
                  className="p-1.5 rounded-lg border border-border text-slate-300 hover:text-white hover:bg-surface-50 text-xs transition"
                  title="Export results to CSV spreadsheet"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                </button>
                <button
                  onClick={exportJSON}
                  className="p-1.5 rounded-lg border border-border text-slate-300 hover:text-white hover:bg-surface-50 text-xs transition"
                  title="Export structured JSON payload"
                >
                  <FileCode size={14} className="text-cyan-400" />
                </button>
                <button
                  onClick={exportMarkdown}
                  className="p-1.5 rounded-lg border border-border text-slate-300 hover:text-white hover:bg-surface-50 text-xs transition"
                  title="Export Markdown report"
                >
                  <FileText size={14} className="text-blue-400" />
                </button>
              </div>
            )}
          </div>

          {analysisResult ? (
            <div className="space-y-4 text-xs">
              {/* Executive Summary */}
              <div className="p-3.5 rounded-xl bg-surface-200 border border-border space-y-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Spectral Evaluation Summary
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Spectral Metrics Grid */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-200 text-xs block">Calculated Remote Sensing Metrics:</span>
                <div className="space-y-2">
                  {analysisResult.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-surface-200 border border-border space-y-1.5 hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{metric.metricName}</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {metric.value} {metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{metric.interpretation}</span>
                      </div>
                      <div className="pt-1 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                        <span>Formula: {metric.scientificFormula}</span>
                        {metric.isMultispectral ? (
                          <span className="text-emerald-400">Calibrated Level-2</span>
                        ) : (
                          <span className="text-amber-400">Visible Proxy</span>
                        )}
                      </div>
                      {metric.caveat && (
                        <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-border/40">
                          {metric.caveat}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Land Cover Classification Bars */}
              <div className="p-3.5 rounded-xl bg-surface-200 border border-border space-y-2.5">
                <span className="font-semibold text-slate-200 text-xs block">
                  Estimated Optical Land Cover Fractions:
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Active Vegetation / Forest Canopy</span>
                      <span className="font-bold text-emerald-400">{analysisResult.landCoverFractions.vegetationPct}%</span>
                    </div>
                    <div className="w-full bg-surface-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${analysisResult.landCoverFractions.vegetationPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Water Bodies & Wetlands</span>
                      <span className="font-bold text-blue-400">{analysisResult.landCoverFractions.waterPct}%</span>
                    </div>
                    <div className="w-full bg-surface-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${analysisResult.landCoverFractions.waterPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Barren Soil / Rock / Urban</span>
                      <span className="font-bold text-amber-400">{analysisResult.landCoverFractions.bareSoilUrbanPct}%</span>
                    </div>
                    <div className="w-full bg-surface-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${analysisResult.landCoverFractions.bareSoilUrbanPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Cloud & Terrain Shadows</span>
                      <span className="font-bold text-slate-400">{analysisResult.landCoverFractions.cloudSnowPct}%</span>
                    </div>
                    <div className="w-full bg-surface-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full" style={{ width: `${analysisResult.landCoverFractions.cloudSnowPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scientific Caveats */}
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-400 text-[11px] space-y-1">
                <span className="font-semibold text-blue-300 block">Scientific Remote Sensing Integrity:</span>
                <p>
                  Calculations strictly distinguish direct spectral observations from qualitative inferences. Optical RGB observations do not fabricate multispectral NIR measurements.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs space-y-2">
              <Globe2 size={28} className="mx-auto text-slate-600 animate-pulse" />
              <p>Select a location and click <strong>STEP 3: Run Analysis</strong> to evaluate the satellite scene.</p>
            </div>
          )}
        </div>
      </div>

      {/* First-Time User Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-100 border border-border shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-base">
                <HelpCircle size={20} />
                <span>SatQuery AI • Quick-Start Guide</span>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-1">
                <span className="font-bold text-cyan-300">Step 1: Choose Your Location</span>
                <p className="text-slate-300">
                  Search any place name (e.g. &quot;Suez Canal&quot;, &quot;Amazon Rainforest&quot;) or enter latitude/longitude coordinates (e.g. <code>30.044, 31.235</code>). The map will immediately center on the area.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-1">
                <span className="font-bold text-cyan-300">Step 2: Choose Data Source & Date</span>
                <p className="text-slate-300">
                  Pick between NASA GIBS daily optical overlays, Day/Night city lights, or False Color Bands 7-2-1 for flood/burn analysis.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-1">
                <span className="font-bold text-cyan-300">Step 3: Analyze & Export</span>
                <p className="text-slate-300">
                  Click <strong>Run Analysis</strong> to compute spectral indices (NDVI / VARI / GLI) and land cover fractions. Export results to CSV, JSON, or Markdown with a single click.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
              >
                Got it, let&apos;s analyze!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
