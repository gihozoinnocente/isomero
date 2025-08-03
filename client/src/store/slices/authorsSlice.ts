import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthorsState } from '../../types';
import { apiService } from '../../services/api';

// Initial state
const initialState: AuthorsState = {
  authors: [],
  currentAuthor: null,
  popular: [],
  pagination: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async (filters: { page?: number; limit?: number; q?: string; sort?: string; order?: string } = {}, { rejectWithValue }) => {
    try {
      const result = await apiService.getAuthors(filters);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch authors');
    }
  }
);

export const fetchAuthor = createAsyncThunk(
  'authors/fetchAuthor',
  async (id: string, { rejectWithValue }) => {
    try {
      const author = await apiService.getAuthor(id);
      return author;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch author');
    }
  }
);

export const fetchPopularAuthors = createAsyncThunk(
  'authors/fetchPopularAuthors',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const authors = await apiService.getPopularAuthors(limit);
      return authors;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch popular authors');
    }
  }
);

export const searchAuthors = createAsyncThunk(
  'authors/searchAuthors',
  async ({ query, limit = 10 }: { query: string; limit?: number }, { rejectWithValue }) => {
    try {
      const authors = await apiService.searchAuthors(query, limit);
      return authors;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to search authors');
    }
  }
);

// Authors slice
const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAuthor: (state) => {
      state.currentAuthor = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Authors
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authors = action.payload.authors;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Author
    builder
      .addCase(fetchAuthor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAuthor = action.payload;
        state.error = null;
      })
      .addCase(fetchAuthor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Popular Authors
    builder
      .addCase(fetchPopularAuthors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPopularAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popular = action.payload;
        state.error = null;
      })
      .addCase(fetchPopularAuthors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Authors
    builder
      .addCase(searchAuthors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authors = action.payload;
        state.error = null;
      })
      .addCase(searchAuthors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentAuthor } = authorsSlice.actions;
export default authorsSlice.reducer;