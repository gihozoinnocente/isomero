import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import {
  ApiResponse,
  ApiError,
  Book,
  BookListResponse,
  BookFilters,
  Author,
  AuthorListResponse,
  Genre,
  GenreListResponse,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  BookRating,
  RatingRequest,
  RatingListResponse,
  FavoriteListResponse,
  UserActivity,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('book_hub_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiError>) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError<ApiError>): void {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('book_hub_token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (data?.error?.message) {
            toast.error(data.error.message);
          } else {
            toast.error('An unexpected error occurred.');
          }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }

  // Authentication API
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/api/users/login', credentials);
    const { user, token } = response.data.data;
    
    // Store token in localStorage
    localStorage.setItem('book_hub_token', token);
    
    return { user, token };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/api/users/register', userData);
    const { user, token } = response.data.data;
    
    // Store token in localStorage
    localStorage.setItem('book_hub_token', token);
    
    return { user, token };
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/api/users/profile');
    return response.data.data.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put<ApiResponse<{ user: User }>>('/api/users/profile', userData);
    return response.data.data.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/api/users/change-password', {
      currentPassword,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem('book_hub_token');
  }

  // Books API
  async getBooks(filters: BookFilters = {}): Promise<BookListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get<ApiResponse<BookListResponse>>(
      `/api/books?${params.toString()}`
    );
    return response.data.data;
  }

  async getBook(id: string): Promise<Book> {
    const response = await this.api.get<ApiResponse<{ book: Book }>>(`/api/books/${id}`);
    return response.data.data.book;
  }

  async getTrendingBooks(days: number = 30, limit: number = 10): Promise<Book[]> {
    const response = await this.api.get<ApiResponse<{ books: Book[] }>>(
      `/api/books/trending?days=${days}&limit=${limit}`
    );
    return response.data.data.books;
  }

  async getTopRatedBooks(limit: number = 10, minRatings: number = 5): Promise<Book[]> {
    const response = await this.api.get<ApiResponse<{ books: Book[] }>>(
      `/api/books/top-rated?limit=${limit}&minRatings=${minRatings}`
    );
    return response.data.data.books;
  }

  async getSimilarBooks(bookId: string, limit: number = 5): Promise<Book[]> {
    const response = await this.api.get<ApiResponse<{ books: Book[] }>>(
      `/api/books/${bookId}/similar?limit=${limit}`
    );
    return response.data.data.books;
  }

  // Book Ratings API
  async getBookRatings(bookId: string, page: number = 1, limit: number = 10): Promise<RatingListResponse> {
    const response = await this.api.get<ApiResponse<RatingListResponse>>(
      `/api/books/${bookId}/ratings?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async addBookRating(bookId: string, ratingData: RatingRequest): Promise<BookRating> {
    const response = await this.api.post<ApiResponse<{ rating: BookRating }>>(
      `/api/books/${bookId}/ratings`,
      ratingData
    );
    return response.data.data.rating;
  }

  async removeBookRating(bookId: string): Promise<void> {
    await this.api.delete(`/api/books/${bookId}/ratings`);
  }

  // Book Favorites API
  async addToFavorites(bookId: string): Promise<void> {
    await this.api.post(`/api/books/${bookId}/favorites`);
  }

  async removeFromFavorites(bookId: string): Promise<void> {
    await this.api.delete(`/api/books/${bookId}/favorites`);
  }

  async getFavorites(page: number = 1, limit: number = 10): Promise<FavoriteListResponse> {
    const response = await this.api.get<ApiResponse<FavoriteListResponse>>(
      `/api/users/favorites?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  // Authors API
  async getAuthors(filters: { page?: number; limit?: number; q?: string; sort?: string; order?: string } = {}): Promise<AuthorListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get<ApiResponse<AuthorListResponse>>(
      `/api/authors?${params.toString()}`
    );
    return response.data.data;
  }

  async getAuthor(id: string): Promise<Author> {
    const response = await this.api.get<ApiResponse<{ author: Author }>>(`/api/authors/${id}`);
    return response.data.data.author;
  }

  async getPopularAuthors(limit: number = 10): Promise<Author[]> {
    const response = await this.api.get<ApiResponse<{ authors: Author[] }>>(
      `/api/authors/popular?limit=${limit}`
    );
    return response.data.data.authors;
  }

  async searchAuthors(query: string, limit: number = 10): Promise<Author[]> {
    const response = await this.api.get<ApiResponse<{ authors: Author[] }>>(
      `/api/authors/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data.authors;
  }

  async getAuthorBooks(authorId: string, filters: { page?: number; limit?: number; sort?: string; order?: string } = {}): Promise<BookListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get<ApiResponse<BookListResponse>>(
      `/api/authors/${authorId}/books?${params.toString()}`
    );
    return response.data.data;
  }

  // Genres API
  async getGenres(filters: { page?: number; limit?: number; q?: string; sort?: string; order?: string } = {}): Promise<GenreListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get<ApiResponse<GenreListResponse>>(
      `/api/genres?${params.toString()}`
    );
    return response.data.data;
  }

  async getGenre(id: string): Promise<Genre> {
    const response = await this.api.get<ApiResponse<{ genre: Genre }>>(`/api/genres/${id}`);
    return response.data.data.genre;
  }

  async getMinimalGenres(): Promise<Pick<Genre, 'id' | 'name'>[]> {
    const response = await this.api.get<ApiResponse<{ genres: Pick<Genre, 'id' | 'name'>[] }>>(
      '/api/genres/minimal'
    );
    return response.data.data.genres;
  }

  async getPopularGenres(limit: number = 10): Promise<Genre[]> {
    const response = await this.api.get<ApiResponse<{ genres: Genre[] }>>(
      `/api/genres/popular?limit=${limit}`
    );
    return response.data.data.genres;
  }

  async getTrendingGenres(days: number = 30, limit: number = 10): Promise<Genre[]> {
    const response = await this.api.get<ApiResponse<{ genres: Genre[] }>>(
      `/api/genres/trending?days=${days}&limit=${limit}`
    );
    return response.data.data.genres;
  }

  async getGenreBooks(genreId: string, filters: { page?: number; limit?: number; q?: string; sort?: string; order?: string } = {}): Promise<BookListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get<ApiResponse<BookListResponse>>(
      `/api/genres/${genreId}/books?${params.toString()}`
    );
    return response.data.data;
  }

  // User Activity API
  async getUserActivity(limit: number = 10): Promise<UserActivity[]> {
    const response = await this.api.get<ApiResponse<{ activities: UserActivity[] }>>(
      `/api/users/activity?limit=${limit}`
    );
    return response.data.data.activities;
  }

  async getRecommendations(limit: number = 10): Promise<Book[]> {
    const response = await this.api.get<ApiResponse<{ recommendations: Book[] }>>(
      `/api/users/recommendations?limit=${limit}`
    );
    return response.data.data.recommendations;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;