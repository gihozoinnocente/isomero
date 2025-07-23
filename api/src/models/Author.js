const { query } = require('../config/database');

class Author {
  // Get all authors with pagination and search
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
      whereClause = `WHERE to_tsvector('english', name) @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM authors ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Validate sort parameters
    const validSortColumns = ['name', 'birth_date', 'nationality', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Add pagination parameters
    paramCount += 2;
    params.push(limit, offset);

    const authorsQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT ba.book_id) as books_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.id AND b.is_available = true
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.${orderBy} ${order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await query(authorsQuery, params);

    return {
      authors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find author by ID with books
  static async findById(id) {
    const authorQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT ba.book_id) as books_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.id AND b.is_available = true
      WHERE a.id = $1
      GROUP BY a.id
    `;

    const result = await query(authorQuery, [id]);
    return result.rows[0] || null;
  }

  // Create new author
  static async create(authorData) {
    const {
      name,
      bio,
      birth_date,
      death_date,
      nationality,
      image_url,
      website_url
    } = authorData;

    const result = await query(
      `INSERT INTO authors (name, bio, birth_date, death_date, nationality, image_url, website_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, bio, birth_date, death_date, nationality, image_url, website_url]
    );

    return result.rows[0];
  }

  // Update author
  static async update(id, updateData) {
    const {
      name,
      bio,
      birth_date,
      death_date,
      nationality,
      image_url,
      website_url
    } = updateData;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const fields = { name, bio, birth_date, death_date, nationality, image_url, website_url };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE authors 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return result.rows[0] || null;
  }

  // Delete author
  static async delete(id) {
    // Check if author has any books
    const booksCheck = await query(
      'SELECT COUNT(*) as count FROM book_authors WHERE author_id = $1',
      [id]
    );

    if (parseInt(booksCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete author with associated books');
    }

    const result = await query('DELETE FROM authors WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  // Get author's books
  static async getBooks(authorId, filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
      sortBy = 'publication_date',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      WHERE ba.author_id = $1 AND b.is_available = true
    `;
    const countResult = await query(countQuery, [authorId]);
    const total = parseInt(countResult.rows[0].total);

    // Validate sort parameters
    const validSortColumns = ['title', 'publication_date', 'average_rating', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'publication_date';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

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
        ba.role as author_role,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE ba.author_id = $1 AND b.is_available = true
      GROUP BY b.id, p.name, ba.role
      ORDER BY b.${orderBy} ${order}
      LIMIT $2 OFFSET $3
    `;

    const result = await query(booksQuery, [authorId, limit, offset]);

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

  // Get popular authors (by book ratings)
  static async getPopularAuthors(limit = 10) {
    const popularQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT ba.book_id) as books_count,
        ROUND(AVG(b.average_rating)::numeric, 2) as avg_book_rating,
        SUM(b.ratings_count) as total_ratings
      FROM authors a
      JOIN book_authors ba ON a.id = ba.author_id
      JOIN books b ON ba.book_id = b.id
      WHERE b.is_available = true AND b.ratings_count > 0
      GROUP BY a.id
      HAVING COUNT(DISTINCT ba.book_id) > 0
      ORDER BY AVG(b.average_rating) DESC, SUM(b.ratings_count) DESC
      LIMIT $1
    `;

    const result = await query(popularQuery, [limit]);
    return result.rows;
  }

  // Search authors by name
  static async searchByName(searchTerm, limit = 10) {
    const searchQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT ba.book_id) as books_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.id AND b.is_available = true
      WHERE to_tsvector('english', a.name) @@ plainto_tsquery('english', $1)
         OR a.name ILIKE $2
      GROUP BY a.id
      ORDER BY 
        CASE WHEN a.name ILIKE $2 THEN 1 ELSE 2 END,
        ts_rank(to_tsvector('english', a.name), plainto_tsquery('english', $1)) DESC,
        a.name
      LIMIT $3
    `;

    const result = await query(searchQuery, [searchTerm, `%${searchTerm}%`, limit]);
    return result.rows;
  }

  // Get authors by nationality
  static async getByNationality(nationality, filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10
    } = filters;

    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM authors 
      WHERE nationality ILIKE $1
    `;
    const countResult = await query(countQuery, [`%${nationality}%`]);
    const total = parseInt(countResult.rows[0].total);

    const authorsQuery = `
      SELECT 
        a.*,
        COUNT(DISTINCT ba.book_id) as books_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.id AND b.is_available = true
      WHERE a.nationality ILIKE $1
      GROUP BY a.id
      ORDER BY a.name
      LIMIT $2 OFFSET $3
    `;

    const result = await query(authorsQuery, [`%${nationality}%`, limit, offset]);

    return {
      authors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get author statistics
  static async getStatistics(authorId) {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT ba.book_id) as total_books,
        ROUND(AVG(b.average_rating)::numeric, 2) as avg_rating,
        SUM(b.ratings_count) as total_ratings,
        MIN(b.publication_date) as first_publication,
        MAX(b.publication_date) as latest_publication,
        array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL) as genres
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.id AND b.is_available = true
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE a.id = $1
      GROUP BY a.id
    `;

    const result = await query(statsQuery, [authorId]);
    return result.rows[0] || null;
  }
}

module.exports = Author;