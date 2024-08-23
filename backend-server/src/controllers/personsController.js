import getAllPersons from '../services/personsService.js';
import logger from '../logger.js'; 

export const getPersons = async (req, res) => {
  try {
    const persons = await getAllPersons();
    res.json(persons);
  } catch (error) {
    logger.error(`Error in getPersons: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
