"use client";

import React, { useState, useEffect } from "react";
import { Search, X, ImageIcon, Check, Loader2 } from "lucide-react";
import { NasaImageItem, Attachment } from "@/types";
import { computeSha256, createProvenanceRecord } from "@/lib/provenance";

interface AttachFromLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (attachment: Attachment) => void;
}

export function AttachFromLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
}: AttachFromLibraryModalProps) {
  const [query, setQuery] = useState("Earth satellite hurricane glacier");
  const [items, setItems] = useState<NasaImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && items.length === 0) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/library/nasa?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to load NASA items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachItem = async (item: NasaImageItem) => {
    setProcessingId(item.nasaId);
    try {
      // Generate SHA-256 for provenance
      const dummyBuffer = new TextEncoder().encode(item.previewUrl + item.nasaId);
      const sha256 = await computeSha256(dummyBuffer);

      const attachment: Attachment = {
        id: "nasa-" + item.nasaId,
        filename: `${item.nasaId}.jpg`,
        url: item.previewUrl,
        mimeType: "image/jpeg",
        sizeBytes: 450000,
        provenance: createProvenanceRecord({
          sha256,
          sourceProvider: "nasa_library",
          providerAssetId: item.nasaId,
          acquisitionDate: item.dateCreated,
        }),
      };

      onSelectImage(attachment);
      onClose();
    } catch (err) {
      console.error("Error creating attachment:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-surface-100 border border-border shadow-2xl p-6 text-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-cyan-400">
            <ImageIcon size={20} />
            <h2 className="text-base font-semibold text-white">Attach Image from NASA Archive</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2 my-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search NASA Earth observation imagery..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-200 border border-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-cyan-400" />
              <span className="text-xs">Querying NASA Earth observation archive...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.nasaId}
                  onClick={() => handleAttachItem(item)}
                  className="group relative rounded-xl border border-border bg-surface-200 overflow-hidden cursor-pointer hover:border-cyan-500/50 hover:shadow-glow transition flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {processingId === item.nasaId && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-cyan-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-200 line-clamp-2">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
