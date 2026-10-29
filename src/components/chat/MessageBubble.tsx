"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, Sparkles, User, ExternalLink, Clock, Layers } from "lucide-react";
import { Message, Attachment } from "@/types";
import { ProvenanceModal } from "./ProvenanceModal";

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [showProvenance, setShowProvenance] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openProvenance = (att?: Attachment) => {
    setSelectedAttachment(att || message.attachments?.[0] || null);
    setShowProvenance(true);
  };

  // Simple, safe Markdown formatter for headers, bold, bullet points, and code blocks
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Code block
      if (line.startsWith("```")) {
        return (
          <div key={idx} className="my-1 text-slate-500 font-mono text-[10px]">
            {line}
          </div>
        );
      }
      // H3
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-sm font-bold text-cyan-300 mt-3 mb-1.5 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h3>
        );
      }
      // H4
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-xs font-semibold text-slate-200 mt-2.5 mb-1">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      // Bullet point
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-300 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        );
      }
      // Horizontal Rule
      if (line.trim() === "---") {
        return <hr key={idx} className="border-border my-3" />;
      }
      // Normal line
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-slate-300'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-surface-300 text-cyan-300 font-mono text-[11px]'>$1</code>");
  };

  return (
    <div className={`py-4 px-4 sm:px-6 transition flex gap-3.5 ${isUser ? "bg-surface-200/40" : "bg-transparent"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300">
            <User size={15} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow">
            <Sparkles size={16} />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Header metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {isUser ? "You" : "SatQuery AI"}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {!isUser && message.metadata?.model && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 text-cyan-400 border border-border font-mono">
                {message.metadata.model}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
            <button
              onClick={copyContent}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-50 transition"
              title="Copy message"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            {!isUser && (message.attachments?.length || message.metadata) && (
              <button
                onClick={() => openProvenance()}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 transition"
                title="Inspect cryptographic hash & provenance"
              >
                <ShieldCheck size={11} />
                <span>Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Attachments preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-w-xl">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="group relative rounded-xl overflow-hidden border border-border bg-surface-200 p-2 space-y-2 hover:border-cyan-500/40 transition"
              >
                <div
                  className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/40 cursor-pointer"
                  onClick={() => setPreviewImage(att.url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">
                    {att.filename}
                  </span>
                  <button
                    onClick={() => openProvenance(att)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                  >
                    <ShieldCheck size={10} />
                    <span>SHA-256</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formatted Content */}
        <div className="space-y-1">{renderFormattedContent(message.content)}</div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-border/60 flex flex-wrap gap-2">
            {message.citations.map((cite, i) => (
              <a
                key={i}
                href={cite.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-surface-200 border border-border text-slate-300 hover:text-cyan-300 transition"
              >
                <span>{cite.title}</span>
                <ExternalLink size={9} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Provenance Modal */}
      <ProvenanceModal
        isOpen={showProvenance}
        onClose={() => setShowProvenance(false)}
        attachment={selectedAttachment}
        metadata={message.metadata}
      />

      {/* Full Size Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Expanded satellite view" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
