require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const booksRoutes = require('./routes/booksRoutes');
const authorRoutes = require('./routes/authorRoutes');
const genreRoutes = require('./routes/genreRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else if (process.env.FRONTEND_URL) {
      callback(null, origin === process.env.FRONTEND_URL);
    } else {
      callback(null, origin === 'http://localhost:3000');
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  maxAge: 86400,
  preflight: false
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10000, // increased limit to 10000 requests per minute
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for all authentication routes and development environment
    const authRoutes = ['/api/users/login', '/api/users/register', '/api/auth/verify'];
    if (process.env.NODE_ENV === 'development' || authRoutes.some(route => req.path.includes(route))) {
      return true;
    }
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return true;
    }
    // Skip rate limiting for static files, health check, and API docs
    if (req.path === '/health' || req.path.startsWith('/api-docs') || req.path.startsWith('/public')) {
      return true;
    }
    // Skip rate limiting for auth endpoints
    if (req.path.startsWith('/api/users/login') || req.path.startsWith('/api/users/register')) {
      return true;
    }
    return false;
  }
});
app.use(limiter);

// Serve static files from public directory
app.use(express.static('public'));

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger configuration
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Handle favicon and screenshot requests
app.get('/favicon.ico', (req, res) => {
  res.status(200).send('');
});

app.get('/screenshot-wide.png', (req, res) => {
  res.status(200).send('');
});

app.get('/screenshot-narrow.png', (req, res) => {
  res.status(200).send('');
});

app.get('/favicon-32x32.png', (req, res) => {
  res.status(200).send('');
});

app.get('/favicon-16x16.png', (req, res) => {
  res.status(200).send('');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/books', booksRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/users', userRoutes);

// Handle favicon requests
// app.get(['/favicon-32x32.png', '/favicon-16x16.png', '/favicon.ico'], (req, res) => {
//   res.status(204).end();
// });

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Book Hub API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Book Hub API server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;