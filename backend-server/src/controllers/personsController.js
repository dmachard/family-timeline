
import { getConnection, beginTransaction, commitTransaction, rollbackTransaction} from '../utils/db.js';
import logger from '../logger.js'; 
import { logActivity } from '../utils/activityLogger.js';

import { profilePictureUpload, deleteProfilePicture } from '../services/uploadService.js';
import { getEnrichedPersons, getAllPersons, getAllMiddleNames, getPersonById } from '../services/personsService.js';
import { addPerson, addMiddleName } from '../services/personsService.js';
import { editPerson } from '../services/personsService.js';
import { delPersonById, deleteMiddleNamesByPersonId, delRelatives } from '../services/personsService.js';
import { delAssociationByPersonId } from '../services/associationsService.js';
import { deleteLogsByPersonId } from '../services/activitiesService.js';
import { addEvent} from '../services/eventsService.js';
import { addAssociation } from '../services/associationsService.js';

export const fetchEnrichedPersons = async (req, res) => {
  // get authenticated user with req.user
  const user = req.user;
  logger.info(`user=${user.username} - fetch all enriched persons`);

  try {
    const persons = await getEnrichedPersons();
    res.json(persons);
  } catch (error) {
    logger.error(`Error in fetchEnrichedPersons: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const fetchPersons = async (req, res) => {
  const user = req.user;
  logger.info(`user=${user.username} - fetch all persons`);

  try {
    const persons = await getAllPersons();
    res.json(persons);
  } catch (error) {
    logger.error(`Error in fetchPersons: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const fetchMiddleNames = async (req, res) => {
  const user = req.user;
  logger.info(`user=${user.username} - fetch all middle names`);

  try {
    const persons = await getAllMiddleNames();
    res.json(persons);
  } catch (error) {
    logger.error(`Error in fetchMiddleNames: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createPerson = async (req, res) => {
  const dbConnection = getConnection(); 
  logger.info(`user=${req.user.username} - create person`);

  try {
    await beginTransaction(dbConnection);

    const newPerson = req.body;

    // checking inputs
    if (newPerson.first_name === '' || newPerson.first_name === '') {
      await rollbackTransaction(dbConnection);
      return res.status(400).json({ message: 'first name or last name are missing' });
    }

    // If a new picture is uploaded, handle the upload
    if (req.file) {
      const newFilename = profilePictureUpload(req.file, newPerson.picture);
      newPerson.picture = newFilename;
    }

    const createdPerson = await addPerson(newPerson); 

    // Then, add the new middle names
    if (newPerson.middle_names && newPerson.middle_names.trim()) {
      const middleNames = newPerson.middle_names.split(',').map(name => name.trim());
      for (const middleName of middleNames) {
        await addMiddleName(createdPerson.id, middleName);
      }
    }

    // birth ?
    if (newPerson.birth_date){
      // create event
      const birthEventId = await addEvent("birth", newPerson.birth_date, false, '', '');
      // connect event to person
      await addAssociation(birthEventId, createdPerson.id);
    }

    // death ?
    if (newPerson.death_date){
      // create event
      const deathEventId = await addEvent("death", newPerson.death_date, false, '', '');
      // connect event to person
      await addAssociation(deathEventId, createdPerson.id);
    }


    // Log the addition in the Activities table
    await logActivity(req.user.userId, 'ADD', 'PERSON', createdPerson.id, '');

    // Commit transaction
    await commitTransaction(dbConnection);

    const personWithMiddleNames = await getPersonById(createdPerson.id, dbConnection);
    res.status(201).json(personWithMiddleNames);
  } catch (error) {
    await rollbackTransaction(dbConnection);

    logger.error(`Error in addNewPerson: ${error.message}`);
    res.status(500).json({ error: 'Failed to create person' });
  }
};

export const updatePerson = async (req, res) => {
  const dbConnection = getConnection(); 
  logger.info(`user=${req.user.username} - update person`);

  try {
    await beginTransaction(dbConnection);

    const personId = req.params.id;
    const person = await getPersonById(personId);
    if (!person) {
      await rollbackTransaction(dbConnection);
      return res.status(404).json({ message: 'Person not found' });
    }

    // checking inputs
    const paramsPerson = req.body;
    if (paramsPerson.first_name === '' || paramsPerson.last_name === '') {
      await rollbackTransaction(dbConnection);
      return res.status(400).json({ message: 'first name or last name are missing' });
    }
    
    // If a new picture is uploaded, handle the upload
    if (req.file) {
      const newFilename = profilePictureUpload(req.file, person.picture);
      req.body.picture = newFilename;
    }

    // keep original picture if exists
    if (req.body.picture == null ) {
      req.body.picture = person.picture
    }

    // Update person's data in the database with the modified req.body
    const updatedPerson = await editPerson(personId, req.body);

    // Handle middle names update
    // First, delete existing middle names for the person
    await deleteMiddleNamesByPersonId(personId);

    // Then, add the new middle names
    const middleNames = req.body.middle_names.split(',').map(name => name.trim());
    for (const middleName of middleNames) {
        await addMiddleName(personId, middleName);
    }

    // Log the addition in the Activities table
    await logActivity(req.user.userId, 'UPDATE', 'PERSON', updatedPerson.id, '');

    // COMMIT TRANSACTION
    await commitTransaction(dbConnection);

    // Return success
    const personWithMiddleNames = await getPersonById(updatedPerson.id);
    res.status(200).json(personWithMiddleNames);
  } catch (error) {
    await rollbackTransaction(dbConnection);

    logger.error('Error updating person', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
};

export const deletePerson = async (req, res) => {
  const dbConnection = getConnection(); 
  logger.info(`user=${req.user.username} - delete person`);

  try {
    // Begin transaction
    await beginTransaction(dbConnection);

    const personId = req.params.id;

    // Fetch person data to get the profile picture path
    const person = await getPersonById(personId);
    if (person && person.picture) {
      deleteProfilePicture(person.picture);
    }

    // Perform deletions
    await delPersonById(personId); 
    await deleteMiddleNamesByPersonId(personId); 
    await delRelatives(personId); 
    await delAssociationByPersonId(personId);

    // Log the deletion in the Activities table
    await logActivity(req.user.userId, 'DELETE', 'PERSON', personId, '');
    await deleteLogsByPersonId(personId);

    // Commit transaction
    await commitTransaction(dbConnection);

    // return success
    res.status(200).json({ message: 'Person deleted successfully' });
  } catch (error) {
    await rollbackTransaction(dbConnection);

    logger.error(`Error in deletePerson: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete person' });
  }
};
