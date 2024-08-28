
import sqlite3 from 'sqlite3';
import config from '../config.js';
import logger from '../logger.js'; 

// Enable verbose mode for more detailed logging
sqlite3.verbose();

// Function to create a database connection
export const createDbConnection = (filename = config.db.filename) => {
  return new sqlite3.Database(filename, (err) => {
    if (err) {
      logger.error('Error opening database:', err.message);
    } else {
      logger.info(`Connected to the SQLite database: ${filename}`);
    }
  });
};


// Create a default database connection
let db;
if (process.env.NODE_ENV !== 'test') {
  db = createDbConnection(config.db.filename);
}

// Function to set a custom database connection (used in testing)
export const setDbConnection = (customDb) => {
  db = customDb;
};

// Function to run queries
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        logger.error('Error executing query:', err.message);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

export default runQuery;
