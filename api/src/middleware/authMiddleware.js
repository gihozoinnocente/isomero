const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sendError } = require('../utils/errorHandler');

// Protect routes middleware
const protect = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      return sendError(res, 'Internal server error', ['JWT_SECRET not configured'], 500);
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return sendError(res, 'No token provided', ['Authentication token is required'], 401);
    }

    // Get token from header
    if (!authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Invalid token format', ['Token must start with Bearer '], 401);
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7).trim();

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user information
      const result = await query(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account deactivated');
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      };
      next();
    } catch (verificationError) {
      // Handle JWT verification errors
      if (verificationError.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid authentication token', ['Token verification failed'], 401);
      } else if (verificationError.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token expired', ['Token has expired'], 401);
      } else {
        throw verificationError; // Re-throw for outer catch block
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Determine error type and message
    let errorMessage = 'Authentication failed';
    let errorDetails = [];
    let statusCode = 401;
    
    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid authentication token';
      errorDetails = ['Token verification failed'];
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Authentication token expired';
      errorDetails = ['Token has expired'];
    } else if (error.message === 'User not found') {
      errorMessage = 'User account not found';
      errorDetails = ['User account not found'];
    } else if (error.message === 'Account deactivated') {
      errorMessage = 'Account deactivated';
      errorDetails = ['Account has been deactivated'];
    } else {
      // For unexpected errors, return 500 with a generic message
      errorMessage = 'Internal server error';
      errorDetails = ['An unexpected error occurred'];
      statusCode = 500;
    }
    
    return sendError(res, errorMessage, errorDetails, statusCode);
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: { message: 'Not authorized as admin' }
    });
  }
};

// Moderator or Admin middleware
const moderator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: { message: 'Not authorized as moderator' }
    });
  }
};

// Optional auth middleware (doesn't require authentication but adds user if token exists)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await query(
        'SELECT id, username, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  admin,
  moderator,
  optionalAuth
};