"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MessageSquare, Trash2, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react";

interface SavedItem {
  id: string;
  nasa_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  asset_url: string;
  date_created: string;
}

export function SavedImageryView() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library/save");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (nasaId: string) => {
    try {
      await fetch(`/api/library/save?nasaId=${encodeURIComponent(nasaId)}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((i) => i.nasa_id !== nasaId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = (item: SavedItem) => {
    router.push(
      `/chat?nasaId=${encodeURIComponent(item.nasa_id)}&title=${encodeURIComponent(
        item.title
      )}&url=${encodeURIComponent(item.thumbnail_url)}`
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <div className="p-6 border-b border-border bg-surface-100/50 backdrop-blur-md">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="text-cyan-400" size={22} /> Saved Earth Observation Assets
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Your curated bookmarks and pins from the NASA archive and analysis runs.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 size={28} className="animate-spin text-cyan-400" />
            <span className="text-xs">Loading saved imagery bookmarks...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 max-w-sm mx-auto text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 border border-border flex items-center justify-center text-slate-400">
              <Bookmark size={22} />
            </div>
            <p className="text-sm font-medium text-slate-300">No saved satellite imagery yet</p>
            <p className="text-xs text-slate-500">
              Browse the NASA Library or explore the GIBS map to bookmark interesting Earth scenes for future analysis.
            </p>
            <button
              onClick={() => router.push("/library")}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
            >
              Browse NASA Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-border bg-surface-100 overflow-hidden flex flex-col hover:border-cyan-500/40 transition"
              >
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => handleRemove(item.nasa_id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-rose-400 hover:bg-black/80 transition"
                    title="Remove from saved"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-100 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.nasa_id}
                    </span>
                    <button
                      onClick={() => handleAnalyze(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition"
                    >
                      <MessageSquare size={12} />
                      <span>Analyze</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
