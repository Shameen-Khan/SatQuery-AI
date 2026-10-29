"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Key,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Lock,
} from "lucide-react";
import { ServiceStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

export function SettingsView() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to permanently delete all your conversation history? This action cannot be undone.")) {
      return;
    }

    try {
      // Fetch user conversations and delete them
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (data.conversations) {
        for (const conv of data.conversations) {
          await fetch(`/api/conversations/${conv.id}`, { method: "DELETE" });
        }
      }
      setClearStatus("All conversation records successfully wiped.");
      setTimeout(() => setClearStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setClearStatus("Failed to clear conversations.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <div className="p-6 border-b border-border bg-surface-100/50 backdrop-blur-md">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-cyan-400" size={22} /> Workspace & System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account credentials, AI integrations, Earth observation API adapters, and data retention.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        {/* Account Profile Card */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Shield size={16} className="text-cyan-400" />
            <span>Authenticated User Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-1">
              <span className="text-slate-400">Account Email:</span>
              <p className="font-semibold text-slate-200">{userEmail || "Local Guest User"}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-200 border border-border space-y-1">
              <span className="text-slate-400">Session Security:</span>
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lock size={12} /> Row Level Security (RLS) Enforced
              </p>
            </div>
          </div>
        </div>

        {/* External Service & API Configuration Status */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Cpu size={16} className="text-cyan-400" />
            <span>API Providers & Integration Diagnostics</span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time status of backend connections. API keys and secrets are never exposed to the client.
          </p>

          <div className="space-y-2.5 pt-1">
            {services.map((s) => (
              <div
                key={s.service}
                className="p-3 rounded-xl bg-surface-200 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{s.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        s.status === "operational"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {s.status === "operational" ? "OPERATIONAL" : "ACTION REQUIRED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{s.message}</p>
                </div>

                {s.docsUrl && (
                  <a
                    href={s.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-300 text-slate-300 hover:text-white border border-border text-[11px] transition self-start sm:self-auto"
                  >
                    <span>Setup Docs</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Privacy & Retention Policy */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database size={16} className="text-cyan-400" />
            <span>Data Privacy & Storage Control</span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-surface-200/50 p-4 rounded-xl border border-border">
            <p>
              • <strong>Private Storage Buckets</strong>: All uploaded satellite imagery files are held in private Supabase Storage buckets under your authenticated user ID. They are accessed exclusively via short-lived, time-limited signed URLs.
            </p>
            <p>
              • <strong>Provenance & Hashes</strong>: SHA-256 cryptographic hashes are computed for every file to guarantee data lineage and prevent silent tampering.
            </p>
            <p>
              • <strong>Isolation</strong>: PostgreSQL Row Level Security (RLS) ensures no other user or organization can view, modify, or query your conversations or uploaded datasets.
            </p>
          </div>

          {clearStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{clearStatus}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Permanently wipe all conversation queries and stored message turns.
            </div>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs transition"
            >
              <Trash2 size={13} />
              <span>Clear Chat History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
