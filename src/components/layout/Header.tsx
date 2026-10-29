"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, AlertCircle, Compass, Download, RefreshCw } from "lucide-react";
import { ServiceStatus } from "@/types";

interface HeaderProps {
  title?: string;
  onExportMarkdown?: () => void;
  onExportJson?: () => void;
  aoiActive?: boolean;
}

export function Header({
  title = "SatQuery AI Workspace",
  onExportMarkdown,
  onExportJson,
  aoiActive = false,
}: HeaderProps) {
  const [healthStatus, setHealthStatus] = useState<ServiceStatus[]>([]);
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) {
          setHealthStatus(data.services);
        }
      })
      .catch(() => {});
  }, []);

  const hasConfigIssues = healthStatus.some((s) => s.status !== "operational");

  return (
    <header className="h-14 border-b border-border bg-surface-100/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-100 truncate max-w-md">
          {title}
        </h1>
        {aoiActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Compass size={11} /> AOI Attached
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Export Dropdown */}
        {(onExportMarkdown || onExportJson) && (
          <div className="flex items-center gap-1.5">
            {onExportMarkdown && (
              <button
                onClick={onExportMarkdown}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border text-slate-300 hover:text-white hover:bg-surface-50 transition"
                title="Export conversation as Markdown"
              >
                <Download size={13} />
                <span>MD</span>
              </button>
            )}
            {onExportJson && (
              <button
                onClick={onExportJson}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border text-slate-300 hover:text-white hover:bg-surface-50 transition"
                title="Export conversation as JSON"
              >
                <Download size={13} />
                <span>JSON</span>
              </button>
            )}
          </div>
        )}

        {/* Health status badge */}
        <div className="relative">
          <button
            onClick={() => setShowStatusPopover(!showStatusPopover)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition ${
              hasConfigIssues
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            <Activity size={12} className={hasConfigIssues ? "animate-pulse" : ""} />
            <span>{hasConfigIssues ? "Setup Needed" : "Services Ready"}</span>
          </button>

          {/* Health Details Popover */}
          {showStatusPopover && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-100 border border-border shadow-2xl p-4 text-xs z-50">
              <div className="flex items-center justify-between pb-2 border-b border-border/80 mb-3">
                <span className="font-semibold text-slate-200">System & API Status</span>
                <Link
                  href="/settings"
                  onClick={() => setShowStatusPopover(false)}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  Configure
                </Link>
              </div>

              <div className="space-y-2.5">
                {healthStatus.map((service) => (
                  <div key={service.service} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">{service.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          service.status === "operational"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {service.status === "operational" ? "READY" : "CONFIG REQUIRED"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{service.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
