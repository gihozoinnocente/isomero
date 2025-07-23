import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { BooksState, BookFilters, Book, RatingRequest } from '../../types';
import { apiService } from '../../services/api';

// Initial state
const initialState: BooksState = {
  books: [],
  currentBook: null,
  filters: {
    page: 1,
    limit: 12,
    sort: 'created_at',
    order: 'desc',
  },
  pagination: null,
  trending: [],
  topRated: [],
  recommendations: [],
  favorites: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (filters: BookFilters, { rejectWithValue }) => {
    try {
      const result = await apiService.getBooks(filters);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch books');
    }
  }
);

export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (id: string, { rejectWithValue }) => {
    try {
      const book = await apiService.getBook(id);
      return book;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch book');
    }
  }
);

export const fetchTrendingBooks = createAsyncThunk(
  'books/fetchTrendingBooks',
  async ({ days = 30, limit = 10 }: { days?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const books = await apiService.getTrendingBooks(days, limit);
      return books;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch trending books');
    }
  }
);

export const fetchTopRatedBooks = createAsyncThunk(
  'books/fetchTopRatedBooks',
  async ({ limit = 10, minRatings = 5 }: { limit?: number; minRatings?: number } = {}, { rejectWithValue }) => {
    try {
      const books = await apiService.getTopRatedBooks(limit, minRatings);
      return books;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch top rated books');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'books/fetchRecommendations',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const books = await apiService.getRecommendations(limit);
      return books;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'books/fetchFavorites',
  async ({ page = 1, limit = 12 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const result = await apiService.getFavorites(page, limit);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'books/addToFavorites',
  async (bookId: string, { rejectWithValue }) => {
    try {
      await apiService.addToFavorites(bookId);
      toast.success('Book added to favorites!');
      return bookId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'books/removeFromFavorites',
  async (bookId: string, { rejectWithValue }) => {
    try {
      await apiService.removeFromFavorites(bookId);
      toast.success('Book removed from favorites!');
      return bookId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to remove from favorites');
    }
  }
);

export const addBookRating = createAsyncThunk(
  'books/addBookRating',
  async ({ bookId, ratingData }: { bookId: string; ratingData: RatingRequest }, { rejectWithValue }) => {
    try {
      const rating = await apiService.addBookRating(bookId, ratingData);
      toast.success('Rating added successfully!');
      return { bookId, rating };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add rating');
    }
  }
);

export const removeBookRating = createAsyncThunk(
  'books/removeBookRating',
  async (bookId: string, { rejectWithValue }) => {
    try {
      await apiService.removeBookRating(bookId);
      toast.success('Rating removed successfully!');
      return bookId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to remove rating');
    }
  }
);

// Books slice
const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BookFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sort: 'created_at',
        order: 'desc',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
    updateBookInList: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex(book => book.id === action.payload.id);
      if (index !== -1) {
        state.books[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Books
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.books;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Book
    builder
      .addCase(fetchBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBook = action.payload;
        state.error = null;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Trending Books
    builder
      .addCase(fetchTrendingBooks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTrendingBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trending = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendingBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Top Rated Books
    builder
      .addCase(fetchTopRatedBooks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopRatedBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topRated = action.payload;
        state.error = null;
      })
      .addCase(fetchTopRatedBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Recommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Favorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload.favorites;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to Favorites
    builder
      .addCase(addToFavorites.fulfilled, (state, action) => {
        const bookId = action.payload;
        
        // Update in books list
        const bookIndex = state.books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
          state.books[bookIndex].is_favorite = true;
        }
        
        // Update current book if it matches
        if (state.currentBook?.id === bookId) {
          state.currentBook.is_favorite = true;
        }
        
        // Update in trending and top rated lists
        const trendingIndex = state.trending.findIndex(book => book.id === bookId);
        if (trendingIndex !== -1) {
          state.trending[trendingIndex].is_favorite = true;
        }
        
        const topRatedIndex = state.topRated.findIndex(book => book.id === bookId);
        if (topRatedIndex !== -1) {
          state.topRated[topRatedIndex].is_favorite = true;
        }
      });

    // Remove from Favorites
    builder
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        const bookId = action.payload;
        
        // Update in books list
        const bookIndex = state.books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
          state.books[bookIndex].is_favorite = false;
        }
        
        // Update current book if it matches
        if (state.currentBook?.id === bookId) {
          state.currentBook.is_favorite = false;
        }
        
        // Update in trending and top rated lists
        const trendingIndex = state.trending.findIndex(book => book.id === bookId);
        if (trendingIndex !== -1) {
          state.trending[trendingIndex].is_favorite = false;
        }
        
        const topRatedIndex = state.topRated.findIndex(book => book.id === bookId);
        if (topRatedIndex !== -1) {
          state.topRated[topRatedIndex].is_favorite = false;
        }
        
        // Remove from favorites list
        state.favorites = state.favorites.filter(book => book.id !== bookId);
      });

    // Add Book Rating
    builder
      .addCase(addBookRating.fulfilled, (state, action) => {
        const { bookId, rating } = action.payload;
        
        // Update current book if it matches
        if (state.currentBook?.id === bookId) {
          state.currentBook.user_rating = rating;
        }
        
        // Note: We would need to refetch the book to get updated average rating
        // For now, we just update the user's rating
      });

    // Remove Book Rating
    builder
      .addCase(removeBookRating.fulfilled, (state, action) => {
        const bookId = action.payload;
        
        // Update current book if it matches
        if (state.currentBook?.id === bookId) {
          state.currentBook.user_rating = undefined;
        }
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  clearError, 
  clearCurrentBook, 
  updateBookInList
} = booksSlice.actions;

export default booksSlice.reducer;