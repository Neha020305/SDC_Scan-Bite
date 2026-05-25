const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new Database('database.db', { verbose: console.log },(err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database via better-sqlite3.');
    
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

    // Create scans table
    db.run(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        product_name TEXT,
        safety_score REAL,
        chemicals_count INTEGER,
        is_safe BOOLEAN,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating scans table', err.message);
      }
    });
  }
});

module.exports = db;
