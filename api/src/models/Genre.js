const { query } = require('../config/database');

class Genre {
  // Get all genres with book counts
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;

    let whereClause = '';
    if (search) {
      paramCount++;
      whereClause = `WHERE g.name ILIKE $${paramCount} OR g.description ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM genres g ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Validate sort parameters
    const validSortColumns = ['name', 'books_count', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Add pagination parameters
    paramCount += 2;
    params.push(limit, offset);

    const genresQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT bg.book_id) as books_count
      FROM genres g
      LEFT JOIN book_genres bg ON g.id = bg.genre_id
      LEFT JOIN books b ON bg.book_id = b.id AND b.is_available = true
      ${whereClause}
      GROUP BY g.id
      ORDER BY ${orderBy === 'books_count' ? 'COUNT(DISTINCT bg.book_id)' : `g.${orderBy}`} ${order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await query(genresQuery, params);

    return {
      genres: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find genre by ID with book count
  static async findById(id) {
    const genreQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT bg.book_id) as books_count
      FROM genres g
      LEFT JOIN book_genres bg ON g.id = bg.genre_id
      LEFT JOIN books b ON bg.book_id = b.id AND b.is_available = true
      WHERE g.id = $1
      GROUP BY g.id
    `;

    const result = await query(genreQuery, [id]);
    return result.rows[0] || null;
  }

  // Find genre by name
  static async findByName(name) {
    const result = await query('SELECT * FROM genres WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  // Create new genre
  static async create(genreData) {
    const { name, description } = genreData;

    const result = await query(
      'INSERT INTO genres (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    return result.rows[0];
  }

  // Update genre
  static async update(id, updateData) {
    const { name, description } = updateData;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE genres 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return result.rows[0] || null;
  }

  // Delete genre
  static async delete(id) {
    // Check if genre has any books
    const booksCheck = await query(
      'SELECT COUNT(*) as count FROM book_genres WHERE genre_id = $1',
      [id]
    );

    if (parseInt(booksCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete genre with associated books');
    }

    const result = await query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  // Get books by genre
  static async getBooks(genreId, filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
      sortBy = 'average_rating',
      sortOrder = 'desc',
      search
    } = filters;

    const offset = (page - 1) * limit;
    const params = [genreId];
    let paramCount = 1;

    let searchClause = '';
    if (search) {
      paramCount++;
      searchClause = `AND (
        to_tsvector('english', b.title) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', b.description) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', a.name) @@ plainto_tsquery('english', $${paramCount})
      )`;
      params.push(search);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      WHERE bg.genre_id = $1 AND b.is_available = true ${searchClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Validate sort parameters
    const validSortColumns = ['title', 'publication_date', 'average_rating', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'average_rating';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Add pagination parameters
    paramCount += 2;
    params.push(limit, offset);

    const booksQuery = `
      SELECT DISTINCT
        b.id,
        b.title,
        b.subtitle,
        b.description,
        b.isbn_10,
        b.isbn_13,
        b.publication_date,
        b.page_count,
        b.language,
        b.format,
        b.cover_image_url,
        b.average_rating,
        b.ratings_count,
        b.price,
        b.currency,
        b.created_at,
        p.name as publisher_name,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors
      FROM books b
      JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      WHERE bg.genre_id = $1 AND b.is_available = true ${searchClause}
      GROUP BY b.id, p.name
      ORDER BY b.${orderBy} ${order}
      LIMIT ${paramCount - 1} OFFSET ${paramCount}
    `;

    const result = await query(booksQuery, params);

    return {
      books: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get popular genres (by book count and ratings)
  static async getPopularGenres(limit = 10) {
    const popularQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT bg.book_id) as books_count,
        ROUND(AVG(b.average_rating)::numeric, 2) as avg_rating,
        SUM(b.ratings_count) as total_ratings
      FROM genres g
      JOIN book_genres bg ON g.id = bg.genre_id
      JOIN books b ON bg.book_id = b.id
      WHERE b.is_available = true AND b.ratings_count > 0
      GROUP BY g.id
      HAVING COUNT(DISTINCT bg.book_id) > 0
      ORDER BY COUNT(DISTINCT bg.book_id) DESC, AVG(b.average_rating) DESC
      LIMIT $1
    `;

    const result = await query(popularQuery, [limit]);
    return result.rows;
  }

  // Search genres by name or description
  static async search(searchTerm, limit = 10) {
    const searchQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT bg.book_id) as books_count
      FROM genres g
      LEFT JOIN book_genres bg ON g.id = bg.genre_id
      LEFT JOIN books b ON bg.book_id = b.id AND b.is_available = true
      WHERE g.name ILIKE $1 OR g.description ILIKE $1
      GROUP BY g.id
      ORDER BY 
        CASE WHEN g.name ILIKE $1 THEN 1 ELSE 2 END,
        g.name
      LIMIT $2
    `;

    const result = await query(searchQuery, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  // Get genre statistics
  static async getStatistics(genreId) {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT bg.book_id) as total_books,
        ROUND(AVG(b.average_rating)::numeric, 2) as avg_rating,
        SUM(b.ratings_count) as total_ratings,
        MIN(b.publication_date) as earliest_book,
        MAX(b.publication_date) as latest_book,
        COUNT(DISTINCT ba.author_id) as unique_authors
      FROM genres g
      LEFT JOIN book_genres bg ON g.id = bg.genre_id
      LEFT JOIN books b ON bg.book_id = b.id AND b.is_available = true
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      WHERE g.id = $1
      GROUP BY g.id
    `;

    const result = await query(statsQuery, [genreId]);
    return result.rows[0] || null;
  }

  // Get trending genres (most active in recent period)
  static async getTrendingGenres(days = 30, limit = 10) {
    const trendingQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT br.id) as recent_ratings,
        COUNT(DISTINCT bg.book_id) as books_count,
        ROUND(AVG(b.average_rating)::numeric, 2) as avg_rating
      FROM genres g
      JOIN book_genres bg ON g.id = bg.genre_id
      JOIN books b ON bg.book_id = b.id
      LEFT JOIN book_ratings br ON b.id = br.book_id 
        AND br.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      WHERE b.is_available = true
      GROUP BY g.id
      HAVING COUNT(DISTINCT br.id) > 0
      ORDER BY COUNT(DISTINCT br.id) DESC, COUNT(DISTINCT bg.book_id) DESC
      LIMIT $1
    `;

    const result = await query(trendingQuery, [limit]);
    return result.rows;
  }

  // Get all genres with minimal data (for dropdowns/filters)
  static async getAllMinimal() {
    const result = await query(
      'SELECT id, name FROM genres ORDER BY name ASC'
    );
    return result.rows;
  }

  // Get genre distribution (for analytics)
  static async getDistribution() {
    const distributionQuery = `
      SELECT 
        g.name,
        g.id,
        COUNT(DISTINCT bg.book_id) as books_count,
        ROUND(
          (COUNT(DISTINCT bg.book_id)::numeric / 
           NULLIF((SELECT COUNT(DISTINCT book_id) FROM book_genres), 0)) * 100, 
          2
        ) as percentage
      FROM genres g
      LEFT JOIN book_genres bg ON g.id = bg.genre_id
      LEFT JOIN books b ON bg.book_id = b.id AND b.is_available = true
      GROUP BY g.id, g.name
      ORDER BY books_count DESC
    `;

    const result = await query(distributionQuery);
    return result.rows;
  }
}

module.exports = Genre;