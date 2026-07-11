import type { Book, SavedConversation, ConversationDetail, BookSuggestion, ChatResponse } from '../types';
import { handleApiResponse } from './apiEvents';
import { CACHE_DURATION, STALE_DURATION } from '../constants';

export interface ApiChatMessage {
  role: string;
  content: string | any[];
}

const LS_PREFIX = 'maududi_cache_';

const memoryCache = new Map<string, { data: any; timestamp: number; stale: boolean }>();

function getCacheKey(endpoint: string, params?: any): string {
  return `${endpoint}${params ? `?${JSON.stringify(params)}` : ''}`;
}

function getFromStorage(key: string): { data: any; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function setToStorage(key: string, data: any, timestamp: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, timestamp }));
  } catch { /* quota exceeded */ }
}

// SWR: return cached data immediately if available (even if stale), refresh in background
function swrGet(key: string): { data: any; isStale: boolean } | null {
  // 1. Check memory (fastest)
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem) {
    if (now - mem.timestamp < CACHE_DURATION) return { data: mem.data, isStale: false };
    if (now - mem.timestamp < CACHE_DURATION + STALE_DURATION) return { data: mem.data, isStale: true };
    memoryCache.delete(key);
  }

  // 2. Check localStorage (persistent across navigations)
  const stored = getFromStorage(key);
  if (stored) {
    const elapsed = now - stored.timestamp;
    if (elapsed < CACHE_DURATION) {
      memoryCache.set(key, { data: stored.data, timestamp: stored.timestamp, stale: false });
      return { data: stored.data, isStale: false };
    }
    if (elapsed < CACHE_DURATION + STALE_DURATION) {
      memoryCache.set(key, { data: stored.data, timestamp: stored.timestamp, stale: true });
      return { data: stored.data, isStale: true };
    }
    try { localStorage.removeItem(LS_PREFIX + key); } catch { /* empty */ }
  }

  return null;
}

function swrSet(key: string, data: any): void {
  const now = Date.now();
  memoryCache.set(key, { data, timestamp: now, stale: false });
  setToStorage(key, data, now);
}

function clearCache(): void {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

const activeControllers = new Set<AbortController>();

export function cancelPendingRequests(): void {
  activeControllers.forEach(c => c.abort());
  activeControllers.clear();
}

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const merged: RequestInit = {
    ...options,
    credentials: 'include',
  };
  const response = await fetch(url, merged);
  return handleApiResponse(response);
}

function getAbortSignal(signal?: AbortSignal): AbortSignal | undefined {
  if (signal) return signal;
  const controller = new AbortController();
  activeControllers.add(controller);
  const cleanup = () => activeControllers.delete(controller);
  controller.signal.addEventListener('abort', cleanup, { once: true });
  return controller.signal;
}

export const apiService = {
  // Get all books or filter by category
  // Cache promise to avoid duplicate in-flight requests
  _bookFetchPromises: new Map<string, Promise<Book[]>>(),

  getBooks: async (category?: string, signal?: AbortSignal): Promise<Book[]> => {
    const cacheKey = getCacheKey('/api/v1/books', { category });

    // SWR: return cached immediately if available
    const cached = swrGet(cacheKey);
    // Skip cache if data is empty (stale empty array from earlier fetch)
    if (cached && !cached.isStale && cached.data.length > 0) return cached.data;
    if (cached && cached.isStale && cached.data.length > 0) {
      // Return stale data, but refresh in background (don't await)
      const refresh = async () => {
        try {
          const fresh = await apiService._fetchBooks(category, signal);
          swrSet(cacheKey, fresh);
          return fresh;
        } catch { /* keep stale data */ }
      };
      refresh();
      return cached.data;
    }

    return apiService._fetchBooks(category, signal);
  },

  _fetchBooks: async (category?: string, signal?: AbortSignal): Promise<Book[]> => {
    const cacheKey = getCacheKey('/api/v1/books', { category });

    // Deduplicate concurrent requests
    const existing = apiService._bookFetchPromises.get(cacheKey);
    if (existing) return existing;

    const url = category 
      ? `/api/v1/books?category=${encodeURIComponent(category)}`
      : '/api/v1/books';
    
    const promise = (async () => {
      try {
        const response = await apiFetch(url, { signal: getAbortSignal(signal) });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as any).detail || `Failed to fetch books: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        swrSet(cacheKey, data);
        return data;
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error('Cannot connect to the server. Please try again.');
        }
        throw error;
      } finally {
        apiService._bookFetchPromises.delete(cacheKey);
      }
    })();

    apiService._bookFetchPromises.set(cacheKey, promise);
    return promise;
  },

  // Get all categories
  getCategories: async (signal?: AbortSignal): Promise<string[]> => {
    const cacheKey = getCacheKey('/api/v1/books/categories');
    const cached = swrGet(cacheKey);
    if (cached && !cached.isStale && cached.data.length > 0) return cached.data;
    if (cached && cached.isStale && cached.data.length > 0) {
      const refresh = async () => {
        try {
          const response = await apiFetch('/api/v1/books/categories', { signal: getAbortSignal(signal) });
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          swrSet(cacheKey, data);
        } catch { /* background refresh failed, keep stale data */ }
      };
      refresh();
      return cached.data;
    }

        const response = await apiFetch('/api/v1/books/categories', { signal: getAbortSignal(signal) });
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    swrSet(cacheKey, data);
    return data;
  },

  // Get a specific book by ID
  getBook: async (bookId: number, signal?: AbortSignal): Promise<Book> => {
    const cacheKey = getCacheKey(`/api/v1/books/${bookId}`);
    const cached = swrGet(cacheKey);
    if (cached && !cached.isStale) return cached.data;
    if (cached && cached.isStale) {
      const refresh = async () => {
        try {
          const response = await apiFetch(`/api/v1/books/${bookId}`, { signal: getAbortSignal(signal) });
          if (!response.ok) throw new Error('Failed to fetch book');
          const data = await response.json();
          swrSet(cacheKey, data);
        } catch { /* keep stale data */ }
      };
      refresh();
      return cached.data;
    }

    const response = await apiFetch(`/api/v1/books/${bookId}`, { signal: getAbortSignal(signal) });
    if (!response.ok) throw new Error('Failed to fetch book');
    const data = await response.json();
    swrSet(cacheKey, data);
    return data;
  },

  // Chat with AI about a book
  chat: async (bookId: number, aiContext: string, messages: ApiChatMessage[], signal?: AbortSignal, conversationId?: number, language?: string): Promise<ChatResponse> => {
    const response = await apiFetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, aiContext, messages, conversationId, language }),
      signal: getAbortSignal(signal),
    });
    if (!response.ok) {
      let errMessage = `Failed to send chat message: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.details || errData.error) {
          errMessage = errData.details || errData.error;
        }
      } catch {
        // ignore parse error; fall back to status text
      }
      throw new Error(errMessage);
    }
    return response.json();
  },

  // Global Chat (e.g., AiContextFinder)
  globalChat: async (systemInstruction: string, messages: ApiChatMessage[], signal?: AbortSignal, conversationId?: number, language?: string): Promise<ChatResponse> => {
    const response = await apiFetch('/api/chat/global', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemInstruction, messages, conversationId, language }),
      signal: getAbortSignal(signal),
    });
    if (!response.ok) {
      let errMessage = `Failed to send global chat message: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.details || errData.error) {
          errMessage = errData.details || errData.error;
        }
      } catch {
        // ignore parse error; fall back to status text
      }
      throw new Error(errMessage);
    }
    return response.json();
  },

  // Get conversations for current user
  getConversations: async (bookId?: number, limit?: number): Promise<SavedConversation[]> => {
    const params = new URLSearchParams();
    if (bookId) params.set('book_id', String(bookId));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    const response = await apiFetch(`/api/chat/conversations${qs ? `?${qs}` : ''}`);
    if (!response.ok) return [];
    return response.json();
  },

  // Get a single conversation with messages
  getConversation: async (conversationId: number): Promise<ConversationDetail> => {
    const response = await apiFetch(`/api/chat/conversations/${conversationId}`);
    if (!response.ok) throw new Error('Failed to load conversation');
    return response.json();
  },

  // Delete a conversation
  deleteConversation: async (conversationId: number): Promise<void> => {
    await apiFetch(`/api/chat/conversations/${conversationId}`, { method: 'DELETE' });
  },

  // Share a conversation
  shareConversation: async (conversationId: number): Promise<{ shareId: string; url: string }> => {
    const response = await apiFetch(`/api/chat/conversations/${conversationId}/share`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to share conversation');
    return response.json();
  },

  // Get book suggestions by topic
  getBookSuggestions: async (topics: string[]): Promise<BookSuggestion[]> => {
    if (!topics.length) return [];
    const response = await apiFetch(`/api/chat/suggestions?topics=${encodeURIComponent(topics.join(','))}`);
    if (!response.ok) return [];
    return response.json();
  },



  // Login
  login: async (email: string, password: string, remember?: boolean): Promise<{ access_token: string; expires_in: number }> => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember: remember ?? true }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return response.json();
  },

  // Register
  register: async (username: string, email: string, password: string, display_name?: string): Promise<{ id: number; email: string; display_name: string; is_active: boolean }> => {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username || email.split('@')[0], email, password, display_name: display_name || '' }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return response.json();
  },

  // Get current user
  getMe: async (): Promise<{ id: number; email: string; display_name: string; is_active: boolean }> => {
    const response = await apiFetch('/api/auth/me');
    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  },

  // Update profile (display_name, email)
  updateProfile: async (data: { display_name?: string; email?: string }): Promise<{ id: number; email: string; display_name: string; is_active: boolean }> => {
    const response = await apiFetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Update failed' }));
      throw new Error(err.detail || 'Update failed');
    }
    return response.json();
  },

  // Change password
  changePassword: async (current_password: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiFetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to change password' }));
      throw new Error(err.detail || 'Failed to change password');
    }
    return response.json();
  },

  // Delete account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await apiFetch('/api/auth/me', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to delete account' }));
      throw new Error(err.detail || 'Failed to delete account');
    }
    return response.json();
  },

  // Record reading history
  recordReadingHistory: async (bookId: number, title: string, slug: string, imageUrl: string, category: string): Promise<void> => {
    const response = await apiFetch('/api/reading-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, title, slug, imageUrl, category }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to record reading history' }));
      throw new Error(err.detail || 'Failed to record reading history');
    }
  },

  // Get reading history
  getReadingHistory: async (): Promise<any[]> => {
    const response = await apiFetch('/api/reading-history');
    if (!response.ok) return [];
    return response.json();
  },

  // Verify email
  verifyEmail: async (code: string, email: string): Promise<{ access_token: string; token_type: string; expires_in: number }> => {
    const response = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Verification failed');
    }
    return response.json();
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to send reset email' }));
      throw new Error(err.detail || 'Failed to send reset email');
    }
    return response.json();
  },

  // Reset password
  resetPassword: async (token: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to reset password' }));
      throw new Error(err.detail || 'Failed to reset password');
    }
    return response.json();
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  },

  // Clear cache (useful after mutations)
  clearCache,
};
