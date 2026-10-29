"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Bookmark,
  MessageSquare,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  Globe2,
} from "lucide-react";
import { NasaImageItem } from "@/types";

export function NasaLibraryExplorer() {
  const router = useRouter();
  const [query, setQuery] = useState("Earth satellite observation");
  const [items, setItems] = useState<NasaImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<NasaImageItem[] | null>(null);

  const presetFilters = [
    { label: "Earth Observation", q: "Earth satellite observation" },
    { label: "Wildfires & Smoke", q: "wildfire smoke plume satellite" },
    { label: "Glaciers & Ice", q: "glacier ice sheet satellite" },
    { label: "Hurricanes & Storms", q: "cyclone hurricane typhoon satellite" },
    { label: "Night Lights", q: "city lights night earth satellite" },
    { label: "Volcanoes", q: "volcano eruption ash plume satellite" },
  ];

  const searchNasa = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/nasa?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setItems(data.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error querying NASA archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchNasa(query);
    // Fetch user's saved items to show bookmark state
    fetch("/api/library/save")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const ids = new Set<string>(data.items.map((i: { nasa_id: string }) => i.nasa_id));
          setSavedIds(ids);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSave = async (item: NasaImageItem) => {
    const isSaved = savedIds.has(item.nasaId);
    try {
      if (isSaved) {
        await fetch(`/api/library/save?nasaId=${encodeURIComponent(item.nasaId)}`, {
          method: "DELETE",
        });
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.nasaId);
          return next;
        });
      } else {
        await fetch("/api/library/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nasaId: item.nasaId,
            title: item.title,
            description: item.description,
            thumbnailUrl: item.previewUrl,
            assetUrl: item.previewUrl,
            mediaType: item.mediaType,
            dateCreated: item.dateCreated,
          }),
        });
        setSavedIds((prev) => new Set(prev).add(item.nasaId));
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const handleLaunchChat = (item: NasaImageItem) => {
    router.push(`/chat?nasaId=${encodeURIComponent(item.nasaId)}&title=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.previewUrl)}`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Banner & Search */}
      <div className="p-6 border-b border-border bg-surface-100/50 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Globe2 className="text-cyan-400" size={22} /> NASA Earth Imagery & Media Library
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search authentic, public Earth observation missions, Terra/Aqua sensors, and astronaut photography.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchNasa(query)}
                placeholder="Search NASA archive..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-200 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button
              onClick={() => searchNasa(query)}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {/* Preset filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold flex-shrink-0">
            Filters:
          </span>
          {presetFilters.map((filter, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(filter.q);
                searchNasa(filter.q);
              }}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border transition ${
                query === filter.q
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-surface-200 border-border text-slate-300 hover:text-white hover:bg-surface-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
            <span className="text-sm">Retrieving imagery from NASA Image and Video Library...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            No NASA imagery matches your search. Try different keywords like &quot;satellite&quot;, &quot;ocean&quot;, or &quot;glacier&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const isSaved = savedIds.has(item.nasaId);
              return (
                <div
                  key={item.nasaId}
                  className="group rounded-2xl border border-border bg-surface-100 overflow-hidden flex flex-col hover:border-cyan-500/40 hover:shadow-glow transition duration-200"
                >
                  <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {item.isEarthObservation ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                          Earth Observation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-slate-300 border border-border backdrop-blur-md">
                          NASA Media
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSave(item)}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition ${
                        isSaved
                          ? "bg-cyan-500 text-white border-cyan-400"
                          : "bg-surface-200/80 text-slate-300 hover:text-white border-border hover:bg-surface-100"
                      }`}
                      title={isSaved ? "Saved to Library" : "Bookmark image"}
                    >
                      <Bookmark size={14} className={isSaved ? "fill-white" : ""} />
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono text-[10px]">
                        {item.nasaId}
                      </span>
                      <button
                        onClick={() => handleLaunchChat(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30 transition"
                      >
                        <MessageSquare size={12} />
                        <span>Analyze</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
