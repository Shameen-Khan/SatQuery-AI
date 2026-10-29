"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatView } from "@/components/chat/ChatView";
import { AreaOfInterest } from "@/types";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c") || undefined;
  const aoiParam = searchParams.get("aoi");

  let initialAoi: AreaOfInterest | null = null;
  if (aoiParam) {
    try {
      initialAoi = JSON.parse(decodeURIComponent(aoiParam));
    } catch {
      initialAoi = null;
    }
  }

  return (
    <ChatView
      initialConversationId={conversationId}
      initialAoi={initialAoi}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 h-screen bg-background" />}>
      <ChatPageContent />
    </Suspense>
  );
}
