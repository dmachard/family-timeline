import { runQuery } from '../utils/db.js';
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

export { 
    getLogsActivity
};

  