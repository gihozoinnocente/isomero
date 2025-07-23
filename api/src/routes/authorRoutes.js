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