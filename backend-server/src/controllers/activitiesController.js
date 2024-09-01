import logger from '../logger.js'; 

import { getLogsActivity } from '../services/activitiesService.js';

export const fetchActivities = async (req, res) => {
    const user = req.user;
    logger.info(`user=${user.username} - fetch activities`);
  
    try {
      const logs = await getLogsActivity();
      res.json(logs);
    } catch (error) {
      logger.error(`Error in fetchActivities: ${error.message}`);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  