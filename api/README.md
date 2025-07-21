# Book Hub API

A comprehensive RESTful API for book discovery and management built with Node.js, Express.js, and PostgreSQL.

## Features

### Core Functionality
- **Book Management**: Complete CRUD operations for books with rich metadata
- **Author Management**: Author profiles with biographical information and book relationships
- **Genre Management**: Categorization system with statistics and trending data
- **User Authentication**: JWT-based authentication with role-based access control
- **Search & Filtering**: Advanced search capabilities with full-text search
- **Pagination**: Efficient data pagination for all list endpoints
- **Rating System**: User ratings and reviews for books
- **Favorites**: Personal book collections for users
- **Recommendations**: Personalized book recommendations based on user preferences

### Advanced Features
- **Trending Books**: Discovery of popular books based on recent activity
- **Similar Books**: Recommendation engine for finding related content
- **Statistics**: Comprehensive analytics for books, authors, and genres
- **User Activity Tracking**: Recent user interactions and reading history

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator with custom middleware
- **Security**: Helmet, CORS, Rate limiting, Password hashing with bcrypt
- **Development**: Nodemon, ESLint for code quality

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_hub
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

4. **Database Setup**

Create PostgreSQL database:
```sql
CREATE DATABASE book_hub;
```

Run migrations:
```bash
npm run migrate
```

Seed initial data:
```bash
npm run seed
```

5. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/change-password` - Change password

#### Books
- `GET /books` - Get all books with filtering and search
- `GET /books/:id` - Get book details
- `POST /books` - Create new book (Admin/Moderator)
- `PUT /books/:id` - Update book (Admin/Moderator)
- `DELETE /books/:id` - Delete book (Admin)
- `GET /books/trending` - Get trending books
- `GET /books/top-rated` - Get top-rated books
- `GET /books/:id/similar` - Get similar books
- `GET /books/:id/ratings` - Get book ratings
- `POST /books/:id/ratings` - Add/update rating
- `DELETE /books/:id/ratings` - Remove rating
- `POST /books/:id/favorites` - Add to favorites
- `DELETE /books/:id/favorites` - Remove from favorites

#### Authors
- `GET /authors` - Get all authors
- `GET /authors/:id` - Get author details
- `POST /authors` - Create new author (Admin/Moderator)
- `PUT /authors/:id` - Update author (Admin/Moderator)
- `DELETE /authors/:id` - Delete author (Admin)
- `GET /authors/popular` - Get popular authors
- `GET /authors/search` - Search authors
- `GET /authors/:id/books` - Get author's books
- `GET /authors/:id/statistics` - Get author statistics

#### Genres
- `GET /genres` - Get all genres
- `GET /genres/:id` - Get genre details
- `POST /genres` - Create new genre (Admin/Moderator)
- `PUT /genres/:id` - Update genre (Admin/Moderator)
- `DELETE /genres/:id` - Delete genre (Admin)
- `GET /genres/popular` - Get popular genres
- `GET /genres/trending` - Get trending genres
- `GET /genres/:id/books` - Get books by genre
- `GET /genres/:id/statistics` - Get genre statistics

### Query Parameters

#### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

#### Search & Filtering
- `q` - Search query (full-text search)
- `genre` - Filter by genre name
- `author` - Filter by author name
- `year` - Filter by publication year
- `minRating` - Minimum rating filter
- `maxRating` - Maximum rating filter
- `sort` - Sort field (title, publication_date, average_rating, created_at)
- `order` - Sort order (asc, desc)

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [] // Validation errors if applicable
  }
}
```

### User Roles

- **User**: Can view books, rate, review, and manage favorites
- **Moderator**: Can create and update books, authors, and genres
- **Admin**: Full access including user management and deletions

## Database Schema

### Key Tables
- `users` - User accounts and authentication
- `books` - Book catalog with metadata
- `authors` - Author information
- `genres` - Book categories
- `publishers` - Publishing house information
- `book_authors` - Many-to-many relationship between books and authors
- `book_genres` - Many-to-many relationship between books and genres
- `book_ratings` - User ratings and reviews
- `user_favorites` - User's favorite books

## Development

### Code Structure
```
src/
├── app.js                 # Application entry point
├── config/
│   └── database.js        # Database configuration
├── database/
│   ├── schema.sql         # Database schema
│   ├── migrate.js         # Migration script
│   └── seed.js           # Seed data script
├── middleware/
│   ├── authMiddleware.js  # Authentication middleware
│   ├── errorMiddleware.js # Error handling
│   └── validationMiddleware.js # Input validation
├── models/
│   ├── Book.js           # Book model
│   ├── Author.js         # Author model
│   ├── Genre.js          # Genre model
│   └── User.js           # User model
└── routes/
    ├── bookRoutes.js     # Book endpoints
    ├── authorRoutes.js   # Author endpoints
    ├── genreRoutes.js    # Genre endpoints
    └── userRoutes.js     # User endpoints
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Best Practices Implemented

1. **Security**
   - JWT authentication with secure token generation
   - Password hashing with bcrypt (12 salt rounds)
   - Rate limiting to prevent abuse
   - CORS configuration
   - Helmet for security headers
   - Input validation and sanitization

2. **Database**
   - Connection pooling for performance
   - Prepared statements to prevent SQL injection
   - Database transactions for data consistency
   - Proper indexing for query performance
   - Soft delete implementation

3. **API Design**
   - RESTful endpoint design
   - Consistent response format
   - Comprehensive error handling
   - Proper HTTP status codes
   - Request validation middleware

4. **Code Quality**
   - Modular architecture with separation of concerns
   - Environment-based configuration
   - Comprehensive logging
   - Error handling middleware
   - Code linting with ESLint

## Testing

The API includes comprehensive test coverage using Jest and Supertest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Environment Variables
Ensure all production environment variables are properly set:
- Use strong JWT secrets
- Configure production database credentials
- Set appropriate CORS origins
- Enable SSL for production database connections

### Database Migration
```bash
# Production migration
NODE_ENV=production npm run migrate
```

### PM2 Process Manager (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/app.js --name "book-hub-api"

# Monitor
pm2 monit
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.