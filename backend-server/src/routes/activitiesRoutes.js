import express from 'express';

import { fetchActivities } from '../controllers/activitiesController.js';

const router = express.Router();

router.get('/', fetchActivities);

export default router;