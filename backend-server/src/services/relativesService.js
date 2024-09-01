import { runQuery, runInsertQuery } from '../utils/db.js';
import logger from '../logger.js'; 

// Function to get all relatives
const getAllRelatives = async () => {
    logger.debug('Fetching all relatives');
    const query = `SELECT * FROM Relatives`;
    return await runQuery(query, []);
};


// Function to get a relative by ID
const getRelativeById = async (id) => {
    logger.debug(`Fetching relative with ID: ${id}`);
    const query = `SELECT * FROM Relatives WHERE id = ?`;
    const relative = await runQuery(query, [id]);
    if (relative.length === 0) {
      throw new Error('Relative not found');
    }
    return relative[0];
};

// Function to create a new relative
const addRelative = async (person_id, relation_type, related_person_id) => {
    logger.debug(`Creating a new relative: person_id=${person_id}, relation_type=${relation_type}, related_person_id=${related_person_id}`);
    const query = `
      INSERT INTO Relatives (person_id, relation_type, related_person_id)
      VALUES (?, ?, ?)
    `;
    const insertId = await runInsertQuery(query, [person_id, relation_type, related_person_id]);
    return insertId;
};

// Function to delete a relative by ID
const delRelativeById = async (id) => {
    logger.debug(`Deleting relative with ID: ${id}`);
    const query = `DELETE FROM Relatives WHERE id = ?`;
    const changes = await runQuery(query, [id]);
    if (changes.changes === 0) {
      throw new Error('Relative not found');
    }
    return changes;
};

// Function to delete a relative by provided person
const delRelativeByPersonId = async (personId, relatedPersonId) => {
    logger.debug(`Deleting relative relationship between ${personId} and ${relatedPersonId}`);

    const query = `DELETE FROM Relatives WHERE person_id = ? AND related_person_id = ?`;
    const changes = await runQuery(query, [personId, relatedPersonId]);
    if (changes.changes === 0) {
      throw new Error('Relative not found');
    }
    return changes;
};

export {
    getAllRelatives, getRelativeById,
    addRelative, delRelativeById, delRelativeByPersonId
};