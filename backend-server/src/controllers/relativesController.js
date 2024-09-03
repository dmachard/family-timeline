import { getConnection, beginTransaction, commitTransaction, rollbackTransaction} from '../utils/db.js';
import logger from '../logger.js'; 
import { logActivity } from '../utils/activityLogger.js'; 

import { getAllRelatives, getRelativeById, checkExistingRelation} from '../services/relativesService.js';
import { addRelative, delRelativeByPersonId } from '../services/relativesService.js';
import { getPersonById } from '../services/personsService.js'

export const fetchRelatives = async (req, res) => {
    try {
        const relatives = await getAllRelatives();
        res.json(relatives);
    } catch (err) {
        logger.error(`Error in fetchRelatives: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createRelative = async (req, res) => {
    const dbConnection = getConnection(); 
    logger.info(`user=${req.user.username} - create relative`);

    const { person_id, relation_type, related_person_id } = req.body;
    try {
        await beginTransaction(dbConnection);

        // avoid incorrect insert
        if (person_id==related_person_id) {
            await rollbackTransaction(dbConnection);
            return res.status(400).json({ message: 'Invalid relationship.' });
        }
        
        // Check if the relationship already exists
        const existingRelation = await checkExistingRelation(person_id, relation_type, related_person_id);
        if (existingRelation) {
            await rollbackTransaction(dbConnection);
            return res.status(400).json({ message: 'This relationship already exists.' });
        }

        // Insert the relation
        await addRelative(person_id, relation_type, related_person_id);

        // Retrieve the related person's gender
        const person = await getPersonById(person_id);
        const genderOfPerson = person.gender;

        // If the relation type is 'spouse', also create the reciprocal relation
        if (relation_type === 'spouse') {
            await addRelative(related_person_id, 'spouse', person_id);
        } else if (relation_type === 'ex-spouse') {
            await addRelative(related_person_id, 'ex-spouse', person_id);
        } else if (relation_type === 'mother') {
            await addRelative(related_person_id, 'child', person_id);
        } else if (relation_type === 'father') {
            await addRelative(related_person_id, 'child', person_id);
        } else if (relation_type === 'sister') {
            await addRelative(related_person_id, genderOfPerson === 'Female' ? 'sister' : 'brother', person_id);
        } else if (relation_type === 'brother') {
            await addRelative(related_person_id, genderOfPerson === 'Male' ? 'brother' : 'sister', person_id);
        }

        // Log the addition in the Activities table
        await logActivity(req.user.userId, 'ADD', 'RELATIVE', person_id, `${person.first_name} ${person.last_name}`);

        // Commit transaction
        await commitTransaction(dbConnection);

        res.status(201).json({ message: "success" });
    } catch (err) {
        await rollbackTransaction(dbConnection);

        logger.error(`Error in createRelative: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteRelative = async (req, res) => {
    const dbConnection = getConnection(); 
    logger.info(`user=${req.user.username} - delete relative`);

    try {
        await beginTransaction(dbConnection);
        const relativeId = req.params.id;

        // Get relationship details
        const relationship = await getRelativeById(relativeId);
        if (!relationship) {
            await rollbackTransaction(dbConnection);
            return res.status(404).json({ error: 'Relative not found' });
        }

        const { person_id, related_person_id } = relationship;
        const person = await getPersonById(person_id);

        // Delete the relationship and its reciprocal
        await delRelativeByPersonId(person_id, related_person_id);
        await delRelativeByPersonId(related_person_id, person_id);

        // Log the deletion in the Activities table
        await logActivity(req.user.userId, 'DELETE', 'RELATIVE', person_id, `${person.first_name} ${person.last_name}`);

        // Commit transaction
        await commitTransaction(dbConnection);

        res.json({ message: 'Relative deleted successfully' });
    } catch (err) {
        await rollbackTransaction(dbConnection);

        logger.error(`Error in deleteRelative: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}