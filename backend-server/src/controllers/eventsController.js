import { getConnection, beginTransaction, commitTransaction, rollbackTransaction} from '../utils/db.js';
import { getAllEvents, addEvent, editEvent, deleteEventById, getEventById, getEventsByTypeAndPersonId} from '../services/eventsService.js';
import { addAssociation, delAssociationByEventId } from '../services/associationsService.js';
import logger from '../logger.js';
import { logActivity } from '../utils/activityLogger.js'; 

export const fetchEvents = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - fetch all events`);

    try {
        const events = await getAllEvents();
        res.json(events);
    } catch (err) {
        logger.error(`Error in fetchEvents: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createEvent = async (req, res) => {
    const dbConnection = getConnection();
    logger.info(`user=${req.user.username} - create event`);

    try {
        await beginTransaction(dbConnection);

        // get params
        const personId = req.params.id;
        const { event_type, event_date, event_verified, event_place, event_notes } = req.body;

        // Check if event already exists for birth or death
        if (event_type === 'birth' || event_type === 'death') {
            const existingEvents = await getEventsByTypeAndPersonId(personId, event_type);
            if (existingEvents.length > 0) {
                await rollbackTransaction(dbConnection);
                logger.warn(`Event of type '${event_type}' already exists for person ID ${personId}`);
                return res.status(400).json({ message: `Event of type '${event_type}' already exists for this person.` });
            }
        }

        // add event
        const eventId = await addEvent(event_type, event_date, event_verified, event_place, event_notes);

        // connect event to person
        await addAssociation(eventId, personId);

        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'ADD', 'EVENT', personId, `${event_type}`);

        // Commit transaction
        await commitTransaction(dbConnection);

        const newEvent = await getEventById(eventId);
        res.status(201).json(newEvent);
    } catch (err) {
        await rollbackTransaction(dbConnection);

        logger.error(`Error in createEvent: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const updateEvent = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - update event`);

    const { id } = req.params;
    const { event_type, event_date, event_verified, event_place, event_notes } = req.body;
    try {
        // edit event
        await editEvent(id, event_date, event_verified, event_place, event_notes);
        
        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'UPDATE', 'EVENT', id, `${event_type}`);

        // return event
        const newEvent = await getEventById(id);
        res.status(201).json(newEvent);
    } catch (err) {
        logger.error(`Error in updateEvent: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteEvent = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - delete event`);

    const { id } = req.params;
    try {
        // delete the event
        await deleteEventById(id);

        // todo delete connections if needed, this event can be connected to other people
        await delAssociationByEventId(id);

        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'DELETE', 'EVENT', id, ``);

        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        logger.error(`Error in deleteEvent: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
