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
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books', { signal: expect.any(AbortSignal) });
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
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books?category=Tafsir', { signal: expect.any(AbortSignal) });
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('parse error'); },
      });

      await expect(apiService.getBooks()).rejects.toThrow('Failed to fetch books: 500 Internal Server Error');
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
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/books/1', { signal: expect.any(AbortSignal) });
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
      const aiContext = 'Test AI context';
      const response = await apiService.chat(1, aiContext, messages);
      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: 1, aiContext, messages }),
        })
      );
    });
  });
});
