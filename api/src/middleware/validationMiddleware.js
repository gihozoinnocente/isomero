const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  uuid: param('id').isUUID().withMessage('Invalid ID format'),
  email: body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
  title: body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Title is required and must be less than 500 characters')
};

// User validation rules
const userValidations = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    commonValidations.email,
    commonValidations.password,
    body('first_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('First name must be less than 100 characters'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Last name must be less than 100 characters')
  ],
  login: [
    commonValidations.email,
    body('password')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Password is required')
  ],
  update: [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('first_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('First name must be less than 100 characters'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Last name must be less than 100 characters')
  ]
};

// Book validation rules
const bookValidations = {
  create: [
    commonValidations.title,
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Subtitle must be less than 500 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be less than 5000 characters'),
    body('isbn_10')
      .optional()
      .matches(/^\d{10}$/)
      .withMessage('ISBN-10 must be exactly 10 digits'),
    body('isbn_13')
      .optional()
      .matches(/^\d{13}$/)
      .withMessage('ISBN-13 must be exactly 13 digits'),
    body('publication_date')
      .optional()
      .isISO8601()
      .withMessage('Publication date must be a valid date'),
    body('page_count')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page count must be a positive integer'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 10 })
      .withMessage('Language code must be between 2 and 10 characters'),
    body('format')
      .optional()
      .isIn(['hardcover', 'paperback', 'ebook', 'audiobook'])
      .withMessage('Format must be one of: hardcover, paperback, ebook, audiobook'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('author_ids')
      .optional()
      .isArray()
      .withMessage('Author IDs must be an array'),
    body('author_ids.*')
      .optional()
      .isUUID()
      .withMessage('Each author ID must be a valid UUID'),
    body('genre_ids')
      .optional()
      .isArray()
      .withMessage('Genre IDs must be an array'),
    body('genre_ids.*')
      .optional()
      .isUUID()
      .withMessage('Each genre ID must be a valid UUID')
  ],
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Title must be between 1 and 500 characters'),
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Subtitle must be less than 500 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be less than 5000 characters'),
    body('isbn_10')
      .optional()
      .matches(/^\d{10}$/)
      .withMessage('ISBN-10 must be exactly 10 digits'),
    body('isbn_13')
      .optional()
      .matches(/^\d{13}$/)
      .withMessage('ISBN-13 must be exactly 13 digits'),
    body('publication_date')
      .optional()
      .isISO8601()
      .withMessage('Publication date must be a valid date'),
    body('page_count')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page count must be a positive integer'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 10 })
      .withMessage('Language code must be between 2 and 10 characters'),
    body('format')
      .optional()
      .isIn(['hardcover', 'paperback', 'ebook', 'audiobook'])
      .withMessage('Format must be one of: hardcover, paperback, ebook, audiobook'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code')
  ]
};

// Author validation rules
const authorValidations = {
  create: [
    commonValidations.name,
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Bio must be less than 2000 characters'),
    body('birth_date')
      .optional()
      .isISO8601()
      .withMessage('Birth date must be a valid date'),
    body('death_date')
      .optional()
      .isISO8601()
      .withMessage('Death date must be a valid date'),
    body('nationality')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Nationality must be less than 100 characters'),
    body('website_url')
      .optional()
      .isURL()
      .withMessage('Website URL must be a valid URL')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Bio must be less than 2000 characters'),
    body('birth_date')
      .optional()
      .isISO8601()
      .withMessage('Birth date must be a valid date'),
    body('death_date')
      .optional()
      .isISO8601()
      .withMessage('Death date must be a valid date'),
    body('nationality')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Nationality must be less than 100 characters'),
    body('website_url')
      .optional()
      .isURL()
      .withMessage('Website URL must be a valid URL')
  ]
};

// Genre validation rules
const genreValidations = {
  create: [
    commonValidations.name,
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters')
  ]
};

// Rating validation rules
const ratingValidations = {
  create: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('review')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Review must be less than 2000 characters')
  ]
};

// Query parameter validations
const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: parseInt(process.env.MAX_PAGE_SIZE) || 50 })
      .withMessage(`Limit must be between 1 and ${process.env.MAX_PAGE_SIZE || 50}`)
  ],
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],
  bookFilters: [
    query('genre')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Genre filter cannot be empty'),
    query('author')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Author filter cannot be empty'),
    query('year')
      .optional()
      .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be a valid year'),
    query('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5'),
    query('sort')
      .optional()
      .isIn(['title', 'publication_date', 'average_rating', 'created_at'])
      .withMessage('Sort must be one of: title, publication_date, average_rating, created_at'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either asc or desc')
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  userValidations,
  bookValidations,
  authorValidations,
  genreValidations,
  ratingValidations,
  queryValidations
};