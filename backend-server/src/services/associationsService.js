import { runQuery, runInsertQuery, runDeleteQuery } from '../utils/db.js';
import logger from '../logger.js';

// Function to get all associations
export const getAllAssociations = async () => {
    logger.debug('get all associations');
    const query = `SELECT * FROM Associations`;
    return await runQuery(query, []);
};

// Function to get a association by ID
export const getAssociationById = async (associationId) => {
    logger.debug(`get association with ID: ${associationId}`);
    const query = `SELECT * FROM Associations WHERE id = ?`;
    const [ association ] = await runQuery(query, [associationId]);
    return association;
};

// Function to create a new association
export const addAssociation = async (event_id, person_id) => {
    logger.debug(`Creating a new association: event_id=${event_id}, person_id=${person_id}`);
    const query = `
      INSERT INTO Associations (event_id, person_id)
      VALUES (?, ?)
    `;
    const insertId = await runInsertQuery(query, [event_id, person_id]);
    return insertId;
};

// Function to delete a association
export const delAssociationById = async (associationId) => {
    logger.debug(`Deleting association with ID: ${associationId}`);
    const query = `DELETE FROM Associations WHERE id = ?`;
    const changes = await runDeleteQuery(query, [associationId]);
    return changes;
};

// Function to delete a association
export const delAssociationByEventId = async (eventId) => {
    logger.debug(`Deleting association(s) for eventId: ${eventId}`);
    const query = `DELETE FROM Associations WHERE event_id = ?`;
    const changes = await runDeleteQuery(query, [eventId]);
    return changes;
};

// Function to delete associations associated with a person
export const delAssociationByPersonId = async (personId) => {
    logger.debug(`Deleting association(s) for personId: ${personId}`);
    const query = 'DELETE FROM Associations WHERE person_id = ?';
    const changes = await runDeleteQuery(query, [personId]);
    return changes;
};

// Function to check if a relative already exists
export const checkExistingAssociation = async (event_id, person_id) => {
    const sql = `
        SELECT 1 FROM Associations 
        WHERE event_id = ? 
        AND person_id = ?
        LIMIT 1
    `;
    const rows = await runQuery(sql, [event_id, person_id]);
    return rows.length > 0;
  };