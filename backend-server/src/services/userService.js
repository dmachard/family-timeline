import runQuery from '../utils/db.js';
import logger from '../logger.js'; 

// Function to get a user by username
const getUserByUsername = async (username) => {
    logger.debug(`get user by name ${username}`);
    const query = 'SELECT * FROM users WHERE username = ?';
    const params = [username];
    const results = await runQuery(query, params);
    return results[0]; // Return the first result
};

// Function to create a new user
const createUser = async (username, password, email) => {
    logger.debug(`insert user ${username}`);
    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    const params = [username, password, email];
    await runQuery(query, params);
};

// Function to get a user by ID
const getUserById = async (id) => {
    logger.debug(`get user by id ${id}`);
    const query = 'SELECT * FROM users WHERE id = ?';
    const params = [id];
    const results = await runQuery(query, params);
    return results[0]; // Return the first result
};

export { getUserByUsername, createUser, getUserById };
