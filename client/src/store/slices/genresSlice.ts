import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GenresState, Genre } from '../../types';
import { apiService } from '../../services/api';

// Initial state
const initialState: GenresState = {
  genres: [],
  currentGenre: null,
  popular: [],
  trending: [],
  minimal: [],
  pagination: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchGenres = createAsyncThunk(
  'genres/fetchGenres',
  async (filters: { page?: number; limit?: number; q?: string; sort?: string; order?: string } = {}, { rejectWithValue }) => {
    try {
      const result = await apiService.getGenres(filters);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch genres');
    }
  }
);

export const fetchGenre = createAsyncThunk(
  'genres/fetchGenre',
  async (id: string, { rejectWithValue }) => {
    try {
      const genre = await apiService.getGenre(id);
      return genre;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch genre');
    }
  }
);

export const fetchMinimalGenres = createAsyncThunk(
  'genres/fetchMinimalGenres',
  async (_, { rejectWithValue }) => {
    try {
      const genres = await apiService.getMinimalGenres();
      return genres;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch genres');
    }
  }
);

export const fetchPopularGenres = createAsyncThunk(
  'genres/fetchPopularGenres',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const genres = await apiService.getPopularGenres(limit);
      return genres;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch popular genres');
    }
  }
);

export const fetchTrendingGenres = createAsyncThunk(
  'genres/fetchTrendingGenres',
  async ({ days = 30, limit = 10 }: { days?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const genres = await apiService.getTrendingGenres(days, limit);
      return genres;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch trending genres');
    }
  }
);

// Genres slice
const genresSlice = createSlice({
  name: 'genres',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGenre: (state) => {
      state.currentGenre = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Genres
    builder
      .addCase(fetchGenres.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.genres = action.payload.genres;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchGenres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Genre
    builder
      .addCase(fetchGenre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGenre.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGenre = action.payload;
        state.error = null;
      })
      .addCase(fetchGenre.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Minimal Genres
    builder
      .addCase(fetchMinimalGenres.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMinimalGenres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.minimal = action.payload;
        state.error = null;
      })
      .addCase(fetchMinimalGenres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Popular Genres
    builder
      .addCase(fetchPopularGenres.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPopularGenres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popular = action.payload;
        state.error = null;
      })
      .addCase(fetchPopularGenres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Trending Genres
    builder
      .addCase(fetchTrendingGenres.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTrendingGenres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trending = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendingGenres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentGenre } = genresSlice.actions;
export default genresSlice.reducer;