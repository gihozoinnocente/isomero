const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get trending books
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Get trending books based on ratings and recent activity
    const trendingBooks = await Book.findAll({
      sortBy: 'rating',
      sortOrder: 'desc',
      limit: limit,
      include: {
        authors: true,
        genres: true,
        publishers: true
      }
    });

    res.json(trendingBooks);
  } catch (error) {
    console.error('❌ Error fetching trending books:', error);
    res.status(500).json({ error: 'Failed to fetch trending books' });
  }
});

// Get top-rated books
router.get('/top-rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Get top-rated books based on average rating
    const topRatedBooks = await Book.findAll({
      sortBy: 'average_rating',
      sortOrder: 'desc',
      limit: limit,
      include: {
        authors: true,
        genres: true,
        publishers: true
      }
    });

    res.json(topRatedBooks);
  } catch (error) {
    console.error('❌ Error fetching top-rated books:', error);
    res.status(500).json({ error: 'Failed to fetch top-rated books' });
  }
});

// Get trending books
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Get trending books based on ratings and recent activity
    const trendingBooks = await Book.findAll({
      sortBy: 'rating',
      sortOrder: 'desc',
      limit: limit,
      include: {
        authors: true,
        genres: true,
        publishers: true
      }
    });

    res.json(trendingBooks);
  } catch (error) {
    console.error('❌ Error fetching trending books:', error);
    res.status(500).json({ error: 'Failed to fetch trending books' });
  }
});

module.exports = router;
