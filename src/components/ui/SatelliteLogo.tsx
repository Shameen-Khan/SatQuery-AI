import React from "react";

export function SatelliteLogo({ className = "w-8 h-8", withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/30 p-2 shadow-glow ${className}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-cyan-400 animate-pulse"
        >
          {/* Central Satellite Body */}
          <polygon points="12 4 19 8 19 16 12 20 5 16 5 8 12 4" fill="rgba(6, 182, 212, 0.15)" />
          {/* Orbital Sensor Lens */}
          <circle cx="12" cy="12" r="3" className="stroke-cyan-300 fill-cyan-500/40" />
          {/* Left Solar Array */}
          <path d="M5 10H1M5 14H1M1 10V14" className="stroke-blue-400" />
          {/* Right Solar Array */}
          <path d="M19 10H23M19 14H23M23 10V14" className="stroke-blue-400" />
          {/* Downlink Beam */}
          <path d="M10 21L12 23L14 21" className="stroke-cyan-400" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-lg">SatQuery</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-extrabold text-lg">
              AI
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Talk to Earth
          </span>
        </div>
      )}
    </div>
  );
}
