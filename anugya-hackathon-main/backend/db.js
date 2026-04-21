const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create users_preferences table
    db.run(`
      CREATE TABLE IF NOT EXISTS users_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        cuisine TEXT,
        diet TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Insert sample data
        db.run(`
          INSERT OR IGNORE INTO users_preferences (user_id, cuisine, diet)
          VALUES ('user_123', 'Italian', 'vegetarian')
        `, (err) => {
          if (err) {
            console.error('Error inserting sample data', err.message);
          }
        });
      }
    });
  }
});

module.exports = db;
