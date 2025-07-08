// Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with more details
  console.error('❌ Error:', {
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Ensure we always have a status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = [];

  // Handle specific error types
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
    details = ['Invalid ID format'];
  } else if (err.code === 11000) { // Mongoose duplicate key
    statusCode = 400;
    message = 'Duplicate field value entered';
    details = ['This record already exists'];
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = Object.values(err.errors).map(val => val.message);
  } else if (err.code) { // PostgreSQL errors
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Duplicate entry';
        details = ['This record already exists'];
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Referenced record not found';
        details = ['The referenced record does not exist'];
        break;
      case '23502': // Not null violation
        statusCode = 400;
        message = 'Missing required field';
        details = ['A required field is missing'];
        break;
      case '22001': // String data, right truncated
        statusCode = 400;
        message = 'Data too long for field';
        details = ['Data too long for field'];
        break;
      case '42P01': // Undefined table
        error = { 
          message: 'Database table not found.', 
          statusCode: 500 
        };
        break;
      default:
        error = { 
          message: 'Database error occurred.', 
          statusCode: 500 
        };
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    details = [message];
  }

  // Send consistent response structure
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = {
  notFound,
  errorHandler
};