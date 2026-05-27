import type { Book } from '../types';

export interface ChatMessage {
  role: string;
  content: string | any[];
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for persistence
const STALE_DURATION = 5 * 60 * 1000;  // 5 minutes: serve stale while revalidating
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

let currentAbortController: AbortController | null = null;

export function cancelPendingRequests(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

function getAbortSignal(signal?: AbortSignal): AbortSignal | undefined {
  if (signal) return signal;
  if (!currentAbortController) {
    currentAbortController = new AbortController();
  }
  return currentAbortController.signal;
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
        const response = await fetch(url, { signal: getAbortSignal(signal) });
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
          const response = await fetch('/api/v1/books/categories', { signal: getAbortSignal(signal) });
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          swrSet(cacheKey, data);
        } catch { /* background refresh failed, keep stale data */ }
      };
      refresh();
      return cached.data;
    }

    const response = await fetch('/api/v1/books/categories', { signal: getAbortSignal(signal) });
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
          const response = await fetch(`/api/v1/books/${bookId}`, { signal: getAbortSignal(signal) });
          if (!response.ok) throw new Error('Failed to fetch book');
          const data = await response.json();
          swrSet(cacheKey, data);
        } catch { /* keep stale data */ }
      };
      refresh();
      return cached.data;
    }

    const response = await fetch(`/api/v1/books/${bookId}`, { signal: getAbortSignal(signal) });
    if (!response.ok) throw new Error('Failed to fetch book');
    const data = await response.json();
    swrSet(cacheKey, data);
    return data;
  },

  // Chat with AI about a book
  chat: async (bookId: number, aiContext: string, messages: ChatMessage[], signal?: AbortSignal): Promise<{ response: string }> => {
    const response = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, aiContext, messages }),
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
  globalChat: async (systemInstruction: string, messages: ChatMessage[], signal?: AbortSignal): Promise<{ response: string }> => {
    const response = await fetch('/api/v1/chat/global', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemInstruction, messages }),
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



  // Login
  login: async (email: string, password: string): Promise<{ access_token: string; expires_in: number }> => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return response.json();
  },

  // Register
  register: async (username: string, email: string, password: string, display_name?: string): Promise<{ id: number; username: string; email: string; display_name: string; is_active: boolean }> => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, display_name: display_name || '' }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return response.json();
  },

  // Get current user
  getMe: async (token: string): Promise<{ id: number; username: string; email: string; display_name: string; is_active: boolean }> => {
    const response = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  },

  // Clear cache (useful after mutations)
  clearCache,
};
