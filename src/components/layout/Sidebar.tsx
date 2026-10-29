"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Activity,
  Compass,
  Image as ImageIcon,
  Bookmark,
  Settings,
  Plus,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { SatelliteLogo } from "../ui/SatelliteLogo";
import { Conversation } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
}

export function Sidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Analysis Studio", href: "/studio", icon: Activity },
    { label: "AI Chat", href: "/chat", icon: MessageSquare },
    { label: "NASA Library", href: "/library", icon: ImageIcon },
    { label: "Map Explorer", href: "/map", icon: Compass },
    { label: "Saved Imagery", href: "/saved", icon: Bookmark },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  // Group conversations by relative date
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupConversations = () => {
    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    filteredConversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt || conv.createdAt);
      const diffDays = Math.floor((now.getTime() - convDate.getTime()) / oneDay);

      if (diffDays === 0) groups["Today"].push(conv);
      else if (diffDays === 1) groups["Yesterday"].push(conv);
      else if (diffDays < 7) groups["Previous 7 Days"].push(conv);
      else groups["Older"].push(conv);
    });

    return groups;
  };

  const grouped = groupConversations();

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameConversation) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-border bg-surface-100 transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/80">
        <Link href="/chat" className="flex items-center">
          <SatelliteLogo withText={!collapsed} />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => {
            if (onNewChat) onNewChat();
            else router.push("/chat");
          }}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-glow transition active:scale-[0.98]"
        >
          <Plus size={18} />
          {!collapsed && <span>New Query</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-400"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Conversations Section */}
      {!collapsed && (
        <div className="flex-1 flex flex-col min-h-0 px-3 pt-3">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-200 border border-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Grouped Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {Object.entries(grouped).map(([groupTitle, list]) => {
              if (list.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <span className="px-2 font-semibold text-[10px] tracking-wider uppercase text-slate-500">
                    {groupTitle}
                  </span>
                  {list.map((conv) => {
                    const isSelected = conv.id === activeConversationId;
                    const isEditing = editingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (onSelectConversation) onSelectConversation(conv.id);
                          else router.push(`/chat?c=${conv.id}`);
                        }}
                        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition ${
                          isSelected
                            ? "bg-surface-50 text-white font-medium border border-border"
                            : "text-slate-400 hover:text-slate-200 hover:bg-surface-200/50"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-1.5 py-0.5 text-xs bg-surface-100 border border-cyan-500 rounded text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={(e) => saveEditing(conv.id, e)}
                              className="p-1 text-cyan-400 hover:text-cyan-300"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-slate-400 hover:text-slate-300"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="truncate pr-2">{conv.title}</span>
                            <div className="hidden group-hover:flex items-center gap-1">
                              <button
                                onClick={(e) => startEditing(conv, e)}
                                className="p-1 text-slate-400 hover:text-white rounded"
                                title="Rename"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onDeleteConversation && confirm(`Delete "${conv.title}"?`)) {
                                    onDeleteConversation(conv.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-xs">
                No conversations found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Account / Footer */}
      <div className="p-3 border-t border-border/80 bg-surface-200/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-xs">
              {userEmail ? userEmail.slice(0, 2).toUpperCase() : "SQ"}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 truncate">
                  {userEmail || "Local Earth Explorer"}
                </span>
                <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <ShieldCheck size={10} /> Authenticated
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-surface-50 transition"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
