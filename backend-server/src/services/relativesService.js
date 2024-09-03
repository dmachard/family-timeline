import { runQuery, runInsertQuery } from '../utils/db.js';
import logger from '../logger.js'; 

// Function to get all relatives
const getAllRelatives = async () => {
    logger.debug('get all relatives');
    const query = `SELECT * FROM Relatives`;
    return await runQuery(query, []);
};


// Function to get a relative by ID
const getRelativeById = async (relativeId) => {
    logger.debug(`get relative with ID: ${relativeId}`);
    const query = `SELECT * FROM Relatives WHERE id = ?`;
    const [ relative ] = await runQuery(query, [relativeId]);
    return relative;
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
    console.log(changes);
    if (changes.changes === 0) {
      throw new Error('Relative not found');
    }
    return changes;
};

// Function to check if a relative already exists
const checkExistingRelation = async (person_id, relation_type, related_person_id) => {
  const sql = `
      SELECT 1 FROM relatives 
      WHERE person_id = ? 
      AND relation_type = ? 
      AND related_person_id = ? 
      LIMIT 1
  `;
  const rows = await runQuery(sql, [person_id, relation_type, related_person_id]);
  return rows.length > 0;
};

export {
    getAllRelatives, getRelativeById,
    addRelative, delRelativeById, delRelativeByPersonId,
    checkExistingRelation
};