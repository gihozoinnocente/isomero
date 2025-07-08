/**
 * @swagger
 * components:
 *   schemas:
 *     Genre:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the genre
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *         name:
 *           type: string
 *           description: Name of the genre
 *           example: 'Fantasy'
 *         description:
 *           type: string
 *           description: Detailed description of the genre
 *           example: 'A genre that features magical and supernatural elements...'
 *         parentGenre:
 *           type: string
 *           description: ID of the parent genre (for hierarchical genres)
 *           example: '123e4567-e89b-12d3-a456-426614174001'
 *         bookCount:
 *           type: integer
 *           description: Number of books in this genre
 *           example: 125
 *         popularityScore:
 *           type: number
 *           description: Genre popularity score (0-100)
 *           minimum: 0
 *           maximum: 100
 *           example: 85.5
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the genre was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the genre was last updated
 *     GenreCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         parentGenre:
 *           type: string
 *     GenreUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         parentGenre:
 *           type: string
 *     GenreFilterRequest:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Search term for genre name
 *         sortBy:
 *           type: string
 *           enum: [name, bookCount, popularityScore]
 *           description: Field to sort by
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           description: Sort order
 *     GenrePaginationRequest:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Page number
 *           default: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           default: 10
 *     GenreDistributionResponse:
 *       type: object
 *       properties:
 *         genre:
 *           type: string
 *           description: Genre name
 *         count:
 *           type: integer
 *           description: Number of books in the genre
 *         percentage:
 *           type: number
 *           description: Percentage of total books
 */

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get a list of genres
 *     description: Retrieve a paginated list of genres with optional filters
 *     tags: [Genres]
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
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term for genre name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, bookCount, popularityScore]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Genre'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   post:
 *     summary: Create a new genre
 *     description: Create a new genre record (Admin/Moderator only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenreCreateRequest'
 *     responses:
 *       201:
 *         description: Genre created successfully
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
 *                     genre:
 *                       $ref: '#/components/schemas/Genre'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Genre already exists
 * 
 * /api/genres/minimal:
 *   get:
 *     summary: Get minimal genre data
 *     description: Retrieve a list of genres with minimal data (for dropdowns)
 *     tags: [Genres]
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
 *                     genres:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/genres/popular:
 *   get:
 *     summary: Get popular genres
 *     description: Retrieve a list of popular genres based on book count
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of genres to return
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
 *                     genres:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Genre'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/genres/trending:
 *   get:
 *     summary: Get trending genres
 *     description: Retrieve trending genres based on recent activity
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to consider for trending calculation
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of genres to return
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
 *                     genres:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Genre'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/genres/distribution:
 *   get:
 *     summary: Get genre distribution
 *     description: Get distribution of books across all genres
 *     tags: [Genres]
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
 *                     distribution:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GenreDistributionResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/genres/search:
 *   get:
 *     summary: Search genres
 *     description: Search for genres by name with optional limit
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
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
 *                     genres:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Search term is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/genres/{id}:
 *   get:
 *     summary: Get a specific genre
 *     description: Retrieve a specific genre by ID
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Genre ID
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
 *                     genre:
 *                       $ref: '#/components/schemas/Genre'
 *       404:
 *         description: Genre not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   put:
 *     summary: Update a genre
 *     description: Update an existing genre (Admin/Moderator only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Genre ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenreUpdateRequest'
 *     responses:
 *       200:
 *         description: Genre updated successfully
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
 *                     genre:
 *                       $ref: '#/components/schemas/Genre'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Genre not found
 * 
 *   delete:
 *     summary: Delete a genre
 *     description: Delete a genre by ID (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Genre not found
 */

const express = require('express');
const router = express.Router();

const { protect, admin, moderator } = require('../middleware/authMiddleware');
const { 
  genreValidations, 
  queryValidations,
  commonValidations,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

const Genre = require('../models/Genre');

// GET /api/genres - Get all genres with pagination and search
router.get('/',
  [
    ...queryValidations.pagination,
    ...queryValidations.search,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        search: req.query.q,
        sortBy: req.query.sort || 'name',
        sortOrder: req.query.order || 'asc'
      };

      const result = await Genre.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/minimal - Get all genres with minimal data (for dropdowns)
router.get('/minimal',
  async (req, res, next) => {
    try {
      const genres = await Genre.getAllMinimal();

      res.json({
        success: true,
        data: { genres }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/popular - Get popular genres
router.get('/popular',
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const genres = await Genre.getPopularGenres(limit);

      res.json({
        success: true,
        data: { genres }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/trending - Get trending genres
router.get('/trending',
  async (req, res, next) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const limit = parseInt(req.query.limit) || 10;
      const genres = await Genre.getTrendingGenres(days, limit);

      res.json({
        success: true,
        data: { genres }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/distribution - Get genre distribution
router.get('/distribution',
  async (req, res, next) => {
    try {
      const distribution = await Genre.getDistribution();

      res.json({
        success: true,
        data: { distribution }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/search - Search genres
router.get('/search',
  [
    ...queryValidations.search,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const searchTerm = req.query.q;
      const limit = parseInt(req.query.limit) || 10;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: { message: 'Search term is required' }
        });
      }

      const genres = await Genre.search(searchTerm, limit);

      res.json({
        success: true,
        data: { genres }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/:id - Get genre by ID
router.get('/:id',
  [commonValidations.uuid, handleValidationErrors],
  async (req, res, next) => {
    try {
      const genre = await Genre.findById(req.params.id);

      if (!genre) {
        return res.status(404).json({
          success: false,
          error: { message: 'Genre not found' }
        });
      }

      res.json({
        success: true,
        data: { genre }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/genres - Create new genre (Admin/Moderator only)
router.post('/',
  [
    ...genreValidations.create,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      // Check if genre already exists
      const existingGenre = await Genre.findByName(req.body.name);
      if (existingGenre) {
        return res.status(409).json({
          success: false,
          error: { message: 'Genre already exists' }
        });
      }

      const genre = await Genre.create(req.body);

      res.status(201).json({
        success: true,
        data: { genre },
        message: 'Genre created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/genres/:id - Update genre (Admin/Moderator only)
router.put('/:id',
  [
    commonValidations.uuid,
    ...genreValidations.update,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      // Check if new name conflicts with existing genre
      if (req.body.name) {
        const existingGenre = await Genre.findByName(req.body.name);
        if (existingGenre && existingGenre.id !== req.params.id) {
          return res.status(409).json({
            success: false,
            error: { message: 'Genre name already exists' }
          });
        }
      }

      const genre = await Genre.update(req.params.id, req.body);

      if (!genre) {
        return res.status(404).json({
          success: false,
          error: { message: 'Genre not found' }
        });
      }

      res.json({
        success: true,
        data: { genre },
        message: 'Genre updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/genres/:id - Delete genre (Admin only)
router.delete('/:id',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const genre = await Genre.delete(req.params.id);

      if (!genre) {
        return res.status(404).json({
          success: false,
          error: { message: 'Genre not found' }
        });
      }

      res.json({
        success: true,
        message: 'Genre deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/:id/books - Get books by genre
router.get('/:id/books',
  [
    commonValidations.uuid,
    ...queryValidations.pagination,
    ...queryValidations.search,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      // Check if genre exists
      const genre = await Genre.findById(req.params.id);
      if (!genre) {
        return res.status(404).json({
          success: false,
          error: { message: 'Genre not found' }
        });
      }

      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        search: req.query.q,
        sortBy: req.query.sort || 'average_rating',
        sortOrder: req.query.order || 'desc'
      };

      const result = await Genre.getBooks(req.params.id, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/genres/:id/statistics - Get genre statistics
router.get('/:id/statistics',
  [commonValidations.uuid, handleValidationErrors],
  async (req, res, next) => {
    try {
      // Check if genre exists
      const genre = await Genre.findById(req.params.id);
      if (!genre) {
        return res.status(404).json({
          success: false,
          error: { message: 'Genre not found' }
        });
      }

      const statistics = await Genre.getStatistics(req.params.id);

      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;