import { runInsertQuery } from './db.js';
import logger from '../logger.js';

export const logActivity = async (userId, actionType, entityType, entityId, details) => {
  const query = `
    INSERT INTO Activities (user_id, action_type, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    await runInsertQuery(query, [userId, actionType, entityType, entityId, details]);
    logger.info(`Activity logged: ${actionType} ${entityType} ID: ${entityId} by User ID: ${userId}`);
  } catch (error) {
    logger.error(`Failed to log activity: ${error.message}`);
    throw error;
  }
};
