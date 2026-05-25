const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';



// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint: string, params?: any): string {
  return `${endpoint}${params ? `?${JSON.stringify(params)}` : ''}`;
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  aiContext: string;
  publicationYear: number;
  category: string;
}

export interface ChatMessage {
  role: string;
  content: string | any[];
}



export const apiService = {
  // Get all books or filter by category
  getBooks: async (category?: string): Promise<Book[]> => {
    const cacheKey = getCacheKey('/api/v1/books', { category });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = category 
      ? `${API_BASE_URL}/api/v1/books?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/api/v1/books`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Cannot connect to API at ${API_BASE_URL}. Make sure the backend server is running.`);
      }
      throw error;
    }
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const cacheKey = getCacheKey('/api/v1/books/categories');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/api/v1/books/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  },

  // Get a specific book by ID
  getBook: async (bookId: number): Promise<Book> => {
    const cacheKey = getCacheKey(`/api/v1/books/${bookId}`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/api/v1/books/${bookId}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  },

  // Chat with AI about a book
  chat: async (bookId: number, messages: ChatMessage[]): Promise<{ response: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, messages }),
    });
    if (!response.ok) {
      let errMessage = `Failed to send chat message: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.details || errData.error) {
          errMessage = errData.details || errData.error;
        }
      } catch (_e) {
        // failed to parse JSON, keep default errMessage
      }
      throw new Error(errMessage);
    }
    return response.json();
  },

  // Global Chat (e.g., AiContextFinder)
  globalChat: async (systemInstruction: string, messages: ChatMessage[]): Promise<{ response: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/global`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemInstruction, messages }),
    });
    if (!response.ok) {
      let errMessage = `Failed to send global chat message: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.details || errData.error) {
          errMessage = errData.details || errData.error;
        }
      } catch (_e) {
        // failed to parse JSON, keep default errMessage
      }
      throw new Error(errMessage);
    }
    return response.json();
  },



  // Clear cache (useful after mutations)
  clearCache,
};
