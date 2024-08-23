
import sqlite3 from 'sqlite3';
import config from '../config.js';
import logger from '../logger.js'; 

// Enable verbose mode for more detailed logging
sqlite3.verbose();

// Create a database connection
const db = new sqlite3.Database(config.db.filename, (err) => {
  if (err) {
    logger.error('Error opening database:', err.message);
  } else {
    logger.info('Connected to the SQLite database.');
  }
});

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
