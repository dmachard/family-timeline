import { runQuery, runInsertQuery, runUpdateQuery, runDeleteQuery } from '../utils/db.js';
import logger from '../logger.js';

// Function to get all events
export const getAllEvents = async () => {
    logger.debug('get all events');
    const query = `SELECT * FROM Events`;
    return await runQuery(query, []);
};

// Function to get all events for one person
export const getEventsByPersonId = async (personId) => {
    logger.debug(`get events for person ID: ${personId}`);
    const query = `
        SELECT Events.*
        FROM Events
        INNER JOIN Associations ON Events.id = Associations.event_id
        WHERE Associations.person_id = ?
        ORDER BY Events.event_date DESC
    `;
    const events = await runQuery(query, [personId]);
    return events;
};

// Function to get an event by ID
export const getEventById = async (eventId) => {
    logger.debug(`get event with ID: ${eventId}`);
    const query = `SELECT * FROM Events WHERE id = ?`;
    const [ event ] = await runQuery(query, [eventId]);
    return event;
};

// Function to create a new event
export const addEvent = async (event_type, event_date, event_verified, event_place, event_notes) => {
    logger.debug(`Creating a new event: type=${event_type}, date=${event_date}`);

    if (event_type === undefined || event_date === undefined) {
        throw new Error("event_type or event_date is undefined");
    }
    if (event_date === '') {
        throw new Error("event_date is empty");
    }

    const values = [
        event_type,
        event_date,
        event_verified || false,
        event_place || '',
        event_notes || ''
      ];

    const query = `
      INSERT INTO Events (event_type, event_date, event_verified, event_place, event_notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    const insertId = await runInsertQuery(query, values);
    return insertId;
};

// Function to update an event
export const editEvent = async (eventId, event_type, event_date, event_verified, event_place, event_notes) => {
    logger.debug(`Updating event with ID: ${eventId}`);
    const query = `
      UPDATE Events
      SET event_type = ?, event_date = ?, event_verified = ?, event_place = ?, event_notes = ?
      WHERE id = ?
    `;
    const changes = await runUpdateQuery(query, [event_type, event_date, event_verified, event_place, event_notes, eventId]);
    if (changes === 0) {
        throw new Error('Event not found');
    }
    return changes;
};

// Function to delete an event
export const deleteEventById = async (eventId) => {
    logger.debug(`Deleting event with ID: ${eventId}`);
    const query = `DELETE FROM Events WHERE id = ?`;
    const changes = await runDeleteQuery(query, [eventId]);
    if (changes === 0) {
        throw new Error('Event not found');
    }
    return changes;
};
