"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Layers,
  Calendar,
  Eye,
  Compass,
  MessageSquare,
  Search,
  Activity,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { GibsLayer, AreaOfInterest } from "@/types";
import { NASA_GIBS_LAYERS, BASEMAP_PROVIDERS, getDefaultGibsDate } from "@/lib/nasa/gibs";

// Dynamically import Leaflet component with SSR disabled
const DynamicInteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-200 text-slate-400 gap-3">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs">Initializing NASA GIBS & Leaflet Geospatial Engine...</span>
    </div>
  ),
});

export function MapExplorer() {
  const router = useRouter();

  const [selectedBasemap, setSelectedBasemap] = useState(BASEMAP_PROVIDERS[1]); // Default Esri Satellite
  const [selectedGibsLayer, setSelectedGibsLayer] = useState<GibsLayer | null>(NASA_GIBS_LAYERS[0]); // Default MODIS TrueColor
  const [gibsDate, setGibsDate] = useState(getDefaultGibsDate());
  const [opacity, setOpacity] = useState(0.85);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 0,
    lng: 0,
    zoom: 3,
  });

  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const [selectedAoi, setSelectedAoi] = useState<AreaOfInterest | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  // Search location state
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchLocation = async () => {
    const q = searchLocation.trim();
    if (!q) return;

    setIsSearchingLocation(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/geospatial/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        setCenterCoords([item.lat, item.lng]);
        setSelectedAoi({
          type: "Point",
          coordinates: [item.lat, item.lng],
          label: item.displayName.split(",")[0],
          zoom: 9,
        });
      } else {
        setSearchError(data.warning || "Location not found. Try entering coordinates directly (e.g. 30.044, 31.235).");
      }
    } catch {
      setSearchError("Could not reach location service. You can type coordinates directly.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleStartChatWithAoi = () => {
    if (!selectedAoi) return;
    const aoiStr = encodeURIComponent(JSON.stringify(selectedAoi));
    router.push(`/chat?aoi=${aoiStr}`);
  };

  const handleAnalyzeInStudio = () => {
    router.push("/studio");
  };

  return (
    <div className="relative flex-1 flex h-screen overflow-hidden bg-background">
      {/* Main Map Canvas */}
      <div className="w-full h-full relative">
        <DynamicInteractiveMap
          basemapUrl={selectedBasemap.url}
          basemapAttribution={selectedBasemap.attribution}
          selectedGibsLayer={selectedGibsLayer}
          gibsDate={gibsDate}
          overlayOpacity={opacity}
          centerCoords={centerCoords}
          onCoordinatesChange={setCursorCoords}
          onSelectAoi={setSelectedAoi}
        />

        {/* Floating Location Search Bar (Top-left) */}
        <div className="absolute top-4 left-4 z-[400] w-80 sm:w-96 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-100/95 backdrop-blur-md border border-border shadow-2xl">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder="Search city, landmark or lat, lng..."
                className="w-full pl-9 pr-2 py-2 text-xs rounded-xl bg-surface-200 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button
              onClick={handleSearchLocation}
              disabled={isSearchingLocation}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              {isSearchingLocation ? "Locating..." : "Locate"}
            </button>
          </div>

          {searchError && (
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between shadow">
              <span>{searchError}</span>
              <button onClick={() => setSearchError(null)}><X size={12} /></button>
            </div>
          )}
        </div>

        {/* Live Coordinate Inspector Overlay (Bottom-left) */}
        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100/90 backdrop-blur-md border border-border shadow-lg text-[11px] font-mono text-slate-300">
          <Compass size={13} className="text-cyan-400" />
          <span>
            Lat: {cursorCoords.lat > 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`}
          </span>
          <span className="text-slate-600">•</span>
          <span>
            Lng: {cursorCoords.lng > 0 ? `${cursorCoords.lng}°E` : `${Math.abs(cursorCoords.lng)}°W`}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400">Zoom: {cursorCoords.zoom}</span>
        </div>

        {/* Selected AOI Action Banner (Bottom-center) */}
        {selectedAoi && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-100/95 backdrop-blur-md border border-cyan-500/40 shadow-glow text-xs">
            <div className="flex items-center gap-2 text-cyan-300">
              <Compass size={16} />
              <span className="font-semibold">{selectedAoi.label}</span>
            </div>

            <button
              onClick={handleAnalyzeInStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow transition"
              title="Open in Analysis Studio"
            >
              <Activity size={13} />
              <span>Analyze in Studio</span>
            </button>

            <button
              onClick={handleStartChatWithAoi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow transition"
              title="Query in AI Chat"
            >
              <MessageSquare size={13} />
              <span>AI Chat</span>
            </button>

            <button
              onClick={() => setSelectedAoi(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Control & Layers Sidebar (Right) */}
      <div className="absolute top-4 right-4 z-[400] w-80 max-h-[90vh] flex flex-col rounded-2xl bg-surface-100/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden text-xs">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-semibold">
            <Layers size={16} className="text-cyan-400" />
            <span>Earth Observation Layers</span>
          </div>
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <ChevronDown
              size={16}
              className={`transition transform ${showLayerPanel ? "rotate-0" : "-rotate-90"}`}
            />
          </button>
        </div>

        {showLayerPanel && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* Basemap Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Base Imagery Provider
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {BASEMAP_PROVIDERS.map((base) => (
                  <button
                    key={base.id}
                    onClick={() => setSelectedBasemap(base)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left border transition ${
                      selectedBasemap.id === base.id
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
                        : "bg-surface-200/60 text-slate-300 border-border hover:bg-surface-50"
                    }`}
                  >
                    <span className="font-medium">{base.name}</span>
                    {selectedBasemap.id === base.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* NASA GIBS Layer Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                NASA GIBS Satellite Overlays
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedGibsLayer(null)}
                  className={`w-full p-2 rounded-xl text-left border transition ${
                    selectedGibsLayer === null
                      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
                      : "bg-surface-200/60 text-slate-400 border-border hover:bg-surface-50"
                  }`}
                >
                  <span className="font-medium">None (Base map only)</span>
                </button>

                {NASA_GIBS_LAYERS.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedGibsLayer(layer)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition space-y-1 ${
                      selectedGibsLayer?.id === layer.id
                        ? "bg-cyan-500/10 border-cyan-500/40 text-slate-100"
                        : "bg-surface-200/60 border-border text-slate-300 hover:bg-surface-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{layer.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-300 text-cyan-400 font-mono">
                        {layer.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{layer.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GIBS Controls: Date & Opacity */}
            {selectedGibsLayer && (
              <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-3">
                {/* Date Picker */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-cyan-400" /> Observation Date:
                    </span>
                    <span className="text-slate-400 font-mono">{gibsDate}</span>
                  </div>
                  <input
                    type="date"
                    value={gibsDate}
                    max={getDefaultGibsDate()}
                    onChange={(e) => setGibsDate(e.target.value)}
                    className="w-full px-2 py-1 bg-surface-100 border border-border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Eye size={12} className="text-cyan-400" /> Layer Opacity:
                    </span>
                    <span className="text-slate-400 font-mono">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Scientific Attribution & Note */}
            <div className="p-2.5 rounded-xl bg-surface-300/60 border border-border/80 text-[10px] text-slate-400 leading-relaxed space-y-1">
              <span className="font-semibold text-slate-300 block">Attribution & Compliance:</span>
              <p>
                NASA GIBS WMTS tiles are provided by NASA EOSDIS. Tiles reflect daily composite sensor swaths with near-real-time ~3hr delivery latency.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
