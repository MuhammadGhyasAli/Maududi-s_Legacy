import { apiService } from '../services/apiService';

// Mock fetch
global.fetch = jest.fn();

describe('apiService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
    apiService.clearCache();
  });

  describe('getBooks', () => {
    it('fetches books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'Test Book', author: 'Test Author' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      });

      const books = await apiService.getBooks();
      expect(books).toEqual(mockBooks);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books', { signal: undefined });
    });

    it('fetches books by category', async () => {
      const mockBooks = [
        { id: 1, title: 'Test Book', author: 'Test Author', category: 'Tafsir' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      });

      const books = await apiService.getBooks('Tafsir');
      expect(books).toEqual(mockBooks);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books?category=Tafsir', { signal: undefined });
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(apiService.getBooks()).rejects.toThrow('Failed to fetch books');
    });
  });

  describe('getBook', () => {
    it('fetches a specific book successfully', async () => {
      const mockBook = { id: 1, title: 'Test Book', author: 'Test Author' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBook,
      });

      const book = await apiService.getBook(1);
      expect(book).toEqual(mockBook);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books/1', { signal: undefined });
    });
  });

  describe('chat', () => {
    it('sends chat request successfully', async () => {
      const mockResponse = { response: 'Test AI response' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages = [{ role: 'user', content: 'Test message' }];
      const response = await apiService.chat(1, messages);
      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: 1, messages }),
        })
      );
    });
  });
});
