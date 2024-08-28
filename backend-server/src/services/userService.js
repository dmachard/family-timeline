import runQuery from './dbUtility.js';

// Function to get a user by username
const getUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    const params = [username];
    const results = await runQuery(query, params);
    return results[0]; // Return the first result
};

// Function to create a new user
const createUser = async (username, password, email) => {
    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    const params = [username, password, email];
    await runQuery(query, params);
};

// Function to get a user by ID
const getUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const params = [id];
    const results = await runQuery(query, params);
    return results[0]; // Return the first result
};

export { getUserByUsername, createUser, getUserById };
