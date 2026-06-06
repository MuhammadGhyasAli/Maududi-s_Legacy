"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatMessage } from "../types";

const STORAGE_KEY = "ml_chat_histories";

interface SavedConversation {
  id: string;
  bookId: number;
  bookTitle: string;
  bookSlug: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

function loadAll(): SavedConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(conversations: SavedConversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // quota exceeded
  }
}

const MAX_CONVERSATIONS_PER_BOOK = 5;

export function useChatHistory(bookId: number, bookTitle: string, bookSlug: string) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(loadAll());
  }, []);

  const trimToMax = useCallback((all: SavedConversation[]): SavedConversation[] => {
    const bookConvs = all.filter(c => c.bookId === bookId);
    if (bookConvs.length <= MAX_CONVERSATIONS_PER_BOOK) return all;

    // Sort by updatedAt ascending (oldest first), mark excess for removal
    const sorted = [...bookConvs].sort((a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    const excess = sorted.slice(0, bookConvs.length - MAX_CONVERSATIONS_PER_BOOK);
    const excessIds = new Set(excess.map(c => c.id));
    return all.filter(c => !excessIds.has(c.id));
  }, [bookId]);

  const saveConversation = useCallback((messages: ChatMessage[]) => {
    if (messages.length <= 1) return; // don't save empty/greeting-only chats

    const now = new Date().toISOString();
    setConversations(prev => {
      const existing = prev.find(c => c.id === activeConvId);
      let updated: SavedConversation[];

      if (existing) {
        updated = prev.map(c =>
          c.id === activeConvId
            ? { ...c, messages, updatedAt: now }
            : c
        );
      } else {
        const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newConv: SavedConversation = {
          id,
          bookId,
          bookTitle,
          bookSlug,
          messages,
          createdAt: now,
          updatedAt: now,
        };
        updated = [newConv, ...prev];
        setActiveConvId(id);
      }

      updated = trimToMax(updated);
      saveAll(updated);
      return updated;
    });
  }, [activeConvId, bookId, bookTitle, bookSlug, trimToMax]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveAll(updated);
      return updated;
    });
    if (activeConvId === id) setActiveConvId(null);
  }, [activeConvId]);

  const getConversation = useCallback((id: string): SavedConversation | undefined => {
    return conversations.find(c => c.id === id);
  }, [conversations]);

  const bookConversations = conversations.filter(c => c.bookId === bookId);

  return {
    conversations: bookConversations,
    activeConvId,
    setActiveConvId,
    saveConversation,
    deleteConversation,
    getConversation,
  };
}
