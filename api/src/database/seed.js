require('dotenv').config();
const { query, closePool } = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Genres
    const genres = [
      { name: 'Fiction', description: 'Literary works that are imaginary and not based on real events' },
      { name: 'Non-Fiction', description: 'Books based on real events, facts, and information' },
      { name: 'Mystery', description: 'Stories involving puzzles, crimes, or unexplained events' },
      { name: 'Romance', description: 'Stories focusing on love relationships and romantic entanglements' },
      { name: 'Science Fiction', description: 'Stories set in the future or involving advanced technology' },
      { name: 'Fantasy', description: 'Stories featuring magical or supernatural elements' },
      { name: 'Thriller', description: 'Fast-paced stories designed to create suspense and excitement' },
      { name: 'Biography', description: 'Accounts of real people\'s lives' },
      { name: 'History', description: 'Books about past events and historical periods' },
      { name: 'Self-Help', description: 'Books designed to help readers improve their lives' }
    ];

    console.log('📚 Seeding genres...');
    const genreIds = {};
    for (const genre of genres) {
      const result = await query(
        'INSERT INTO genres (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING id',
        [genre.name, genre.description]
      );
      if (result.rows.length > 0) {
        genreIds[genre.name] = result.rows[0].id;
      } else {
        // Get existing genre ID
        const existing = await query('SELECT id FROM genres WHERE name = $1', [genre.name]);
        genreIds[genre.name] = existing.rows[0].id;
      }
    }

    // Seed Publishers
    const publishers = [
      { name: 'Penguin Random House', website_url: 'https://www.penguinrandomhouse.com' },
      { name: 'HarperCollins', website_url: 'https://www.harpercollins.com' },
      { name: 'Simon & Schuster', website_url: 'https://www.simonandschuster.com' },
      { name: 'Macmillan Publishers', website_url: 'https://us.macmillan.com' },
      { name: 'Hachette Book Group', website_url: 'https://www.hachettebookgroup.com' }
    ];

    console.log('🏢 Seeding publishers...');
    const publisherIds = {};
    for (const publisher of publishers) {
      const result = await query(
        'INSERT INTO publishers (name, website_url) VALUES ($1, $2) RETURNING id',
        [publisher.name, publisher.website_url]
      );
      publisherIds[publisher.name] = result.rows[0].id;
    }

    // Seed Authors
    const authors = [
      {
        name: 'J.K. Rowling',
        bio: 'British author best known for the Harry Potter fantasy series',
        birth_date: '1965-07-31',
        nationality: 'British'
      },
      {
        name: 'George Orwell',
        bio: 'English novelist and essayist, known for his works on social criticism',
        birth_date: '1903-06-25',
        death_date: '1950-01-21',
        nationality: 'British'
      },
      {
        name: 'Harper Lee',
        bio: 'American novelist widely known for To Kill a Mockingbird',
        birth_date: '1926-04-28',
        death_date: '2016-02-19',
        nationality: 'American'
      },
      {
        name: 'Agatha Christie',
        bio: 'English writer known for detective novels featuring Hercule Poirot and Miss Marple',
        birth_date: '1890-09-15',
        death_date: '1976-01-12',
        nationality: 'British'
      },
      {
        name: 'Stephen King',
        bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels',
        birth_date: '1947-09-21',
        nationality: 'American'
      }
    ];

    console.log('✍️ Seeding authors...');
    const authorIds = {};
    for (const author of authors) {
      const result = await query(
        'INSERT INTO authors (name, bio, birth_date, death_date, nationality) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [author.name, author.bio, author.birth_date, author.death_date || null, author.nationality]
      );
      authorIds[author.name] = result.rows[0].id;
    }

    // Seed Books
    const books = [
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        description: 'The first novel in the Harry Potter series and Rowling\'s debut novel',
        isbn_13: '9780747532699',
        publisher: 'Penguin Random House',
        publication_date: '1997-06-26',
        page_count: 223,
        language: 'en',
        format: 'paperback',
        price: 12.99,
        authors: ['J.K. Rowling'],
        genres: ['Fantasy', 'Fiction']
      },
      {
        title: '1984',
        description: 'A dystopian social science fiction novel about totalitarian control',
        isbn_13: '9780451524935',
        publisher: 'HarperCollins',
        publication_date: '1949-06-08',
        page_count: 328,
        language: 'en',
        format: 'paperback',
        price: 14.99,
        authors: ['George Orwell'],
        genres: ['Science Fiction', 'Fiction']
      },
      {
        title: 'To Kill a Mockingbird',
        description: 'A novel about racial injustice and the destruction of innocence',
        isbn_13: '9780061120084',
        publisher: 'HarperCollins',
        publication_date: '1960-07-11',
        page_count: 376,
        language: 'en',
        format: 'paperback',
        price: 13.99,
        authors: ['Harper Lee'],
        genres: ['Fiction']
      },
      {
        title: 'Murder on the Orient Express',
        description: 'A detective novel featuring the Belgian detective Hercule Poirot',
        isbn_13: '9780062693662',
        publisher: 'HarperCollins',
        publication_date: '1934-01-01',
        page_count: 256,
        language: 'en',
        format: 'paperback',
        price: 15.99,
        authors: ['Agatha Christie'],
        genres: ['Mystery', 'Fiction']
      },
      {
        title: 'The Shining',
        description: 'A horror novel about a family that becomes caretakers of an isolated hotel',
        isbn_13: '9780307743657',
        publisher: 'Penguin Random House',
        publication_date: '1977-01-28',
        page_count: 447,
        language: 'en',
        format: 'paperback',
        price: 16.99,
        authors: ['Stephen King'],
        genres: ['Thriller', 'Fiction']
      }
    ];

    console.log('📖 Seeding books...');
    for (const book of books) {
      // Insert book
      const bookResult = await query(
        `INSERT INTO books (title, description, isbn_13, publisher_id, publication_date, 
         page_count, language, format, price) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          book.title,
          book.description,
          book.isbn_13,
          publisherIds[book.publisher],
          book.publication_date,
          book.page_count,
          book.language,
          book.format,
          book.price
        ]
      );
      const bookId = bookResult.rows[0].id;

      // Link authors
      for (const authorName of book.authors) {
        await query(
          'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
          [bookId, authorIds[authorName]]
        );
      }

      // Link genres
      for (const genreName of book.genres) {
        await query(
          'INSERT INTO book_genres (book_id, genre_id) VALUES ($1, $2)',
          [bookId, genreIds[genreName]]
        );
      }
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
};

// Check if this script is being run directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };