const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, withTransaction } = require('../config/database');

class User {
  // Generate JWT token
  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // Hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  // Find user by username
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, first_name, last_name, avatar_url, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Create new user
  static async create(userData) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      avatar_url,
      role = 'user'
    } = userData;

    // Check if user already exists
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, avatar_url, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, first_name, last_name, avatar_url, role, is_active, email_verified, created_at`,
      [username, email.toLowerCase(), hashedPassword, first_name, last_name, avatar_url, role]
    );

    return result.rows[0];
  }

  // Authenticate user
  static async authenticate(email, password) {
    const user = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (user.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const userData = user.rows[0];

    if (!userData.is_active) {
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await this.comparePassword(password, userData.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  // Update user
  static async update(id, updateData) {
    const {
      username,
      email,
      first_name,
      last_name,
      avatar_url,
      role,
      is_active,
      email_verified
    } = updateData;

    // Check for existing username/email conflicts
    if (username) {
      const existingUsername = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );
      if (existingUsername.rows.length > 0) {
        throw new Error('Username already taken');
      }
    }

    if (email) {
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (existingEmail.rows.length > 0) {
        throw new Error('Email already in use');
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const fields = { username, email, first_name, last_name, avatar_url, role, is_active, email_verified };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        if (key === 'email') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value.toLowerCase());
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, first_name, last_name, avatar_url, role, is_active, email_verified, created_at, updated_at
    `;

    const result = await query(updateQuery, values);
    return result.rows[0] || null;
  }

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    // Get user with password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    return true;
  }

  // Delete user (soft delete by deactivating)
  static async delete(id) {
    const result = await query(
      `UPDATE users 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, username, email, is_active`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Get all users with pagination (admin only)
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
      search,
      role,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;
    const whereConditions = [];

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        username ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    // Role filter
    if (role) {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      params.push(role);
    }

    // Active status filter
    if (isActive !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      params.push(isActive);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Validate sort parameters
    const validSortColumns = ['username', 'email', 'first_name', 'last_name', 'role', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Add pagination parameters
    paramCount += 2;
    params.push(limit, offset);

    const usersQuery = `
      SELECT 
        id, username, email, first_name, last_name, avatar_url, 
        role, is_active, email_verified, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${orderBy} ${order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await query(usersQuery, params);

    return {
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user statistics
  static async getUserStats(userId) {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT br.id) as ratings_given,
        ROUND(AVG(br.rating)::numeric, 2) as avg_rating_given,
        COUNT(DISTINCT uf.book_id) as favorite_books,
        COUNT(DISTINCT br.book_id) as books_rated
      FROM users u
      LEFT JOIN book_ratings br ON u.id = br.user_id
      LEFT JOIN user_favorites uf ON u.id = uf.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await query(statsQuery, [userId]);
    return result.rows[0] || {
      ratings_given: 0,
      avg_rating_given: 0,
      favorite_books: 0,
      books_rated: 0
    };
  }

  // Get user's recent activity
  static async getRecentActivity(userId, limit = 10) {
    const activityQuery = `
      (
        SELECT 
          'rating' as type,
          br.created_at,
          b.id as book_id,
          b.title as book_title,
          br.rating,
          br.review
        FROM book_ratings br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'favorite' as type,
          uf.created_at,
          b.id as book_id,
          b.title as book_title,
          NULL as rating,
          NULL as review
        FROM user_favorites uf
        JOIN books b ON uf.book_id = b.id
        WHERE uf.user_id = $1
      )
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(activityQuery, [userId, limit]);
    return result.rows;
  }

  // Get reading recommendations for user
  static async getRecommendations(userId, limit = 10) {
    const recommendationsQuery = `
      WITH user_preferences AS (
        -- Get user's favorite genres based on ratings
        SELECT bg.genre_id, AVG(br.rating) as avg_rating
        FROM book_ratings br
        JOIN book_genres bg ON br.book_id = bg.book_id
        WHERE br.user_id = $1 AND br.rating >= 4
        GROUP BY bg.genre_id
        ORDER BY avg_rating DESC
        LIMIT 3
      ),
      user_rated_books AS (
        SELECT book_id FROM book_ratings WHERE user_id = $1
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
        array_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL) as genres
      FROM books b
      JOIN book_genres bg ON b.id = bg.book_id
      JOIN user_preferences up ON bg.genre_id = up.genre_id
      LEFT JOIN book_authors ba ON b.id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE b.is_available = true 
        AND b.id NOT IN (SELECT book_id FROM user_rated_books)
        AND b.average_rating >= 3.5
        AND b.ratings_count >= 5
      GROUP BY b.id
      ORDER BY b.average_rating DESC, b.ratings_count DESC
      LIMIT $2
    `;

    const result = await query(recommendationsQuery, [userId, limit]);
    return result.rows;
  }
}

module.exports = User;