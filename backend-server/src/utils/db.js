
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

// Get connection
const getConnection = () => {
  if (!db) {
    // If db is not initialized, create a new connection
    db = createDbConnection();
  }
  return db;
};

// Function to set a custom database connection (used in testing)
const setDbConnection = (customDb) => {
  db = customDb;
};

// Function to run query
const runQuery = (query, params = [], dbConnection = db) => {
  return new Promise((resolve, reject) => {
    dbConnection.all(query, params, (err, rows) => {
      if (err) {
        logger.error('Error executing query:', err.message);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// Function to run an insert query
const runInsertQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        logger.error('Error executing insert query:', err.message);
        reject(err);
      } else {
        resolve(this.lastID); // Return the last inserted ID
      }
    });
  });
};


// Function to begin a transaction
const beginTransaction = (dbConnection = db) => {
  return new Promise((resolve, reject) => {
    dbConnection.run('BEGIN TRANSACTION', [], (err) => {
      if (err) {
        logger.error('Error beginning transaction:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to commit a transaction
const commitTransaction = (dbConnection = db) => {
  return new Promise((resolve, reject) => {
    dbConnection.run('COMMIT', [], (err) => {
      if (err) {
        logger.error('Error committing transaction:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to rollback a transaction
const rollbackTransaction = (dbConnection = db) => {
  return new Promise((resolve, reject) => {
    dbConnection.run('ROLLBACK', [], (err) => {
      if (err) {
        logger.error('Error rolling back transaction:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export { getConnection, setDbConnection, runQuery, runInsertQuery, beginTransaction, commitTransaction, rollbackTransaction };

