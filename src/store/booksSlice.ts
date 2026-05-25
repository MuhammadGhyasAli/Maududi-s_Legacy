import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '../types';
import { apiService } from '../services/apiService';

interface BooksState {
  books: Book[];
  categories: string[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
}

const initialState: BooksState = {
  books: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: 'All',
  searchQuery: '',
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (category?: string) => {
    return await apiService.getBooks(category);
  }
);

export const fetchCategories = createAsyncThunk(
  'books/fetchCategories',
  async () => {
    return await apiService.getCategories();
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (bookId: number) => {
    return await apiService.getBook(bookId);
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch books';
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export const { setSelectedCategory, setSearchQuery, clearError } = booksSlice.actions;
export default booksSlice.reducer;
