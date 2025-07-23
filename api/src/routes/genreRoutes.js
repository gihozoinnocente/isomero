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