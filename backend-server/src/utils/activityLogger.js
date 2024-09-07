import { runInsertQuery } from './db.js';
import logger from '../logger.js';

export const logActivity = async (userId, actionType, entityType, personId, details) => {
  if ( personId === undefined || personId === null){  personId = 0; }

  const query = `
    INSERT INTO Activities (user_id, action_type, entity_type, person_id, details)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    await runInsertQuery(query, [userId, actionType, entityType, personId, details]);
    logger.info(`Activity logged: ${actionType} ${entityType} Person ID: ${personId} by User ID: ${userId}`);
  } catch (error) {
    logger.error(`Failed to log activity: ${error.message}`);
    throw error;
  }
};
