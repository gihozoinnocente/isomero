const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - genre
 *         - publicationYear
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *         title:
 *           type: string
 *           description: The title of the book
 *           example: 'The Great Gatsby'
 *         author:
 *           type: string
 *           description: The author of the book
 *           example: 'F. Scott Fitzgerald'
 *         genre:
 *           type: string
 *           description: The genre of the book
 *           example: 'Classic'
 *         publicationYear:
 *           type: integer
 *           description: The year the book was published
 *           example: 1925
 *         rating:
 *           type: number
 *           description: Average rating of the book
 *           example: 4.5
 *         coverImage:
 *           type: string
 *           description: URL to the book cover image
 *           example: 'https://example.com/cover.jpg'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the book was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the book was last updated
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get a list of books with optional filters
 *     description: Retrieve a paginated list of books with optional filtering and sorting
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *         example: 'Great'
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *         example: 'Classic'
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *         example: 'Fitzgerald'
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by publication year
 *         example: 1925
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating filter
 *         example: 4.0
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Maximum rating filter
 *         example: 5.0
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by
 *         example: 'created_at'
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Sort order (asc/desc)
 *         example: 'desc'
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
 */

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     description: Retrieve a specific book by its unique ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *         example: '123e4567-e89b-12d3-a456-426614174000'
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
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /api/books/{id}/similar:
 *   get:
 *     summary: Get similar books
 *     description: Retrieve books similar to the specified book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *         example: '123e4567-e89b-12d3-a456-426614174000'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of similar books to return
 *         example: 5
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
 */

const { protect, optionalAuth, admin, moderator } = require('../middleware/authMiddleware');
const { 
  bookValidations, 
  ratingValidations,
  queryValidations,
  commonValidations,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

const Book = require('../models/Book');

// GET /api/books - Get all books with filters
router.get('/', 
  [
    ...queryValidations.pagination,
    ...queryValidations.search,
    ...queryValidations.bookFilters,
    handleValidationErrors
  ],
  optionalAuth,
  async (req, res, next) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        search: req.query.q,
        genre: req.query.genre,
        author: req.query.author,
        year: parseInt(req.query.year),
        minRating: parseFloat(req.query.minRating),
        maxRating: parseFloat(req.query.maxRating),
        sortBy: req.query.sort || 'created_at',
        sortOrder: req.query.order || 'desc'
      };

      const result = await Book.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/trending - Get trending books
router.get('/trending',
  async (req, res, next) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const limit = parseInt(req.query.limit) || 10;

      const books = await Book.getTrendingBooks(days, limit);

      res.json({
        success: true,
        data: { books }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/top-rated - Get top rated books
router.get('/top-rated',
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const minRatings = parseInt(req.query.minRatings) || 5;

      const books = await Book.getTopRatedBooks(limit, minRatings);

      res.json({
        success: true,
        data: { books }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/:id - Get book by ID
router.get('/:id',
  [commonValidations.uuid, handleValidationErrors],
  optionalAuth,
  async (req, res, next) => {
    try {
      const book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not found' }
        });
      }

      // Add user-specific data if authenticated
      if (req.user) {
        book.user_rating = await Book.getUserRating(book.id, req.user.id);
        book.is_favorite = await Book.isInFavorites(book.id, req.user.id);
      }

      res.json({
        success: true,
        data: { book }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/books - Create new book (Admin/Moderator only)
router.post('/',
  [
    ...bookValidations.create,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      const book = await Book.create(req.body);

      res.status(201).json({
        success: true,
        data: { book },
        message: 'Book created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/books/:id - Update book (Admin/Moderator only)
router.put('/:id',
  [
    commonValidations.uuid,
    ...bookValidations.update,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      const book = await Book.update(req.params.id, req.body);

      if (!book) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not found' }
        });
      }

      res.json({
        success: true,
        data: { book },
        message: 'Book updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/books/:id - Delete book (Admin only)
router.delete('/:id',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const book = await Book.delete(req.params.id);

      if (!book) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not found' }
        });
      }

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/:id/similar - Get similar books
router.get('/:id/similar',
  [commonValidations.uuid, handleValidationErrors],
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const books = await Book.getSimilarBooks(req.params.id, limit);

      res.json({
        success: true,
        data: { books }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/:id/ratings - Get book ratings
router.get('/:id/ratings',
  [
    commonValidations.uuid,
    ...queryValidations.pagination,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await Book.getRatings(req.params.id, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/books/:id/ratings - Add/Update rating
router.post('/:id/ratings',
  [
    commonValidations.uuid,
    ...ratingValidations.create,
    handleValidationErrors
  ],
  protect,
  async (req, res, next) => {
    try {
      // Check if book exists
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not found' }
        });
      }

      const rating = await Book.addRating(req.params.id, req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: { rating },
        message: 'Rating added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/books/:id/ratings - Remove user's rating
router.delete('/:id/ratings',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  async (req, res, next) => {
    try {
      const rating = await Book.removeRating(req.params.id, req.user.id);

      if (!rating) {
        return res.status(404).json({
          success: false,
          error: { message: 'Rating not found' }
        });
      }

      res.json({
        success: true,
        message: 'Rating removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/books/:id/favorites - Add to favorites
router.post('/:id/favorites',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  async (req, res, next) => {
    try {
      // Check if book exists
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not found' }
        });
      }

      const favorite = await Book.addToFavorites(req.params.id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Book added to favorites'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/books/:id/favorites - Remove from favorites
router.delete('/:id/favorites',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  async (req, res, next) => {
    try {
      const favorite = await Book.removeFromFavorites(req.params.id, req.user.id);

      if (!favorite) {
        return res.status(404).json({
          success: false,
          error: { message: 'Book not in favorites' }
        });
      }

      res.json({
        success: true,
        message: 'Book removed from favorites'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;