require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, closePool } = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }
    
    console.log('🎉 Database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
};

// Check if this script is being run directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };