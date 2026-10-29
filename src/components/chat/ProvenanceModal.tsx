"use client";

import React from "react";
import { ShieldCheck, X, Copy, ExternalLink, Info, AlertTriangle } from "lucide-react";
import { Attachment, AnalysisMetadata } from "@/types";
import { SCIENTIFIC_UNCERTAINTY_DISCLAIMER, PHYSICAL_CONSTRAINTS_NOTE } from "@/lib/provenance";

interface ProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment?: Attachment | null;
  metadata?: AnalysisMetadata | null;
}

export function ProvenanceModal({
  isOpen,
  onClose,
  attachment,
  metadata,
}: ProvenanceModalProps) {
  if (!isOpen) return null;

  const copyHash = () => {
    if (attachment?.provenance?.sha256) {
      navigator.clipboard.writeText(attachment.provenance.sha256);
      alert("Cryptographic SHA-256 hash copied to clipboard.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-100 border border-border shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck size={20} />
            <h2 className="text-base font-semibold text-white">Cryptographic Provenance & Audit Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {attachment && (
            <div className="space-y-3 p-3.5 rounded-xl bg-surface-200 border border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{attachment.filename}</span>
                <span className="text-[11px] text-slate-400">
                  {(attachment.sizeBytes / 1024).toFixed(1)} KB • {attachment.mimeType}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">SHA-256 Cryptographic Checksum:</span>
                <div className="flex items-center gap-2 bg-surface-300 p-2 rounded-lg font-mono text-[11px] text-cyan-300 break-all border border-cyan-500/20">
                  <span className="flex-1">{attachment.provenance?.sha256}</span>
                  <button
                    onClick={copyHash}
                    className="p-1 rounded hover:bg-surface-100 text-slate-300 hover:text-white"
                    title="Copy SHA-256"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400">Source Provider:</span>
                  <p className="font-medium text-slate-200 uppercase">
                    {attachment.provenance?.sourceProvider || "User Upload"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Computed At:</span>
                  <p className="font-medium text-slate-200">
                    {attachment.provenance?.computedAt ? new Date(attachment.provenance.computedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {metadata && (
            <div className="p-3.5 rounded-xl bg-surface-200 border border-border space-y-2">
              <span className="font-semibold text-white block">AI Model Run Metadata:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Inference Engine:</span>
                  <p className="font-medium text-cyan-400">{metadata.model}</p>
                </div>
                <div>
                  <span className="text-slate-400">Execution Time:</span>
                  <p className="font-medium text-slate-200">{metadata.executionMs} ms</p>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Disclaimer Alert */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Info size={14} />
              <span>Scientific Rigor & Validation Standards</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {SCIENTIFIC_UNCERTAINTY_DISCLAIMER}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400 pt-1">
              {PHYSICAL_CONSTRAINTS_NOTE}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-200 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
