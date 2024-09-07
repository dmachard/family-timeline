import { runQuery, runDeleteQuery } from '../utils/db.js';
import logger from '../logger.js'; 

// Function to get all persons
const getLogsActivity = async () => {
    logger.debug(`get logs activity`);
    const query = `SELECT a.*, u.username
        FROM Activities a
        JOIN Users u ON a.user_id = u.id
        ORDER BY timestamp DESC
    `;
    return await runQuery(query, []);
};

// Function to delete logs for a given personId
const deleteLogsByPersonId = async (personId) => {
    logger.debug(`Deleting logs for personId: ${personId}`);
    
    // Define the SQL query to delete logs associated with the given personId
    const query = `DELETE FROM Activities WHERE person_id = ?`;
    
    // Execute the delete query
    await runDeleteQuery(query, [personId]);
};

export { 
    getLogsActivity, 
    deleteLogsByPersonId
};

  