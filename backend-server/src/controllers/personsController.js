import { getPersons } from '../services/personsService.js';
import logger from '../logger.js'; 

export const fetchAllPersons = async (req, res) => {
  // get authenticated user with req.user
  const user = req.user;
  logger.info(`user=${user.username} - fetch all persons`);

  try {
    const persons = await getPersons();
    res.json(persons);
  } catch (error) {
    logger.error(`Error in getPersons: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
