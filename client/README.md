# Book Hub Frontend

A modern, responsive React TypeScript application for book discovery and management.

## Features

### 📚 Core Functionality
- **Book Discovery**: Browse, search, and filter through thousands of books
- **Advanced Search**: Full-text search with filters by genre, author, rating, and publication year
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **User Authentication**: Secure login/register with JWT tokens
- **Personal Library**: Favorite books, reading history, and personalized recommendations
- **Rating & Reviews**: Rate books and read community reviews

### 🎨 UI/UX Features
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Progressive Loading**: Skeleton screens and lazy loading for optimal performance
- **Responsive Grid**: Adaptive layouts for different screen sizes

### ⚡ Technical Features
- **TypeScript**: Full type safety and enhanced developer experience
- **Redux Toolkit**: Efficient state management with RTK Query
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Form Validation**: Robust form handling with React Hook Form and Yup
- **Error Handling**: Comprehensive error boundaries and user feedback

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Yup validation
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Create React App with TypeScript template

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Running Book Hub API (see backend README)

### Installation

1. **Clone and navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

4. **Start development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookCard.tsx    # Book display component
│   ├── FilterPanel.tsx # Search and filter controls
│   ├── Layout.tsx      # Main application layout
│   ├── Pagination.tsx  # Pagination component
│   ├── RatingStars.tsx # Star rating component
│   └── SearchBar.tsx   # Search input component
├── pages/              # Page components
│   ├── Home.tsx        # Homepage with featured content
│   ├── Books.tsx       # Book catalog with filters
│   ├── BookDetail.tsx  # Individual book details
│   ├── Login.tsx       # Authentication pages
│   └── Profile.tsx     # User profile and settings
├── store/              # Redux store and slices
│   ├── slices/         # Redux Toolkit slices
│   │   ├── authSlice.ts    # Authentication state
│   │   ├── booksSlice.ts   # Books state and actions
│   │   ├── genresSlice.ts  # Genres state
│   │   └── uiSlice.ts      # UI state (theme, sidebar)
│   └── index.ts        # Store configuration
├── services/           # API services
│   └── api.ts         # Axios configuration and API calls
├── types/             # TypeScript type definitions
│   └── index.ts       # All application types
├── utils/             # Utility functions
│   └── cn.ts          # Class name utility
├── App.tsx            # Root application component
└── index.tsx          # Application entry point
```

## Key Components

### BookCard
Versatile book display component with multiple variants:
- **Default**: Grid view with cover image and basic info
- **Compact**: List view for search results
- **Detailed**: Extended view with full metadata

### FilterPanel
Comprehensive filtering interface:
- Genre dropdown with popular options
- Author search with autocomplete
- Publication year range
- Rating filters
- Sort options (title, date, rating)

### SearchBar
Intelligent search with:
- Debounced input for performance
- Search suggestions
- Clear functionality
- Loading states

### Layout
Responsive application shell:
- Collapsible sidebar navigation
- Theme toggle
- User authentication status
- Mobile-optimized header

## State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  books: {
    books: Book[],
    currentBook: Book | null,
    filters: BookFilters,
    pagination: PaginationMeta,
    trending: Book[],
    topRated: Book[],
    recommendations: Book[],
    favorites: Book[],
    isLoading: boolean,
    error: string | null
  },
  genres: {
    genres: Genre[],
    popular: Genre[],
    minimal: Genre[], // For dropdowns
    isLoading: boolean
  },
  ui: {
    theme: 'light' | 'dark',
    sidebarOpen: boolean,
    searchOpen: boolean,
    notifications: Notification[]
  }
}
```

### Async Actions
All API calls are handled through Redux Toolkit's `createAsyncThunk`:
- `fetchBooks` - Get books with filters
- `fetchBook` - Get single book details
- `addToFavorites` - Add book to user favorites
- `addBookRating` - Rate a book
- `loginUser` - Authenticate user

## Responsive Design

### Breakpoints
- **xs**: 475px (extra small phones)
- **sm**: 640px (small phones)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large screens)

### Layout Strategy
- Mobile-first responsive design
- Flexible grid systems for book displays
- Collapsible navigation for mobile
- Touch-friendly interactive elements
- Optimized loading states for all screen sizes

## Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy()
- Dynamic imports for heavy components
- Separate bundles for vendor libraries

### Loading Strategies
- Skeleton screens during data fetching
- Progressive image loading with fallbacks
- Debounced search to reduce API calls
- Pagination to limit data transfer

### Bundle Optimization
- Tree shaking for unused code elimination
- Asset optimization for images and fonts
- Service worker for caching (production)

## Accessibility Features

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Focus management with visible indicators
- Skip links for screen reader users
- Proper tab order throughout the application

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Alternative text for images
- Status announcements for dynamic content

### Visual Accessibility
- High contrast mode support
- Scalable fonts and UI elements
- Color-blind friendly color palette
- Reduced motion support for sensitive users

## Testing Strategy

### Unit Tests
- Component rendering tests
- Redux slice testing
- Utility function tests
- Form validation tests

### Integration Tests
- API service tests
- User workflow tests
- Authentication flow tests
- Error handling tests

### E2E Tests (Future)
- Critical user journeys
- Cross-browser compatibility
- Performance benchmarks

## Deployment

### Build Process
```bash
npm run build
```

### Environment Configuration
- Development: `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

### Hosting Options
- **Vercel**: Optimized for React applications
- **Netlify**: Simple deployment with CI/CD
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Create pull request with description
5. Review and merge after approval

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write descriptive component and function names
- Add JSDoc comments for complex logic
- Maintain consistent file and folder structure

### Git Conventions
- Use conventional commit messages
- Keep commits atomic and focused
- Include tests with feature commits
- Update documentation for API changes

## Future Enhancements

### Planned Features
- **Reading Lists**: Custom collections and reading goals
- **Social Features**: Follow users and share recommendations
- **Advanced Filters**: Price range, availability, format filters
- **Offline Support**: Service worker for offline reading
- **Book Preview**: Sample pages and excerpts
- **Audio Books**: Integration with audio book players

### Technical Improvements
- **Performance**: Virtual scrolling for large lists
- **Testing**: Comprehensive E2E test suite
- **Analytics**: User behavior tracking and insights
- **PWA**: Progressive web app capabilities
- **Accessibility**: Enhanced screen reader support

## Support

For technical issues or questions:
- Check the [FAQ](docs/FAQ.md)
- Review [troubleshooting guide](docs/TROUBLESHOOTING.md)
- Create an issue on GitHub
- Contact the development team

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.