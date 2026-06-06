"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

export function useChatHistory(bookId: number, bookTitle: string, bookSlug: string, isAuthenticated: boolean = false) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Ref for activeConvId to avoid stale closures in callbacks
  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);

  // Ref for conversations to avoid getConversation depending on state
  const conversationsRef = useRef<SavedConversation[]>([]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  useEffect(() => {
    if (isAuthenticated) {
      setConversations(loadAll());
    } else {
      setConversations([]);
      setActiveConvId(null);
    }
  }, [isAuthenticated]);

  const trimToMax = useCallback((all: SavedConversation[]): SavedConversation[] => {
    const bookConvs = all.filter(c => c.bookId === bookId);
    if (bookConvs.length <= MAX_CONVERSATIONS_PER_BOOK) return all;

    const sorted = [...bookConvs].sort((a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    const excess = sorted.slice(0, bookConvs.length - MAX_CONVERSATIONS_PER_BOOK);
    const excessIds = new Set(excess.map(c => c.id));
    return all.filter(c => !excessIds.has(c.id));
  }, [bookId]);

  const saveConversation = useCallback((messages: ChatMessage[]) => {
    if (!isAuthenticated) return;
    if (messages.length <= 1) return;

    const now = new Date().toISOString();
    const newId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let isNew = false;

    setConversations(prev => {
      const existing = prev.find(c => c.id === activeConvIdRef.current);
      let updated: SavedConversation[];

      if (existing) {
        updated = prev.map(c =>
          c.id === activeConvIdRef.current
            ? { ...c, messages, updatedAt: now }
            : c
        );
      } else {
        isNew = true;
        const newConv: SavedConversation = {
          id: newId,
          bookId,
          bookTitle,
          bookSlug,
          messages,
          createdAt: now,
          updatedAt: now,
        };
        updated = [newConv, ...prev];
      }

      updated = trimToMax(updated);
      saveAll(updated);
      return updated;
    });

    if (isNew) setActiveConvId(newId);
  }, [isAuthenticated, bookId, bookTitle, bookSlug, trimToMax]);

  const deleteConversation = useCallback((id: string) => {
    if (!isAuthenticated) return;
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveAll(updated);
      return updated;
    });
    if (activeConvIdRef.current === id) setActiveConvId(null);
  }, [isAuthenticated]);

  const getConversation = useCallback((id: string): SavedConversation | undefined => {
    return conversationsRef.current.find(c => c.id === id);
  }, []);

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
