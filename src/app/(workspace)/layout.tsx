"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Conversation } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

function WorkspaceSidebarContainer({
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  conversations,
}: {
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  conversations: Conversation[];
}) {
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("c") || undefined;

  return (
    <Sidebar
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={onSelectConversation}
      onNewChat={onNewChat}
      onDeleteConversation={onDeleteConversation}
      onRenameConversation={onRenameConversation}
    />
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (id: string) => {
    router.push(`/chat?c=${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      router.push("/chat");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="w-72 h-screen border-r border-border bg-surface-100" />}>
        <WorkspaceSidebarContainer
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />
      </Suspense>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
