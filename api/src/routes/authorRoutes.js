/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required:
 *         - name
 *         - nationality
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the author
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *         name:
 *           type: string
 *           description: Full name of the author
 *           example: 'J.K. Rowling'
 *         nationality:
 *           type: string
 *           description: Country of origin
 *           example: 'British'
 *         birthYear:
 *           type: integer
 *           description: Year of birth
 *           example: 1965
 *         biography:
 *           type: string
 *           description: Brief biography of the author
 *           example: 'Joanne Rowling is a British author best known for the Harry Potter series...'
 *         photoUrl:
 *           type: string
 *           format: uri
 *           description: URL to the author's photo
 *           example: 'https://example.com/authors/jk-rowling.jpg'
 *         booksCount:
 *           type: integer
 *           description: Number of books written by the author
 *           example: 7
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the author was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the author was last updated
 *     AuthorCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - nationality
 *       properties:
 *         name:
 *           type: string
 *         nationality:
 *           type: string
 *         birthYear:
 *           type: integer
 *         biography:
 *           type: string
 *         photoUrl:
 *           type: string
 *     AuthorUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         nationality:
 *           type: string
 *         birthYear:
 *           type: integer
 *         biography:
 *           type: string
 *         photoUrl:
 *           type: string
 *     AuthorFilterRequest:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Search term for author name
 *         nationality:
 *           type: string
 *           description: Filter by author nationality
 *         sortBy:
 *           type: string
 *           enum: [name, nationality, booksCount]
 *           description: Field to sort by
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           description: Sort order
 *     AuthorPaginationRequest:
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
 */

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get a list of authors
 *     description: Retrieve a paginated list of authors with optional filters
 *     tags: [Authors]
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
 *         description: Search term for author name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, nationality, booksCount]
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
 *                         $ref: '#/components/schemas/Author'
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
 *     summary: Create a new author
 *     description: Create a new author record (Admin/Moderator only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorCreateRequest'
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/authors/popular:
 *   get:
 *     summary: Get popular authors
 *     description: Retrieve a list of popular authors based on book count
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of authors to return
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
 *                     authors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Author'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/authors/search:
 *   get:
 *     summary: Search authors by name
 *     description: Search for authors by name with optional limit
 *     tags: [Authors]
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
 *                     authors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Author'
 *       400:
 *         description: Search term is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/authors/nationality/{nationality}:
 *   get:
 *     summary: Get authors by nationality
 *     description: Retrieve authors from a specific nationality
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nationality
 *         required: true
 *         schema:
 *           type: string
 *         description: Nationality to filter by
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
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Author'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /api/authors/{id}:
 *   get:
 *     summary: Get a specific author
 *     description: Retrieve a specific author by ID
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author ID
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
 *                     author:
 *                       $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   put:
 *     summary: Update an author
 *     description: Update an existing author (Admin/Moderator only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorUpdateRequest'
 *     responses:
 *       200:
 *         description: Author updated successfully
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
 *                     author:
 *                       $ref: '#/components/schemas/Author'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Author not found
 * 
 *   delete:
 *     summary: Delete an author
 *     description: Delete an author by ID (Admin only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Author not found
 * 
 * /api/authors/{id}/books:
 *   get:
 *     summary: Get books by author
 *     description: Retrieve books written by a specific author
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author ID
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
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Author not found
 */

const express = require('express');
const router = express.Router();

const { protect, admin, moderator } = require('../middleware/authMiddleware');
const { 
  authorValidations, 
  queryValidations,
  commonValidations,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

const Author = require('../models/Author');

// GET /api/authors - Get all authors with pagination and search
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

      const result = await Author.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/popular - Get popular authors
router.get('/popular',
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const authors = await Author.getPopularAuthors(limit);

      res.json({
        success: true,
        data: { authors }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/search - Search authors by name
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

      const authors = await Author.searchByName(searchTerm, limit);

      res.json({
        success: true,
        data: { authors }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/nationality/:nationality - Get authors by nationality
router.get('/nationality/:nationality',
  [
    ...queryValidations.pagination,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { nationality } = req.params;
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10
      };

      const result = await Author.getByNationality(nationality, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/:id - Get author by ID
router.get('/:id',
  [commonValidations.uuid, handleValidationErrors],
  async (req, res, next) => {
    try {
      const author = await Author.findById(req.params.id);

      if (!author) {
        return res.status(404).json({
          success: false,
          error: { message: 'Author not found' }
        });
      }

      res.json({
        success: true,
        data: { author }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/authors - Create new author (Admin/Moderator only)
router.post('/',
  [
    ...authorValidations.create,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      const author = await Author.create(req.body);

      res.status(201).json({
        success: true,
        data: { author },
        message: 'Author created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/authors/:id - Update author (Admin/Moderator only)
router.put('/:id',
  [
    commonValidations.uuid,
    ...authorValidations.update,
    handleValidationErrors
  ],
  protect,
  moderator,
  async (req, res, next) => {
    try {
      const author = await Author.update(req.params.id, req.body);

      if (!author) {
        return res.status(404).json({
          success: false,
          error: { message: 'Author not found' }
        });
      }

      res.json({
        success: true,
        data: { author },
        message: 'Author updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/authors/:id - Delete author (Admin only)
router.delete('/:id',
  [commonValidations.uuid, handleValidationErrors],
  protect,
  admin,
  async (req, res, next) => {
    try {
      const author = await Author.delete(req.params.id);

      if (!author) {
        return res.status(404).json({
          success: false,
          error: { message: 'Author not found' }
        });
      }

      res.json({
        success: true,
        message: 'Author deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/:id/books - Get author's books
router.get('/:id/books',
  [
    commonValidations.uuid,
    ...queryValidations.pagination,
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      // Check if author exists
      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({
          success: false,
          error: { message: 'Author not found' }
        });
      }

      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        sortBy: req.query.sort || 'publication_date',
        sortOrder: req.query.order || 'desc'
      };

      const result = await Author.getBooks(req.params.id, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/:id/statistics - Get author statistics
router.get('/:id/statistics',
  [commonValidations.uuid, handleValidationErrors],
  async (req, res, next) => {
    try {
      // Check if author exists
      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({
          success: false,
          error: { message: 'Author not found' }
        });
      }

      const statistics = await Author.getStatistics(req.params.id);

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