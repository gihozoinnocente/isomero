const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { 
  userValidations, 
  queryValidations,
  commonValidations,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

const User = require('../models/User');
const Book = require('../models/Book');

// POST /api/users/register - Register new user
router.post('/register',
  [
    ...userValidations.register,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const user = await User.create(req.body);
      const token = User.generateToken(user.id);

      res.status(201).json({
        success: true,
        data: { 
          user,
          token 
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/users/login - Login user
router.post('/login',
  [
    ...userValidations.login,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.authenticate(email, password);
      const token = User.generateToken(user.id);

      res.json({
        success: true,
        data: { 
          user,
          token 
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/profile - Get current user profile
router.get('/profile',
  protect,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Get user statistics
      const stats = await User.getUserStats(req.user.id);

      res.json({
        success: true,
        data: { 
          user: {
            ...user,
            stats
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/users/profile - Update current user profile
router.put('/profile',
  [
    ...userValidations.update,
    handleValidationErrors
  ],
  protect,
  async (req, res, next) => {
    try {
      const user = await User.update(req.user.id, req.body);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { user },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/users/change-password - Change password
router.put('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
  ],
  protect,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await User.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/favorites - Get user's favorite books
router.get('/favorites',
  [
    ...queryValidations.pagination,
    handleValidationErrors
  ],
  protect,
  async (req, res, next) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10
      };

      const result = await Book.getUserFavorites(req.user.id, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/activity - Get user's recent activity
router.get('/activity',
  protect,
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await User.getRecentActivity(req.user.id, limit);

      res.json({
        success: true,
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/recommendations - Get book recommendations
router.get('/recommendations',
  protect,
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const recommendations = await User.getRecommendations(req.user.id, limit);

      res.json({
        success: true,
        data: { recommendations }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/statistics - Get user statistics
router.get('/statistics',
  protect,
  async (req, res, next) => {
    try {
      const stats = await User.getUserStats(req.user.id);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin routes

// GET /api/users - Get all users (Admin only)
router.get('/',
  [
    ...queryValidations.pagination,
    ...queryValidations.search,
    handleValidationErrors
  ],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        search: req.query.q,
        role: req.query.role,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: req.query.sort || 'created_at',
        sortOrder: req.query.order || 'desc'
      };

      const result = await User.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Get user by ID (Admin only)
router.get('/:id',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Get user statistics
      const stats = await User.getUserStats(req.params.id);

      res.json({
        success: true,
        data: { 
          user: {
            ...user,
            stats
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id',
  [
    commonValidations.uuid,
    ...userValidations.update,
    body('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Role must be one of: user, admin, moderator'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active must be a boolean'),
    body('email_verified')
      .optional()
      .isBoolean()
      .withMessage('email_verified must be a boolean'),
    handleValidationErrors
  ],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const user = await User.update(req.params.id, req.body);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { user },
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/:id - Deactivate user (Admin only)
router.delete('/:id',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      // Prevent admin from deactivating themselves
      if (req.params.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot deactivate your own account' }
        });
      }

      const user = await User.delete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id/activity - Get user activity (Admin only)
router.get('/:id/activity',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      const limit = parseInt(req.query.limit) || 10;
      const activities = await User.getRecentActivity(req.params.id, limit);

      res.json({
        success: true,
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;