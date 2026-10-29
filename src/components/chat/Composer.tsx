"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Image as ImageIcon,
  Compass,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Attachment, AreaOfInterest } from "@/types";
import { AttachFromLibraryModal } from "./AttachFromLibraryModal";

interface ComposerProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  attachedAoi?: AreaOfInterest | null;
  onClearAoi?: () => void;
}

export function Composer({
  onSendMessage,
  isLoading,
  attachedAoi,
  onClearAoi,
}: ComposerProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const starterPrompts = [
    "Describe the land cover in this image.",
    "Identify visible roads and waterways.",
    "Compare the visible changes between these two images.",
    "What can be confidently inferred from this image?",
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading || isUploading) return;
    onSendMessage(message.trim(), attachments);
    setMessage("");
    setAttachments([]);
    setUploadError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAttachments((prev) => [...prev, data.attachment]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Paste image handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          break;
        }
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      processFile(files[0]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-t border-border bg-surface-100/90 backdrop-blur-md px-4 py-3 sm:px-6 transition ${
        isDragging ? "bg-cyan-950/20 ring-2 ring-cyan-500/50" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Starter Prompts chips when empty */}
        {attachments.length === 0 && !message && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <Sparkles size={11} className="text-cyan-400" /> Prompts:
            </span>
            {starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setMessage(prompt)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs bg-surface-200 border border-border/80 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-surface-50 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Upload error alert */}
        {uploadError && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{uploadError}</span>
            </div>
            <button onClick={() => setUploadError(null)}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Attached AOI or Image Preview Strip */}
        {(attachments.length > 0 || attachedAoi || isUploading) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {attachedAoi && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs">
                <Compass size={13} />
                <span className="font-medium">
                  AOI: {attachedAoi.label || `${attachedAoi.type} Selected`}
                </span>
                {onClearAoi && (
                  <button onClick={onClearAoi} className="hover:text-white ml-1">
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-surface-200 border border-border text-xs"
              >
                <div className="w-8 h-8 rounded bg-black/40 overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={att.url} alt={att.filename} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium max-w-[120px] truncate">
                    {att.filename}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {att.provenance?.sha256?.slice(0, 10)}...
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            {isUploading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200 border border-cyan-500/30 text-xs text-cyan-400">
                <Loader2 size={13} className="animate-spin" />
                <span>Hashing & encrypting image...</span>
              </div>
            )}
          </div>
        )}

        {/* Input Box */}
        <div className="relative flex items-end gap-2 rounded-2xl bg-surface-200 border border-border focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 p-2 transition shadow-inner">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/webp,image/tiff"
            className="hidden"
          />

          {/* Attachment buttons */}
          <div className="flex items-center gap-1 pb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-surface-100 transition"
              title="Upload satellite image (JPEG, PNG, WebP, TIFF)"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={() => setShowLibraryModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-surface-100 transition"
              title="Attach imagery from NASA Library"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask a question about this satellite image, terrain, or coordinate region..."
            rows={1}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-none py-2 px-1 max-h-48 leading-relaxed"
          />

          {/* Send Button */}
          <div className="pb-1">
            <button
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || isLoading || isUploading}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-glow"
              title="Send question (Enter)"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Footer uncertainty note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>
            Shift + Enter for new line • Drag & drop images or paste from clipboard
          </span>
          <span className="hidden sm:inline">
            Observable features are distinguished from inferences
          </span>
        </div>
      </div>

      {/* NASA Library Attach Modal */}
      <AttachFromLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectImage={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
      />
    </div>
  );
}
