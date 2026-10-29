"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, Conversation, Attachment, AreaOfInterest } from "@/types";
import { Header } from "../layout/Header";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { Sparkles, Loader2, Compass, AlertCircle, RefreshCw } from "lucide-react";

interface ChatViewProps {
  initialConversationId?: string;
  initialAoi?: AreaOfInterest | null;
  onConversationsUpdated?: () => void;
}

export function ChatView({
  initialConversationId,
  initialAoi,
  onConversationsUpdated,
}: ChatViewProps) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [conversationTitle, setConversationTitle] = useState("New Earth Observation Query");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedAoi, setAttachedAoi] = useState<AreaOfInterest | null>(initialAoi || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      loadConversation(initialConversationId);
    } else {
      setConversationId(undefined);
      setMessages([]);
      setConversationTitle("New Earth Observation Query");
    }
  }, [initialConversationId]);

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      if (data.conversation) {
        setConversationTitle(data.conversation.title);
        setAttachedAoi(data.conversation.aoi || null);
      }
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load the requested conversation.");
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    setError(null);
    setIsLoading(true);

    // Optimistic local user message
    const tempUserMsg: Message = {
      id: "temp-" + Date.now(),
      conversationId: conversationId || "new",
      userId: "current-user",
      role: "user",
      content: text,
      attachments,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: text,
          attachments,
          aoi: attachedAoi,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze imagery");
      }

      // Update active conversation ID if newly created
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        window.history.replaceState(null, "", `/chat?c=${data.conversationId}`);
        if (onConversationsUpdated) onConversationsUpdated();
      }

      // Replace optimistic messages with confirmed database records
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, data.userMessage, data.assistantMessage];
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error sending message");
    } finally {
      setIsLoading(false);
    }
  };

  // Export handlers
  const exportAsMarkdown = () => {
    const mdLines = [
      `# ${conversationTitle}`,
      `*Exported from SatQuery AI on ${new Date().toLocaleString()}*`,
      "",
    ];

    messages.forEach((msg) => {
      const sender = msg.role === "user" ? "User" : "SatQuery AI";
      mdLines.push(`### ${sender} (${new Date(msg.createdAt).toLocaleTimeString()}):`);
      mdLines.push(msg.content);
      if (msg.attachments && msg.attachments.length > 0) {
        mdLines.push("\n**Attachments:**");
        msg.attachments.forEach((a) => {
          mdLines.push(`- ${a.filename} (SHA-256: \`${a.provenance?.sha256}\`)`);
        });
      }
      mdLines.push("\n---\n");
    });

    const blob = new Blob([mdLines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-${conversationTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJson = () => {
    const jsonStr = JSON.stringify(
      {
        title: conversationTitle,
        conversationId,
        exportedAt: new Date().toISOString(),
        aoi: attachedAoi,
        messages,
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-${conversationTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <Header
        title={conversationTitle}
        onExportMarkdown={messages.length > 0 ? exportAsMarkdown : undefined}
        onExportJson={messages.length > 0 ? exportAsJson : undefined}
        aoiActive={Boolean(attachedAoi)}
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-lg">
              <Sparkles size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                SatQuery AI • Earth Observation Intelligence
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Upload your optical or multispectral satellite imagery, attach assets from the NASA Archive, or select an Area of Interest on the map.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full text-left pt-2">
              <div className="p-3 rounded-xl bg-surface-100 border border-border text-xs space-y-1">
                <span className="font-semibold text-slate-200">Optical Analysis</span>
                <p className="text-[11px] text-slate-400">
                  Inspect coastline erosion, urban development, burn scars, and crop patterns.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-border text-xs space-y-1">
                <span className="font-semibold text-slate-200">Cryptographic Provenance</span>
                <p className="text-[11px] text-slate-400">
                  Every uploaded image has its SHA-256 computed and audited automatically.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-6 px-4 sm:px-6 flex gap-3.5 bg-surface-200/20 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="flex-1 space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-400">Analyzing Earth Observation Scene...</span>
              </div>
              <div className="h-3 w-3/4 bg-surface-50 rounded" />
              <div className="h-3 w-1/2 bg-surface-50 rounded" />
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 mx-6 my-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Area */}
      <Composer
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        attachedAoi={attachedAoi}
        onClearAoi={() => setAttachedAoi(null)}
      />
    </div>
  );
}
