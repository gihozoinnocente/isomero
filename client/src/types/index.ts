// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface ApiError {
    success: false;
    error: {
      message: string;
      details?: ValidationError[];
    };
  }
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
  
  // Book Types
  export interface Book {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    isbn_10?: string;
    isbn_13?: string;
    publication_date?: string;
    page_count?: number;
    language: string;
    format: BookFormat;
    cover_image_url?: string;
    average_rating: number;
    ratings_count: number;
    price?: number;
    currency: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    publisher_name?: string;
    publisher_website?: string;
    authors: Author[];
    genres: Genre[];
    user_rating?: BookRating;
    is_favorite?: boolean;
  }
  
  export interface BookListResponse {
    books: Book[];
    pagination: PaginationMeta;
  }
  
  export interface BookFilters {
    page?: number;
    limit?: number;
    q?: string; // search query
    genre?: string;
    author?: string;
    year?: number;
    minRating?: number;
    maxRating?: number;
    sort?: BookSortField;
    order?: SortOrder;
  }
  
  export type BookFormat = 'hardcover' | 'paperback' | 'ebook' | 'audiobook';
  export type BookSortField = 'title' | 'publication_date' | 'average_rating' | 'created_at';
  export type SortOrder = 'asc' | 'desc';
  
  // Author Types
  export interface Author {
    id: string;
    name: string;
    bio?: string;
    birth_date?: string;
    death_date?: string;
    nationality?: string;
    image_url?: string;
    website_url?: string;
    books_count?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface AuthorListResponse {
    authors: Author[];
    pagination: PaginationMeta;
  }
  
  // Genre Types
  export interface Genre {
    id: string;
    name: string;
    description?: string;
    books_count?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface GenreListResponse {
    genres: Genre[];
    pagination: PaginationMeta;
  }
  
  // User Types
  export interface User {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role: UserRole;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    stats?: UserStats;
  }
  
  export type UserRole = 'user' | 'admin' | 'moderator';
  
  export interface UserStats {
    ratings_given: number;
    avg_rating_given: number;
    favorite_books: number;
    books_rated: number;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }
  
  // Rating Types
  export interface BookRating {
    id: string;
    book_id: string;
    user_id: string;
    rating: number;
    review?: string;
    created_at: string;
    updated_at: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }
  
  export interface RatingRequest {
    rating: number;
    review?: string;
  }
  
  export interface RatingListResponse {
    ratings: BookRating[];
    pagination: PaginationMeta;
  }
  
  // Favorites Types
  export interface FavoriteBook extends Book {
    favorited_at: string;
  }
  
  export interface FavoriteListResponse {
    favorites: FavoriteBook[];
    pagination: PaginationMeta;
  }
  
  // Activity Types
  export interface UserActivity {
    type: 'rating' | 'favorite';
    created_at: string;
    book_id: string;
    book_title: string;
    rating?: number;
    review?: string;
  }
  
  // State Types
  export interface AppState {
    auth: AuthState;
    books: BooksState;
    authors: AuthorsState;
    genres: GenresState;
    ui: UIState;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface BooksState {
    books: Book[];
    currentBook: Book | null;
    filters: BookFilters;
    pagination: PaginationMeta | null;
    trending: Book[];
    topRated: Book[];
    recommendations: Book[];
    favorites: FavoriteBook[];
    isLoading: boolean;
    error: string | null;
  }
  
  export interface AuthorsState {
    authors: Author[];
    currentAuthor: Author | null;
    popular: Author[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface GenresState {
    genres: Genre[];
    currentGenre: Genre | null;
    popular: Genre[];
    trending: Genre[];
    minimal: Pick<Genre, 'id' | 'name'>[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    searchOpen: boolean;
    notifications: Notification[];
  }
  
  export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }
  
  // Component Props Types
  export interface BookCardProps {
    book: Book;
    variant?: 'default' | 'compact' | 'detailed';
    showActions?: boolean;
    onClick?: (book: Book) => void;
  }
  
  export interface FilterPanelProps {
    filters: BookFilters;
    onFiltersChange: (filters: Partial<BookFilters>) => void;
    genres: Pick<Genre, 'id' | 'name'>[];
    isLoading?: boolean;
  }
  
  export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
  }
  
  export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
    className?: string;
  }
  
  export interface RatingStarsProps {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
  }
  
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
  
  // Form Types
  export interface BookFormData {
    title: string;
    subtitle?: string;
    description?: string;
    isbn_10?: string;
    isbn_13?: string;
    publication_date?: string;
    page_count?: number;
    language: string;
    format: BookFormat;
    price?: number;
    currency: string;
    author_ids: string[];
    genre_ids: string[];
  }
  
  export interface AuthorFormData {
    name: string;
    bio?: string;
    birth_date?: string;
    death_date?: string;
    nationality?: string;
    website_url?: string;
  }
  
  export interface GenreFormData {
    name: string;
    description?: string;
  }
  
  // API Endpoint Types
  export interface ApiEndpoints {
    // Auth
    LOGIN: '/api/users/login';
    REGISTER: '/api/users/register';
    PROFILE: '/api/users/profile';
    CHANGE_PASSWORD: '/api/users/change-password';
    
    // Books
    BOOKS: '/api/books';
    BOOK_DETAILS: (id: string) => string;
    TRENDING_BOOKS: '/api/books/trending';
    TOP_RATED_BOOKS: '/api/books/top-rated';
    BOOK_RATINGS: (id: string) => string;
    BOOK_FAVORITES: (id: string) => string;
    SIMILAR_BOOKS: (id: string) => string;
    
    // Authors
    AUTHORS: '/api/authors';
    AUTHOR_DETAILS: (id: string) => string;
    POPULAR_AUTHORS: '/api/authors/popular';
    AUTHOR_BOOKS: (id: string) => string;
    
    // Genres
    GENRES: '/api/genres';
    GENRE_DETAILS: (id: string) => string;
    POPULAR_GENRES: '/api/genres/popular';
    TRENDING_GENRES: '/api/genres/trending';
    MINIMAL_GENRES: '/api/genres/minimal';
    GENRE_BOOKS: (id: string) => string;
    
    // User
    USER_FAVORITES: '/api/users/favorites';
    USER_RECOMMENDATIONS: '/api/users/recommendations';
    USER_ACTIVITY: '/api/users/activity';
  }