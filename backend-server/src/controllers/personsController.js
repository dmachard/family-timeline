
import { getConnection, beginTransaction, commitTransaction, rollbackTransaction} from '../utils/db.js';
import logger from '../logger.js'; 

import {
  getEnrichedPersons,
  getAllPersons,
  getAllMiddleNames, 
  addPerson,
  editPerson,
  getPerson,
  addMiddleName,
  delPerson,
  delMiddleNames,
  delRelatives,
  delConnections
} from '../services/personsService.js';

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
  try {
    await beginTransaction(dbConnection);

    const newPerson = req.body; 
    const createdPerson = await addPerson(newPerson); 

    if (newPerson.middle_names && newPerson.middle_names.length > 0) {
      for (const middleName of newPerson.middle_names) {
        await addMiddleName(createdPerson.id, middleName);
      }
    }
    await commitTransaction(dbConnection);

    const personWithMiddleNames = await getPerson(createdPerson.id, dbConnection);
    res.status(201).json(personWithMiddleNames);
  } catch (error) {
    await rollbackTransaction(dbConnection);

    logger.error(`Error in addNewPerson: ${error.message}`);
    res.status(500).json({ error: 'Failed to create person' });
  }
};

export const updatePerson = async (req, res) => {
  const personId = req.params.id;
  try {
    const updated = await editPerson(personId, req.body);
    if (updated) {
      const updatedPerson = await getPerson(personId);
      res.json(updatedPerson);
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    logger.error('Error updating person', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
};

export const deletePerson = async (req, res) => {
  const dbConnection = getConnection(); 
  try {
    // Begin transaction
    await beginTransaction(dbConnection);

    const personId = req.params.id;

    // Perform deletions
    await delPerson(personId); 
    await delMiddleNames(personId); 
    await delRelatives(personId); 
    await delConnections(personId);

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
