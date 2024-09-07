import { runQuery, runInsertQuery, runDeleteQuery } from '../utils/db.js';
import logger from '../logger.js';

// Function to get all attachments
export const getAllAttachments = async () => {
    logger.debug('get all attachments');
    const query = `SELECT * FROM Attachments`;
    return await runQuery(query, []);
};

// Function to get an attachment by ID
export const getAttachmentById = async (attachmentId) => {
    logger.debug(`get attachment with ID: ${attachmentId}`);
    const query = `SELECT * FROM Attachments WHERE id = ?`;
    const [ attachment ] = await runQuery(query, [attachmentId]);
    return attachment;
};

// Function to create a new attachment
export const addAttachment = async (event_id, file_path, description) => {
    logger.debug(`Creating a new attachment: event_id=${event_id}, file_path=${file_path}`);
    const query = `
      INSERT INTO Attachments (event_id, file_path, description)
      VALUES (?, ?, ?)
    `;
    const insertId = await runInsertQuery(query, [event_id, file_path, description]);
    return insertId;
};

// Function to delete an attachment
export const delAttachmentById = async (attachmentId) => {
    logger.debug(`Deleting attachment with ID: ${attachmentId}`);
    const query = `DELETE FROM Attachments WHERE id = ?`;
    const changes = await runDeleteQuery(query, [attachmentId]);
    if (changes === 0) {
        throw new Error('Attachment not found');
    }
    return changes;
};
