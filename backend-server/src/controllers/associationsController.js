import logger from '../logger.js';

import { getAllAssociations, getAssociationById  } from '../services/associationsService.js';
import { delAssociationById, addAssociation, checkExistingAssociation  } from '../services/associationsService.js';

export const fetchAssociations = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - fetch all associations`);

    try {
        const connections = await getAllAssociations();
        res.json(connections);
    } catch (err) {
        logger.error(`Error in fetchAssociations: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteAssociation = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - delete association`);

    const { id } = req.params;
    try {
        // delete the event
        await delAssociationById(id);

        res.json({ message: 'Association deleted successfully' });
    } catch (err) {
        logger.error(`Error in deleteAssociation: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createAssociation = async (req, res) => {
    logger.info(`user=${req.user.username} - create association`);

    try {
        // get params
        const eventId = req.params.id;
        const { person_id } = req.body;

        // Check if the association already exists
        const existingAssociation = await checkExistingAssociation(eventId, person_id);
        if (existingAssociation) {
            return res.status(400).json({ message: 'This association already exists.' });
        }

        // connect event to person
        const associationId = await addAssociation(eventId, person_id);


        const newAssociation = await getAssociationById(associationId);
        res.status(201).json(newAssociation);
    } catch (err) {

        logger.error(`Error in createAssociation: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}