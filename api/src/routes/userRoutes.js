/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: 'user@example.com'
 *         name:
 *           type: string
 *           description: User's full name
 *           example: 'John Doe'
 *         role:
 *           type: string
 *           enum: [user, moderator, admin]
 *           description: User's role in the system
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *     UserCreateRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         name:
 *           type: string
 *     TokenResponse:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           description: Whether the token is valid
 *         user:
 *           $ref: '#/components/schemas/User'
 *     AuthErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         avatar:
 *           type: string
 *           format: uri
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *     UserLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 6
 *     UserStats:
 *       type: object
 *       properties:
 *         totalBooksRead:
 *           type: integer
 *         favoriteGenres:
 *           type: array
 *           items:
 *             type: string
 *         readingTime:
 *           type: integer
 *           description: Total reading time in minutes
 *         lastActive:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 * 
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 * 
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     stats:
 *                       $ref: '#/components/schemas/UserStats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 * 
 *   put:
 *     summary: Update user profile
 *     description: Update current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 * 
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     description: Update current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/users/favorites:
 *   get:
 *     summary: Get user's favorite books
 *     description: Retrieve list of books marked as favorites by the user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/users/activity:
 *   get:
 *     summary: Get user's recent activity
 *     description: Retrieve user's recent interactions with the system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Type of activity (read, reviewed, favorited, etc.)
 *                           book:
 *                             $ref: '#/components/schemas/Book'
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/users/recommendations:
 *   get:
 *     summary: Get book recommendations
 *     description: Retrieve personalized book recommendations based on user's reading history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

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

// POST /api/users/login - Login user
router.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare password
      const isValidPassword = await User.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = User.generateToken(user.id);
      
      // Return user data (excluding password) and token
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      };

      res.json({
        success: true,
        data: {
          user: userData,
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Server error',
        details: error.message 
      });
    }
  }
);

// Verify token route
router.get('/auth/verify', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        res.json({ valid: true, user });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/users/register - Register new user
router.post('/register',
  [
    ...userValidations.register,
    handleValidationErrors
  ],
  async (req, res) => {
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
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          details: error.details || []
        }
      });
    }
  }
);

// POST /api/users/login - Login user
router.post('/login',
  [
    ...userValidations.login,
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      console.log('Login attempt:', {
        email: req.body.email,
        timestamp: new Date().toISOString()
      });
      
      const { email, password } = req.body;
      const user = await User.authenticate(email, password);
      const token = User.generateToken(user.id);

        // Get user profile data using User model
        const profile = await User.findById(user.id);

        // Log the user data for debugging
        console.log('User profile:', {
          id: profile?.id,
          username: profile?.username,
          email: profile?.email
        });
      
      res.json({
        success: true,
        data: { 
          user: profile,
          token 
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login failed:', {
        error: error.message,
        timestamp: new Date().toISOString(),
        email: req.body.email
      });
      
      // Don't expose sensitive error messages to the client
      const errorMessage = error.message.includes('credentials') 
        ? 'Invalid credentials' 
        : error.message.includes('active') 
          ? 'Account is not active' 
          : 'Login failed';
      
      res.status(401).json({
        success: false,
        error: {
          message: errorMessage,
          details: []
        }
      });
    }
  }
);

// GET /api/auth/verify - Verify authentication token
router.get('/auth/verify',
  protect,
  (req, res) => {
    res.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: req.user
      }
    });
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

      return res.json({
        success: true,
        data: { 
          user: {
            ...user,
            stats
          }
        }
      });
    } catch (error) {
      return next(error);
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