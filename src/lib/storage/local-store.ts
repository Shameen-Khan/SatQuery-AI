import fs from "fs";
import path from "path";
import { Conversation, Message } from "@/types";

interface LocalDatabase {
  conversations: Conversation[];
  messages: Message[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local-conversations.json");

function ensureDbFile(): LocalDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: LocalDatabase = { conversations: [], messages: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    const fallback: LocalDatabase = { conversations: [], messages: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

function writeDbFile(data: LocalDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getLocalConversations(searchQuery?: string): Promise<Conversation[]> {
  const db = ensureDbFile();
  let list = db.conversations.sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(q));
  }

  return list;
}

export async function getLocalConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
  const db = ensureDbFile();
  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) return null;

  const msgs = db.messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return { conversation: conv, messages: msgs };
}

export async function saveLocalConversation(conv: Conversation): Promise<Conversation> {
  const db = ensureDbFile();
  const existingIdx = db.conversations.findIndex((c) => c.id === conv.id);

  if (existingIdx >= 0) {
    db.conversations[existingIdx] = { ...db.conversations[existingIdx], ...conv, updatedAt: new Date().toISOString() };
  } else {
    db.conversations.unshift(conv);
  }

  writeDbFile(db);
  return conv;
}

export async function saveLocalMessage(msg: Message): Promise<Message> {
  const db = ensureDbFile();
  db.messages.push(msg);

  // Update conversation updatedAt
  const convIdx = db.conversations.findIndex((c) => c.id === msg.conversationId);
  if (convIdx >= 0) {
    db.conversations[convIdx].updatedAt = new Date().toISOString();
  }

  writeDbFile(db);
  return msg;
}

export async function updateLocalConversationTitle(id: string, title: string): Promise<Conversation | null> {
  const db = ensureDbFile();
  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) return null;

  conv.title = title;
  conv.updatedAt = new Date().toISOString();
  writeDbFile(db);
  return conv;
}

export async function deleteLocalConversation(id: string): Promise<boolean> {
  const db = ensureDbFile();
  db.conversations = db.conversations.filter((c) => c.id !== id);
  db.messages = db.messages.filter((m) => m.conversationId !== id);
  writeDbFile(db);
  return true;
}

export async function clearAllLocalConversations(): Promise<void> {
  writeDbFile({ conversations: [], messages: [] });
}
