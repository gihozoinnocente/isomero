const { query, withTransaction } = require('../config/database');

class Book {
  // Get all books with filters, search, and pagination
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
      search,
      genre,
      author,
      year,
      minRating,
      maxRating,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;

    // Base query with joins
    let baseQuery = `
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.is_available = true
    `;

    // Search filter
    if (search) {
      paramCount++;
      baseQuery += ` AND (
        to_tsvector('english', b.title) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', b.description) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', a.name) @@ plainto_tsquery('english', $${paramCount})
      )`;
      params.push(search);
    }

    // Genre filter
    if (genre) {
      paramCount++;
      baseQuery += ` AND g.name ILIKE $${paramCount}`;
      params.push(`%${genre}%`);
    }

    // Author filter
    if (author) {
      paramCount++;
      baseQuery += ` AND a.name ILIKE $${paramCount}`;
      params.push(`%${author}%`);
    }

    // Year filter
    if (year) {
      paramCount++;
      baseQuery += ` AND EXTRACT(YEAR FROM b.publication_date) = $${paramCount}`;
      params.push(year);
    }

    // Rating filters
    if (minRating) {
      paramCount++;
      baseQuery += ` AND b.average_rating >= $${paramCount}`;
      params.push(minRating);
    }

    if (maxRating) {
      paramCount++;
      baseQuery += ` AND b.average_rating <= $${paramCount}`;
      params.push(maxRating);
    }

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT b.id) as total ${baseQuery}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query with aggregations
    const validSortColumns = ['title', 'publication_date', 'average_rating', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    paramCount += 2;
    const mainQuery = `
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
        b.updated_at,
        p.name as publisher_name,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      ${baseQuery}
      GROUP BY b.id, p.name
      ORDER BY b.${orderBy} ${order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    params.push(limit, offset);

    const result = await query(mainQuery, params);

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

  // Find book by ID with full details
  static async findById(id) {
    const bookQuery = `
      SELECT 
        b.*,
        p.name as publisher_name,
        p.website_url as publisher_website,
        array_agg(DISTINCT jsonb_build_object(
          'id', a.id, 
          'name', a.name, 
          'role', ba.role
        )) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object(
          'id', g.id, 
          'name', g.name,
          'description', g.description
        )) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.id = $1
      GROUP BY b.id, p.name, p.website_url
    `;

    const result = await query(bookQuery, [id]);
    return result.rows[0] || null;
  }

  // Create new book
  static async create(bookData) {
    return withTransaction(async (client) => {
      const {
        title,
        subtitle,
        description,
        isbn_10,
        isbn_13,
        publisher_id,
        publication_date,
        page_count,
        language = 'en',
        format = 'paperback',
        cover_image_url,
        price,
        currency = 'USD',
        author_ids = [],
        genre_ids = []
      } = bookData;

      // Insert book
      const bookResult = await client.query(
        `INSERT INTO books (
          title, subtitle, description, isbn_10, isbn_13, publisher_id,
          publication_date, page_count, language, format, cover_image_url,
          price, currency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          title, subtitle, description, isbn_10, isbn_13, publisher_id,
          publication_date, page_count, language, format, cover_image_url,
          price, currency
        ]
      );

      const book = bookResult.rows[0];

      // Link authors
      if (author_ids.length > 0) {
        const authorPromises = author_ids.map(authorId =>
          client.query(
            'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
            [book.id, authorId]
          )
        );
        await Promise.all(authorPromises);
      }

      // Link genres
      if (genre_ids.length > 0) {
        const genrePromises = genre_ids.map(genreId =>
          client.query(
            'INSERT INTO book_genres (book_id, genre_id) VALUES ($1, $2)',
            [book.id, genreId]
          )
        );
        await Promise.all(genrePromises);
      }

      return book;
    });
  }

  // Update book
  static async update(id, updateData) {
    return withTransaction(async (client) => {
      const {
        title,
        subtitle,
        description,
        isbn_10,
        isbn_13,
        publisher_id,
        publication_date,
        page_count,
        language,
        format,
        cover_image_url,
        price,
        currency,
        is_available,
        author_ids,
        genre_ids
      } = updateData;

      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCount = 0;

      const fields = {
        title, subtitle, description, isbn_10, isbn_13, publisher_id,
        publication_date, page_count, language, format, cover_image_url,
        price, currency, is_available
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      });

      if (updateFields.length === 0 && !author_ids && !genre_ids) {
        throw new Error('No fields to update');
      }

      let book;
      if (updateFields.length > 0) {
        paramCount++;
        values.push(id);

        const updateQuery = `
          UPDATE books 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await client.query(updateQuery, values);
        book = result.rows[0];

        if (!book) {
          throw new Error('Book not found');
        }
      } else {
        // Get existing book if only updating relationships
        const result = await client.query('SELECT * FROM books WHERE id = $1', [id]);
        book = result.rows[0];
        if (!book) {
          throw new Error('Book not found');
        }
      }

      // Update author relationships
      if (author_ids) {
        await client.query('DELETE FROM book_authors WHERE book_id = $1', [id]);
        if (author_ids.length > 0) {
          const authorPromises = author_ids.map(authorId =>
            client.query(
              'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
              [id, authorId]
            )
          );
          await Promise.all(authorPromises);
        }
      }

      // Update genre relationships
      if (genre_ids) {
        await client.query('DELETE FROM book_genres WHERE book_id = $1', [id]);
        if (genre_ids.length > 0) {
          const genrePromises = genre_ids.map(genreId =>
            client.query(
              'INSERT INTO book_genres (book_id, genre_id) VALUES ($1, $2)',
              [id, genreId]
            )
          );
          await Promise.all(genrePromises);
        }
      }

      return book;
    });
  }

  // Delete book
  static async delete(id) {
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  // Get book ratings
  static async getRatings(bookId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    const ratingsQuery = `
      SELECT 
        br.*,
        u.username,
        u.first_name,
        u.last_name
      FROM book_ratings br
      JOIN users u ON br.user_id = u.id
      WHERE br.book_id = $1
      ORDER BY br.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM book_ratings 
      WHERE book_id = $1
    `;

    const [ratingsResult, countResult] = await Promise.all([
      query(ratingsQuery, [bookId, limit, offset]),
      query(countQuery, [bookId])
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      ratings: ratingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Add or update rating
  static async addRating(bookId, userId, ratingData) {
    return withTransaction(async (client) => {
      const { rating, review } = ratingData;

      const result = await client.query(
        `INSERT INTO book_ratings (book_id, user_id, rating, review)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (book_id, user_id)
         DO UPDATE SET 
           rating = EXCLUDED.rating,
           review = EXCLUDED.review,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [bookId, userId, rating, review]
      );

      return result.rows[0];
    });
  }

  // Remove rating
  static async removeRating(bookId, userId) {
    const result = await query(
      'DELETE FROM book_ratings WHERE book_id = $1 AND user_id = $2 RETURNING *',
      [bookId, userId]
    );
    return result.rows[0] || null;
  }

  // Get user's rating for a book
  static async getUserRating(bookId, userId) {
    const result = await query(
      'SELECT * FROM book_ratings WHERE book_id = $1 AND user_id = $2',
      [bookId, userId]
    );
    return result.rows[0] || null;
  }

  // Add to favorites
  static async addToFavorites(bookId, userId) {
    const result = await query(
      `INSERT INTO user_favorites (book_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (book_id, user_id) DO NOTHING
       RETURNING *`,
      [bookId, userId]
    );
    return result.rows[0] || null;
  }

  // Remove from favorites
  static async removeFromFavorites(bookId, userId) {
    const result = await query(
      'DELETE FROM user_favorites WHERE book_id = $1 AND user_id = $2 RETURNING *',
      [bookId, userId]
    );
    return result.rows[0] || null;
  }

  // Check if book is in user's favorites
  static async isInFavorites(bookId, userId) {
    const result = await query(
      'SELECT 1 FROM user_favorites WHERE book_id = $1 AND user_id = $2',
      [bookId, userId]
    );
    return result.rows.length > 0;
  }

  // Get user's favorite books
  static async getUserFavorites(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    const favoritesQuery = `
      SELECT 
        b.id,
        b.title,
        b.subtitle,
        b.description,
        b.cover_image_url,
        b.average_rating,
        b.ratings_count,
        b.price,
        b.currency,
        uf.created_at as favorited_at,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM user_favorites uf
      JOIN books b ON uf.book_id = b.id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE uf.user_id = $1 AND b.is_available = true
      GROUP BY b.id, uf.created_at
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM user_favorites uf
      JOIN books b ON uf.book_id = b.id
      WHERE uf.user_id = $1 AND b.is_available = true
    `;

    const [favoritesResult, countResult] = await Promise.all([
      query(favoritesQuery, [userId, limit, offset]),
      query(countQuery, [userId])
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      favorites: favoritesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get similar books based on genres and authors
  static async getSimilarBooks(bookId, limit = 5) {
    const similarQuery = `
      WITH book_info AS (
        SELECT ARRAY_AGG(DISTINCT ba.author_id) as author_ids,
               ARRAY_AGG(DISTINCT bg.genre_id) as genre_ids
        FROM books b
        LEFT JOIN book_authors ba ON b.id = ba.book_id
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        WHERE b.id = $1
      )
      SELECT DISTINCT
        b.id,
        b.title,
        b.subtitle,
        b.cover_image_url,
        b.average_rating,
        b.ratings_count,
        b.price,
        b.currency,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres,
        (
          CASE WHEN ba.author_id = ANY((SELECT author_ids FROM book_info)) THEN 2 ELSE 0 END +
          CASE WHEN bg.genre_id = ANY((SELECT genre_ids FROM book_info)) THEN 1 ELSE 0 END
        ) as similarity_score
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.id != $1 
        AND b.is_available = true
        AND (
          ba.author_id = ANY((SELECT author_ids FROM book_info)) OR
          bg.genre_id = ANY((SELECT genre_ids FROM book_info))
        )
      GROUP BY b.id
      HAVING (
        CASE WHEN ba.author_id = ANY((SELECT author_ids FROM book_info)) THEN 2 ELSE 0 END +
        CASE WHEN bg.genre_id = ANY((SELECT genre_ids FROM book_info)) THEN 1 ELSE 0 END
      ) > 0
      ORDER BY similarity_score DESC, b.average_rating DESC
      LIMIT $2
    `;

    const result = await query(similarQuery, [bookId, limit]);
    return result.rows;
  }

  // Get trending books (most rated in recent period)
  static async getTrendingBooks(days = 30, limit = 10) {
    const trendingQuery = `
      SELECT 
        b.id,
        b.title,
        b.subtitle,
        b.cover_image_url,
        b.average_rating,
        b.ratings_count,
        b.price,
        b.currency,
        COUNT(br.id) as recent_ratings,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM books b
      LEFT JOIN book_ratings br ON b.id = br.book_id 
        AND br.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.is_available = true
      GROUP BY b.id
      HAVING COUNT(br.id) > 0
      ORDER BY COUNT(br.id) DESC, b.average_rating DESC
      LIMIT $1
    `;

    const result = await query(trendingQuery, [limit]);
    return result.rows;
  }

  // Get top rated books
  static async getTopRatedBooks(limit = 10, minRatings = 5) {
    const topRatedQuery = `
      SELECT 
        b.id,
        b.title,
        b.subtitle,
        b.cover_image_url,
        b.average_rating,
        b.ratings_count,
        b.price,
        b.currency,
        array_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) FILTER (WHERE a.id IS NOT NULL) as authors,
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM books b
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.is_available = true AND b.ratings_count >= $2
      GROUP BY b.id
      ORDER BY b.average_rating DESC, b.ratings_count DESC
      LIMIT $1
    `;

    const result = await query(topRatedQuery, [limit, minRatings]);
    return result.rows;
  }
}

module.exports = Book;